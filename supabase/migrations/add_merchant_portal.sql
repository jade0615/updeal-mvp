-- Migration: Add Merchant Portal and Notification System
-- Date: 2025-12-30
-- Purpose: Enable merchant authentication and email notifications

-- ==========================================
-- 1. Extend Merchants Table
-- ==========================================

-- Add authentication fields
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add notification fields
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS notification_email TEXT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "claim_notification": true,
  "redeem_notification": true,
  "daily_summary": true
}'::jsonb;

-- Add tracking fields
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email);

-- Add comments
COMMENT ON COLUMN merchants.email IS 'Merchant login email address';
COMMENT ON COLUMN merchants.password_hash IS 'Bcrypt hashed password for merchant authentication';
COMMENT ON COLUMN merchants.notification_email IS 'Email address for receiving notifications (can differ from login email)';
COMMENT ON COLUMN merchants.notification_preferences IS 'JSON object containing notification preferences: claim_notification, redeem_notification, daily_summary';
COMMENT ON COLUMN merchants.last_login_at IS 'Timestamp of last successful login';


-- ==========================================
-- 2. Create Merchant Sessions Table
-- ==========================================

CREATE TABLE IF NOT EXISTS merchant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for session management
CREATE INDEX IF NOT EXISTS idx_merchant_sessions_token ON merchant_sessions(token);
CREATE INDEX IF NOT EXISTS idx_merchant_sessions_merchant ON merchant_sessions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_sessions_expires ON merchant_sessions(expires_at);

-- Add comments
COMMENT ON TABLE merchant_sessions IS 'Stores merchant authentication sessions';
COMMENT ON COLUMN merchant_sessions.token IS 'Unique session token (UUID)';
COMMENT ON COLUMN merchant_sessions.expires_at IS 'Session expiration timestamp';


-- ==========================================
-- 3. Create Notification Logs Table
-- ==========================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) NOT NULL,
  notification_type TEXT NOT NULL, -- 'claim', 'redeem', 'daily_summary'
  recipient_email TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'sent', -- 'sent', 'failed'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for querying notification history
CREATE INDEX IF NOT EXISTS idx_notification_logs_merchant ON notification_logs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created ON notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);

-- Add comments
COMMENT ON TABLE notification_logs IS 'Logs all email notifications sent to merchants';
COMMENT ON COLUMN notification_logs.notification_type IS 'Type of notification: claim, redeem, or daily_summary';
COMMENT ON COLUMN notification_logs.status IS 'Delivery status: sent or failed';
COMMENT ON COLUMN notification_logs.metadata IS 'Additional data about the notification (coupon code, customer info, etc.)';


-- ==========================================
-- 4. Create Analytics View (Optional)
-- ==========================================

-- View for merchant dashboard statistics
CREATE OR REPLACE VIEW merchant_dashboard_stats AS
SELECT 
  m.id as merchant_id,
  m.name as merchant_name,
  m.slug,
  
  -- Total claims
  COUNT(c.id) as total_claims,
  
  -- Total redemptions
  COUNT(CASE WHEN c.status = 'redeemed' THEN 1 END) as total_redemptions,
  
  -- Redemption rate
  CASE 
    WHEN COUNT(c.id) > 0 THEN 
      ROUND((COUNT(CASE WHEN c.status = 'redeemed' THEN 1 END)::numeric / COUNT(c.id)::numeric * 100), 2)
    ELSE 0 
  END as redemption_rate,
  
  -- Today's claims
  COUNT(CASE WHEN c.created_at >= CURRENT_DATE THEN 1 END) as today_claims,
  
  -- Today's redemptions
  COUNT(CASE WHEN c.status = 'redeemed' AND c.redeemed_at >= CURRENT_DATE THEN 1 END) as today_redemptions,
  
  -- Last activity
  MAX(GREATEST(c.created_at, c.redeemed_at)) as last_activity_at
  
FROM merchants m
LEFT JOIN coupons c ON c.merchant_id = m.id
GROUP BY m.id, m.name, m.slug;

COMMENT ON VIEW merchant_dashboard_stats IS 'Pre-calculated statistics for merchant dashboard';


-- ==========================================
-- 5. Auto-cleanup Function for Expired Sessions
-- ==========================================

CREATE OR REPLACE FUNCTION cleanup_expired_merchant_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM merchant_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_merchant_sessions IS 'Removes expired merchant sessions from the database';


-- ==========================================
-- Verification
-- ==========================================

DO $$
DECLARE
  merchant_cols INTEGER;
  sessions_exists BOOLEAN;
  logs_exists BOOLEAN;
BEGIN
  -- Check merchants table columns
  SELECT COUNT(*) INTO merchant_cols
  FROM information_schema.columns
  WHERE table_name = 'merchants'
    AND column_name IN ('email', 'password_hash', 'notification_email', 'notification_preferences', 'last_login_at');
  
  -- Check if tables exist
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'merchant_sessions') INTO sessions_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_logs') INTO logs_exists;
  
  RAISE NOTICE 'Migration completed:';
  RAISE NOTICE '  - Merchant columns added: %', merchant_cols;
  RAISE NOTICE '  - Merchant sessions table: %', CASE WHEN sessions_exists THEN 'Created' ELSE 'Failed' END;
  RAISE NOTICE '  - Notification logs table: %', CASE WHEN logs_exists THEN 'Created' ELSE 'Failed' END;
END $$;
