import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count, error } = await supabase
    .from("bank_connections")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthStart);

  // Gracefully handle missing table (migration 013 may not have been run)
  const connectionsThisMonth = error ? 0 : (count || 0);

  return NextResponse.json({
    connectionsThisMonth,
    limit: 50,
  });
}
