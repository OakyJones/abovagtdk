import { TinkTransaction, parseTinkAmount } from "./tink";
import { services } from "./services";

export interface DetectedSubscription {
  serviceName: string;
  knownServiceId?: string;
  monthlyAmount: number;
  transactionCount: number;
  lastSeen: string;
  matchedBy: "known_service" | "recurring_pattern";
  icon?: string;
}

interface TransactionGroup {
  name: string;
  amounts: number[];
  dates: string[];
  originalDescriptions: string[];
}

// Common subscription-related keywords in transaction descriptions
const SUBSCRIPTION_KEYWORDS = [
  // Generic
  "abo", "subscription", "premium", "plus", "monthly", "recurring",
  // Streaming & music
  "netflix", "spotify", "viaplay", "disney", "hbo", "max",
  "youtube", "apple", "google", "microsoft", "adobe",
  "tidal", "mofibo", "audible", "podimo", "nextory",
  // Fitness & software
  "fitness", "sats", "icloud", "dropbox", "nordvpn",
  // Gaming
  "playstation", "xbox", "nintendo", "ea play",
  // Dating
  "tinder", "bumble", "hinge",
  // Food & news
  "hellofresh", "goodiebox", "aarstiderne",
  "politiken", "berlingske", "jyllands", "zetland",
  "headspace", "calm", "strava",
  // Bredbånd & TV
  "norlys", "stofa", "waoo", "yousee", "fastspeed", "hiper",
  "allente", "boxer",
  // Alarm & sikkerhed
  "verisure", "sector alarm", "ajax alarm",
  // Fagforening & a-kasse
  "hk danmark", "3f ", "krifa", "faglige hus", "ase ", "lederne",
  // Sygeforsikring
  "sygeforsikring", "danmark gruppe",
  // El & energi
  "oersted", "ørsted", "ewii", "clever",
  // Kontaktlinser
  "lensway", "synoptik", "louis nielsen",
  // Vitamin & kosttilskud
  "puori", "bodylab", "vitaepro",
  // Transport
  "rejsekort", "dsb", "donkey republic", "lime ",
  // Opbevaring
  "self storage", "pelican", "shurgard",
  // Kæledyr
  "buddy", "petlux", "animail", "dyreforsikring",
  // Rengøring
  "happy helper", "hilfr", "cliive",
  // Personlig pleje & mode
  "estrid", "dollar shave", "stitch fix", "miinto", "zalando",
  // Elektronik-leje
  "grover", "myway",
];

