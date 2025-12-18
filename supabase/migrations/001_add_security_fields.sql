-- ==========================================
-- Migration: Add Security Fields
-- Date: 2024-12-16
-- Purpose: Add phone normalization and store PIN verification
-- ==========================================

-- 1. Add phone_e164 and phone_last4 to coupons table
-- phone_e164: Normalized E.164 format (+1234567890)
-- phone_last4: Last 4 digits for display purposes
ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS phone_e164 text,
ADD COLUMN IF NOT EXISTS phone_last4 text;

-- 2. Add redeem_pin to merchants table
-- Store PIN (4-6 digits) for redemption verification
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS redeem_pin text;

-- 3. Create unique constraint on (merchant_id, phone_e164)
-- This prevents duplicate coupon claims AND handles race conditions
-- Note: We use DROP IF EXISTS to make this migration idempotent
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'coupons_merchant_phone_unique'
  ) THEN
    ALTER TABLE coupons DROP CONSTRAINT coupons_merchant_phone_unique;
  END IF;
END $$;

-- Add the constraint
-- IMPORTANT: phone_e164 must NOT be null for this to work effectively
ALTER TABLE coupons
ADD CONSTRAINT coupons_merchant_phone_unique
UNIQUE (merchant_id, phone_e164);

-- 4. Add index on phone_e164 for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupons_phone_e164 ON coupons(phone_e164);

-- 5. Add index on redeem_pin for merchants (for validation queries)
CREATE INDEX IF NOT EXISTS idx_merchants_redeem_pin ON merchants(redeem_pin);

-- 6. Add comments for documentation
COMMENT ON COLUMN coupons.phone_e164 IS 'Normalized phone number in E.164 format (+1234567890)';
COMMENT ON COLUMN coupons.phone_last4 IS 'Last 4 digits of phone for display (e.g., "7890")';
COMMENT ON COLUMN merchants.redeem_pin IS 'Store PIN (4-6 digits) for coupon redemption verification';

-- Migration complete
