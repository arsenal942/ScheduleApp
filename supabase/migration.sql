-- ============================================================
-- Schedule App — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Base weekly template blocks
-- These represent the recurring weekly schedule
create table template_blocks (
  id uuid primary key default gen_random_uuid(),
  day text not null check (day in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  sort_order integer not null,
  time_label text not null,          -- e.g. "7:15 – 8:00 AM"
  category text not null,            -- e.g. "engineroom", "fitfocus", "immutable"
  description text not null,         -- e.g. "Deep work session"
  hours numeric(4,2) not null,       -- e.g. 3.25
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast day lookups
create index idx_template_blocks_day on template_blocks(day, sort_order);

-- Week-specific override blocks
-- When present for a given week_start + day, these REPLACE the template for that day
create table week_overrides (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,          -- always a Monday (start of ISO week)
  day text not null check (day in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  sort_order integer not null,
  time_label text not null,
  category text not null,
  description text not null,
  hours numeric(4,2) not null,
  note text,                         -- optional reason for the override
  created_by text not null,          -- email of who created it
  created_at timestamptz default now()
);

-- Index for fast week+day lookups
create index idx_week_overrides_lookup on week_overrides(week_start, day, sort_order);

-- Audit log for changes (optional but useful)
create table schedule_audit (
  id uuid primary key default gen_random_uuid(),
  action text not null,              -- 'create', 'update', 'delete', 'reorder', 'override_create', 'override_delete'
  table_name text not null,          -- 'template_blocks' or 'week_overrides'
  record_id uuid,
  day text,
  details jsonb,                     -- what changed
  performed_by text not null,        -- email
  performed_at timestamptz default now()
);

-- Auto-update updated_at on template_blocks
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger template_blocks_updated_at
  before update on template_blocks
  for each row execute function update_updated_at();

-- Row Level Security
alter table template_blocks enable row level security;
alter table week_overrides enable row level security;
alter table schedule_audit enable row level security;

-- Since auth is handled at the app layer (NextAuth), we use
-- a service role key server-side. These policies allow full
-- access for the service role.
create policy "Service role full access" on template_blocks
  for all using (true) with check (true);

create policy "Service role full access" on week_overrides
  for all using (true) with check (true);

create policy "Service role full access" on schedule_audit
  for all using (true) with check (true);
