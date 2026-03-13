-- ============================================================
-- Seed: known_services — Danske abonnementer med priser, opsigelse og price_tiers
-- Run after migration_001
-- price_tiers: JSON array med alle planer og priser for nedgraderingsforslag
-- ============================================================

-- STREAMING & TV
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Netflix', 'streaming', 79, 0, 0, '[{"plan":"Basis m/reklamer","price":79},{"plan":"Standard","price":119},{"plan":"Premium","price":179}]'::jsonb, now()),
  ('Viaplay', 'streaming', 99, 0, 0, '[{"plan":"Film & Serier m. reklamer","price":99},{"plan":"Film & Serier","price":149},{"plan":"Total","price":449},{"plan":"Premium","price":499}]'::jsonb, now()),
  ('Disney+', 'streaming', 89, 0, 0, '[{"plan":"Standard","price":89},{"plan":"Premium","price":139}]'::jsonb, now()),
  ('Max/HBO', 'streaming', 69, 0, 0, '[{"plan":"Basis","price":69},{"plan":"Standard","price":99},{"plan":"Premium","price":149}]'::jsonb, now()),
  ('TV2 Play', 'streaming', 69, 0, 0, null, now()),
  ('Amazon Prime Video', 'streaming', 59, 0, 0, null, now()),
  ('Apple TV+', 'streaming', 79, 0, 0, null, now()),
  ('SkyShowtime', 'streaming', 99, 0, 0, null, now()),
  ('Paramount+', 'streaming', 69, 0, 0, null, now()),
  ('Nordisk Film+', 'streaming', 59, 0, 0, null, now()),
  ('C More', 'streaming', 99, 0, 0, null, now()),
  ('Discovery+', 'streaming', 49, 0, 0, null, now()),
  ('DAZN', 'streaming', 79, 0, 0, null, now()),
  ('Hayu', 'streaming', 49, 0, 0, null, now()),
  ('Patreon', 'streaming', 50, 0, 0, '[{"plan":"Variabel","price":50,"note":"gennemsnit"}]'::jsonb, now()),
  ('Twitch', 'streaming', 39, 0, 0, '[{"plan":"Tier 1","price":39},{"plan":"Tier 2","price":79},{"plan":"Tier 3","price":189}]'::jsonb, now());

-- MUSIK & LYDBØGER
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Spotify', 'music', 119, 0, 0, '[{"plan":"Student","price":69},{"plan":"Individual","price":119},{"plan":"Duo","price":169},{"plan":"Family","price":199}]'::jsonb, now()),
  ('Apple Music', 'music', 109, 0, 0, '[{"plan":"Student","price":59},{"plan":"Individual","price":109},{"plan":"Family","price":169}]'::jsonb, now()),
  ('YouTube Premium', 'music', 139, 0, 0, '[{"plan":"Music","price":109},{"plan":"Premium","price":139},{"plan":"Family","price":179}]'::jsonb, now()),
  ('Tidal', 'music', 109, 0, 0, '[{"plan":"Individual","price":109},{"plan":"Family","price":169}]'::jsonb, now()),
  ('Mofibo', 'music', 149, 0, 0, null, now()),
  ('Audible', 'music', 149, 0, 0, null, now()),
  ('Nextory', 'music', 149, 0, 0, null, now()),
  ('Saxo Premium', 'music', 149, 0, 0, null, now()),
  ('Podimo', 'music', 79, 0, 0, null, now());

-- FITNESS
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Fitness World', 'fitness', 149, 30, 0, '[{"plan":"Basis","price":149},{"plan":"Premium","price":249},{"plan":"VIP","price":349}]'::jsonb, now()),
  ('SATS', 'fitness', 299, 30, 0, '[{"plan":"Basis","price":199},{"plan":"All-in","price":299}]'::jsonb, now()),
  ('Fresh Fitness', 'fitness', 149, 30, 0, null, now()),
  ('Loop Fitness', 'fitness', 199, 30, 0, null, now()),
  ('DGI Fitness', 'fitness', 179, 30, 0, null, now()),
  ('Repeat', 'fitness', 149, 0, 0, null, now()),
  ('Fitnessdk', 'fitness', 249, 30, 0, null, now()),
  ('MyFitnessPal', 'fitness', 79, 0, 0, '[{"plan":"Premium","price":79}]'::jsonb, now()),
  ('Noom', 'fitness', 149, 0, 0, '[{"plan":"Månedlig","price":149},{"plan":"Årlig","price":99,"note":"pr md ved årlig"}]'::jsonb, now());

