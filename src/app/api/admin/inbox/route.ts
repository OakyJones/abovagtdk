import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data: emails, error } = await supabase
    .from("inbound_emails")
    .select("id, from_email, to_email, subject, body_html, body_text, tag, is_read, direction, received_at")
    .order("received_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const unreadCount = (emails || []).filter(
    (e) => !e.is_read && (e.direction === "inbound" || !e.direction)
  ).length;

  return NextResponse.json({ emails: emails || [], unreadCount });
}

export async function PATCH(req: NextRequest) {
  const { id, is_read } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin()
    .from("inbound_emails")
    .update({ is_read })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
