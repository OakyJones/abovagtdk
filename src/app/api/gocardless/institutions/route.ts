import { NextResponse } from "next/server";

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

async function fetchInstitutions(): Promise<Institution[]> {
  const now = Date.now();
  if (cachedInstitutions && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedInstitutions;
  }

  const secretId = process.env.GOCARDLESS_SECRET_ID;
  const secretKey = process.env.GOCARDLESS_SECRET_KEY;

  if (!secretId || !secretKey) {
    throw new Error("GoCardless credentials not configured");
  }

  // Step 1: Get access token
  const tokenRes = await fetch(
    "https://bankaccountdata.gocardless.com/api/v2/token/new/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret_id: secretId,
        secret_key: secretKey,
      }),
    }
  );

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`GoCardless token error: ${tokenRes.status} ${err}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access;

  // Step 2: Fetch Danish institutions
  const instRes = await fetch(
    "https://bankaccountdata.gocardless.com/api/v2/institutions/?country=dk",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!instRes.ok) {
    const err = await instRes.text();
    throw new Error(`GoCardless institutions error: ${instRes.status} ${err}`);
  }

  const institutions: { id: string; name: string; logo: string }[] =
    await instRes.json();

  // Map to slim format
  cachedInstitutions = institutions.map((inst) => ({
    id: inst.id,
    name: inst.name,
    logo: inst.logo,
  }));
  cacheTimestamp = now;

  return cachedInstitutions;
}

export async function GET() {
  try {
    const institutions = await fetchInstitutions();
    return NextResponse.json({ institutions, count: institutions.length });
  } catch (error) {
    console.error("GoCardless institutions error:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente bankliste", institutions: [] },
      { status: 503 }
    );
  }
}
