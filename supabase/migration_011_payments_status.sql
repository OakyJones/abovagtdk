-- ============================================================
-- Migration 011: Add status and captured_at to payments table
-- for delayed capture support
-- ============================================================

ALTER TABLE payments ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'authorized'
  CHECK (status IN ('authorized', 'captured', 'refunded'));

ALTER TABLE payments ADD COLUMN IF NOT EXISTS captured_at timestamptz;
