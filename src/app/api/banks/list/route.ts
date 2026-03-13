import { NextResponse } from "next/server";
import { getInstitutions } from "@/lib/gocardless";

export const dynamic = "force-dynamic";

// In-memory cache
let cachedBanks: { id: string; name: string; logo: string; transaction_total_days: string }[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  try {
    const now = Date.now();

    if (cachedBanks && now - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json({ banks: cachedBanks, count: cachedBanks.length, cached: true });
    }

    // Verify credentials exist
    if (!process.env.GOCARDLESS_SECRET_ID || !process.env.GOCARDLESS_SECRET_KEY) {
      return NextResponse.json(
        { error: "GoCardless er ikke konfigureret", banks: [] },
        { status: 503 }
      );
    }

    const institutions = await getInstitutions("DK");

    cachedBanks = institutions.map((inst) => ({
      id: inst.id,
      name: inst.name,
      logo: inst.logo,
      transaction_total_days: inst.transaction_total_days,
    }));
    cacheTimestamp = now;

    return NextResponse.json({ banks: cachedBanks, count: cachedBanks.length });
  } catch (error) {
    console.error("Banks list error:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente bankliste", banks: [] },
      { status: 503 }
    );
  }
}
