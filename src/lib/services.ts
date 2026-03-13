export type CancellationPeriod = "løbende" | "1 md opsigelse" | "12 md binding";

export interface DowngradeOption {
  fromLabel: string;
  toLabel: string;
  savingsPerMonth: number;
}

export interface ServiceTier {
  id: string;
  label: string;
  price: number;
  isDefault?: boolean;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  monthlyPrice: number; // DKK — default/lowest price
  priceNote?: string; // e.g. "9-79 kr/md"
  cancellation: CancellationPeriod;
  icon: string;
  downgrade?: DowngradeOption;
  tiers?: ServiceTier[];
}

export const categoryLabels: Record<string, string> = {
  streaming: "Streaming & TV",
  music: "Musik & lydbøger",
  fitness: "Fitness",
  software: "Software & cloud",
  gaming: "Gaming",
  food: "Madlevering & bokse",
  news: "Aviser & magasiner",
  telecom: "Mobil & internet",
  broadband: "Bredbånd & Internet",
  tv: "TV-pakker",
  alarm: "Alarm & Sikkerhed",
  union: "Fagforening & A-kasse",
  health: "Sygeforsikring",
  energy: "El & Energi",
  contacts: "Kontaktlinser",
  vitamins: "Vitamin & Kosttilskud",
  transport: "Transport",
  storage: "Opbevaring",
  pets: "Kæledyr",
  cleaning: "Rengøring",
  grooming: "Personlig pleje",
  fashion: "Tøj & Mode",
  electronics: "Elektronik-leje",
  dating: "Dating",
  misc: "Diverse",
};

export const categoryOrder = [
  "streaming",
  "music",
  "fitness",
  "software",
  "gaming",
  "food",
  "news",
  "telecom",
  "broadband",
  "tv",
  "alarm",
  "union",
  "health",
  "energy",
  "contacts",
  "vitamins",
  "transport",
  "storage",
  "pets",
  "cleaning",
  "grooming",
  "fashion",
  "electronics",
  "dating",
  "misc",
];

