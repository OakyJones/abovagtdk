-- Migration 016: Admin chat table for Jonas <-> Mik communication
CREATE TABLE IF NOT EXISTS admin_chat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender TEXT NOT NULL CHECK (sender IN ('jonas', 'mik')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_by_mik BOOLEAN DEFAULT FALSE,
  mik_action_taken TEXT,
  mik_action_result TEXT
);

-- RLS
ALTER TABLE admin_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on admin_chat"
  ON admin_chat
  FOR ALL
  USING (true)
  WITH CHECK (true);