-- SOFTWARE & CLOUD
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Microsoft 365', 'software', 89, 0, 0, '[{"plan":"Personal","price":89},{"plan":"Family","price":129}]'::jsonb, now()),
  ('Adobe Creative Cloud', 'software', 189, 0, 12, null, now()),
  ('iCloud+', 'software', 9, 0, 0, '[{"plan":"50 GB","price":9},{"plan":"200 GB","price":29},{"plan":"2 TB","price":79}]'::jsonb, now()),
  ('Google One', 'software', 20, 0, 0, '[{"plan":"100 GB","price":20},{"plan":"200 GB","price":30},{"plan":"2 TB","price":100}]'::jsonb, now()),
  ('Dropbox', 'software', 99, 0, 0, null, now()),
  ('1Password', 'software', 29, 0, 0, null, now()),
  ('NordVPN', 'software', 49, 0, 0, null, now()),
  ('ChatGPT Plus', 'software', 149, 0, 0, null, now()),
  ('Canva Pro', 'software', 99, 0, 0, null, now()),
  ('Claude', 'software', 149, 0, 0, '[{"plan":"Pro","price":149},{"plan":"Max 5x","price":1500}]'::jsonb, now()),
  ('GitHub Copilot', 'software', 75, 0, 0, '[{"plan":"Individual","price":75},{"plan":"Business","price":140}]'::jsonb, now()),
  ('Midjourney', 'software', 220, 0, 0, '[{"plan":"Basic","price":75},{"plan":"Standard","price":220},{"plan":"Pro","price":440}]'::jsonb, now()),
  ('Cursor', 'software', 150, 0, 0, '[{"plan":"Pro","price":150},{"plan":"Business","price":300}]'::jsonb, now()),
  ('Figma', 'software', 100, 0, 0, '[{"plan":"Professional","price":100},{"plan":"Organization","price":330}]'::jsonb, now()),
  ('Slack', 'software', 60, 0, 0, '[{"plan":"Pro","price":60},{"plan":"Business+","price":95}]'::jsonb, now()),
  ('Zoom', 'software', 100, 0, 0, '[{"plan":"Pro","price":100},{"plan":"Business","price":150}]'::jsonb, now()),
  ('Notion', 'software', 60, 0, 0, '[{"plan":"Plus","price":60},{"plan":"Business","price":120}]'::jsonb, now()),
  ('Linear', 'software', 60, 0, 0, '[{"plan":"Standard","price":60},{"plan":"Plus","price":100}]'::jsonb, now()),
  ('Superhuman', 'software', 200, 0, 0, '[{"plan":"Standard","price":200}]'::jsonb, now());

-- GAMING
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('PlayStation Plus', 'gaming', 59, 0, 0, '[{"plan":"Essential","price":59},{"plan":"Extra","price":99},{"plan":"Premium","price":119}]'::jsonb, now()),
  ('Xbox Game Pass', 'gaming', 79, 0, 0, '[{"plan":"Core","price":59},{"plan":"Standard","price":79},{"plan":"Ultimate","price":119}]'::jsonb, now()),
  ('Nintendo Switch Online', 'gaming', 29, 0, 0, '[{"plan":"Individual","price":29},{"plan":"Family","price":49},{"plan":"Expansion Pack","price":59}]'::jsonb, now()),
  ('EA Play', 'gaming', 39, 0, 0, null, now()),
  ('GeForce NOW', 'gaming', 99, 0, 0, null, now());