export const services: Service[] = [
  // STREAMING & TV
  {
    id: "netflix", name: "Netflix", category: "streaming", monthlyPrice: 79, cancellation: "løbende", icon: "🎬",
    tiers: [
      { id: "netflix-basis", label: "Basis med reklamer", price: 79 },
      { id: "netflix-standard", label: "Standard", price: 109, isDefault: true },
      { id: "netflix-premium", label: "Premium", price: 169 },
    ],
  },
  {
    id: "viaplay", name: "Viaplay", category: "streaming", monthlyPrice: 99, cancellation: "løbende", icon: "📺",
    tiers: [
      { id: "viaplay-reklamer", label: "Film & Serier m. reklamer", price: 99 },
      { id: "viaplay-standard", label: "Film & Serier", price: 149, isDefault: true },
      { id: "viaplay-total", label: "Total", price: 449 },
      { id: "viaplay-premium", label: "Premium", price: 499 },
    ],
  },
  {
    id: "disney", name: "Disney+", category: "streaming", monthlyPrice: 49, cancellation: "løbende", icon: "🏰",
    tiers: [
      { id: "disney-reklamer", label: "Standard m. reklamer", price: 49 },
      { id: "disney-standard", label: "Standard", price: 79, isDefault: true },
      { id: "disney-premium", label: "Premium", price: 119 },
    ],
  },
  {
    id: "max-hbo", name: "Max/HBO", category: "streaming", monthlyPrice: 89, cancellation: "løbende", icon: "🎭",
    tiers: [
      { id: "max-basis", label: "Basis", price: 89, isDefault: true },
      { id: "max-standard", label: "Standard", price: 129 },
      { id: "max-premium", label: "Premium", price: 169 },
    ],
  },
  { id: "tv2-play", name: "TV2 Play", category: "streaming", monthlyPrice: 69, cancellation: "løbende", icon: "📡" },
  { id: "amazon-prime-video", name: "Amazon Prime Video", category: "streaming", monthlyPrice: 59, cancellation: "løbende", icon: "▶️" },
  { id: "apple-tv", name: "Apple TV+", category: "streaming", monthlyPrice: 79, cancellation: "løbende", icon: "🍎" },
  { id: "skyshowtime", name: "SkyShowtime", category: "streaming", monthlyPrice: 99, cancellation: "løbende", icon: "🌤️" },
  { id: "paramount", name: "Paramount+", category: "streaming", monthlyPrice: 69, cancellation: "løbende", icon: "⭐" },
  { id: "nordisk-film", name: "Nordisk Film+", category: "streaming", monthlyPrice: 59, cancellation: "løbende", icon: "🎞️" },
  { id: "c-more", name: "C More", category: "streaming", monthlyPrice: 99, cancellation: "løbende", icon: "📺" },
  { id: "discovery", name: "Discovery+", category: "streaming", monthlyPrice: 49, cancellation: "løbende", icon: "🔍" },
  { id: "dazn", name: "DAZN", category: "streaming", monthlyPrice: 79, cancellation: "løbende", icon: "⚽" },
  { id: "hayu", name: "Hayu", category: "streaming", monthlyPrice: 49, cancellation: "løbende", icon: "💅" },

  // MUSIK & LYDBØGER
  {
    id: "spotify", name: "Spotify", category: "music", monthlyPrice: 99, cancellation: "løbende", icon: "🎵",
    tiers: [
      { id: "spotify-individual", label: "Individual", price: 99, isDefault: true },
      { id: "spotify-duo", label: "Duo", price: 139 },
      { id: "spotify-family", label: "Family", price: 179 },
    ],
  },
  {
    id: "apple-music", name: "Apple Music", category: "music", monthlyPrice: 99, cancellation: "løbende", icon: "🎶",
    tiers: [
      { id: "apple-music-individual", label: "Individual", price: 99, isDefault: true },
      { id: "apple-music-family", label: "Family", price: 169 },
    ],
  },
  {
    id: "youtube-premium", name: "YouTube Premium", category: "music", monthlyPrice: 79, cancellation: "løbende", icon: "🔴",
    tiers: [
      { id: "yt-individual", label: "Individual", price: 79, isDefault: true },
      { id: "yt-family", label: "Family", price: 149 },
    ],
  },
  { id: "tidal", name: "Tidal", category: "music", monthlyPrice: 99, cancellation: "løbende", icon: "🌊" },
  { id: "mofibo", name: "Mofibo", category: "music", monthlyPrice: 149, cancellation: "løbende", icon: "📖" },
  { id: "audible", name: "Audible", category: "music", monthlyPrice: 149, cancellation: "løbende", icon: "🎧" },
  { id: "nextory", name: "Nextory", category: "music", monthlyPrice: 149, cancellation: "løbende", icon: "📚" },
  { id: "saxo-premium", name: "Saxo Premium", category: "music", monthlyPrice: 149, cancellation: "løbende", icon: "📕" },
  { id: "podimo", name: "Podimo", category: "music", monthlyPrice: 79, cancellation: "løbende", icon: "🎙️" },

  // FITNESS
  { id: "fitness-world", name: "Fitness World", category: "fitness", monthlyPrice: 199, cancellation: "1 md opsigelse", icon: "💪" },
  { id: "sats", name: "SATS", category: "fitness", monthlyPrice: 299, cancellation: "1 md opsigelse", icon: "🏋️", downgrade: { fromLabel: "All-in", toLabel: "Basis", savingsPerMonth: 100 } },
  { id: "fresh-fitness", name: "Fresh Fitness", category: "fitness", monthlyPrice: 149, cancellation: "1 md opsigelse", icon: "🏃" },
  { id: "loop-fitness", name: "Loop Fitness", category: "fitness", monthlyPrice: 199, cancellation: "1 md opsigelse", icon: "🔄" },
  { id: "dgi-fitness", name: "DGI Fitness", category: "fitness", monthlyPrice: 179, cancellation: "1 md opsigelse", icon: "🤸" },
  { id: "repeat", name: "Repeat", category: "fitness", monthlyPrice: 149, cancellation: "løbende", icon: "🔁" },
  { id: "fitnessdk", name: "Fitnessdk", category: "fitness", monthlyPrice: 249, cancellation: "1 md opsigelse", icon: "🏅" },

  // SOFTWARE & CLOUD
  { id: "microsoft365", name: "Microsoft 365", category: "software", monthlyPrice: 89, cancellation: "løbende", icon: "💼" },
  { id: "adobe", name: "Adobe Creative Cloud", category: "software", monthlyPrice: 189, cancellation: "12 md binding", icon: "🎨" },
  {
    id: "icloud", name: "iCloud+", category: "software", monthlyPrice: 9, cancellation: "løbende", icon: "☁️",
    tiers: [
      { id: "icloud-50", label: "50 GB", price: 9, isDefault: true },
      { id: "icloud-200", label: "200 GB", price: 29 },
      { id: "icloud-2tb", label: "2 TB", price: 79 },
    ],
  },
  {
    id: "google-one", name: "Google One", category: "software", monthlyPrice: 20, cancellation: "løbende", icon: "🌐",
    tiers: [
      { id: "google-100", label: "100 GB", price: 20, isDefault: true },
      { id: "google-200", label: "200 GB", price: 30 },
      { id: "google-2tb", label: "2 TB", price: 70 },
      { id: "google-5tb", label: "5 TB", price: 139 },
    ],
  },
  { id: "dropbox", name: "Dropbox", category: "software", monthlyPrice: 99, cancellation: "løbende", icon: "📦", downgrade: { fromLabel: "Plus", toLabel: "Basic (gratis)", savingsPerMonth: 99 } },
  { id: "1password", name: "1Password", category: "software", monthlyPrice: 29, cancellation: "løbende", icon: "🔐" },
  { id: "nordvpn", name: "NordVPN", category: "software", monthlyPrice: 49, cancellation: "løbende", icon: "🛡️" },
  { id: "chatgpt-plus", name: "ChatGPT Plus", category: "software", monthlyPrice: 149, cancellation: "løbende", icon: "🤖" },
  { id: "canva-pro", name: "Canva Pro", category: "software", monthlyPrice: 99, cancellation: "løbende", icon: "🖌️" },

  // GAMING
  {
    id: "ps-plus", name: "PlayStation Plus", category: "gaming", monthlyPrice: 59, cancellation: "løbende", icon: "🎮",
    tiers: [
      { id: "ps-essential", label: "Essential", price: 59, isDefault: true },
      { id: "ps-extra", label: "Extra", price: 99 },
      { id: "ps-premium", label: "Premium", price: 119 },
    ],
  },
  {
    id: "xbox-game-pass", name: "Xbox Game Pass", category: "gaming", monthlyPrice: 59, cancellation: "løbende", icon: "🟢",
    tiers: [
      { id: "xbox-core", label: "Core", price: 59 },
      { id: "xbox-standard", label: "Standard", price: 79, isDefault: true },
      { id: "xbox-ultimate", label: "Ultimate", price: 119 },
    ],
  },
  { id: "nintendo-online", name: "Nintendo Switch Online", category: "gaming", monthlyPrice: 29, cancellation: "løbende", icon: "🕹️" },
  { id: "ea-play", name: "EA Play", category: "gaming", monthlyPrice: 39, cancellation: "løbende", icon: "⚡" },
  { id: "geforce-now", name: "GeForce NOW", category: "gaming", monthlyPrice: 99, cancellation: "løbende", icon: "💚" },

  // MADLEVERING & BOKSE
  { id: "hellofresh", name: "HelloFresh", category: "food", monthlyPrice: 1728, priceNote: "399 kr/uge", cancellation: "løbende", icon: "🥗" },
  { id: "goodiebox", name: "Goodiebox", category: "food", monthlyPrice: 249, cancellation: "løbende", icon: "🎁" },
  { id: "simplecook", name: "SimpleCook", category: "food", monthlyPrice: 1511, priceNote: "349 kr/uge", cancellation: "løbende", icon: "🍳" },
  { id: "retnemt", name: "RetNemt", category: "food", monthlyPrice: 1728, priceNote: "399 kr/uge", cancellation: "løbende", icon: "🍱" },
  { id: "aarstiderne", name: "Aarstiderne", category: "food", monthlyPrice: 1728, priceNote: "399 kr/uge", cancellation: "løbende", icon: "🌿" },
  { id: "greenmeal", name: "GreenMeal", category: "food", monthlyPrice: 1511, priceNote: "349 kr/uge", cancellation: "løbende", icon: "🥬" },

  // AVISER & MAGASINER
  { id: "politiken", name: "Politiken", category: "news", monthlyPrice: 199, cancellation: "1 md opsigelse", icon: "📰" },
  { id: "berlingske", name: "Berlingske", category: "news", monthlyPrice: 199, cancellation: "1 md opsigelse", icon: "🗞️" },
  { id: "jyllands-posten", name: "Jyllands-Posten", category: "news", monthlyPrice: 179, cancellation: "1 md opsigelse", icon: "📄" },
  { id: "ekstra-bladet", name: "Ekstra Bladet+", category: "news", monthlyPrice: 79, cancellation: "løbende", icon: "📢" },
  { id: "bt-plus", name: "BT+", category: "news", monthlyPrice: 59, cancellation: "løbende", icon: "📋" },
  { id: "zetland", name: "Zetland", category: "news", monthlyPrice: 129, cancellation: "løbende", icon: "💎" },
  { id: "nyt", name: "The New York Times", category: "news", monthlyPrice: 49, cancellation: "løbende", icon: "🗽" },

  // MOBIL & INTERNET
  { id: "telmore", name: "Telmore", category: "telecom", monthlyPrice: 149, priceNote: "149-349 kr/md", cancellation: "løbende", icon: "📱" },
  { id: "yousee", name: "YouSee", category: "telecom", monthlyPrice: 199, priceNote: "199-399 kr/md", cancellation: "1 md opsigelse", icon: "📶" },
  { id: "oister", name: "Oister", category: "telecom", monthlyPrice: 99, priceNote: "99-299 kr/md", cancellation: "løbende", icon: "📲" },
  { id: "cbb-mobil", name: "CBB Mobil", category: "telecom", monthlyPrice: 79, priceNote: "79-199 kr/md", cancellation: "løbende", icon: "☎️" },
  { id: "greenspeak", name: "Greenspeak", category: "telecom", monthlyPrice: 99, priceNote: "99-199 kr/md", cancellation: "løbende", icon: "🌱" },
  { id: "lebara", name: "Lebara", category: "telecom", monthlyPrice: 49, priceNote: "49-149 kr/md", cancellation: "løbende", icon: "🔵" },

  // BREDBÅND & INTERNET
  { id: "norlys-bredbaand", name: "Norlys Bredbånd", category: "broadband", monthlyPrice: 299, priceNote: "299-449 kr/md", cancellation: "1 md opsigelse", icon: "🌐" },
  { id: "stofa-bredbaand", name: "Stofa Bredbånd", category: "broadband", monthlyPrice: 249, priceNote: "249-399 kr/md", cancellation: "1 md opsigelse", icon: "📡" },
  { id: "waoo", name: "Waoo", category: "broadband", monthlyPrice: 249, priceNote: "249-449 kr/md", cancellation: "1 md opsigelse", icon: "🔗" },
  { id: "yousee-bredbaand", name: "YouSee Bredbånd", category: "broadband", monthlyPrice: 299, priceNote: "299-499 kr/md", cancellation: "1 md opsigelse", icon: "📶" },
  { id: "fastspeed", name: "Fastspeed", category: "broadband", monthlyPrice: 249, priceNote: "249-399 kr/md", cancellation: "1 md opsigelse", icon: "⚡" },
  { id: "hiper", name: "Hiper", category: "broadband", monthlyPrice: 199, priceNote: "199-349 kr/md", cancellation: "løbende", icon: "🚀" },

  // TV-PAKKER
  { id: "yousee-tv", name: "YouSee TV", category: "tv", monthlyPrice: 199, priceNote: "199-549 kr/md", cancellation: "1 md opsigelse", icon: "📺" },
  { id: "allente", name: "Allente", category: "tv", monthlyPrice: 199, priceNote: "199-599 kr/md", cancellation: "1 md opsigelse", icon: "📡" },
  { id: "boxer", name: "Boxer", category: "tv", monthlyPrice: 199, priceNote: "199-399 kr/md", cancellation: "1 md opsigelse", icon: "📦" },
  { id: "waoo-tv", name: "Waoo TV", category: "tv", monthlyPrice: 199, priceNote: "199-499 kr/md", cancellation: "1 md opsigelse", icon: "🖥️" },
  { id: "stofa-tv", name: "Stofa TV", category: "tv", monthlyPrice: 179, priceNote: "179-499 kr/md", cancellation: "1 md opsigelse", icon: "📡" },

  // ALARM & SIKKERHED
  { id: "verisure", name: "Verisure", category: "alarm", monthlyPrice: 399, cancellation: "12 md binding", icon: "🔒" },
  { id: "sector-alarm", name: "Sector Alarm", category: "alarm", monthlyPrice: 349, cancellation: "12 md binding", icon: "🛡️" },
  { id: "ajax-alarm", name: "AJAX Alarm", category: "alarm", monthlyPrice: 199, cancellation: "1 md opsigelse", icon: "🔔" },
  { id: "norlys-alarm", name: "Norlys Alarm", category: "alarm", monthlyPrice: 299, cancellation: "12 md binding", icon: "🏠" },

  // FAGFORENING & A-KASSE
  { id: "hk", name: "HK Danmark", category: "union", monthlyPrice: 499, cancellation: "1 md opsigelse", icon: "🤝" },
  { id: "3f", name: "3F", category: "union", monthlyPrice: 549, cancellation: "1 md opsigelse", icon: "👷" },
  { id: "krifa", name: "Krifa", category: "union", monthlyPrice: 399, cancellation: "1 md opsigelse", icon: "🤲" },
  { id: "det-faglige-hus", name: "Det Faglige Hus", category: "union", monthlyPrice: 299, cancellation: "1 md opsigelse", icon: "🏢" },
  { id: "ase", name: "ASE", category: "union", monthlyPrice: 299, cancellation: "1 md opsigelse", icon: "💼" },
  { id: "lederne", name: "Lederne", category: "union", monthlyPrice: 599, cancellation: "1 md opsigelse", icon: "👔" },

  // SYGEFORSIKRING
  {
    id: "sygeforsikring-dk", name: "Sygeforsikringen \"danmark\"", category: "health", monthlyPrice: 95, cancellation: "1 md opsigelse", icon: "🏥",
    tiers: [
      { id: "dk-gruppe1", label: "Gruppe 1", price: 95, isDefault: true },
      { id: "dk-gruppe2", label: "Gruppe 2", price: 185 },
      { id: "dk-gruppe5", label: "Gruppe 5", price: 280 },
    ],
  },

  // EL & ENERGI
  { id: "norlys-el", name: "Norlys El", category: "energy", monthlyPrice: 99, priceNote: "Fastpris-abo", cancellation: "løbende", icon: "⚡" },
  { id: "oersted", name: "Ørsted", category: "energy", monthlyPrice: 99, priceNote: "Fastpris-abo", cancellation: "løbende", icon: "🔌" },
  { id: "ewii", name: "Ewii", category: "energy", monthlyPrice: 79, priceNote: "Fastpris-abo", cancellation: "løbende", icon: "💡" },
  { id: "clever", name: "Clever elbil-abo", category: "energy", monthlyPrice: 249, cancellation: "løbende", icon: "🔋" },

  // KONTAKTLINSER
  { id: "lensway", name: "Lensway", category: "contacts", monthlyPrice: 199, cancellation: "løbende", icon: "👁️" },
  { id: "synoptik-abo", name: "Synoptik Linseabo", category: "contacts", monthlyPrice: 249, cancellation: "1 md opsigelse", icon: "👓" },
  { id: "louis-nielsen-abo", name: "Louis Nielsen Linseabo", category: "contacts", monthlyPrice: 229, cancellation: "1 md opsigelse", icon: "🔍" },

  // VITAMIN & KOSTTILSKUD
  { id: "puori", name: "Puori", category: "vitamins", monthlyPrice: 199, cancellation: "løbende", icon: "💊" },
  { id: "bodylab", name: "Bodylab", category: "vitamins", monthlyPrice: 149, cancellation: "løbende", icon: "🥛" },
  { id: "sats-nutrition", name: "SATS Nutrition", category: "vitamins", monthlyPrice: 179, cancellation: "løbende", icon: "🏋️" },
  { id: "vitaepro", name: "Vitaepro", category: "vitamins", monthlyPrice: 299, cancellation: "løbende", icon: "🌿" },

  // TRANSPORT
  { id: "rejsekort-pendler", name: "Rejsekort Pendler", category: "transport", monthlyPrice: 500, priceNote: "Varierer", cancellation: "løbende", icon: "🚆" },
  { id: "dsb-orange", name: "DSB Orange", category: "transport", monthlyPrice: 199, priceNote: "Pendlerkort", cancellation: "1 md opsigelse", icon: "🚂" },
  { id: "donkey-republic", name: "Donkey Republic", category: "transport", monthlyPrice: 89, cancellation: "løbende", icon: "🚲" },
  { id: "lime", name: "Lime", category: "transport", monthlyPrice: 79, cancellation: "løbende", icon: "🛴" },

  // OPBEVARING
  { id: "city-self-storage", name: "City Self Storage", category: "storage", monthlyPrice: 499, priceNote: "499-1499 kr/md", cancellation: "1 md opsigelse", icon: "📦" },
  { id: "pelican", name: "Pelican Self Storage", category: "storage", monthlyPrice: 449, priceNote: "449-1299 kr/md", cancellation: "1 md opsigelse", icon: "🏗️" },
  { id: "shurgard", name: "Shurgard", category: "storage", monthlyPrice: 399, priceNote: "399-1199 kr/md", cancellation: "1 md opsigelse", icon: "🏪" },

  // KÆLEDYR
  { id: "buddy", name: "Buddy", category: "pets", monthlyPrice: 299, cancellation: "løbende", icon: "🐕" },
  { id: "petlux", name: "Petlux", category: "pets", monthlyPrice: 249, cancellation: "løbende", icon: "🐾" },
  { id: "animail", name: "Animail", category: "pets", monthlyPrice: 199, cancellation: "løbende", icon: "🐱" },
  { id: "dyreforsikring", name: "Dyreforsikring", category: "pets", monthlyPrice: 199, priceNote: "149-399 kr/md", cancellation: "1 md opsigelse", icon: "🐶" },

  // RENGØRING
  { id: "happy-helper", name: "Happy Helper", category: "cleaning", monthlyPrice: 799, priceNote: "Varierer", cancellation: "løbende", icon: "🧹" },
  { id: "hilfr", name: "Hilfr", category: "cleaning", monthlyPrice: 699, priceNote: "Varierer", cancellation: "løbende", icon: "🧽" },
  { id: "cliive", name: "Cliive", category: "cleaning", monthlyPrice: 749, priceNote: "Varierer", cancellation: "løbende", icon: "✨" },

  // PERSONLIG PLEJE
  { id: "estrid", name: "Estrid", category: "grooming", monthlyPrice: 59, cancellation: "løbende", icon: "🪒" },
  { id: "dollar-shave-club", name: "Dollar Shave Club", category: "grooming", monthlyPrice: 69, cancellation: "løbende", icon: "💈" },
  { id: "goodiebox-beauty", name: "Goodiebox", category: "grooming", monthlyPrice: 249, cancellation: "løbende", icon: "🎁" },

  // TØJ & MODE
  { id: "stitch-fix", name: "Stitch Fix", category: "fashion", monthlyPrice: 149, cancellation: "løbende", icon: "👗" },
  { id: "miinto-plus", name: "Miinto+", category: "fashion", monthlyPrice: 49, cancellation: "løbende", icon: "👠" },
  { id: "zalando-plus", name: "Zalando Plus", category: "fashion", monthlyPrice: 49, cancellation: "løbende", icon: "👟" },

  // ELEKTRONIK-LEJE
  { id: "grover", name: "Grover", category: "electronics", monthlyPrice: 299, priceNote: "Varierer", cancellation: "løbende", icon: "💻" },
  { id: "myway", name: "myway", category: "electronics", monthlyPrice: 199, priceNote: "Varierer", cancellation: "løbende", icon: "📱" },

  // DATING
  { id: "tinder", name: "Tinder", category: "dating", monthlyPrice: 89, cancellation: "løbende", icon: "🔥" },
  { id: "bumble", name: "Bumble", category: "dating", monthlyPrice: 199, cancellation: "løbende", icon: "🐝" },
  { id: "hinge", name: "Hinge", category: "dating", monthlyPrice: 149, cancellation: "løbende", icon: "💜" },

  // DIVERSE
  { id: "amazon-prime", name: "Amazon Prime", category: "misc", monthlyPrice: 59, cancellation: "løbende", icon: "📦" },
  { id: "vivino", name: "Vivino Premium", category: "misc", monthlyPrice: 59, cancellation: "løbende", icon: "🍷" },
  { id: "headspace", name: "Headspace", category: "misc", monthlyPrice: 69, cancellation: "løbende", icon: "🧘" },
  { id: "calm", name: "Calm", category: "misc", monthlyPrice: 49, cancellation: "løbende", icon: "😌" },
  { id: "strava", name: "Strava", category: "misc", monthlyPrice: 49, cancellation: "løbende", icon: "🚴" },
];

