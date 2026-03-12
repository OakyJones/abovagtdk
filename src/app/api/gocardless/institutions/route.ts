import { NextResponse } from "next/server";
import { getInstitutions } from "@/lib/gocardless";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const institutions = await getInstitutions("DK");
    return NextResponse.json({ institutions });
  } catch (error) {
    console.error("GoCardless institutions error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kunne ikke hente banker" },
      { status: 500 }
    );
  }
}
