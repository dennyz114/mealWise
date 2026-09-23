-- Normalize ingredients: household library + meal link table
-- Prefer running supabase/restore.sql for a clean wipe.
-- Use this only if you need to migrate an existing DB with data.

BEGIN;

-- Ensure library table exists
CREATE TABLE IF NOT EXISTS public.ingredient_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households (id) ON DELETE CASCADE,
  name text NOT NULL,
  unit text NOT NULL,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ingredient_library_household_name_key UNIQUE (household_id, name)
);

-- Backfill library from denormalized meal_ingredients (if those columns still exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'meal_ingredients'
      AND column_name = 'name'
  ) THEN
    INSERT INTO public.ingredient_library (household_id, name, unit, category)
    SELECT DISTINCT
      m.household_id,
      mi.name,
      COALESCE(mi.unit, 'units'),
      COALESCE(mi.category, 'pantry')
    FROM public.meal_ingredients mi
    JOIN public.meals m ON m.id = mi.meal_id
    WHERE mi.name IS NOT NULL
    ON CONFLICT (household_id, name) DO NOTHING;
  END IF;
END $$;

-- Add link column if missing
ALTER TABLE public.meal_ingredients
  ADD COLUMN IF NOT EXISTS ingredient_id uuid REFERENCES public.ingredient_library (id);

-- Populate ingredient_id from library by name + household
UPDATE public.meal_ingredients mi
SET ingredient_id = il.id
FROM public.meals m
JOIN public.ingredient_library il
  ON il.household_id = m.household_id
 AND il.name = mi.name
WHERE mi.meal_id = m.id
  AND mi.ingredient_id IS NULL
  AND mi.name IS NOT NULL;

-- Drop rows that could not be linked (should be none after backfill)
DELETE FROM public.meal_ingredients WHERE ingredient_id IS NULL;

ALTER TABLE public.meal_ingredients
  ALTER COLUMN ingredient_id SET NOT NULL;

ALTER TABLE public.meal_ingredients
  ALTER COLUMN quantity SET NOT NULL;

-- Drop denormalized columns
ALTER TABLE public.meal_ingredients DROP COLUMN IF EXISTS name;
ALTER TABLE public.meal_ingredients DROP COLUMN IF EXISTS unit;
ALTER TABLE public.meal_ingredients DROP COLUMN IF EXISTS category;

-- Unique meal+ingredient
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'meal_ingredients_meal_ingredient_key'
  ) THEN
    ALTER TABLE public.meal_ingredients
      ADD CONSTRAINT meal_ingredients_meal_ingredient_key UNIQUE (meal_id, ingredient_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ingredient_library_household ON public.ingredient_library (household_id);
CREATE INDEX IF NOT EXISTS idx_meal_ingredients_meal ON public.meal_ingredients (meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_ingredients_ingredient ON public.meal_ingredients (ingredient_id);

ALTER TABLE public.ingredient_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ingredient_library_all_member ON public.ingredient_library;
CREATE POLICY ingredient_library_all_member
  ON public.ingredient_library FOR ALL TO authenticated
  USING (public.is_household_member(household_id))
  WITH CHECK (public.is_household_member(household_id));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingredient_library TO authenticated;

COMMIT;
