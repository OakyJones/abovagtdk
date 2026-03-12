import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const SERVICES = [
  // STREAMING & TV
  { name: "Netflix", category: "streaming", current_price: 79, cancellation_period_days: 0, binding_months: 0 },
  { name: "Viaplay", category: "streaming", current_price: 119, cancellation_period_days: 0, binding_months: 0 },
  { name: "Disney+", category: "streaming", current_price: 49, cancellation_period_days: 0, binding_months: 0 },
  { name: "Max/HBO", category: "streaming", current_price: 89, cancellation_period_days: 0, binding_months: 0 },
  { name: "TV2 Play", category: "streaming", current_price: 69, cancellation_period_days: 0, binding_months: 0 },
  { name: "Amazon Prime Video", category: "streaming", current_price: 59, cancellation_period_days: 0, binding_months: 0 },
  { name: "Apple TV+", category: "streaming", current_price: 79, cancellation_period_days: 0, binding_months: 0 },
  { name: "SkyShowtime", category: "streaming", current_price: 99, cancellation_period_days: 0, binding_months: 0 },
  { name: "Paramount+", category: "streaming", current_price: 69, cancellation_period_days: 0, binding_months: 0 },
  { name: "Nordisk Film+", category: "streaming", current_price: 59, cancellation_period_days: 0, binding_months: 0 },
  { name: "C More", category: "streaming", current_price: 99, cancellation_period_days: 0, binding_months: 0 },
  { name: "Discovery+", category: "streaming", current_price: 49, cancellation_period_days: 0, binding_months: 0 },
  { name: "DAZN", category: "streaming", current_price: 79, cancellation_period_days: 0, binding_months: 0 },
  { name: "Hayu", category: "streaming", current_price: 49, cancellation_period_days: 0, binding_months: 0 },
  // MUSIK & LYDBØGER
  { name: "Spotify", category: "music", current_price: 99, cancellation_period_days: 0, binding_months: 0 },
  { name: "Apple Music", category: "music", current_price: 99, cancellation_period_days: 0, binding_months: 0 },
  { name: "YouTube Premium", category: "music", current_price: 79, cancellation_period_days: 0, binding_months: 0 },
  { name: "Tidal", category: "music", current_price: 99, cancellation_period_days: 0, binding_months: 0 },
  { name: "Mofibo", category: "music", current_price: 149, cancellation_period_days: 0, binding_months: 0 },
  { name: "Audible", category: "music", current_price: 149, cancellation_period_days: 0, binding_months: 0 },
  { name: "Nextory", category: "music", current_price: 149, cancellation_period_days: 0, binding_months: 0 },
  { name: "Saxo Premium", category: "music", current_price: 149, cancellation_period_days: 0, binding_months: 0 },
  { name: "Podimo", category: "music", current_price: 79, cancellation_period_days: 0, binding_months: 0 },
  // FITNESS
  { name: "Fitness World", category: "fitness", current_price: 199, cancellation_period_days: 30, binding_months: 0 },
  { name: "SATS", category: "fitness", current_price: 299, cancellation_period_days: 30, binding_months: 0 },
  { name: "Fresh Fitness", category: "fitness", current_price: 149, cancellation_period_days: 30, binding_months: 0 },
  { name: "Loop Fitness", category: "fitness", current_price: 199, cancellation_period_days: 30, binding_months: 0 },
  { name: "DGI Fitness", category: "fitness", current_price: 179, cancellation_period_days: 30, binding_months: 0 },
  { name: "Repeat", category: "fitness", current_price: 149, cancellation_period_days: 0, binding_months: 0 },
  { name: "Fitnessdk", category: "fitness", current_price: 249, cancellation_period_days: 30, binding_months: 0 },
  // SOFTWARE & CLOUD
  { name: "Microsoft 365", category: "software", current_price: 89, cancellation_period_days: 0, binding_months: 0 },
  { name: "Adobe Creative Cloud", category: "software", current_price: 189, cancellation_period_days: 0, binding_months: 12 },
  { name: "iCloud+", category: "software", current_price: 9, cancellation_period_days: 0, binding_months: 0 },
  { name: "Google One", category: "software", current_price: 20, cancellation_period_days: 0, binding_months: 0 },
  { name: "Dropbox", category: "software", current_price: 99, cancellation_period_days: 0, binding_months: 0 },
  { name: "1Password", category: "software", current_price: 29, cancellation_period_days: 0, binding_months: 0 },
  { name: "NordVPN", category: "software", current_price: 49, cancellation_period_days: 0, binding_months: 0 },
  { name: "ChatGPT Plus", category: "software", current_price: 149, cancellation_period_days: 0, binding_months: 0 },
  { name: "Canva Pro", category: "software", current_price: 99, cancellation_period_days: 0, binding_months: 0 },
  // GAMING
  { name: "PlayStation Plus", category: "gaming", current_price: 59, cancellation_period_days: 0, binding_months: 0 },
  { name: "Xbox Game Pass", category: "gaming", current_price: 79, cancellation_period_days: 0, binding_months: 0 },
  { name: "Nintendo Switch Online", category: "gaming", current_price: 29, cancellation_period_days: 0, binding_months: 0 },
  { name: "EA Play", category: "gaming", current_price: 39, cancellation_period_days: 0, binding_months: 0 },
  { name: "GeForce NOW", category: "gaming", current_price: 99, cancellation_period_days: 0, binding_months: 0 },
  // MADLEVERING & BOKSE
  { name: "HelloFresh", category: "food", current_price: 1596, cancellation_period_days: 0, binding_months: 0 },
  { name: "Goodiebox", category: "food", current_price: 249, cancellation_period_days: 0, binding_months: 0 },
  { name: "SimpleCook", category: "food", current_price: 1396, cancellation_period_days: 0, binding_months: 0 },
  { name: "RetNemt", category: "food", current_price: 1596, cancellation_period_days: 0, binding_months: 0 },
  { name: "Aarstiderne", category: "food", current_price: 1596, cancellation_period_days: 0, binding_months: 0 },
  { name: "GreenMeal", category: "food", current_price: 1396, cancellation_period_days: 0, binding_months: 0 },
  // AVISER & MAGASINER
  { name: "Politiken", category: "news", current_price: 199, cancellation_period_days: 30, binding_months: 0 },
  { name: "Berlingske", category: "news", current_price: 199, cancellation_period_days: 30, binding_months: 0 },
  { name: "Jyllands-Posten", category: "news", current_price: 179, cancellation_period_days: 30, binding_months: 0 },
  { name: "Ekstra Bladet+", category: "news", current_price: 79, cancellation_period_days: 0, binding_months: 0 },
  { name: "BT+", category: "news", current_price: 59, cancellation_period_days: 0, binding_months: 0 },
  { name: "Zetland", category: "news", current_price: 129, cancellation_period_days: 0, binding_months: 0 },
  { name: "The New York Times", category: "news", current_price: 49, cancellation_period_days: 0, binding_months: 0 },
  // MOBIL & INTERNET
  { name: "Telmore", category: "telecom", current_price: 149, cancellation_period_days: 0, binding_months: 0 },
  { name: "YouSee", category: "telecom", current_price: 199, cancellation_period_days: 30, binding_months: 0 },
  { name: "Oister", category: "telecom", current_price: 99, cancellation_period_days: 0, binding_months: 0 },
  { name: "CBB Mobil", category: "telecom", current_price: 79, cancellation_period_days: 0, binding_months: 0 },
  { name: "Greenspeak", category: "telecom", current_price: 99, cancellation_period_days: 0, binding_months: 0 },
  { name: "Lebara", category: "telecom", current_price: 49, cancellation_period_days: 0, binding_months: 0 },
  // DATING
  { name: "Tinder", category: "dating", current_price: 89, cancellation_period_days: 0, binding_months: 0 },
  { name: "Bumble", category: "dating", current_price: 199, cancellation_period_days: 0, binding_months: 0 },
  { name: "Hinge", category: "dating", current_price: 149, cancellation_period_days: 0, binding_months: 0 },
  // DIVERSE
  { name: "Amazon Prime", category: "misc", current_price: 59, cancellation_period_days: 0, binding_months: 0 },
  { name: "Vivino Premium", category: "misc", current_price: 59, cancellation_period_days: 0, binding_months: 0 },
  { name: "Headspace", category: "misc", current_price: 69, cancellation_period_days: 0, binding_months: 0 },
  { name: "Calm", category: "misc", current_price: 49, cancellation_period_days: 0, binding_months: 0 },
  { name: "Strava", category: "misc", current_price: 49, cancellation_period_days: 0, binding_months: 0 },
];

export async function POST() {
  const supabase = getSupabaseAdmin();
  const log: string[] = [];
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const svc of SERVICES) {
    // Check if already exists (case-insensitive name match)
    const { data: existing } = await supabase
      .from("known_services")
      .select("id, name")
      .ilike("name", svc.name)
      .maybeSingle();

    if (existing) {
      log.push(`SKIP: "${svc.name}" (findes allerede som "${existing.name}")`);
      skipped++;
      continue;
    }

    const { error } = await supabase.from("known_services").insert({
      ...svc,
      price_updated_at: new Date().toISOString(),
    });

    if (error) {
      log.push(`FEJL: "${svc.name}" — ${error.message}`);
      errors++;
    } else {
      log.push(`TILFØJET: "${svc.name}" (${svc.category}, ${svc.current_price} kr/md)`);
      inserted++;
    }
  }

  return NextResponse.json({
    summary: { total: SERVICES.length, inserted, skipped, errors },
    log,
  });
}
