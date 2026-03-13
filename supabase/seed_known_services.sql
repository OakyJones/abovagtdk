-- ============================================================
-- Seed: known_services — Danske abonnementer med priser og opsigelse
-- Run after migration_001
-- ============================================================

-- STREAMING & TV
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Netflix', 'streaming', 79, 0, 0, now()),
  ('Viaplay', 'streaming', 119, 0, 0, now()),
  ('Disney+', 'streaming', 49, 0, 0, now()),
  ('Max/HBO', 'streaming', 89, 0, 0, now()),
  ('TV2 Play', 'streaming', 69, 0, 0, now()),
  ('Amazon Prime Video', 'streaming', 59, 0, 0, now()),
  ('Apple TV+', 'streaming', 79, 0, 0, now()),
  ('SkyShowtime', 'streaming', 99, 0, 0, now()),
  ('Paramount+', 'streaming', 69, 0, 0, now()),
  ('Nordisk Film+', 'streaming', 59, 0, 0, now()),
  ('C More', 'streaming', 99, 0, 0, now()),
  ('Discovery+', 'streaming', 49, 0, 0, now()),
  ('DAZN', 'streaming', 79, 0, 0, now()),
  ('Hayu', 'streaming', 49, 0, 0, now());

-- MUSIK & LYDBØGER
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Spotify', 'music', 99, 0, 0, now()),
  ('Apple Music', 'music', 99, 0, 0, now()),
  ('YouTube Premium', 'music', 79, 0, 0, now()),
  ('Tidal', 'music', 99, 0, 0, now()),
  ('Mofibo', 'music', 149, 0, 0, now()),
  ('Audible', 'music', 149, 0, 0, now()),
  ('Nextory', 'music', 149, 0, 0, now()),
  ('Saxo Premium', 'music', 149, 0, 0, now()),
  ('Podimo', 'music', 79, 0, 0, now());

-- FITNESS
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Fitness World', 'fitness', 199, 30, 0, now()),
  ('SATS', 'fitness', 299, 30, 0, now()),
  ('Fresh Fitness', 'fitness', 149, 30, 0, now()),
  ('Loop Fitness', 'fitness', 199, 30, 0, now()),
  ('DGI Fitness', 'fitness', 179, 30, 0, now()),
  ('Repeat', 'fitness', 149, 0, 0, now()),
  ('Fitnessdk', 'fitness', 249, 30, 0, now());

-- SOFTWARE & CLOUD
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Microsoft 365', 'software', 89, 0, 0, now()),
  ('Adobe Creative Cloud', 'software', 189, 0, 12, now()),
  ('iCloud+', 'software', 9, 0, 0, now()),
  ('Google One', 'software', 20, 0, 0, now()),
  ('Dropbox', 'software', 99, 0, 0, now()),
  ('1Password', 'software', 29, 0, 0, now()),
  ('NordVPN', 'software', 49, 0, 0, now()),
  ('ChatGPT Plus', 'software', 149, 0, 0, now()),
  ('Canva Pro', 'software', 99, 0, 0, now());

-- GAMING
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('PlayStation Plus', 'gaming', 59, 0, 0, now()),
  ('Xbox Game Pass', 'gaming', 79, 0, 0, now()),
  ('Nintendo Switch Online', 'gaming', 29, 0, 0, now()),
  ('EA Play', 'gaming', 39, 0, 0, now()),
  ('GeForce NOW', 'gaming', 99, 0, 0, now());

-- MADLEVERING & BOKSE
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('HelloFresh', 'food', 1596, 0, 0, now()),
  ('Goodiebox', 'food', 249, 0, 0, now()),
  ('SimpleCook', 'food', 1396, 0, 0, now()),
  ('RetNemt', 'food', 1596, 0, 0, now()),
  ('Aarstiderne', 'food', 1596, 0, 0, now()),
  ('GreenMeal', 'food', 1396, 0, 0, now());

-- AVISER & MAGASINER
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Politiken', 'news', 199, 30, 0, now()),
  ('Berlingske', 'news', 199, 30, 0, now()),
  ('Jyllands-Posten', 'news', 179, 30, 0, now()),
  ('Ekstra Bladet+', 'news', 79, 0, 0, now()),
  ('BT+', 'news', 59, 0, 0, now()),
  ('Zetland', 'news', 129, 0, 0, now()),
  ('The New York Times', 'news', 49, 0, 0, now());

-- MOBIL & INTERNET
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Telmore', 'telecom', 149, 0, 0, now()),
  ('YouSee', 'telecom', 199, 30, 0, now()),
  ('Oister', 'telecom', 99, 0, 0, now()),
  ('CBB Mobil', 'telecom', 79, 0, 0, now()),
  ('Greenspeak', 'telecom', 99, 0, 0, now()),
  ('Lebara', 'telecom', 49, 0, 0, now());

