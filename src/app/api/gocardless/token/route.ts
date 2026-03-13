import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/gocardless";

export const dynamic = "force-dynamic";

/** Health-check / debug endpoint — returns token status (not the actual token) */
export async function GET() {
  try {
    const token = await getAccessToken();
    return NextResponse.json({
      ok: true,
      tokenLength: token.length,
      message: "GoCardless token hentet succesfuldt",
    });
  } catch (error) {
    console.error("GoCardless token error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Token fejl" },
      { status: 500 }
    );
  }
}

/** POST — get fresh access token (for internal use) */
export async function POST() {
  try {
    const token = await getAccessToken();
    return NextResponse.json({ access: token });
  } catch (error) {
    console.error("GoCardless token error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Token fejl" },
      { status: 500 }
    );
  }
}
