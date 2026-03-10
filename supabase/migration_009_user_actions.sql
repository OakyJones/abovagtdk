-- Add user_actions jsonb column to quiz_results to store per-service choices (keep/downgrade/cancel)
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS user_actions jsonb DEFAULT '{}';
