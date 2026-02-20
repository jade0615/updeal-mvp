-- Migration: Add email_logs table for tracking all email campaigns
-- Date: 2026-02-21
-- Purpose: Allow admin to view which customers received emails, success/failure status, and email content

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    subject TEXT NOT NULL,
    template_name TEXT NOT NULL,   -- e.g. 'verification-reminder', 'expiration-reminder', 'hotpot-ics'
    html_content TEXT,             -- Full rendered HTML for preview
    status TEXT NOT NULL DEFAULT 'success', -- 'success' | 'failed'
    error_message TEXT,            -- Error details if failed
    campaign_name TEXT,            -- e.g. 'honoo-ramen-2026-02-17'
    sent_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_email_logs_merchant ON email_logs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign ON email_logs(campaign_name);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);

-- RLS (service role bypasses this; admin pages use service role)
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE email_logs IS 'Tracks all outbound email campaigns: recipient, template, status, and HTML content for preview.';
COMMENT ON COLUMN email_logs.status IS 'success | failed';
COMMENT ON COLUMN email_logs.template_name IS 'Identifies which email template was used, e.g. verification-reminder';
COMMENT ON COLUMN email_logs.html_content IS 'The fully rendered HTML body sent to the recipient, for admin preview';
