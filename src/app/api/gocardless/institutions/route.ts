import { NextResponse } from "next/server";
import { getInstitutions } from "@/lib/gocardless";

export const dynamic = "force-dynamic";

interface Institution {
  id: string;
  name: string;
  logo: string;
}

// In-memory cache: refresh once per day
let cachedInstitutions: Institution[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  try {
    const now = Date.now();
    if (cachedInstitutions && now - cacheTimestamp < CACHE_TTL_MS) {
      return NextResponse.json({ institutions: cachedInstitutions, count: cachedInstitutions.length });
    }

    if (!process.env.GOCARDLESS_SECRET_ID || !process.env.GOCARDLESS_SECRET_KEY) {
      throw new Error("GoCardless credentials not configured");
    }

    const raw = await getInstitutions("DK");

    cachedInstitutions = raw.map((inst) => ({
      id: inst.id,
      name: inst.name,
      logo: inst.logo,
    }));
    cacheTimestamp = now;

    return NextResponse.json({ institutions: cachedInstitutions, count: cachedInstitutions.length });
  } catch (error) {
    console.error("GoCardless institutions error:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente bankliste", institutions: [] },
      { status: 503 }
    );
  }
}
