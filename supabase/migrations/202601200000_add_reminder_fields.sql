-- Migration: Add fields for automated email reminders
-- Date: 2026-01-20
-- Purpose: Support multi-stage email automation and calendar integration

ALTER TABLE coupons ADD COLUMN IF NOT EXISTS expected_visit_date TIMESTAMPTZ;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS email_sent_stage INTEGER DEFAULT 0; -- 0: None, 1: T0, 2: T1, 3: T2
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS reminder_status TEXT DEFAULT 'pending'; -- 'pending', 'processing', 'completed', 'failed'

-- Add index for cron job efficiency
CREATE INDEX IF NOT EXISTS idx_coupons_reminder_query ON coupons(email_sent_stage, expected_visit_date) WHERE status = 'active';

-- Add comment to explain stages
COMMENT ON COLUMN coupons.email_sent_stage IS '0: Not started, 1: Immediate (T0) sent, 2: 24h Before (T1) sent, 3: Day of (T2) sent';
