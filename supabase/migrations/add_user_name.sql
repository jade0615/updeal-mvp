-- Migration: Add name column to users table
-- Date: 2024-12-16

DO $$
BEGIN
  -- Add name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name text;
  END IF;
END $$;

COMMENT ON COLUMN users.name IS 'User display name (claimed from landing page)';
