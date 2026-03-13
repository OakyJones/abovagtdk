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
  appstore: "App Store & In-App",
  clubs: "Foreninger & Klubber",
  charity: "Velgørenhed & Donationer",
  coffee: "Kaffe & Drikkevarer",
  dental: "Tandlæge & Sundhed",
  magazines: "Magasiner",
  garden: "Haveservice",
  laundry: "Vaskeri",
  digistorage: "Digital storage",
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
  "appstore",
  "clubs",
  "charity",
  "coffee",
  "dental",
  "magazines",
  "garden",
  "laundry",
  "digistorage",
  "misc",
];

/** Quiz pages group multiple categories into browsable sections */
export interface QuizPage {
  id: string;
  label: string;
  icon: string;
  categories: string[];
}

export const quizPages: QuizPage[] = [
  { id: "entertainment", label: "Underholdning", icon: "🎬", categories: ["streaming", "music", "gaming"] },
  { id: "mobile-internet", label: "Mobil & Internet", icon: "📱", categories: ["telecom", "broadband", "tv"] },
  { id: "health-fitness", label: "Fitness & Sundhed", icon: "💪", categories: ["fitness", "contacts", "dental", "vitamins"] },
  { id: "food-boxes", label: "Mad & Bokse", icon: "🍽", categories: ["food", "coffee"] },
  { id: "software-apps", label: "Software & Apps", icon: "💻", categories: ["software", "appstore", "electronics", "digistorage"] },
  { id: "media", label: "Medier", icon: "📰", categories: ["news", "magazines"] },
  { id: "home", label: "Hjem", icon: "🏠", categories: ["alarm", "cleaning", "garden", "storage", "laundry"] },
  { id: "transport", label: "Transport", icon: "🚗", categories: ["transport"] },
  { id: "shopping", label: "Shopping", icon: "🛍️", categories: ["grooming", "fashion", "pets", "electronics"] },
  { id: "other", label: "Andet", icon: "📦", categories: ["dating", "charity", "clubs", "misc"] },
];

