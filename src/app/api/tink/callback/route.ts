import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const credentialsId = req.nextUrl.searchParams.get("credentialsId");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    // Redirect to dashboard with error
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error)}`, req.url)
    );
  }

  if (!credentialsId) {
    return NextResponse.redirect(
      new URL("/dashboard?error=no_credentials", req.url)
    );
  }

  // Store the credentials ID in a cookie so the dashboard can use it
  // The actual scanning happens when the user loads the dashboard
  const response = NextResponse.redirect(
    new URL(`/dashboard?connected=true&credentialsId=${credentialsId}`, req.url)
  );

  response.cookies.set("tink_credentials_id", credentialsId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });

  return response;
}
