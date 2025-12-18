-- Migration: Add Analytics Columns

-- 1. Add UTM columns to users table (attribution)
alter table users add column if not exists utm_source text;
alter table users add column if not exists utm_medium text;
alter table users add column if not exists utm_campaign text;
alter table users add column if not exists utm_term text;
alter table users add column if not exists utm_content text;

-- 2. Add UTM columns to events table (for easier querying than JSONB)
alter table events add column if not exists utm_source text;
alter table events add column if not exists utm_medium text;
alter table events add column if not exists utm_campaign text;

-- 3. Create indexes for analytics
create index if not exists idx_users_utm_source on users(utm_source);
create index if not exists idx_users_utm_campaign on users(utm_campaign);
create index if not exists idx_events_utm_source on events(utm_source);
create index if not exists idx_events_utm_campaign on events(utm_campaign);

-- 4. Helper function to increment stats (safe equivalent)
create or replace function increment_coupon_claims(p_merchant_id uuid)
returns void as $$
begin
  update landing_page_stats
  set 
    total_coupon_claims = total_coupon_claims + 1,
    last_calculated_at = now()
  where merchant_id = p_merchant_id;
  
  if not found then
    insert into landing_page_stats (merchant_id, total_coupon_claims)
    values (p_merchant_id, 1);
  end if;
end;
$$ language plpgsql;

create or replace function increment_form_submits(p_merchant_id uuid)
returns void as $$
begin
  update landing_page_stats
  set 
    total_form_submits = total_form_submits + 1,
    last_calculated_at = now()
  where merchant_id = p_merchant_id;
  
  if not found then
    insert into landing_page_stats (merchant_id, total_form_submits)
    values (p_merchant_id, 1);
  end if;
end;
$$ language plpgsql;
