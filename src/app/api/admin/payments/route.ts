import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [
      { data: payments },
      { data: monthPayments },
    ] = await Promise.all([
      supabase
        .from("payments")
        .select("id, user_id, amount, stripe_payment_id, status, paid_at, captured_at, users(email)")
        .order("paid_at", { ascending: false })
        .limit(50),
      supabase
        .from("payments")
        .select("amount, status")
        .gte("paid_at", monthStart),
    ]);

    const totalRevenueMonth = (monthPayments || [])
      .filter((p) => p.status === "captured")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const totalAuthorizedMonth = (monthPayments || [])
      .filter((p) => p.status === "authorized")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const totalRefundedMonth = (monthPayments || [])
      .filter((p) => p.status === "refunded")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return NextResponse.json({
      payments: payments || [],
      stats: {
        totalRevenueMonth,
        totalAuthorizedMonth,
        totalRefundedMonth,
        totalPaymentsMonth: (monthPayments || []).length,
      },
    });
  } catch (error) {
    console.error("Admin payments error:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente betalinger" },
      { status: 500 }
    );
  }
}
