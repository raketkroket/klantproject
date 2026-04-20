/*
  # Add image and category fields to challenges

  1. Changes
    - Adds `image_url` (text) column to `challenges` for cover images
    - Adds `category` (text) column for topic classification (e.g. Web, Mobile, AI, Data)
    - Adds `duration` (text) column for expected time (e.g. "2-4 weken")

  2. Notes
    - All new columns are nullable with safe defaults
    - Existing rows are unaffected
    - No destructive operations
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'challenges' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE challenges ADD COLUMN image_url text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'challenges' AND column_name = 'category'
  ) THEN
    ALTER TABLE challenges ADD COLUMN category text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'challenges' AND column_name = 'duration'
  ) THEN
    ALTER TABLE challenges ADD COLUMN duration text DEFAULT '';
  END IF;
END $$;
