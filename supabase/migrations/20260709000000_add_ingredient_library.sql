-- Create ingredient_library table
CREATE TABLE IF NOT EXISTS ingredient_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name text NOT NULL,
  unit text NOT NULL,
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(household_id, name)
);

-- Enable RLS
ALTER TABLE ingredient_library ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view ingredient library in their household"
  ON ingredient_library
  FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ingredients library in their household"
  ON ingredient_library
  FOR INSERT
  WITH CHECK (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ingredients library in their household"
  ON ingredient_library
  FOR UPDATE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ingredients library in their household"
  ON ingredient_library
  FOR DELETE
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ingredient_library_household ON ingredient_library(household_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_library_name ON ingredient_library(household_id, name);