-- BREDBÅND & INTERNET
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Norlys Bredbånd', 'broadband', 299, 30, 0, now()),
  ('Stofa Bredbånd', 'broadband', 249, 30, 0, now()),
  ('Waoo', 'broadband', 249, 30, 0, now()),
  ('YouSee Bredbånd', 'broadband', 299, 30, 0, now()),
  ('Fastspeed', 'broadband', 249, 30, 0, now()),
  ('Hiper', 'broadband', 199, 0, 0, now());

-- TV-PAKKER
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('YouSee TV', 'tv', 199, 30, 0, now()),
  ('Allente', 'tv', 199, 30, 0, now()),
  ('Boxer', 'tv', 199, 30, 0, now()),
  ('Waoo TV', 'tv', 199, 30, 0, now()),
  ('Stofa TV', 'tv', 179, 30, 0, now());

-- ALARM & SIKKERHED
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Verisure', 'alarm', 399, 0, 12, now()),
  ('Sector Alarm', 'alarm', 349, 0, 12, now()),
  ('AJAX Alarm', 'alarm', 199, 30, 0, now()),
  ('Norlys Alarm', 'alarm', 299, 0, 12, now());

-- FAGFORENING & A-KASSE
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('HK Danmark', 'union', 499, 30, 0, now()),
  ('3F', 'union', 549, 30, 0, now()),
  ('Krifa', 'union', 399, 30, 0, now()),
  ('Det Faglige Hus', 'union', 299, 30, 0, now()),
  ('ASE', 'union', 299, 30, 0, now()),
  ('Lederne', 'union', 599, 30, 0, now());

-- SYGEFORSIKRING
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Sygeforsikringen "danmark"', 'health', 95, 30, 0, now());

-- EL & ENERGI
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Norlys El', 'energy', 99, 0, 0, now()),
  ('Ørsted', 'energy', 99, 0, 0, now()),
  ('Ewii', 'energy', 79, 0, 0, now()),
  ('Clever elbil-abo', 'energy', 249, 0, 0, now());

-- KONTAKTLINSER
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Lensway', 'contacts', 199, 0, 0, now()),
  ('Synoptik Linseabo', 'contacts', 249, 30, 0, now()),
  ('Louis Nielsen Linseabo', 'contacts', 229, 30, 0, now());

-- VITAMIN & KOSTTILSKUD
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Puori', 'vitamins', 199, 0, 0, now()),
  ('Bodylab', 'vitamins', 149, 0, 0, now()),
  ('SATS Nutrition', 'vitamins', 179, 0, 0, now()),
  ('Vitaepro', 'vitamins', 299, 0, 0, now());

-- TRANSPORT
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Rejsekort Pendler', 'transport', 500, 0, 0, now()),
  ('DSB Orange', 'transport', 199, 30, 0, now()),
  ('Donkey Republic', 'transport', 89, 0, 0, now()),
  ('Lime', 'transport', 79, 0, 0, now());

-- OPBEVARING
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('City Self Storage', 'storage', 499, 30, 0, now()),
  ('Pelican Self Storage', 'storage', 449, 30, 0, now()),
  ('Shurgard', 'storage', 399, 30, 0, now());

-- KÆLEDYR
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Buddy', 'pets', 299, 0, 0, now()),
  ('Petlux', 'pets', 249, 0, 0, now()),
  ('Animail', 'pets', 199, 0, 0, now()),
  ('Dyreforsikring', 'pets', 199, 30, 0, now());

-- RENGØRING
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Happy Helper', 'cleaning', 799, 0, 0, now()),
  ('Hilfr', 'cleaning', 699, 0, 0, now()),
  ('Cliive', 'cleaning', 749, 0, 0, now());

-- PERSONLIG PLEJE
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Estrid', 'grooming', 59, 0, 0, now()),
  ('Dollar Shave Club', 'grooming', 69, 0, 0, now()),
  ('Goodiebox', 'grooming', 249, 0, 0, now());

-- TØJ & MODE
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Stitch Fix', 'fashion', 149, 0, 0, now()),
  ('Miinto+', 'fashion', 49, 0, 0, now()),
  ('Zalando Plus', 'fashion', 49, 0, 0, now());

-- ELEKTRONIK-LEJE
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Grover', 'electronics', 299, 0, 0, now()),
  ('myway', 'electronics', 199, 0, 0, now());

-- DATING
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Tinder', 'dating', 89, 0, 0, now()),
  ('Bumble', 'dating', 199, 0, 0, now()),
  ('Hinge', 'dating', 149, 0, 0, now());

-- DIVERSE
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_updated_at) values
  ('Amazon Prime', 'misc', 59, 0, 0, now()),
  ('Vivino Premium', 'misc', 59, 0, 0, now()),
  ('Headspace', 'misc', 69, 0, 0, now()),
  ('Calm', 'misc', 49, 0, 0, now()),
  ('Strava', 'misc', 49, 0, 0, now());
