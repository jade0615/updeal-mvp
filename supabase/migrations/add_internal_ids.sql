-- Add internal_id field for merchants (商家内部编号)
-- This is a human-readable ID for internal tracking purposes
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS internal_id TEXT;

-- Add internal_id field for users/customers (客户内部编号)
-- This is a human-readable ID for internal tracking purposes
ALTER TABLE users ADD COLUMN IF NOT EXISTS internal_id TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_merchants_internal_id ON merchants(internal_id);
CREATE INDEX IF NOT EXISTS idx_users_internal_id ON users(internal_id);

-- Add comments for documentation
COMMENT ON COLUMN merchants.internal_id IS '商家内部编号，供内部运营使用';
COMMENT ON COLUMN users.internal_id IS '客户内部编号，供内部运营使用';
