-- ==========================================
-- ROLLBACK SCRIPT
-- ==========================================
-- Purpose: Remove indexes created by add_coupon_indexes.sql
-- Use this if you need to revert the index changes

-- Remove the three indexes created by the migration
DROP INDEX IF EXISTS idx_coupons_redeemed_at;
DROP INDEX IF EXISTS idx_coupons_merchant_status_redeemed;
DROP INDEX IF EXISTS idx_coupons_user_status;

-- Verify indexes were removed
DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count
  FROM pg_indexes
  WHERE tablename = 'coupons'
    AND indexname IN (
      'idx_coupons_redeemed_at',
      'idx_coupons_merchant_status_redeemed',
      'idx_coupons_user_status'
    );
  
  IF remaining_count = 0 THEN
    RAISE NOTICE 'Successfully removed all new indexes';
  ELSE
    RAISE WARNING 'Some indexes may still exist: %', remaining_count;
  END IF;
END $$;