-- MADLEVERING & BOKSE
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('HelloFresh', 'food', 1596, 0, 0, null, now()),
  ('Goodiebox', 'food', 249, 0, 0, null, now()),
  ('SimpleCook', 'food', 1396, 0, 0, null, now()),
  ('RetNemt', 'food', 1596, 0, 0, null, now()),
  ('Aarstiderne', 'food', 1596, 0, 0, null, now()),
  ('GreenMeal', 'food', 1396, 0, 0, null, now()),
  ('Nemlig.com Plus', 'food', 49, 0, 0, '[{"plan":"Plus","price":49}]'::jsonb, now()),
  ('Wolt+', 'food', 49, 0, 0, '[{"plan":"Wolt+","price":49}]'::jsonb, now()),
  ('Too Good To Go', 'food', 0, 0, 0, null, now()),
  ('EatGrim', 'food', 99, 0, 0, '[{"plan":"Standard","price":99},{"plan":"Stor","price":149}]'::jsonb, now());

-- AVISER & MAGASINER
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Politiken', 'news', 199, 30, 0, null, now()),
  ('Berlingske', 'news', 199, 30, 0, null, now()),
  ('Jyllands-Posten', 'news', 179, 30, 0, null, now()),
  ('Ekstra Bladet+', 'news', 79, 0, 0, null, now()),
  ('BT+', 'news', 59, 0, 0, null, now()),
  ('Zetland', 'news', 129, 0, 0, null, now()),
  ('The New York Times', 'news', 49, 0, 0, null, now()),
  ('Frihedsbrevet', 'news', 99, 0, 0, '[{"plan":"Månedlig","price":99},{"plan":"Årlig","price":79,"note":"pr md ved årlig"}]'::jsonb, now()),
  ('Weekendavisen', 'news', 99, 30, 0, '[{"plan":"Digital","price":99},{"plan":"Digital+Papir","price":199}]'::jsonb, now()),
  ('Third Ear', 'news', 79, 0, 0, '[{"plan":"Månedlig","price":79},{"plan":"Årlig","price":59,"note":"pr md ved årlig"}]'::jsonb, now()),
  ('r8Dio', 'news', 49, 0, 0, '[{"plan":"Medlem","price":49},{"plan":"Støttemedlem","price":99}]'::jsonb, now()),
  ('Kontoret', 'news', 49, 0, 0, '[{"plan":"Standard","price":49}]'::jsonb, now()),
  ('Kristeligt Dagblad', 'news', 99, 30, 0, '[{"plan":"Digital","price":99},{"plan":"Digital+Papir","price":299}]'::jsonb, now()),
  ('Ingeniøren', 'news', 99, 0, 0, '[{"plan":"Digital","price":99},{"plan":"Premium","price":199}]'::jsonb, now()),
  ('Altinget', 'news', 149, 0, 0, '[{"plan":"Basis","price":149},{"plan":"Pro","price":299}]'::jsonb, now()),
  ('Acast+', 'news', 39, 0, 0, '[{"plan":"Standard","price":39}]'::jsonb, now());

-- MOBIL & INTERNET
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Telmore', 'telecom', 149, 0, 0, null, now()),
  ('YouSee', 'telecom', 199, 30, 0, null, now()),
  ('Oister', 'telecom', 99, 0, 0, null, now()),
  ('CBB Mobil', 'telecom', 79, 0, 0, null, now()),
  ('Greenspeak', 'telecom', 99, 0, 0, '[{"plan":"6GB","price":99},{"plan":"40GB","price":149},{"plan":"Fri data","price":199}]'::jsonb, now()),
  ('Lebara', 'telecom', 49, 0, 0, null, now()),
  ('Duka', 'telecom', 99, 0, 0, '[{"plan":"Mini","price":59},{"plan":"Medium","price":99},{"plan":"Stor","price":149},{"plan":"Ubegrænset","price":199}]'::jsonb, now()),
  ('Waoo Mobil', 'telecom', 119, 30, 0, '[{"plan":"1GB","price":49},{"plan":"20GB","price":119},{"plan":"80GB","price":179},{"plan":"Fri data","price":299}]'::jsonb, now()),
  ('Callme', 'telecom', 129, 0, 0, '[{"plan":"10GB","price":79},{"plan":"50GB","price":129},{"plan":"Fri data","price":169}]'::jsonb, now());

