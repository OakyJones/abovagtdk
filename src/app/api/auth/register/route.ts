import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, newsletterConsent, signupPath } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Check if user already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      // Update consent on re-visit
      const updateFields: Record<string, unknown> = {
        newsletter_consent: newsletterConsent ?? false,
      };
      // Try adding signup_path (column may not exist yet)
      if (signupPath) updateFields.signup_path = signupPath;

      await supabase
        .from("users")
        .update(updateFields)
        .eq("id", existing.id);

      return NextResponse.json({ userId: existing.id, isNew: false });
    }

    // Create new user — try with signup_path, fall back without
    const insertFields: Record<string, unknown> = {
      email,
      newsletter_consent: newsletterConsent ?? false,
    };
    if (signupPath) insertFields.signup_path = signupPath;

    let result = await supabase
      .from("users")
      .insert(insertFields)
      .select("id")
      .single();

    if (result.error && signupPath) {
      // signup_path column might not exist yet
      result = await supabase
        .from("users")
        .insert({ email, newsletter_consent: newsletterConsent ?? false })
        .select("id")
        .single();
    }

    if (result.error || !result.data) {
      console.error("User insert error:", result.error);
      return NextResponse.json(
        { error: result.error?.message || "Could not create user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ userId: result.data.id, isNew: true });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
