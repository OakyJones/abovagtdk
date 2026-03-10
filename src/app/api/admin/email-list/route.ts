import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const segment = req.nextUrl.searchParams.get("segment") || "all";
  const newsletterOnly =
    req.nextUrl.searchParams.get("newsletter") === "true";

  // Get all users who have quiz results, joined with their latest quiz result
  const { data: users, error } = await supabase
    .from("users")
    .select(
      "id, email, created_at, newsletter_consent, contact_status, quiz_completed"
    )
    .eq("quiz_completed", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!users || users.length === 0) {
    return NextResponse.json({ users: [], stats: { total: 0, newsletter: 0, highSavings: 0 } });
  }

  // Get quiz results for all these users
  const userIds = users.map((u) => u.id);
  const { data: quizResults } = await supabase
    .from("quiz_results")
    .select(
      "user_id, email, estimated_monthly_cost, estimated_savings, selected_services, created_at"
    )
    .in("user_id", userIds)
    .order("created_at", { ascending: false });

  // Build a map: user_id -> latest quiz result
  const quizMap: Record<string, typeof quizResults extends (infer T)[] | null ? T : never> = {};
  for (const qr of quizResults || []) {
    if (qr.user_id && !quizMap[qr.user_id]) {
      quizMap[qr.user_id] = qr;
    }
  }

  // Merge users with quiz data
  let enriched = users.map((u) => {
    const qr = quizMap[u.id];
    const monthlySavings = qr
      ? Math.round(qr.estimated_savings / 12)
      : 0;
    const serviceCount = qr
      ? (qr.selected_services as string[])?.length || 0
      : 0;
    return {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      newsletter_consent: u.newsletter_consent,
      contact_status: u.contact_status || "none",
      quiz_date: qr?.created_at || u.created_at,
      monthly_savings: monthlySavings,
      monthly_cost: qr?.estimated_monthly_cost || 0,
      service_count: serviceCount,
    };
  });

  // Filter by newsletter consent if requested
  if (newsletterOnly) {
    enriched = enriched.filter((u) => u.newsletter_consent);
  }

  // Stats before segment filter
  const stats = {
    total: enriched.length,
    newsletter: enriched.filter((u) => u.newsletter_consent).length,
    highSavings: enriched.filter((u) => u.monthly_savings > 300).length,
  };

  // Apply segment filter
  if (segment === "high-savings") {
    enriched = enriched.filter((u) => u.monthly_savings > 300);
  }

  return NextResponse.json({ users: enriched, stats });
}

export async function PATCH(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const { userId, contact_status } = await req.json();

  if (!userId || !["none", "contacted", "converted"].includes(contact_status)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .update({ contact_status })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
