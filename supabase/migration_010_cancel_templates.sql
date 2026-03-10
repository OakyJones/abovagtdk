-- ============================================================
-- Migration 010: Add cancel_url and cancel_email_template to known_services
-- ============================================================

-- Update streaming services
UPDATE known_services SET cancel_url = 'https://www.netflix.com/cancelplan', cancel_email_template = 'Opsigelse af Netflix-abonnement' WHERE name = 'Netflix';
UPDATE known_services SET cancel_url = 'https://account.viaplay.dk/subscription', cancel_email_template = 'Opsigelse af Viaplay-abonnement' WHERE name = 'Viaplay';
UPDATE known_services SET cancel_url = 'https://www.disneyplus.com/account', cancel_email_template = 'Opsigelse af Disney+-abonnement' WHERE name = 'Disney+';
UPDATE known_services SET cancel_url = 'https://play.max.com/settings/subscription', cancel_email_template = 'Opsigelse af Max/HBO-abonnement' WHERE name = 'Max/HBO';
UPDATE known_services SET cancel_url = 'https://play.tv2.dk/profil/abonnement', cancel_email_template = 'Opsigelse af TV2 Play-abonnement' WHERE name = 'TV2 Play';

-- Update music services
UPDATE known_services SET cancel_url = 'https://www.spotify.com/account/subscription/', cancel_email_template = 'Opsigelse af Spotify-abonnement' WHERE name = 'Spotify';
UPDATE known_services SET cancel_url = 'https://support.apple.com/da-dk/HT202039', cancel_email_template = 'Opsigelse af Apple Music-abonnement' WHERE name = 'Apple Music';
UPDATE known_services SET cancel_url = 'https://www.youtube.com/paid_memberships', cancel_email_template = 'Opsigelse af YouTube Premium-abonnement' WHERE name = 'YouTube Premium';

-- Update software
UPDATE known_services SET cancel_url = 'https://account.adobe.com/plans', cancel_email_template = 'Opsigelse af Adobe Creative Cloud-abonnement' WHERE name = 'Adobe Creative Cloud';
UPDATE known_services SET cancel_url = 'https://chat.openai.com/#settings/subscription', cancel_email_template = 'Opsigelse af ChatGPT Plus-abonnement' WHERE name = 'ChatGPT Plus';
