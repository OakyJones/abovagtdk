import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ hasPaid: false });
  }

  if (process.env.SKIP_PAYMENT === "true") {
    return NextResponse.json({ hasPaid: true });
  }

  const supabase = getSupabaseAdmin();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, status")
    .eq("user_id", userId)
    .in("status", ["authorized", "captured"])
    .order("paid_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ hasPaid: !!payment });
}
