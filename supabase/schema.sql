-- UpDeal MVP Schema

-- 1. Merchants Table
create table merchants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  template_type text not null, -- 'nail', 'sushi', 'chinese', 'bbq', 'massage', 'boba'
  content jsonb not null default '{}'::jsonb, -- dynamic content (images, texts)
  created_at timestamptz default now()
);

-- Enable RLS
alter table merchants enable row level security;
-- Allow public read access to merchants
create policy "Allow public read access" on merchants for select using (true);


-- 2. Influencers Table
create table influencers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  click_count int default 0,
  conversion_count int default 0,
  created_at timestamptz default now()
);

alter table influencers enable row level security;
-- By default, deny public access. Admin/Server actions use Service Role.
-- Maybe allow checking code validity? For now, assume Server Action handles it.


-- 3. Users Table (Consumers)
create table users (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  email text,
  name text,
  source_influencer_id uuid references influencers(id),
  created_at timestamptz default now()
--   unique(phone) -- Optional: For MVP, maybe allow same phone to re-enter? Let's check logic later.
);

alter table users enable row level security;


-- 4. Coupons Table
create table coupons (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) not null,
  user_id uuid references users(id) not null,
  status text default 'active', -- 'active', 'redeemed', 'expired'
  code text unique not null, -- visual code format: XMAS-A7K9
  redeemed_at timestamptz, -- 核销时间
  expires_at timestamptz, -- 过期时间 (默认30天)
  created_at timestamptz default now()
);

alter table coupons enable row level security;

-- Indexes for coupons
create index idx_coupons_code on coupons(code);
create index idx_coupons_status on coupons(status);
create index idx_coupons_merchant on coupons(merchant_id);

-- ==========================================
-- UpDeal MVP Schema Extensions
-- ==========================================

-- 5. Admin Users Table (后台管理员表)
create table admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text not null,
  role text default 'operator', -- 'admin', 'operator'
  is_active boolean default true,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: 仅允许服务端访问
alter table admin_users enable row level security;

-- Indexes
create index idx_admin_users_email on admin_users(email);


-- 6. Events Tracking Table (事件追踪表)
create table events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null, -- 'page_view', 'form_submit', 'coupon_claim'
  merchant_id uuid references merchants(id),
  user_id uuid references users(id),
  influencer_id uuid references influencers(id),

  -- Event metadata
  session_id text,
  page_url text,
  referrer text,
  user_agent text,
  ip_address text,

  -- Additional data (灵活存储)
  metadata jsonb default '{}'::jsonb,

  created_at timestamptz default now()
);

-- RLS: 允许插入，但不允许公开读取
alter table events enable row level security;
create policy "Allow insert for all" on events for insert with check (true);

-- Indexes for analytics queries
create index idx_events_type on events(event_type);
create index idx_events_merchant on events(merchant_id);
create index idx_events_created_at on events(created_at desc);
create index idx_events_session on events(session_id);


-- 7. Ad Campaigns Table (广告投放记录表)
create table ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) not null,

  -- Campaign info
  campaign_name text not null,
  platform text default 'google_ads', -- 'google_ads', 'meta', etc.

  -- Budget & Performance (手动录入)
  daily_budget decimal(10,2),
  total_spent decimal(10,2) default 0,

  -- Date range
  start_date date not null,
  end_date date,

  -- Status
  status text default 'active', -- 'active', 'paused', 'completed'

  -- Metadata
  notes text,
  metadata jsonb default '{}'::jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table ad_campaigns enable row level security;

-- Indexes
create index idx_ad_campaigns_merchant on ad_campaigns(merchant_id);
create index idx_ad_campaigns_status on ad_campaigns(status);


