-- ============================================================
-- AboVagt Complete Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- ===== 1. USERS =====
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz not null default now(),
  quiz_completed bool not null default false,
  tink_connected bool not null default false,
  stripe_customer_id text
);

-- ===== 2. KNOWN SERVICES =====
create table if not exists known_services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text,
  logo_url text,
  current_price numeric,
  price_tiers jsonb,
  cancel_url text,
  cancel_email_template text,
  cancellation_period_days int not null default 0,
  binding_months int not null default 0,
  price_updated_at timestamptz,
  observation_count int not null default 0
);

-- ===== 3. QUIZ RESULTS =====
create table if not exists quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  email text not null,
  selected_services jsonb not null default '[]'::jsonb,
  usage_frequency jsonb not null default '{}'::jsonb,
  estimated_monthly_cost numeric not null default 0,
  estimated_savings numeric not null default 0,
  converted_to_scan bool not null default false,
  created_at timestamptz not null default now()
);

-- ===== 4. BANK CONNECTIONS =====
create table if not exists bank_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references users(id) on delete cascade,
  tink_credential_id text,
  bank_name text,
  connected_at timestamptz not null default now(),
  last_scan_at timestamptz
);

-- ===== 5. SUBSCRIPTIONS =====
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references users(id) on delete cascade,
  service_name text not null,
  known_service_id uuid references known_services(id),
  monthly_amount numeric not null,
  detected_at timestamptz not null default now(),
  status text not null default 'active'
);

-- ===== 6. ACTIONS =====
create table if not exists actions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references users(id) on delete cascade,
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  type text not null check (type in ('cancel', 'downgrade')),
  savings_from_date date,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);

-- ===== 7. PAYMENTS =====
create table if not exists payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references users(id) on delete cascade,
  action_id uuid not null references actions(id) on delete cascade,
  amount numeric not null,
  stripe_payment_id text,
  paid_at timestamptz
);

-- ===== 8. SCANS =====
create table if not exists scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references users(id) on delete cascade,
  bank_connection_id uuid not null references bank_connections(id) on delete cascade,
  transactions_found int not null default 0,
  subscriptions_found int not null default 0,
  scanned_at timestamptz not null default now()
);

-- ===== 9. DRIP EMAILS =====
create table if not exists drip_emails (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references users(id) on delete cascade,
  quiz_result_id uuid not null references quiz_results(id) on delete cascade,
  day int not null check (day in (3, 7, 14, 90)),
  sent_at timestamptz,
  clicked bool not null default false
);

-- ===== 10. PRICE OBSERVATIONS =====
create table if not exists price_observations (
  id uuid default gen_random_uuid() primary key,
  known_service_id uuid not null references known_services(id) on delete cascade,
  observed_price numeric not null,
  observed_at timestamptz not null default now()
);

-- ===== 11. UNKNOWN SERVICES =====
create table if not exists unknown_services (
  id uuid default gen_random_uuid() primary key,
  transaction_name text not null,
  observed_price numeric,
  observation_count int not null default 1,
  reviewed bool not null default false
);


-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_quiz_results_user on quiz_results(user_id);
create index if not exists idx_quiz_results_email on quiz_results(email);
create index if not exists idx_quiz_results_created on quiz_results(created_at desc);
create index if not exists idx_bank_connections_user on bank_connections(user_id);
create index if not exists idx_subscriptions_user on subscriptions(user_id);
create index if not exists idx_actions_user on actions(user_id);
create index if not exists idx_payments_user on payments(user_id);
create index if not exists idx_scans_user on scans(user_id);
create index if not exists idx_drip_emails_user on drip_emails(user_id);
create index if not exists idx_drip_emails_quiz on drip_emails(quiz_result_id);
create index if not exists idx_price_obs_service on price_observations(known_service_id);
create index if not exists idx_known_services_category on known_services(category);
create index if not exists idx_unknown_services_reviewed on unknown_services(reviewed);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Users: can read/update own row
alter table users enable row level security;
create policy "users_select_own" on users for select using (auth.uid() = id);
create policy "users_update_own" on users for update using (auth.uid() = id);
create policy "users_insert_anon" on users for insert with check (true);

-- Quiz results: insert anon, read own
alter table quiz_results enable row level security;
create policy "quiz_insert_anon" on quiz_results for insert with check (true);
create policy "quiz_select_own" on quiz_results for select using (
  user_id = auth.uid() or user_id is null
);

-- Bank connections: own only
alter table bank_connections enable row level security;
create policy "bank_select_own" on bank_connections for select using (user_id = auth.uid());
create policy "bank_insert_own" on bank_connections for insert with check (user_id = auth.uid());
create policy "bank_update_own" on bank_connections for update using (user_id = auth.uid());

-- Subscriptions: own only
alter table subscriptions enable row level security;
create policy "subs_select_own" on subscriptions for select using (user_id = auth.uid());
create policy "subs_insert_own" on subscriptions for insert with check (user_id = auth.uid());
create policy "subs_update_own" on subscriptions for update using (user_id = auth.uid());

-- Actions: own only
alter table actions enable row level security;
create policy "actions_select_own" on actions for select using (user_id = auth.uid());
create policy "actions_insert_own" on actions for insert with check (user_id = auth.uid());
create policy "actions_update_own" on actions for update using (user_id = auth.uid());

-- Payments: own only
alter table payments enable row level security;
create policy "payments_select_own" on payments for select using (user_id = auth.uid());
create policy "payments_insert_own" on payments for insert with check (user_id = auth.uid());

-- Scans: own only
alter table scans enable row level security;
create policy "scans_select_own" on scans for select using (user_id = auth.uid());
create policy "scans_insert_own" on scans for insert with check (user_id = auth.uid());

-- Drip emails: own only
alter table drip_emails enable row level security;
create policy "drip_select_own" on drip_emails for select using (user_id = auth.uid());
create policy "drip_insert_anon" on drip_emails for insert with check (true);
create policy "drip_update_anon" on drip_emails for update with check (true);

-- Known services: public read
alter table known_services enable row level security;
create policy "known_services_public_read" on known_services for select using (true);

-- Price observations: public read
alter table price_observations enable row level security;
create policy "price_obs_public_read" on price_observations for select using (true);
create policy "price_obs_insert" on price_observations for insert with check (true);

-- Unknown services: insert anon, no public read
alter table unknown_services enable row level security;
create policy "unknown_insert_anon" on unknown_services for insert with check (true);