export type UsageFrequency = "daily" | "weekly" | "rarely" | "never";

export const frequencyLabels: Record<UsageFrequency, string> = {
  daily: "Dagligt",
  weekly: "Ugentligt",
  rarely: "Sjældent",
  never: "Aldrig",
};

export function getServiceById(id: string): Service | undefined {
  return services.find((s) => s.id === id);
}

/** Get the effective price for a service given selected plans */
export function getEffectivePrice(
  service: Service,
  selectedPlans: Record<string, string>
): number {
  if (service.tiers && selectedPlans[service.id]) {
    const tier = service.tiers.find((t) => t.id === selectedPlans[service.id]);
    if (tier) return tier.price;
  }
  return service.monthlyPrice;
}

/** Get the selected tier label */
export function getSelectedTierLabel(
  service: Service,
  selectedPlans: Record<string, string>
): string | null {
  if (!service.tiers || !selectedPlans[service.id]) return null;
  const tier = service.tiers.find((t) => t.id === selectedPlans[service.id]);
  return tier?.label || null;
}

/** Get default tier for a service */
export function getDefaultTier(service: Service): ServiceTier | undefined {
  if (!service.tiers) return undefined;
  return service.tiers.find((t) => t.isDefault) || service.tiers[0];
}

/** Compute downgrade suggestion from tiers */
export function getTierDowngrade(
  service: Service,
  selectedPlans: Record<string, string>
): DowngradeOption | null {
  if (!service.tiers || !selectedPlans[service.id]) {
    return service.downgrade || null;
  }
  const currentTierId = selectedPlans[service.id];
  const currentIndex = service.tiers.findIndex((t) => t.id === currentTierId);
  if (currentIndex <= 0) return null; // already on cheapest tier
  const currentTier = service.tiers[currentIndex];
  const lowerTier = service.tiers[currentIndex - 1];
  return {
    fromLabel: currentTier.label,
    toLabel: lowerTier.label,
    savingsPerMonth: currentTier.price - lowerTier.price,
  };
}