export const services: Service[] = [
  // STREAMING & TV
  {
    id: "netflix", name: "Netflix", category: "streaming", monthlyPrice: 79, cancellation: "løbende", icon: "🎬",
    tiers: [
      { id: "netflix-basis", label: "Basis med reklamer", price: 79 },
      { id: "netflix-standard", label: "Standard", price: 119, isDefault: true },
      { id: "netflix-premium", label: "Premium", price: 179 },
    ],
  },
  {
    id: "viaplay", name: "Viaplay", category: "streaming", monthlyPrice: 79, cancellation: "løbende", icon: "📺",
    tiers: [
      { id: "viaplay-basis", label: "Basis", price: 79 },
      { id: "viaplay-standard", label: "Standard", price: 139, isDefault: true },
      { id: "viaplay-total", label: "Total", price: 449 },
    ],
  },
  {
    id: "disney", name: "Disney+", category: "streaming", monthlyPrice: 89, cancellation: "løbende", icon: "🏰",
    tiers: [
      { id: "disney-standard", label: "Standard", price: 89, isDefault: true },
      { id: "disney-premium", label: "Premium", price: 139 },
    ],
  },
  {
    id: "max-hbo", name: "Max/HBO", category: "streaming", monthlyPrice: 69, cancellation: "løbende", icon: "🎭",
    tiers: [
      { id: "max-basis", label: "Basis", price: 69 },
      { id: "max-standard", label: "Standard", price: 99, isDefault: true },
      { id: "max-premium", label: "Premium", price: 149 },
    ],
  },
  {
    id: "tv2-play", name: "TV2 Play", category: "streaming", monthlyPrice: 79, cancellation: "løbende", icon: "📡",
    tiers: [
      { id: "tv2-standard", label: "Standard", price: 79, isDefault: true },
      { id: "tv2-plus", label: "Plus", price: 149 },
    ],
  },
  { id: "amazon-prime-video", name: "Amazon Prime Video", category: "streaming", monthlyPrice: 59, cancellation: "løbende", icon: "▶️" },
  { id: "apple-tv", name: "Apple TV+", category: "streaming", monthlyPrice: 79, cancellation: "løbende", icon: "🍎" },
  { id: "skyshowtime", name: "SkyShowtime", category: "streaming", monthlyPrice: 99, cancellation: "løbende", icon: "🌤️" },
  { id: "paramount", name: "Paramount+", category: "streaming", monthlyPrice: 69, cancellation: "løbende", icon: "⭐" },
  { id: "nordisk-film", name: "Nordisk Film+", category: "streaming", monthlyPrice: 59, cancellation: "løbende", icon: "🎞️" },
  { id: "c-more", name: "C More", category: "streaming", monthlyPrice: 99, cancellation: "løbende", icon: "📺" },
  { id: "discovery", name: "Discovery+", category: "streaming", monthlyPrice: 49, cancellation: "løbende", icon: "🔍" },
  { id: "dazn", name: "DAZN", category: "streaming", monthlyPrice: 79, cancellation: "løbende", icon: "⚽" },
  { id: "hayu", name: "Hayu", category: "streaming", monthlyPrice: 49, cancellation: "løbende", icon: "💅" },
  { id: "patreon", name: "Patreon", category: "streaming", monthlyPrice: 50, priceNote: "Varierer", cancellation: "løbende", icon: "🎨" },
  {
    id: "twitch", name: "Twitch", category: "streaming", monthlyPrice: 39, cancellation: "løbende", icon: "🟣",
    tiers: [
      { id: "twitch-t1", label: "Tier 1", price: 39, isDefault: true },
      { id: "twitch-t2", label: "Tier 2", price: 79 },
      { id: "twitch-t3", label: "Tier 3", price: 189 },
    ],
  },

  // MUSIK & LYDBØGER
  {
    id: "spotify", name: "Spotify", category: "music", monthlyPrice: 69, cancellation: "løbende", icon: "🎵",
    tiers: [
      { id: "spotify-student", label: "Student", price: 69 },
      { id: "spotify-individual", label: "Individual", price: 119, isDefault: true },
      { id: "spotify-duo", label: "Duo", price: 169 },
      { id: "spotify-family", label: "Family", price: 199 },
    ],
  },
  {
    id: "apple-music", name: "Apple Music", category: "music", monthlyPrice: 59, cancellation: "løbende", icon: "🎶",
    tiers: [
      { id: "apple-music-student", label: "Student", price: 59 },
      { id: "apple-music-individual", label: "Individual", price: 109, isDefault: true },
      { id: "apple-music-family", label: "Family", price: 169 },
    ],
  },
  {
    id: "youtube-premium", name: "YouTube Premium", category: "music", monthlyPrice: 139, cancellation: "løbende", icon: "🔴",
    tiers: [
      { id: "yt-individual", label: "Individual", price: 139, isDefault: true },
      { id: "yt-family", label: "Family", price: 179 },
    ],
  },
  {
    id: "tidal", name: "Tidal", category: "music", monthlyPrice: 109, cancellation: "løbende", icon: "🌊",
    tiers: [
      { id: "tidal-individual", label: "Individual", price: 109, isDefault: true },
      { id: "tidal-family", label: "Family", price: 169 },
    ],
  },
  {
    id: "deezer", name: "Deezer", category: "music", monthlyPrice: 119, cancellation: "løbende", icon: "🎵",
    tiers: [
      { id: "deezer-premium", label: "Premium", price: 119, isDefault: true },
      { id: "deezer-family", label: "Family", price: 179 },
    ],
  },
  { id: "mofibo", name: "Mofibo", category: "music", monthlyPrice: 149, cancellation: "løbende", icon: "📖" },
  { id: "audible", name: "Audible", category: "music", monthlyPrice: 149, cancellation: "løbende", icon: "🎧" },
  { id: "nextory", name: "Nextory", category: "music", monthlyPrice: 149, cancellation: "løbende", icon: "📚" },
  { id: "saxo-premium", name: "Saxo Premium", category: "music", monthlyPrice: 149, cancellation: "løbende", icon: "📕" },
  { id: "podimo", name: "Podimo", category: "music", monthlyPrice: 79, cancellation: "løbende", icon: "🎙️" },

  // FITNESS
  {
    id: "fitness-world", name: "Fitness World", category: "fitness", monthlyPrice: 149, cancellation: "1 md opsigelse", icon: "💪",
    tiers: [
      { id: "fw-basis", label: "Basis", price: 149 },
      { id: "fw-premium", label: "Premium", price: 249, isDefault: true },
      { id: "fw-vip", label: "VIP", price: 349 },
    ],
  },
  { id: "sats", name: "SATS", category: "fitness", monthlyPrice: 299, cancellation: "1 md opsigelse", icon: "🏋️", downgrade: { fromLabel: "All-in", toLabel: "Basis", savingsPerMonth: 100 } },
  { id: "fresh-fitness", name: "Fresh Fitness", category: "fitness", monthlyPrice: 149, cancellation: "1 md opsigelse", icon: "🏃" },
  { id: "loop-fitness", name: "Loop Fitness", category: "fitness", monthlyPrice: 199, cancellation: "1 md opsigelse", icon: "🔄" },
  { id: "dgi-fitness", name: "DGI Fitness", category: "fitness", monthlyPrice: 179, cancellation: "1 md opsigelse", icon: "🤸" },
  { id: "repeat", name: "Repeat", category: "fitness", monthlyPrice: 149, cancellation: "løbende", icon: "🔁" },
  { id: "fitnessdk", name: "Fitnessdk", category: "fitness", monthlyPrice: 249, cancellation: "1 md opsigelse", icon: "🏅" },
  { id: "myfitnesspal", name: "MyFitnessPal", category: "fitness", monthlyPrice: 79, cancellation: "løbende", icon: "📊" },
  {
    id: "noom", name: "Noom", category: "fitness", monthlyPrice: 99, cancellation: "løbende", icon: "🍏",
    tiers: [
      { id: "noom-aar", label: "Årlig", price: 99 },
      { id: "noom-md", label: "Månedlig", price: 149, isDefault: true },
    ],
  },

  // SOFTWARE & CLOUD
  {
    id: "microsoft365", name: "Microsoft 365", category: "software", monthlyPrice: 85, cancellation: "løbende", icon: "💼",
    tiers: [
      { id: "m365-personal", label: "Personal", price: 85, isDefault: true },
      { id: "m365-family", label: "Family", price: 115 },
    ],
  },
  {
    id: "adobe", name: "Adobe Creative Cloud", category: "software", monthlyPrice: 109, cancellation: "12 md binding", icon: "🎨",
    tiers: [
      { id: "adobe-foto", label: "Fotografi", price: 109 },
      { id: "adobe-enkelt", label: "Enkeltapp", price: 169, isDefault: true },
      { id: "adobe-alle", label: "Alle apps", price: 459 },
    ],
  },
  {
    id: "icloud", name: "iCloud+", category: "software", monthlyPrice: 9, cancellation: "løbende", icon: "☁️",
    tiers: [
      { id: "icloud-50", label: "50 GB", price: 9, isDefault: true },
      { id: "icloud-200", label: "200 GB", price: 29 },
      { id: "icloud-2tb", label: "2 TB", price: 89 },
    ],
  },
  {
    id: "google-one", name: "Google One", category: "software", monthlyPrice: 20, cancellation: "løbende", icon: "🌐",
    tiers: [
      { id: "google-100", label: "100 GB", price: 20, isDefault: true },
      { id: "google-200", label: "200 GB", price: 30 },
      { id: "google-2tb", label: "2 TB", price: 100 },
    ],
  },
  { id: "dropbox", name: "Dropbox", category: "software", monthlyPrice: 99, cancellation: "løbende", icon: "📦", downgrade: { fromLabel: "Plus", toLabel: "Basic (gratis)", savingsPerMonth: 99 } },
  { id: "1password", name: "1Password", category: "software", monthlyPrice: 29, cancellation: "løbende", icon: "🔐" },
  { id: "nordvpn", name: "NordVPN", category: "software", monthlyPrice: 49, cancellation: "løbende", icon: "🛡️" },
  {
    id: "chatgpt-plus", name: "ChatGPT", category: "software", monthlyPrice: 149, cancellation: "løbende", icon: "🤖",
    tiers: [
      { id: "chatgpt-plus", label: "Plus", price: 149, isDefault: true },
      { id: "chatgpt-pro", label: "Pro", price: 1500 },
    ],
  },
  { id: "canva-pro", name: "Canva Pro", category: "software", monthlyPrice: 99, cancellation: "løbende", icon: "🖌️" },
  {
    id: "claude-ai", name: "Claude", category: "software", monthlyPrice: 149, cancellation: "løbende", icon: "🤖",
    tiers: [
      { id: "claude-pro", label: "Pro", price: 149, isDefault: true },
      { id: "claude-max", label: "Max 5x", price: 1500 },
    ],
  },
  {
    id: "github-copilot", name: "GitHub Copilot", category: "software", monthlyPrice: 75, cancellation: "løbende", icon: "🐙",
    tiers: [
      { id: "copilot-individual", label: "Individual", price: 75, isDefault: true },
      { id: "copilot-business", label: "Business", price: 140 },
    ],
  },
  {
    id: "midjourney", name: "Midjourney", category: "software", monthlyPrice: 75, cancellation: "løbende", icon: "🎨",
    tiers: [
      { id: "mj-basic", label: "Basic", price: 75 },
      { id: "mj-standard", label: "Standard", price: 220, isDefault: true },
      { id: "mj-pro", label: "Pro", price: 440 },
    ],
  },
  {
    id: "cursor", name: "Cursor", category: "software", monthlyPrice: 150, cancellation: "løbende", icon: "💻",
    tiers: [
      { id: "cursor-pro", label: "Pro", price: 150, isDefault: true },
      { id: "cursor-business", label: "Business", price: 300 },
    ],
  },
  {
    id: "figma", name: "Figma", category: "software", monthlyPrice: 100, cancellation: "løbende", icon: "🎨",
    tiers: [
      { id: "figma-pro", label: "Professional", price: 100, isDefault: true },
      { id: "figma-org", label: "Organization", price: 330 },
    ],
  },
  {
    id: "slack", name: "Slack", category: "software", monthlyPrice: 60, cancellation: "løbende", icon: "💬",
    tiers: [
      { id: "slack-pro", label: "Pro", price: 60, isDefault: true },
      { id: "slack-business", label: "Business+", price: 95 },
    ],
  },
  {
    id: "zoom", name: "Zoom", category: "software", monthlyPrice: 100, cancellation: "løbende", icon: "📹",
    tiers: [
      { id: "zoom-pro", label: "Pro", price: 100, isDefault: true },
      { id: "zoom-business", label: "Business", price: 150 },
    ],
  },
  {
    id: "notion", name: "Notion", category: "software", monthlyPrice: 60, cancellation: "løbende", icon: "📝",
    tiers: [
      { id: "notion-plus", label: "Plus", price: 60, isDefault: true },
      { id: "notion-business", label: "Business", price: 120 },
    ],
  },
  {
    id: "linear", name: "Linear", category: "software", monthlyPrice: 60, cancellation: "løbende", icon: "📐",
    tiers: [
      { id: "linear-standard", label: "Standard", price: 60, isDefault: true },
      { id: "linear-plus", label: "Plus", price: 100 },
    ],
  },
  { id: "superhuman", name: "Superhuman", category: "software", monthlyPrice: 200, cancellation: "løbende", icon: "✉️" },

  // GAMING
  {
    id: "ps-plus", name: "PlayStation Plus", category: "gaming", monthlyPrice: 59, cancellation: "løbende", icon: "🎮",
    tiers: [
      { id: "ps-essential", label: "Essential", price: 59, isDefault: true },
      { id: "ps-extra", label: "Extra", price: 109 },
      { id: "ps-premium", label: "Premium", price: 135 },
    ],
  },
  {
    id: "xbox-game-pass", name: "Xbox Game Pass", category: "gaming", monthlyPrice: 59, cancellation: "løbende", icon: "🟢",
    tiers: [
      { id: "xbox-core", label: "Core", price: 59 },
      { id: "xbox-standard", label: "Standard", price: 109, isDefault: true },
      { id: "xbox-ultimate", label: "Ultimate", price: 149 },
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
  { id: "nemlig-plus", name: "Nemlig.com Plus", category: "food", monthlyPrice: 49, cancellation: "løbende", icon: "🛒" },
  { id: "wolt-plus", name: "Wolt+", category: "food", monthlyPrice: 49, cancellation: "løbende", icon: "🛵" },
  { id: "toogoodtogo", name: "Too Good To Go", category: "food", monthlyPrice: 0, priceNote: "Gratis (hyppige køb)", cancellation: "løbende", icon: "🥡" },
  {
    id: "eatgrim", name: "EatGrim", category: "food", monthlyPrice: 99, cancellation: "løbende", icon: "🥦",
    tiers: [
      { id: "eatgrim-standard", label: "Standard", price: 99, isDefault: true },
      { id: "eatgrim-stor", label: "Stor", price: 149 },
    ],
  },

  // AVISER & MAGASINER
  { id: "politiken", name: "Politiken", category: "news", monthlyPrice: 199, cancellation: "1 md opsigelse", icon: "📰" },
  { id: "berlingske", name: "Berlingske", category: "news", monthlyPrice: 199, cancellation: "1 md opsigelse", icon: "🗞️" },
  { id: "jyllands-posten", name: "Jyllands-Posten", category: "news", monthlyPrice: 179, cancellation: "1 md opsigelse", icon: "📄" },
  { id: "ekstra-bladet", name: "Ekstra Bladet+", category: "news", monthlyPrice: 79, cancellation: "løbende", icon: "📢" },
  { id: "bt-plus", name: "BT+", category: "news", monthlyPrice: 59, cancellation: "løbende", icon: "📋" },
  { id: "zetland", name: "Zetland", category: "news", monthlyPrice: 129, cancellation: "løbende", icon: "💎" },
  { id: "nyt", name: "The New York Times", category: "news", monthlyPrice: 49, cancellation: "løbende", icon: "🗽" },
  {
    id: "frihedsbrevet", name: "Frihedsbrevet", category: "news", monthlyPrice: 79, cancellation: "løbende", icon: "✉️",
    tiers: [
      { id: "frihed-aar", label: "Årlig", price: 79 },
      { id: "frihed-md", label: "Månedlig", price: 99, isDefault: true },
    ],
  },
  {
    id: "weekendavisen", name: "Weekendavisen", category: "news", monthlyPrice: 99, cancellation: "1 md opsigelse", icon: "📰",
    tiers: [
      { id: "wa-digital", label: "Digital", price: 99, isDefault: true },
      { id: "wa-digital-papir", label: "Digital+Papir", price: 199 },
    ],
  },
  {
    id: "third-ear", name: "Third Ear", category: "news", monthlyPrice: 59, cancellation: "løbende", icon: "🎧",
    tiers: [
      { id: "te-aar", label: "Årlig", price: 59 },
      { id: "te-md", label: "Månedlig", price: 79, isDefault: true },
    ],
  },
  {
    id: "r8dio", name: "r8Dio", category: "news", monthlyPrice: 49, cancellation: "løbende", icon: "📻",
    tiers: [
      { id: "r8-medlem", label: "Medlem", price: 49, isDefault: true },
      { id: "r8-stoette", label: "Støttemedlem", price: 99 },
    ],
  },
  { id: "kontoret", name: "Kontoret", category: "news", monthlyPrice: 49, cancellation: "løbende", icon: "🎙️" },
  {
    id: "kristeligt-dagblad", name: "Kristeligt Dagblad", category: "news", monthlyPrice: 99, cancellation: "1 md opsigelse", icon: "✝️",
    tiers: [
      { id: "kd-digital", label: "Digital", price: 99, isDefault: true },
      { id: "kd-digital-papir", label: "Digital+Papir", price: 299 },
    ],
  },
  {
    id: "ingenioeren", name: "Ingeniøren", category: "news", monthlyPrice: 99, cancellation: "løbende", icon: "⚙️",
    tiers: [
      { id: "ing-digital", label: "Digital", price: 99, isDefault: true },
      { id: "ing-premium", label: "Premium", price: 199 },
    ],
  },
  {
    id: "altinget", name: "Altinget", category: "news", monthlyPrice: 149, cancellation: "løbende", icon: "🏛️",
    tiers: [
      { id: "alt-basis", label: "Basis", price: 149, isDefault: true },
      { id: "alt-pro", label: "Pro", price: 299 },
    ],
  },
  { id: "acast-plus", name: "Acast+", category: "news", monthlyPrice: 39, cancellation: "løbende", icon: "🎙️" },

  // MOBIL & INTERNET
  {
    id: "telmore", name: "Telmore", category: "telecom", monthlyPrice: 99, cancellation: "løbende", icon: "📱",
    tiers: [
      { id: "telmore-lille", label: "Lille", price: 99 },
      { id: "telmore-mellem", label: "Mellem", price: 149, isDefault: true },
      { id: "telmore-stor", label: "Stor", price: 199 },
      { id: "telmore-fri", label: "Fri data", price: 299 },
    ],
  },
  {
    id: "yousee", name: "YouSee", category: "telecom", monthlyPrice: 99, cancellation: "1 md opsigelse", icon: "📶",
    tiers: [
      { id: "yousee-lille", label: "Lille", price: 99 },
      { id: "yousee-mellem", label: "Mellem", price: 149, isDefault: true },
      { id: "yousee-stor", label: "Stor", price: 199 },
      { id: "yousee-fri", label: "Fri data", price: 299 },
    ],
  },
  {
    id: "telia", name: "Telia", category: "telecom", monthlyPrice: 99, cancellation: "1 md opsigelse", icon: "📡",
    tiers: [
      { id: "telia-lille", label: "Lille", price: 99 },
      { id: "telia-mellem", label: "Mellem", price: 179, isDefault: true },
      { id: "telia-stor", label: "Stor", price: 249 },
      { id: "telia-fri", label: "Fri data", price: 349 },
    ],
  },
  {
    id: "tre", name: "3/Tre", category: "telecom", monthlyPrice: 99, cancellation: "løbende", icon: "3️⃣",
    tiers: [
      { id: "tre-lille", label: "Lille", price: 99 },
      { id: "tre-mellem", label: "Mellem", price: 149, isDefault: true },
      { id: "tre-stor", label: "Stor", price: 199 },
      { id: "tre-fri", label: "Fri data", price: 299 },
    ],
  },
  {
    id: "oister", name: "Oister", category: "telecom", monthlyPrice: 79, cancellation: "løbende", icon: "📲",
    tiers: [
      { id: "oister-15gb", label: "15GB", price: 79 },
      { id: "oister-40gb", label: "40GB", price: 139, isDefault: true },
      { id: "oister-fri", label: "Fri data", price: 239 },
    ],
  },
  {
    id: "cbb-mobil", name: "CBB Mobil", category: "telecom", monthlyPrice: 79, cancellation: "løbende", icon: "☎️",
    tiers: [
      { id: "cbb-10gb", label: "10GB", price: 79 },
      { id: "cbb-40gb", label: "40GB", price: 129, isDefault: true },
      { id: "cbb-fri", label: "Fri data", price: 199 },
    ],
  },
  {
    id: "greenspeak", name: "Greenspeak", category: "telecom", monthlyPrice: 99, cancellation: "løbende", icon: "🌱",
    tiers: [
      { id: "gs-6gb", label: "6GB", price: 99, isDefault: true },
      { id: "gs-40gb", label: "40GB", price: 149 },
      { id: "gs-fri", label: "Fri data", price: 199 },
    ],
  },
  {
    id: "lebara", name: "Lebara", category: "telecom", monthlyPrice: 49, priceNote: "49-149 kr/md", cancellation: "løbende", icon: "🔵",
    tiers: [
      { id: "lebara-5gb", label: "5 GB", price: 49 },
      { id: "lebara-40gb", label: "40 GB", price: 99 },
      { id: "lebara-100gb", label: "100 GB", price: 149 },
    ],
  },
  {
    id: "duka", name: "Duka", category: "telecom", monthlyPrice: 59, cancellation: "løbende", icon: "📱",
    tiers: [
      { id: "duka-mini", label: "Mini", price: 59 },
      { id: "duka-medium", label: "Medium", price: 99, isDefault: true },
      { id: "duka-stor", label: "Stor", price: 149 },
      { id: "duka-ubegr", label: "Ubegrænset", price: 199 },
    ],
  },
  {
    id: "waoo-mobil", name: "Waoo Mobil", category: "telecom", monthlyPrice: 49, cancellation: "1 md opsigelse", icon: "📶",
    tiers: [
      { id: "waoo-1gb", label: "1GB", price: 49 },
      { id: "waoo-20gb", label: "20GB", price: 119, isDefault: true },
      { id: "waoo-80gb", label: "80GB", price: 179 },
      { id: "waoo-fri", label: "Fri data", price: 299 },
    ],
  },
  {
    id: "callme", name: "Callme", category: "telecom", monthlyPrice: 79, cancellation: "løbende", icon: "📞",
    tiers: [
      { id: "callme-10gb", label: "10GB", price: 79 },
      { id: "callme-50gb", label: "50GB", price: 129, isDefault: true },
      { id: "callme-fri", label: "Fri data", price: 169 },
    ],
  },

  // BREDBÅND & INTERNET
  {
    id: "norlys-bredbaand", name: "Norlys Bredbånd", category: "broadband", monthlyPrice: 199, cancellation: "1 md opsigelse", icon: "🌐",
    tiers: [
      { id: "norlys-100", label: "100/100", price: 199 },
      { id: "norlys-500", label: "500/500", price: 299, isDefault: true },
      { id: "norlys-1000", label: "1000/1000", price: 449 },
    ],
  },
  { id: "stofa-bredbaand", name: "Stofa Bredbånd", category: "broadband", monthlyPrice: 249, priceNote: "249-399 kr/md", cancellation: "1 md opsigelse", icon: "📡" },
  { id: "waoo", name: "Waoo", category: "broadband", monthlyPrice: 249, priceNote: "249-449 kr/md", cancellation: "1 md opsigelse", icon: "🔗" },
  { id: "yousee-bredbaand", name: "YouSee Bredbånd", category: "broadband", monthlyPrice: 299, priceNote: "299-499 kr/md", cancellation: "1 md opsigelse", icon: "📶" },
  {
    id: "fastspeed", name: "Fastspeed", category: "broadband", monthlyPrice: 199, cancellation: "1 md opsigelse", icon: "⚡",
    tiers: [
      { id: "fs-100", label: "100/100", price: 199 },
      { id: "fs-500", label: "500/500", price: 269, isDefault: true },
      { id: "fs-1000", label: "1000/1000", price: 399 },
    ],
  },
  {
    id: "hiper", name: "Hiper", category: "broadband", monthlyPrice: 199, cancellation: "løbende", icon: "🚀",
    tiers: [
      { id: "hiper-100", label: "100/100", price: 199 },
      { id: "hiper-300", label: "300/300", price: 249, isDefault: true },
      { id: "hiper-1000", label: "1000/1000", price: 349 },
    ],
  },
  {
    id: "kviknet", name: "Kviknet", category: "broadband", monthlyPrice: 199, cancellation: "løbende", icon: "🌐",
    tiers: [
      { id: "kvik-100", label: "100/100", price: 199 },
      { id: "kvik-500", label: "500/500", price: 249, isDefault: true },
      { id: "kvik-1000", label: "1000/1000", price: 299 },
    ],
  },

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
  {
    id: "glossybox", name: "Glossybox", category: "grooming", monthlyPrice: 119, cancellation: "løbende", icon: "💄",
    tiers: [
      { id: "glossy-aar", label: "Årlig", price: 119 },
      { id: "glossy-md", label: "Standard", price: 149, isDefault: true },
    ],
  },

  // TØJ & MODE
  { id: "stitch-fix", name: "Stitch Fix", category: "fashion", monthlyPrice: 149, cancellation: "løbende", icon: "👗" },
  { id: "miinto-plus", name: "Miinto+", category: "fashion", monthlyPrice: 49, cancellation: "løbende", icon: "👠" },
  { id: "zalando-plus", name: "Zalando Plus", category: "fashion", monthlyPrice: 49, cancellation: "løbende", icon: "👟" },
  { id: "justfab", name: "JustFab", category: "fashion", monthlyPrice: 299, cancellation: "løbende", icon: "👠" },

  // ELEKTRONIK-LEJE
  { id: "grover", name: "Grover", category: "electronics", monthlyPrice: 299, priceNote: "Varierer", cancellation: "løbende", icon: "💻" },
  { id: "myway", name: "myway", category: "electronics", monthlyPrice: 199, priceNote: "Varierer", cancellation: "løbende", icon: "📱" },

  // DATING
  {
    id: "tinder", name: "Tinder", category: "dating", monthlyPrice: 79, cancellation: "løbende", icon: "🔥",
    tiers: [
      { id: "tinder-plus", label: "Plus", price: 79 },
      { id: "tinder-gold", label: "Gold", price: 129, isDefault: true },
      { id: "tinder-platinum", label: "Platinum", price: 199 },
    ],
  },
  { id: "bumble", name: "Bumble", category: "dating", monthlyPrice: 199, cancellation: "løbende", icon: "🐝" },
  { id: "hinge", name: "Hinge", category: "dating", monthlyPrice: 149, cancellation: "løbende", icon: "💜" },

  // APP STORE & IN-APP
  {
    id: "apple-one", name: "Apple One", category: "appstore", monthlyPrice: 169, cancellation: "løbende", icon: "🍎",
    tiers: [
      { id: "a1-individual", label: "Individual", price: 169, isDefault: true },
      { id: "a1-family", label: "Family", price: 249 },
      { id: "a1-premium", label: "Premium", price: 299 },
    ],
  },
  { id: "google-play-pass", name: "Google Play Pass", category: "appstore", monthlyPrice: 39, cancellation: "løbende", icon: "▶️" },
  { id: "apple-arcade", name: "Apple Arcade", category: "appstore", monthlyPrice: 69, cancellation: "løbende", icon: "🕹️" },

  // FORENINGER & KLUBBER
  { id: "golfklub", name: "Golfklub", category: "clubs", monthlyPrice: 500, priceNote: "Varierer", cancellation: "12 md binding", icon: "⛳" },
  { id: "sportsklub", name: "Sportsklub", category: "clubs", monthlyPrice: 200, priceNote: "Varierer", cancellation: "12 md binding", icon: "⚽" },
  { id: "spejder", name: "Spejder", category: "clubs", monthlyPrice: 100, priceNote: "Varierer", cancellation: "løbende", icon: "🏕️" },
  { id: "hobbyforening", name: "Hobbyforening", category: "clubs", monthlyPrice: 150, priceNote: "Varierer", cancellation: "løbende", icon: "🎨" },

  // VELGØRENHED & DONATIONER
  { id: "roede-kors", name: "Røde Kors", category: "charity", monthlyPrice: 100, cancellation: "løbende", icon: "❤️" },
  { id: "unicef", name: "UNICEF", category: "charity", monthlyPrice: 150, cancellation: "løbende", icon: "🌍" },
  { id: "amnesty", name: "Amnesty International", category: "charity", monthlyPrice: 75, cancellation: "løbende", icon: "🕊️" },
  { id: "kraeftens-bekaempelse", name: "Kræftens Bekæmpelse", category: "charity", monthlyPrice: 100, cancellation: "løbende", icon: "🎗️" },

  // KAFFE & DRIKKEVARER
  { id: "nespresso", name: "Nespresso abonnement", category: "coffee", monthlyPrice: 249, cancellation: "løbende", icon: "☕" },
  { id: "simplecoffee", name: "SimpleCoffee", category: "coffee", monthlyPrice: 199, cancellation: "løbende", icon: "☕" },
  { id: "bki", name: "BKI abonnement", category: "coffee", monthlyPrice: 149, cancellation: "løbende", icon: "☕" },

  // PARKERING
  { id: "easypark", name: "EasyPark", category: "transport", monthlyPrice: 49, priceNote: "Varierer", cancellation: "løbende", icon: "🅿️" },
  { id: "parkpark", name: "ParkPark", category: "transport", monthlyPrice: 39, priceNote: "Varierer", cancellation: "løbende", icon: "🅿️" },
  { id: "apcoa-flow", name: "Apcoa Flow", category: "transport", monthlyPrice: 0, priceNote: "Gratis (transaktionsgebyr)", cancellation: "løbende", icon: "🅿️" },

  // TANDLÆGE & SUNDHED
  { id: "tandlaege-abo", name: "Tandlæge-abonnement", category: "dental", monthlyPrice: 149, priceNote: "99-249 kr/md", cancellation: "1 md opsigelse", icon: "🦷" },
  { id: "kiropraktor", name: "Kiropraktor-abonnement", category: "dental", monthlyPrice: 299, priceNote: "Varierer", cancellation: "1 md opsigelse", icon: "🩺" },
  { id: "mindler", name: "Mindler", category: "dental", monthlyPrice: 499, cancellation: "løbende", icon: "🧠" },

  // MAGASINER
  { id: "euroman", name: "Euroman", category: "magazines", monthlyPrice: 89, cancellation: "løbende", icon: "📖" },
  { id: "femina", name: "Femina", category: "magazines", monthlyPrice: 69, cancellation: "løbende", icon: "📖" },
  { id: "illustreret-videnskab", name: "Illustreret Videnskab", category: "magazines", monthlyPrice: 79, cancellation: "løbende", icon: "🔬" },
  { id: "samvirke", name: "Samvirke", category: "magazines", monthlyPrice: 49, cancellation: "løbende", icon: "📖" },

  // HAVESERVICE
  { id: "greenmow", name: "GreenMow", category: "garden", monthlyPrice: 399, priceNote: "Varierer", cancellation: "løbende", icon: "🌱" },
  { id: "plaeneklip", name: "Plæneklip-abonnement", category: "garden", monthlyPrice: 499, priceNote: "Varierer", cancellation: "løbende", icon: "🏡" },
  { id: "have-abo", name: "Haveservice-abonnement", category: "garden", monthlyPrice: 599, priceNote: "Varierer", cancellation: "1 md opsigelse", icon: "🌿" },

  // VASKERI
  { id: "washa", name: "Washa", category: "laundry", monthlyPrice: 299, priceNote: "Varierer", cancellation: "løbende", icon: "👔" },
  { id: "renseri-abo", name: "Renseri-abonnement", category: "laundry", monthlyPrice: 249, priceNote: "Varierer", cancellation: "løbende", icon: "👗" },

  // DIGITAL STORAGE
  { id: "backblaze", name: "Backblaze", category: "digistorage", monthlyPrice: 49, cancellation: "løbende", icon: "💾" },
  { id: "onedrive-extra", name: "OneDrive 100 GB", category: "digistorage", monthlyPrice: 15, cancellation: "løbende", icon: "☁️" },

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
