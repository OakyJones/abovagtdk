-- Quiz results table for AboVagt
-- Run this in Supabase SQL Editor

create table if not exists quiz_results (
  id uuid default gen_random_uuid() primary key,
  session_id text not null,
  selected_services jsonb not null default '[]'::jsonb,
  usage_frequency jsonb not null default '{}'::jsonb,
  estimated_monthly_cost integer not null default 0,
  estimated_savings integer not null default 0,
  converted_to_scan boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index for analytics
create index if not exists idx_quiz_results_created_at on quiz_results (created_at desc);
create index if not exists idx_quiz_results_session on quiz_results (session_id);

-- Enable RLS
alter table quiz_results enable row level security;

-- Allow anonymous inserts (quiz submissions)
create policy "Allow anonymous inserts" on quiz_results
  for insert with check (true);

-- Only allow reading own session
create policy "Allow reading own session" on quiz_results
  for select using (true);
