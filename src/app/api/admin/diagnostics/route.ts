import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const tables = [
    "users",
    "quiz_results",
    "inbound_emails",
    "actions",
    "payments",
    "drip_emails",
  ];

  const results: Record<string, { count: number | null; error: string | null; sample: unknown }> = {};

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    // Get one sample row
    const { data: sample, error: sampleErr } = await supabase
      .from(table)
      .select("*")
      .order("created_at" in {} ? "created_at" : "id", { ascending: false })
      .limit(1)
      .maybeSingle();

    results[table] = {
      count: count ?? null,
      error: error?.message || sampleErr?.message || null,
      sample: sample ? Object.keys(sample) : null,
    };
  }

  // Specific checks
  const { data: inboundSample, error: inboundErr } = await supabase
    .from("inbound_emails")
    .select("id, from_email, to_email, subject, direction, is_read, received_at, tag")
    .order("received_at", { ascending: false })
    .limit(10);

  const { count: inboundTotal, error: inboundCountErr } = await supabase
    .from("inbound_emails")
    .select("*", { count: "exact", head: true });

  const { data: recentUsers } = await supabase
    .from("users")
    .select("id, email, tink_connected, newsletter_consent, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Check email_attachments
  const { count: attachmentCount } = await supabase
    .from("email_attachments")
    .select("*", { count: "exact", head: true });

  // RLS check: try raw SQL to see if RLS is enabled
  const { data: rlsCheck } = await supabase.rpc("check_rls_status").maybeSingle();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    tableCounts: results,
    inboundEmails: {
      total: inboundTotal ?? 0,
      countError: inboundCountErr?.message || null,
      queryError: inboundErr?.message || null,
      recent: inboundSample || [],
    },
    attachments: { count: attachmentCount ?? 0 },
    recentUsers: recentUsers || [],
    rlsCheck: rlsCheck || "rpc not available — check manually",
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + "...",
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasWebhookSecret: !!process.env.RESEND_WEBHOOK_SECRET,
    },
  });
}

// Simulate inbound webhook for testing
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();

  const { action } = await req.json();

  if (action === "simulate-inbound") {
    const { data, error } = await supabase
      .from("inbound_emails")
      .insert({
        from_email: "test@example.com",
        to_email: "hej@abovagt.dk",
        subject: "[TEST] Simuleret inbound email — " + new Date().toLocaleString("da-DK"),
        body_text: "Dette er en test-email simuleret fra admin-panelet for at verificere at inbound emails vises korrekt.",
        body_html: "<p>Dette er en <strong>test-email</strong> simuleret fra admin-panelet for at verificere at inbound emails vises korrekt.</p>",
        tag: "general",
        is_read: false,
        direction: "inbound",
        received_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        hint: error.hint || null,
        details: error.details || null,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
      message: "Test-email indsat i inbound_emails",
    });
  }

  return NextResponse.json({ error: "Ukendt action" }, { status: 400 });
}
