-- Migration: Add performance indexes to coupons table
-- Date: 2025-12-29
-- Purpose: Optimize query performance for redemption statistics and user queries
-- Safety: This migration ONLY adds indexes, does not modify or delete any data

-- ==========================================
-- Performance Optimization Indexes
-- ==========================================

-- 1. Redeemed time index (for time-range queries on redemptions)
-- Using partial index to save space (only indexes redeemed coupons)
CREATE INDEX IF NOT EXISTS idx_coupons_redeemed_at 
ON coupons(redeemed_at)
WHERE status = 'redeemed';

COMMENT ON INDEX idx_coupons_redeemed_at IS 'Optimizes queries filtering by redemption time (e.g., today''s redemptions, last 7 days)';


-- 2. Composite index for merchant-level redemption statistics
-- Optimizes queries like: merchant stats, redemption counts by merchant
CREATE INDEX IF NOT EXISTS idx_coupons_merchant_status_redeemed 
ON coupons(merchant_id, status, redeemed_at DESC);

COMMENT ON INDEX idx_coupons_merchant_status_redeemed IS 'Optimizes merchant-level statistics queries (total redemptions, active coupons, etc.)';


-- 3. User-level coupon queries
-- Optimizes queries for user's coupon history and status
CREATE INDEX IF NOT EXISTS idx_coupons_user_status 
ON coupons(user_id, status);

COMMENT ON INDEX idx_coupons_user_status IS 'Optimizes user-level queries (my coupons, redemption history)';


-- ==========================================
-- Verification Queries
-- ==========================================

-- Verify indexes were created successfully
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE tablename = 'coupons'
    AND indexname IN (
      'idx_coupons_redeemed_at',
      'idx_coupons_merchant_status_redeemed',
      'idx_coupons_user_status'
    );
  
  RAISE NOTICE 'Successfully created % new indexes on coupons table', index_count;
END $$;
