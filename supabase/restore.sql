-- mealWise — wipe & restore public schema
-- Run in: Supabase Dashboard → SQL Editor
--
-- What this does:
--   1. Drops app tables / functions / triggers in public
--   2. Recreates schema, RLS, profile trigger, join RPC
--
-- What this does NOT do:
--   - Delete Auth users (see OPTIONAL block at the bottom)
--   - Change Auth settings (Email provider, "Confirm email", etc.)
--
-- After running: register a fresh user, create/join a household, and verify.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Drop existing objects (safe to re-run)
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.join_household_by_code(text);
DROP FUNCTION IF EXISTS public.create_household(text, text);
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_household_member(uuid);
DROP FUNCTION IF EXISTS public.is_household_owner(uuid);

DROP TABLE IF EXISTS public.shopping_list_items CASCADE;
DROP TABLE IF EXISTS public.menu_days CASCADE;
DROP TABLE IF EXISTS public.weekly_menus CASCADE;
DROP TABLE IF EXISTS public.meal_ingredients CASCADE;
DROP TABLE IF EXISTS public.meals CASCADE;
DROP TABLE IF EXISTS public.household_members CASCADE;
DROP TABLE IF EXISTS public.households CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  join_code text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT households_join_code_key UNIQUE (join_code)
);

CREATE TABLE public.household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT household_members_household_user_key UNIQUE (household_id, user_id)
);

CREATE TABLE public.meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.meal_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid NOT NULL REFERENCES public.meals (id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity numeric,
  unit text,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.weekly_menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  week_start date NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.menu_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_menu_id uuid NOT NULL REFERENCES public.weekly_menus (id) ON DELETE CASCADE,
  day_of_week int2 NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  meal_id uuid NOT NULL REFERENCES public.meals (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_menu_id uuid NOT NULL REFERENCES public.weekly_menus (id) ON DELETE CASCADE,
  ingredient_name text NOT NULL,
  quantity numeric,
  unit text,
  category text,
  is_checked boolean NOT NULL DEFAULT false,
  is_manual boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3. Helper functions for RLS (avoid recursive policy checks)
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 4. Profile auto-create on signup
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 5. Household RPCs (create + join bypass RLS ordering issues)
-- ---------------------------------------------------------------------------

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

GRANT EXECUTE ON FUNCTION public.is_household_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_household_owner(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Grants (required when creating tables via SQL Editor)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- profiles
CREATE POLICY profiles_select_authenticated
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- households
CREATE POLICY households_select_member_or_creator
  ON public.households FOR SELECT TO authenticated
  USING (public.is_household_member(id) OR created_by = auth.uid());

CREATE POLICY households_insert_authenticated
  ON public.households FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY households_update_member
  ON public.households FOR UPDATE TO authenticated
  USING (public.is_household_member(id))
  WITH CHECK (public.is_household_member(id));

CREATE POLICY households_delete_owner_or_creator
  ON public.households FOR DELETE TO authenticated
  USING (public.is_household_owner(id) OR created_by = auth.uid());

-- household_members
CREATE POLICY household_members_select_member
  ON public.household_members FOR SELECT TO authenticated
  USING (public.is_household_member(household_id));

CREATE POLICY household_members_insert_self
  ON public.household_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY household_members_update_owner_or_self
  ON public.household_members FOR UPDATE TO authenticated
  USING (public.is_household_owner(household_id) OR user_id = auth.uid())
  WITH CHECK (public.is_household_owner(household_id) OR user_id = auth.uid());

CREATE POLICY household_members_delete_owner_or_self
  ON public.household_members FOR DELETE TO authenticated
  USING (public.is_household_owner(household_id) OR user_id = auth.uid());

-- meals (+ ingredients): household members
CREATE POLICY meals_all_member
  ON public.meals FOR ALL TO authenticated
  USING (public.is_household_member(household_id))
  WITH CHECK (public.is_household_member(household_id));

CREATE POLICY meal_ingredients_all_member
  ON public.meal_ingredients FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meals m
      WHERE m.id = meal_id AND public.is_household_member(m.household_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meals m
      WHERE m.id = meal_id AND public.is_household_member(m.household_id)
    )
  );

-- weekly menus (+ days + shopping): household members
CREATE POLICY weekly_menus_all_member
  ON public.weekly_menus FOR ALL TO authenticated
  USING (public.is_household_member(household_id))
  WITH CHECK (public.is_household_member(household_id));

CREATE POLICY menu_days_all_member
  ON public.menu_days FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.weekly_menus wm
      WHERE wm.id = weekly_menu_id AND public.is_household_member(wm.household_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.weekly_menus wm
      WHERE wm.id = weekly_menu_id AND public.is_household_member(wm.household_id)
    )
  );

CREATE POLICY shopping_list_items_all_member
  ON public.shopping_list_items FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.weekly_menus wm
      WHERE wm.id = weekly_menu_id AND public.is_household_member(wm.household_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.weekly_menus wm
      WHERE wm.id = weekly_menu_id AND public.is_household_member(wm.household_id)
    )
  );

COMMIT;

-- ---------------------------------------------------------------------------
-- OPTIONAL: wipe Auth users too (start completely fresh)
-- Uncomment and run separately if you want zero accounts left.
-- This cascades to profiles via ON DELETE CASCADE.
-- ---------------------------------------------------------------------------
-- DELETE FROM auth.users;
