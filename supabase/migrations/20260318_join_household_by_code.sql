-- Fix: non-members cannot SELECT households under RLS (member-only policy),
-- so join-by-code returns 0 rows (PostgREST PGRST116).
-- This RPC looks up by join_code and inserts membership as the caller.

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
