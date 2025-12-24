-- Add virtual_base_count to merchants table for marketing heat logic
alter table merchants add column if not exists virtual_base_count int default 200;