-- BREDBÅND & INTERNET
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Norlys Bredbånd', 'broadband', 199, 30, 0, '[{"plan":"100/100","price":199},{"plan":"500/500","price":299},{"plan":"1000/1000","price":449}]'::jsonb, now()),
  ('Stofa Bredbånd', 'broadband', 249, 30, 0, null, now()),
  ('Waoo', 'broadband', 249, 30, 0, null, now()),
  ('YouSee Bredbånd', 'broadband', 299, 30, 0, null, now()),
  ('Fastspeed', 'broadband', 199, 30, 0, '[{"plan":"100/100","price":199},{"plan":"500/500","price":269},{"plan":"1000/1000","price":399}]'::jsonb, now()),
  ('Hiper', 'broadband', 199, 0, 0, '[{"plan":"100/100","price":199},{"plan":"300/300","price":249},{"plan":"1000/1000","price":349}]'::jsonb, now()),
  ('Kviknet', 'broadband', 199, 0, 0, '[{"plan":"100/100","price":199},{"plan":"500/500","price":249},{"plan":"1000/1000","price":299}]'::jsonb, now());

-- TV-PAKKER
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('YouSee TV', 'tv', 199, 30, 0, null, now()),
  ('Allente', 'tv', 199, 30, 0, null, now()),
  ('Boxer', 'tv', 199, 30, 0, null, now()),
  ('Waoo TV', 'tv', 199, 30, 0, null, now()),
  ('Stofa TV', 'tv', 179, 30, 0, null, now());

-- ALARM & SIKKERHED
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Verisure', 'alarm', 399, 0, 12, null, now()),
  ('Sector Alarm', 'alarm', 349, 0, 12, null, now()),
  ('AJAX Alarm', 'alarm', 199, 30, 0, null, now()),
  ('Norlys Alarm', 'alarm', 299, 0, 12, null, now());

-- KONTAKTLINSER
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Lensway', 'contacts', 199, 0, 0, null, now()),
  ('Synoptik Linseabo', 'contacts', 249, 30, 0, null, now()),
  ('Louis Nielsen Linseabo', 'contacts', 229, 30, 0, null, now());

-- VITAMIN & KOSTTILSKUD
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Puori', 'vitamins', 199, 0, 0, null, now()),
  ('Bodylab', 'vitamins', 149, 0, 0, null, now()),
  ('SATS Nutrition', 'vitamins', 179, 0, 0, null, now()),
  ('Vitaepro', 'vitamins', 299, 0, 0, null, now());

-- TRANSPORT
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Rejsekort Pendler', 'transport', 500, 0, 0, null, now()),
  ('DSB Orange', 'transport', 199, 30, 0, null, now()),
  ('Donkey Republic', 'transport', 89, 0, 0, null, now()),
  ('Lime', 'transport', 79, 0, 0, null, now());

-- OPBEVARING
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('City Self Storage', 'storage', 499, 30, 0, null, now()),
  ('Pelican Self Storage', 'storage', 449, 30, 0, null, now()),
  ('Shurgard', 'storage', 399, 30, 0, null, now());

-- KÆLEDYR
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Buddy', 'pets', 299, 0, 0, null, now()),
  ('Petlux', 'pets', 249, 0, 0, null, now()),
  ('Animail', 'pets', 199, 0, 0, null, now()),
  ('Dyreforsikring', 'pets', 199, 30, 0, null, now());

-- RENGØRING
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Happy Helper', 'cleaning', 799, 0, 0, null, now()),
  ('Hilfr', 'cleaning', 699, 0, 0, null, now()),
  ('Cliive', 'cleaning', 749, 0, 0, null, now());

-- PERSONLIG PLEJE
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Estrid', 'grooming', 59, 0, 0, null, now()),
  ('Dollar Shave Club', 'grooming', 69, 0, 0, null, now()),
  ('Goodiebox', 'grooming', 199, 0, 0, '[{"plan":"Standard","price":199}]'::jsonb, now()),
  ('Glossybox', 'grooming', 149, 0, 0, '[{"plan":"Standard","price":149},{"plan":"Årlig","price":119,"note":"pr md ved årlig"}]'::jsonb, now());

