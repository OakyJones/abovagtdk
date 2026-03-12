import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const credentialsId = req.nextUrl.searchParams.get("credentialsId");
  const code = req.nextUrl.searchParams.get("code");
  const userId = req.nextUrl.searchParams.get("userId");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error)}`, req.url)
    );
  }

  if (!credentialsId) {
    return NextResponse.redirect(
      new URL("/dashboard?error=no_credentials", req.url)
    );
  }

  // Save the Tink code and credentialsId for later use (scanning)
  if (userId && code) {
    try {
      const supabase = getSupabaseAdmin();
      // Store Tink connection info on the user
      await supabase
        .from("users")
        .update({
          tink_code: code,
          tink_credentials_id: credentialsId,
        })
        .eq("id", userId);

      // Track bank connection for monthly quota monitoring
      await supabase
        .from("bank_connections")
        .insert({ user_id: userId, provider: "tink" });
    } catch (e) {
      console.error("Failed to save Tink data:", e);
      // Continue anyway — we pass credentialsId via URL
    }
  }

  const dashboardUrl = new URL("/dashboard", req.url);
  dashboardUrl.searchParams.set("connected", "true");
  dashboardUrl.searchParams.set("credentialsId", credentialsId);
  if (code) dashboardUrl.searchParams.set("code", code);

  const response = NextResponse.redirect(dashboardUrl);

  response.cookies.set("tink_credentials_id", credentialsId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });

  return response;
}
