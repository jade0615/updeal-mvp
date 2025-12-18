-- Migration: Add redeemed_at and expires_at to coupons table
-- Date: 2024-12-15

-- Add new columns if they don't exist
DO $$
BEGIN
  -- Add redeemed_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'redeemed_at'
  ) THEN
    ALTER TABLE coupons ADD COLUMN redeemed_at timestamptz;
  END IF;

  -- Add expires_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE coupons ADD COLUMN expires_at timestamptz;
  END IF;
END $$;

-- Make code column unique and not null if it isn't already
DO $$
BEGIN
  -- Make code not null
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'code' AND is_nullable = 'YES'
  ) THEN
    -- First, update any NULL codes with a generated value
    UPDATE coupons SET code = 'LEGACY-' || substr(md5(random()::text), 1, 4) WHERE code IS NULL;
    ALTER TABLE coupons ALTER COLUMN code SET NOT NULL;
  END IF;

  -- Add unique constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'coupons_code_key'
  ) THEN
    ALTER TABLE coupons ADD CONSTRAINT coupons_code_key UNIQUE (code);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_merchant ON coupons(merchant_id);

-- Update comment
COMMENT ON COLUMN coupons.status IS 'Coupon status: active, redeemed, expired';
COMMENT ON COLUMN coupons.code IS 'Visual code format: XMAS-A7K9';
COMMENT ON COLUMN coupons.redeemed_at IS 'Timestamp when coupon was redeemed';
COMMENT ON COLUMN coupons.expires_at IS 'Expiration timestamp (default 30 days from creation)';