-- TØJ & MODE
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Stitch Fix', 'fashion', 149, 0, 0, null, now()),
  ('Miinto+', 'fashion', 49, 0, 0, null, now()),
  ('Zalando Plus', 'fashion', 49, 0, 0, null, now()),
  ('JustFab', 'fashion', 299, 0, 0, '[{"plan":"VIP","price":299}]'::jsonb, now());

-- ELEKTRONIK-LEJE
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Grover', 'electronics', 299, 0, 0, null, now()),
  ('myway', 'electronics', 199, 0, 0, null, now());

-- DATING
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Tinder', 'dating', 89, 0, 0, null, now()),
  ('Bumble', 'dating', 199, 0, 0, null, now()),
  ('Hinge', 'dating', 149, 0, 0, null, now());

-- APP STORE & IN-APP
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Apple One', 'appstore', 169, 0, 0, '[{"plan":"Individual","price":169},{"plan":"Family","price":249},{"plan":"Premium","price":299}]'::jsonb, now()),
  ('Google Play Pass', 'appstore', 39, 0, 0, null, now()),
  ('Apple Arcade', 'appstore', 69, 0, 0, null, now());

-- FORENINGER & KLUBBER
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Golfklub', 'clubs', 500, 0, 12, null, now()),
  ('Sportsklub', 'clubs', 200, 0, 12, null, now()),
  ('Spejder', 'clubs', 100, 0, 0, null, now()),
  ('Hobbyforening', 'clubs', 150, 0, 0, null, now());

-- VELGØRENHED & DONATIONER
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Røde Kors', 'charity', 100, 0, 0, null, now()),
  ('UNICEF', 'charity', 150, 0, 0, null, now()),
  ('Amnesty International', 'charity', 75, 0, 0, null, now()),
  ('Kræftens Bekæmpelse', 'charity', 100, 0, 0, null, now());

-- KAFFE & DRIKKEVARER
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Nespresso abonnement', 'coffee', 249, 0, 0, null, now()),
  ('SimpleCoffee', 'coffee', 199, 0, 0, null, now()),
  ('BKI abonnement', 'coffee', 149, 0, 0, null, now());

-- PARKERING
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('EasyPark', 'transport', 49, 0, 0, null, now()),
  ('ParkPark', 'transport', 39, 0, 0, null, now()),
  ('Apcoa Flow', 'transport', 0, 0, 0, null, now());

-- TANDLÆGE & SUNDHED
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Tandlæge-abonnement', 'dental', 149, 30, 0, null, now()),
  ('Kiropraktor-abonnement', 'dental', 299, 30, 0, null, now()),
  ('Mindler', 'dental', 499, 0, 0, null, now());

-- MAGASINER
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Euroman', 'magazines', 89, 0, 0, null, now()),
  ('Femina', 'magazines', 69, 0, 0, null, now()),
  ('Illustreret Videnskab', 'magazines', 79, 0, 0, null, now()),
  ('Samvirke', 'magazines', 49, 0, 0, null, now());

-- HAVESERVICE
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('GreenMow', 'garden', 399, 0, 0, null, now()),
  ('Plæneklip-abonnement', 'garden', 499, 0, 0, null, now()),
  ('Haveservice-abonnement', 'garden', 599, 30, 0, null, now());

-- VASKERI
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Washa', 'laundry', 299, 0, 0, null, now()),
  ('Renseri-abonnement', 'laundry', 249, 0, 0, null, now());

-- DIGITAL STORAGE
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Backblaze', 'digistorage', 49, 0, 0, null, now()),
  ('OneDrive 100 GB', 'digistorage', 15, 0, 0, null, now());

-- DIVERSE
insert into known_services (name, category, current_price, cancellation_period_days, binding_months, price_tiers, price_updated_at) values
  ('Amazon Prime', 'misc', 59, 0, 0, null, now()),
  ('Vivino Premium', 'misc', 59, 0, 0, null, now()),
  ('Headspace', 'misc', 69, 0, 0, null, now()),
  ('Calm', 'misc', 49, 0, 0, null, now()),
  ('Strava', 'misc', 49, 0, 0, null, now());
