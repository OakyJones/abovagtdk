export interface Service {
  id: string;
  name: string;
  category: "streaming" | "music" | "fitness" | "books" | "software" | "food" | "storage";
  monthlyPrice: number; // DKK
  icon: string; // emoji fallback
  color: string; // brand-ish color for the card
}

export const services: Service[] = [
  // Streaming
  { id: "netflix", name: "Netflix", category: "streaming", monthlyPrice: 119, icon: "🎬", color: "#E50914" },
  { id: "viaplay", name: "Viaplay", category: "streaming", monthlyPrice: 129, icon: "📺", color: "#6B3FA0" },
  { id: "disney", name: "Disney+", category: "streaming", monthlyPrice: 89, icon: "🏰", color: "#113CCF" },
  { id: "hbo", name: "HBO Max", category: "streaming", monthlyPrice: 99, icon: "🎭", color: "#5822B4" },
  // Musik
  { id: "spotify", name: "Spotify", category: "music", monthlyPrice: 79, icon: "🎵", color: "#1DB954" },
  { id: "apple-music", name: "Apple Music", category: "music", monthlyPrice: 79, icon: "🎶", color: "#FC3C44" },
  { id: "youtube-premium", name: "YouTube Premium", category: "music", monthlyPrice: 79, icon: "▶️", color: "#FF0000" },
  // Fitness
  { id: "fitness-world", name: "Fitness World", category: "fitness", monthlyPrice: 199, icon: "💪", color: "#FF6B00" },
  { id: "sats", name: "SATS", category: "fitness", monthlyPrice: 299, icon: "🏋️", color: "#00A3E0" },
  // Bøger & lyd
  { id: "mofibo", name: "Mofibo", category: "books", monthlyPrice: 149, icon: "📖", color: "#00B4D8" },
  { id: "audible", name: "Audible", category: "books", monthlyPrice: 109, icon: "🎧", color: "#F7991C" },
  // Software
  { id: "adobe", name: "Adobe CC", category: "software", monthlyPrice: 375, icon: "🎨", color: "#FF0000" },
  { id: "microsoft365", name: "Microsoft 365", category: "software", monthlyPrice: 69, icon: "💼", color: "#0078D4" },
  // Cloud storage
  { id: "icloud", name: "iCloud+", category: "storage", monthlyPrice: 9, icon: "☁️", color: "#3E82F7" },
  { id: "google-one", name: "Google One", category: "storage", monthlyPrice: 20, icon: "🌐", color: "#4285F4" },
  // Mad & livsstil
  { id: "hellofresh", name: "HelloFresh", category: "food", monthlyPrice: 499, icon: "🥗", color: "#91C11E" },
  { id: "goodiebox", name: "Goodiebox", category: "food", monthlyPrice: 199, icon: "🎁", color: "#FF69B4" },
];

export type UsageFrequency = "daily" | "weekly" | "rarely" | "never";

export const frequencyLabels: Record<UsageFrequency, string> = {
  daily: "Dagligt",
  weekly: "Ugentligt",
  rarely: "Sjældent",
  never: "Aldrig",
};

export function getEstimatedSavings(
  selectedServices: string[],
  usageFrequency: Record<string, UsageFrequency>
): { monthlySavings: number; yearlySavings: number; wastedServices: Service[] } {
  const wastedServices = services.filter(
    (s) =>
      selectedServices.includes(s.id) &&
      (usageFrequency[s.id] === "rarely" || usageFrequency[s.id] === "never")
  );

  const monthlySavings = wastedServices.reduce((sum, s) => sum + s.monthlyPrice, 0);

  return {
    monthlySavings,
    yearlySavings: monthlySavings * 12,
    wastedServices,
  };
}
