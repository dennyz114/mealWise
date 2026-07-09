-- Enable RLS on meals table
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Enable RLS on meal_ingredients table
ALTER TABLE meal_ingredients ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- RLS policies for meals
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'meals' AND policyname = 'meals_select'
  ) THEN
    CREATE POLICY "meals_select" ON meals FOR SELECT TO authenticated
      USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'meals' AND policyname = 'meals_insert'
  ) THEN
    CREATE POLICY "meals_insert" ON meals FOR INSERT TO authenticated
      WITH CHECK (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'meals' AND policyname = 'meals_update'
  ) THEN
    CREATE POLICY "meals_update" ON meals FOR UPDATE TO authenticated
      USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()))
      WITH CHECK (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'meals' AND policyname = 'meals_delete'
  ) THEN
    CREATE POLICY "meals_delete" ON meals FOR DELETE TO authenticated
      USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- RLS policies for meal_ingredients
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'meal_ingredients' AND policyname = 'meal_ingredients_select'
  ) THEN
    CREATE POLICY "meal_ingredients_select" ON meal_ingredients FOR SELECT TO authenticated
      USING (meal_id IN (SELECT id FROM meals WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'meal_ingredients' AND policyname = 'meal_ingredients_insert'
  ) THEN
    CREATE POLICY "meal_ingredients_insert" ON meal_ingredients FOR INSERT TO authenticated
      WITH CHECK (meal_id IN (SELECT id FROM meals WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'meal_ingredients' AND policyname = 'meal_ingredients_update'
  ) THEN
    CREATE POLICY "meal_ingredients_update" ON meal_ingredients FOR UPDATE TO authenticated
      USING (meal_id IN (SELECT id FROM meals WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())))
      WITH CHECK (meal_id IN (SELECT id FROM meals WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'meal_ingredients' AND policyname = 'meal_ingredients_delete'
  ) THEN
    CREATE POLICY "meal_ingredients_delete" ON meal_ingredients FOR DELETE TO authenticated
      USING (meal_id IN (SELECT id FROM meals WHERE household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())));
  END IF;
END $$;
