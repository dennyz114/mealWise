-- mealWise — fix RLS for create/join/delete household flows
-- Run in: Supabase Dashboard → SQL Editor (on your current DB, no wipe needed)

BEGIN;

-- Table grants (often missing when tables are created via SQL Editor)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Helpers (recreate so they exist even if restore was partial)
CREATE OR REPLACE FUNCTION public.is_household_member(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members
    WHERE household_id = p_household_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_household_owner(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members
    WHERE household_id = p_household_id
      AND user_id = auth.uid()
      AND role = 'owner'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_household_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_household_owner(uuid) TO authenticated;

-- SELECT must allow the creator to read the row on INSERT … RETURNING
-- (membership does not exist yet at that moment)
DROP POLICY IF EXISTS households_select_member ON public.households;
DROP POLICY IF EXISTS households_select_member_or_creator ON public.households;

CREATE POLICY households_select_member_or_creator
  ON public.households FOR SELECT TO authenticated
  USING (public.is_household_member(id) OR created_by = auth.uid());

-- DELETE: owner, or original creator (covers edge cases after member cleanup)
DROP POLICY IF EXISTS households_delete_owner ON public.households;
DROP POLICY IF EXISTS households_delete_owner_or_creator ON public.households;

CREATE POLICY households_delete_owner_or_creator
  ON public.households FOR DELETE TO authenticated
  USING (public.is_household_owner(id) OR created_by = auth.uid());

-- Atomic create: household + owner membership (avoids RLS ordering bugs)
CREATE OR REPLACE FUNCTION public.create_household(p_name text, p_join_code text)
RETURNS public.households
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h public.households%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'Household name is required';
  END IF;

  IF p_join_code IS NULL OR length(trim(p_join_code)) = 0 THEN
    RAISE EXCEPTION 'Join code is required';
  END IF;

  INSERT INTO public.households (name, join_code, created_by)
  VALUES (trim(p_name), trim(p_join_code), auth.uid())
  RETURNING * INTO h;

  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (h.id, auth.uid(), 'owner');

  RETURN h;
END;
$$;

REVOKE ALL ON FUNCTION public.create_household(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_household(text, text) TO authenticated;

-- Keep join RPC in sync
CREATE OR REPLACE FUNCTION public.join_household_by_code(p_join_code text)
RETURNS public.households
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h public.households%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT *
  INTO h
  FROM public.households
  WHERE join_code = p_join_code;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid join code';
  END IF;

  INSERT INTO public.household_members (household_id, user_id, role)
  VALUES (h.id, auth.uid(), 'member');

  RETURN h;
END;
$$;

REVOKE ALL ON FUNCTION public.join_household_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_household_by_code(text) TO authenticated;

COMMIT;
