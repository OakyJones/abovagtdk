import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
  }
  return _supabase;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const quizResultId = Buffer.from(token, "base64url").toString("utf-8");

    if (!quizResultId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const { error } = await getSupabase()
      .from("quiz_results")
      .update({
        newsletter_consent: false,
        newsletter_consent_at: null,
      })
      .eq("id", quizResultId);

    if (error) {
      console.error("Unsubscribe error:", error);
      return NextResponse.json({ error: "Could not unsubscribe" }, { status: 500 });
    }

    // Also update user's newsletter_consent if we can find them
    const { data: quizResult } = await getSupabase()
      .from("quiz_results")
      .select("user_id")
      .eq("id", quizResultId)
      .maybeSingle();

    if (quizResult?.user_id) {
      await getSupabase()
        .from("users")
        .update({ newsletter_consent: false })
        .eq("id", quizResult.user_id);
    }

    // Redirect to confirmation page
    return NextResponse.redirect(new URL("/afmeld?success=true", req.url));
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }
}