-- 8. Landing Page Analytics (落地页分析汇总表)
create table landing_page_stats (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) not null unique,

  -- Counters (定期更新)
  total_page_views bigint default 0,
  total_form_submits bigint default 0,
  total_coupon_claims bigint default 0,
  unique_visitors bigint default 0,

  -- Conversion metrics
  conversion_rate decimal(5,2) default 0,

  -- Last updated
  last_calculated_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table landing_page_stats enable row level security;

-- Indexes
create index idx_landing_stats_merchant on landing_page_stats(merchant_id);


-- 9. Session Management (会话管理 - 用于Admin登录)
create table admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references admin_users(id) on delete cascade not null,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

alter table admin_sessions enable row level security;

-- Indexes
create index idx_admin_sessions_token on admin_sessions(token);
create index idx_admin_sessions_expires on admin_sessions(expires_at);


-- ==========================================
-- 更新现有表结构
-- ==========================================

-- Update merchants table
alter table merchants add column if not exists logo_url text;
alter table merchants add column if not exists is_active boolean default true;
alter table merchants add column if not exists ga4_measurement_id text;
alter table merchants add column if not exists updated_at timestamptz default now();

-- Update coupons table
alter table coupons add column if not exists expires_at timestamptz;
alter table coupons add column if not exists redeemed_at timestamptz;

-- Update users table
-- Add unique constraint for phone (if not exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_phone_unique'
  ) then
    alter table users add constraint users_phone_unique unique(phone);
  end if;
end $$;

create index if not exists idx_users_phone on users(phone);
create index if not exists idx_users_email on users(email);


-- ==========================================
-- 触发器：自动更新 updated_at
-- ==========================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_merchants_updated_at before update on merchants
  for each row execute function update_updated_at_column();

create trigger update_admin_users_updated_at before update on admin_users
  for each row execute function update_updated_at_column();

create trigger update_ad_campaigns_updated_at before update on ad_campaigns
  for each row execute function update_updated_at_column();


-- Setup complete


-- Add redeem_pin for store redemption terminal
alter table merchants add column if not exists redeem_pin text;


-- ==========================================
-- Apple Wallet 集成字段
-- ==========================================

-- 为商家添加地理位置信息（用于 Apple Wallet 地理围栏提醒）
alter table merchants add column if not exists latitude DECIMAL(9,6);
alter table merchants add column if not exists longitude DECIMAL(10,6);
alter table merchants add column if not exists address TEXT;

-- 为地理位置查询添加索引
create index if not exists idx_merchants_location on merchants(latitude, longitude);

-- 为优惠券添加 Apple Wallet 相关字段
alter table coupons add column if not exists apple_push_token TEXT;
alter table coupons add column if not exists apple_pass_type_id TEXT;
alter table coupons add column if not exists apple_serial_number TEXT UNIQUE;
alter table coupons add column if not exists apple_pass_url TEXT;  -- 存储生成的 .pkpass 文件 URL

-- 为 Apple Wallet 字段添加索引
create index if not exists idx_coupons_apple_serial on coupons(apple_serial_number);
create index if not exists idx_coupons_apple_token on coupons(apple_push_token);

-- 为优惠券添加验证令牌（用于 Apple Wallet Web Service 鉴权）
alter table coupons add column if not exists authentication_token TEXT;


-- ==========================================
-- Apple Wallet Web Service (WWS) 设备注册表
-- ==========================================

-- 创建钱包注册表（记录设备与卡券的绑定关系及推送令牌）
create table if not exists wallet_registrations (
    id uuid primary key default gen_random_uuid(),
    device_id text not null,
    push_token text not null,
    pass_type_id text not null,
    serial_number text not null,
    coupon_id uuid references coupons(id) on delete cascade,
    created_at timestamptz default now(),
    unique(device_id, pass_type_id, serial_number)
);

-- 为更新查询添加索引
create index if not exists idx_wallet_reg_lookup on wallet_registrations(device_id, pass_type_id);
create index if not exists idx_wallet_reg_serial on wallet_registrations(serial_number);

-- RLS 策略
alter table wallet_registrations enable row level security;
