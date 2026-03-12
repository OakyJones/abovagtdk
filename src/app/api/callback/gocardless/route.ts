import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const ref = req.nextUrl.searchParams.get("ref");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error)}`, req.url)
    );
  }

  const uid = userId || ref;

  if (!uid) {
    return NextResponse.redirect(
      new URL("/dashboard?error=missing_user", req.url)
    );
  }

  // Mark user as bank connected
  try {
    const supabase = getSupabaseAdmin();
    await supabase
      .from("users")
      .update({ tink_connected: true }) // reuse existing column
      .eq("id", uid);
  } catch (e) {
    console.error("Failed to update user after GoCardless callback:", e);
  }

  const dashboardUrl = new URL("/dashboard", req.url);
  dashboardUrl.searchParams.set("connected", "true");

  return NextResponse.redirect(dashboardUrl);
}
