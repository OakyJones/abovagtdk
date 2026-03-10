import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createTinkUser, getAuthorizationCode, buildTinkLinkUrl } from "@/lib/tink";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!process.env.TINK_CLIENT_ID || !process.env.TINK_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "Tink is not configured" },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get user email for external_user_id
    const { data: user } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create Tink user (or get existing)
    try {
      const tinkUserId = await createTinkUser(user.id);
      console.log("Tink user created/found:", tinkUserId, "external_user_id:", user.id);
    } catch (createErr) {
      console.log("Tink user create note:", createErr);
      // User might already exist, continue
    }

    // Get authorization code
    const authCode = await getAuthorizationCode(user.id);
    console.log("Tink auth code obtained for user:", user.id);

    // Build Tink Link URL
    const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://abovagt.dk"}/api/tink/callback`;

    const tinkLinkUrl = buildTinkLinkUrl({
      clientId: process.env.TINK_CLIENT_ID,
      redirectUri: callbackUrl,
      authorizationCode: authCode,
    });

    return NextResponse.json({ url: tinkLinkUrl });
  } catch (error) {
    console.error("Tink link error:", error);
    return NextResponse.json(
      { error: "Failed to create Tink Link" },
      { status: 500 }
    );
  }
}
