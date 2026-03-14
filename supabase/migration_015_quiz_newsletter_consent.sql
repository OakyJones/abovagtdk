-- Migration 015: Tilføj newsletter_consent til quiz_results
-- Juridisk: Markedsføringsloven kræver eksplicit samtykke til drip-emails (dag 3/7/14/90)
-- Default false = eksisterende brugere får IKKE drip-emails

ALTER TABLE quiz_results
ADD COLUMN IF NOT EXISTS newsletter_consent boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS newsletter_consent_at timestamptz;
