-- Inbound emails from Resend webhook
CREATE TABLE IF NOT EXISTS inbound_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT,
  body_html TEXT,
  body_text TEXT,
  tag TEXT NOT NULL DEFAULT 'other',
  is_read BOOLEAN NOT NULL DEFAULT false,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email attachments
CREATE TABLE IF NOT EXISTS email_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES inbound_emails(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content_type TEXT,
  storage_path TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inbound_emails_received_at ON inbound_emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbound_emails_tag ON inbound_emails(tag);
CREATE INDEX IF NOT EXISTS idx_email_attachments_email_id ON email_attachments(email_id);
