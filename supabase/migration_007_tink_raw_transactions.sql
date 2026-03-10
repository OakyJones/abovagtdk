-- ============================================================
-- Migration 007: Raw transactions table for Tink data
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS raw_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tink_transaction_id TEXT,
  account_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'DKK',
  description TEXT NOT NULL,
  booked_date DATE NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_raw_transactions_user ON raw_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_raw_transactions_booked ON raw_transactions(booked_date DESC);

-- RLS
ALTER TABLE raw_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "raw_tx_select_own" ON raw_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "raw_tx_insert_anon" ON raw_transactions FOR INSERT WITH CHECK (true);
