-- Fix meal create RLS failures without a full restore.
-- Run in: Supabase Dashboard → SQL Editor

BEGIN;

-- Membership helpers must ignore RLS (avoids recursive policy checks)
CREATE OR REPLACE FUNCTION public.is_household_member(p_household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
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
SET row_security = off
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

-- Atomic meal create (bypasses INSERT…RETURNING RLS footguns)
CREATE OR REPLACE FUNCTION public.create_meal(
  p_household_id uuid,
  p_name text,
  p_icon text DEFAULT 'ti-soup'
)
RETURNS public.meals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  m public.meals%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.household_members
    WHERE household_id = p_household_id
      AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a household member';
  END IF;

  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'Meal name is required';
  END IF;

  INSERT INTO public.meals (household_id, name, icon, created_by)
  VALUES (
    p_household_id,
    trim(p_name),
    COALESCE(NULLIF(trim(p_icon), ''), 'ti-soup'),
    auth.uid()
  )
  RETURNING * INTO m;

  RETURN m;
END;
$$;

REVOKE ALL ON FUNCTION public.create_meal(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_meal(uuid, text, text) TO authenticated;

COMMIT;
