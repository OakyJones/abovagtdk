-- ============================================================
-- Migration 006: Add direction to inbound_emails for outbound tracking
-- Run this in Supabase SQL Editor
-- ============================================================

ALTER TABLE inbound_emails ADD COLUMN IF NOT EXISTS direction text NOT NULL DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound'));
CREATE INDEX IF NOT EXISTS idx_inbound_emails_direction ON inbound_emails(direction);
