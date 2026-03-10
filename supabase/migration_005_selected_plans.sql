-- ============================================================
-- Migration 005: Add selected_plans to quiz_results
-- Run this in Supabase SQL Editor
-- ============================================================

ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS selected_plans jsonb NOT NULL DEFAULT '{}'::jsonb;