/** Get all cheaper tiers below the currently selected one */
export function getLowerTiers(
  service: Service,
  selectedPlans: Record<string, string>
): { tierId: string; label: string; price: number; savingsPerMonth: number }[] {
  if (!service.tiers || !selectedPlans[service.id]) return [];
  const currentTierId = selectedPlans[service.id];
  const currentIndex = service.tiers.findIndex((t) => t.id === currentTierId);
  if (currentIndex <= 0) return [];
  const currentPrice = service.tiers[currentIndex].price;
  return service.tiers
    .slice(0, currentIndex)
    .map((t) => ({
      tierId: t.id,
      label: t.label,
      price: t.price,
      savingsPerMonth: currentPrice - t.price,
    }))
    .reverse(); // show highest savings first
}

export function formatPrice(service: Service, selectedPlans?: Record<string, string>): string {
  if (selectedPlans && service.tiers && selectedPlans[service.id]) {
    const tier = service.tiers.find((t) => t.id === selectedPlans[service.id]);
    if (tier) return `${tier.price} kr/md`;
  }
  if (service.priceNote) return service.priceNote;
  if (service.tiers) {
    const prices = service.tiers.map((t) => t.price);
    return `${Math.min(...prices)}-${Math.max(...prices)} kr/md`;
  }
  return `${service.monthlyPrice} kr/md`;
}

export function getEstimatedSavings(
  selectedServices: string[],
  usageFrequency: Record<string, UsageFrequency>,
  selectedPlans?: Record<string, string>
): { monthlySavings: number; yearlySavings: number; wastedServices: Service[] } {
  const wastedServices = services.filter(
    (s) =>
      selectedServices.includes(s.id) &&
      (usageFrequency[s.id] === "rarely" || usageFrequency[s.id] === "never")
  );

  const monthlySavings = wastedServices.reduce(
    (sum, s) => sum + getEffectivePrice(s, selectedPlans || {}),
    0
  );

  return {
    monthlySavings,
    yearlySavings: monthlySavings * 12,
    wastedServices,
  };
}

export function getCancellationDate(cancellation: CancellationPeriod): string {
  const now = new Date();
  if (cancellation === "løbende") {
    return "med det samme";
  }
  if (cancellation === "1 md opsigelse") {
    const date = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    return date.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
  }
  // 12 md binding — worst case
  const date = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  return date.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
}
