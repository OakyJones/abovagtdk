-- Add signup_path to track how the user arrived
ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_path text DEFAULT 'quiz';
-- Valid values: 'quiz', 'connect'
