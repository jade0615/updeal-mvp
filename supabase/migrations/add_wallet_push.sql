-- Add wallet_message to coupons
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS wallet_message TEXT;

-- Create wallet_registrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS wallet_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT NOT NULL,
    push_token TEXT NOT NULL,
    pass_type_id TEXT NOT NULL,
    serial_number TEXT NOT NULL,
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(device_id, pass_type_id, serial_number)
);
