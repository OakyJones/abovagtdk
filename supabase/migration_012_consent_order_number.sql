-- ============================================================
-- Migration 012: Add consent_given_at and order_number to payments
-- for legal compliance (forbrugeraftaleloven)
-- ============================================================

ALTER TABLE payments ADD COLUMN IF NOT EXISTS consent_given_at timestamptz;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_number text;
