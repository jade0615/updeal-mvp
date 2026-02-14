-- Migration: Add Merchant Analytics Support
-- Date: 2026-02-14
-- Purpose: Create page_views table for merchant analytics dashboard

-- ==========================================
-- 1. Create page_views Table
-- ==========================================

CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE page_views IS 'Tracks individual page views for merchant analytics';
COMMENT ON COLUMN page_views.merchant_id IS 'Reference to the merchant whose page was viewed';
COMMENT ON COLUMN page_views.viewed_at IS 'Timestamp when the page was viewed';


-- ==========================================
-- 2. Create Indexes for Performance
-- ==========================================

-- Index for merchant queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_page_views_merchant ON page_views(merchant_id);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at DESC);

-- Composite index for merchant + time queries
CREATE INDEX IF NOT EXISTS idx_page_views_merchant_time ON page_views(merchant_id, viewed_at DESC);


-- ==========================================
-- 3. Enable RLS
-- ==========================================

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow insert for all (tracking page views)
CREATE POLICY "Allow insert for all" ON page_views
  FOR INSERT
  WITH CHECK (true);

-- Allow merchants to view their own stats (via server-side queries only)
-- Note: Real access control is handled at application level via merchant_sessions


-- ==========================================
-- 4. Verification Query
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully';
  RAISE NOTICE 'page_views table created with % indexes', (
    SELECT COUNT(*) 
    FROM pg_indexes 
    WHERE tablename = 'page_views'
  );
END $$;
