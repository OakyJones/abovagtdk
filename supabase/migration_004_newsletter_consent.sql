-- ============================================================
-- Migration 004: Newsletter consent + email segmentation
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add newsletter_consent to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS newsletter_consent bool NOT NULL DEFAULT false;

-- Add contact_status to users for "kontaktet" / "konverteret" tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_status text CHECK (contact_status IN ('none', 'contacted', 'converted')) DEFAULT 'none';
