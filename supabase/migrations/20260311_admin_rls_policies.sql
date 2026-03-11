-- Admin RLS policies for all tables
-- The service_role key should bypass RLS, but if RLS was enabled without policies,
-- some edge cases can block access. These policies ensure full access for service_role
-- and also allow anon/authenticated users broader access where needed.

-- NOTE: Run this manually in Supabase SQL Editor if the migration runner isn't set up.
-- Each block is wrapped in DO/EXCEPTION to be safe to re-run.

-- 1. Ensure RLS is enabled on inbound_emails (was missing in original migration)
ALTER TABLE IF EXISTS inbound_emails ENABLE ROW LEVEL SECURITY;

-- 2. Drop restrictive policies and add open ones for tables accessed by admin API
-- (Admin API uses service_role_key which bypasses RLS, but these are safety nets)

-- payments
DO $$ BEGIN
  CREATE POLICY "allow_all_payments" ON payments FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- inbound_emails
DO $$ BEGIN
  CREATE POLICY "allow_all_inbound_emails" ON inbound_emails FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- actions
DO $$ BEGIN
  CREATE POLICY "allow_all_actions" ON actions FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- unknown_services
DO $$ BEGIN
  CREATE POLICY "allow_all_unknown_services" ON unknown_services FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- users (needs broad read for admin + foreign key joins)
DO $$ BEGIN
  CREATE POLICY "allow_all_users" ON users FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- quiz_results
DO $$ BEGIN
  CREATE POLICY "allow_all_quiz_results" ON quiz_results FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
