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
  { id: "hellofresh", name: "HelloFresh", category: "food", monthlyPrice: 1596, priceNote: "399 kr/uge", cancellation: "løbende", icon: "🥗" },
  { id: "goodiebox", name: "Goodiebox", category: "food", monthlyPrice: 249, cancellation: "løbende", icon: "🎁" },
  { id: "simplecook", name: "SimpleCook", category: "food", monthlyPrice: 1396, priceNote: "349 kr/uge", cancellation: "løbende", icon: "🍳" },
  { id: "retnemt", name: "RetNemt", category: "food", monthlyPrice: 1596, priceNote: "399 kr/uge", cancellation: "løbende", icon: "🍱" },
  { id: "aarstiderne", name: "Aarstiderne", category: "food", monthlyPrice: 1596, priceNote: "399 kr/uge", cancellation: "løbende", icon: "🌿" },
  { id: "greenmeal", name: "GreenMeal", category: "food", monthlyPrice: 1396, priceNote: "349 kr/uge", cancellation: "løbende", icon: "🥬" },

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
