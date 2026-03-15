import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// GET: Hent beskeder
// Tabel: admin_chat(id, sender, message, created_at, read_by_mik, mik_action_taken, mik_action_result)
export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data: messages, error } = await supabase
    .from("admin_chat")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Tæl ulæste fra Mik (beskeder hvor sender='mik' som Jonas ikke har set)
  // Vi bruger read_by_mik til at spore om Mik har læst Jonas' beskeder
  // For Jonas' ulæste fra Mik: vi har ikke en read_by_jonas kolonne,
  // så vi tracker det client-side via polling
  const unreadFromMik = (messages || []).filter(
    (m) => m.sender === "mik" && !m.read_by_mik
  ).length;

  return NextResponse.json({
    messages: messages || [],
    unreadCount: unreadFromMik,
  });
}

// POST: Send besked som Jonas
export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("admin_chat")
    .insert({
      sender: "jonas",
      message: message.trim(),
      read_by_mik: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
