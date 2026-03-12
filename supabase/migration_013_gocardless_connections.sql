-- Track GoCardless/Tink bank connections per month
-- Used to monitor the free tier limit (50 connections/month)
create table if not exists bank_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  provider text not null default 'tink', -- 'tink' or 'gocardless'
  created_at timestamptz not null default now()
);

-- Index for monthly count queries
create index if not exists idx_bank_connections_created_at on bank_connections(created_at);