/** Normalize a transaction description for matching */
function normalize(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/[^a-zæøå0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Try to match a transaction description to a known service */
function matchKnownService(desc: string): typeof services[number] | null {
  const norm = normalize(desc);

  for (const svc of services) {
    const svcNorm = normalize(svc.name);
    // Direct name match
    if (norm.includes(svcNorm)) return svc;
    // ID match (e.g. "netflix" in description)
    if (norm.includes(svc.id.replace(/-/g, ""))) return svc;
    if (norm.includes(svc.id.replace(/-/g, " "))) return svc;
  }

  return null;
}

/** Group transactions by normalized description */
function groupTransactions(transactions: TinkTransaction[]): TransactionGroup[] {
  const groups = new Map<string, TransactionGroup>();

  for (const tx of transactions) {
    const amount = parseTinkAmount(tx.amount);
    // Only look at outgoing transactions (negative amounts in Tink = expenses)
    if (parseInt(tx.amount.value.unscaledValue) > 0) continue;
    // Skip very small or very large amounts
    if (amount < 5 || amount > 5000) continue;

    const desc = tx.descriptions.display || tx.descriptions.original;
    const normDesc = normalize(desc);

    // Group key: first 30 chars of normalized description
    const key = normDesc.slice(0, 30);

    if (!groups.has(key)) {
      groups.set(key, {
        name: desc,
        amounts: [],
        dates: [],
        originalDescriptions: [],
      });
    }

    const group = groups.get(key)!;
    group.amounts.push(amount);
    group.dates.push(tx.dates.booked);
    group.originalDescriptions.push(desc);
  }

  return Array.from(groups.values());
}

/** Check if a group of transactions looks like a subscription */
function isRecurring(group: TransactionGroup): boolean {
  // Need at least 2 transactions
  if (group.amounts.length < 2) return false;

  // Check if amounts are similar (within 20%)
  const avgAmount = group.amounts.reduce((a, b) => a + b, 0) / group.amounts.length;
  const allSimilar = group.amounts.every(
    (a) => Math.abs(a - avgAmount) / avgAmount < 0.2
  );
  if (!allSimilar) return false;

  // Check if dates are roughly monthly apart
  const sortedDates = [...group.dates].sort();
  if (sortedDates.length >= 2) {
    const first = new Date(sortedDates[0]);
    const last = new Date(sortedDates[sortedDates.length - 1]);
    const daySpan = (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24);
    // At least 20 days apart for 2 transactions (roughly monthly)
    if (daySpan < 20) return false;
  }

  return true;
}

/** Check if description matches subscription keywords */
function hasSubscriptionKeyword(desc: string): boolean {
  const norm = normalize(desc);
  return SUBSCRIPTION_KEYWORDS.some((kw) => norm.includes(kw));
}

/** Scan transactions and detect subscriptions */
export function scanTransactions(transactions: TinkTransaction[]): {
  subscriptions: DetectedSubscription[];
  unknownRecurring: DetectedSubscription[];
  totalMonthlySpend: number;
} {
  const groups = groupTransactions(transactions);
  const subscriptions: DetectedSubscription[] = [];
  const unknownRecurring: DetectedSubscription[] = [];

  for (const group of groups) {
    const isRec = isRecurring(group);
    const hasKeyword = hasSubscriptionKeyword(group.name);

    // Skip non-recurring, non-keyword transactions
    if (!isRec && !hasKeyword) continue;

    const avgAmount = Math.round(
      group.amounts.reduce((a, b) => a + b, 0) / group.amounts.length
    );
    const sortedDates = [...group.dates].sort();
    const lastDate = sortedDates[sortedDates.length - 1];

    const matchedService = matchKnownService(group.name);

    const detected: DetectedSubscription = {
      serviceName: matchedService?.name || group.name,
      knownServiceId: matchedService?.id,
      monthlyAmount: avgAmount,
      transactionCount: group.amounts.length,
      lastSeen: lastDate,
      matchedBy: matchedService ? "known_service" : "recurring_pattern",
      icon: matchedService?.icon,
    };

    if (matchedService) {
      subscriptions.push(detected);
    } else if (isRec) {
      unknownRecurring.push(detected);
    }
  }

  // Sort by amount descending
  subscriptions.sort((a, b) => b.monthlyAmount - a.monthlyAmount);
  unknownRecurring.sort((a, b) => b.monthlyAmount - a.monthlyAmount);

  // Calculate total monthly spend from all outgoing transactions
  let totalSpend = 0;
  const allDates: string[] = [];
  for (const tx of transactions) {
    const rawVal = parseInt(tx.amount.value.unscaledValue);
    if (rawVal > 0) continue; // skip incoming
    const amount = parseTinkAmount(tx.amount);
    if (amount < 1) continue;
    totalSpend += amount;
    if (tx.dates.booked) allDates.push(tx.dates.booked);
  }

  // Estimate months spanned
  let months = 3; // default to 3 months
  if (allDates.length >= 2) {
    const sorted = allDates.sort();
    const first = new Date(sorted[0]);
    const last = new Date(sorted[sorted.length - 1]);
    const daySpan = (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24);
    months = Math.max(1, Math.round(daySpan / 30));
  }

  const totalMonthlySpend = Math.round(totalSpend / months);

  return { subscriptions, unknownRecurring, totalMonthlySpend };
}
