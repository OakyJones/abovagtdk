import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count } = await supabase
    .from("bank_connections")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthStart);

  return NextResponse.json({
    connectionsThisMonth: count || 0,
    limit: 50,
  });
}
