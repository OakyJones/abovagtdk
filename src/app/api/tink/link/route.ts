// TODO: Skift tilbage til Tink når revenue tillader (bedre branding: "Drevet af Visa")
// Pt. erstattet af /api/gocardless/link
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!process.env.TINK_CLIENT_ID) {
      return NextResponse.json(
        { error: "Tink is not configured" },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verify user exists
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build Tink Link URL without authorization_code
    // Tink Link will create a temporary user and return credentialsId + code on callback
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://abovagt.dk"}/api/tink/callback?userId=${userId}`;

    const params = new URLSearchParams({
      client_id: process.env.TINK_CLIENT_ID,
      redirect_uri: callbackUrl,
      market: "DK",
      locale: "da_DK",
    });

    const tinkLinkUrl = `https://link.tink.com/1.0/transactions/connect-accounts/?${params.toString()}`;

    return NextResponse.json({ url: tinkLinkUrl });
  } catch (error) {
    console.error("Tink link error:", error);
    return NextResponse.json(
      { error: "Failed to create Tink Link" },
      { status: 500 }
    );
  }
}
