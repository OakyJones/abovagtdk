import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// POST: Capture a specific payment (admin or cron)
export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Mangler paymentIntentId" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    // Update payment record
    const supabase = getSupabaseAdmin();
    await supabase
      .from("payments")
      .update({
        status: "captured",
        captured_at: new Date().toISOString(),
      })
      .eq("stripe_payment_id", paymentIntentId);

    return NextResponse.json({
      success: true,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error("Stripe capture error:", error);
    return NextResponse.json(
      { error: "Kunne ikke capture betaling" },
      { status: 500 }
    );
  }
}

// GET: Cron job — capture all payments where savings_from_date has passed
export async function GET(req: NextRequest) {
  // Verify cron secret (for Vercel Cron or manual trigger)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_SESSION_TOKEN;
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const today = new Date().toISOString().split("T")[0];

    // Find payments that are authorized but not yet captured,
    // where the associated action's savings_from_date has passed
    const { data: pendingPayments, error } = await supabase
      .from("payments")
      .select("id, stripe_payment_id, action_id, actions(savings_from_date)")
      .eq("status", "authorized")
      .not("stripe_payment_id", "is", null);

    if (error) {
      console.error("Error fetching pending payments:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const stripe = getStripe();
    let captured = 0;
    let failed = 0;

    for (const payment of pendingPayments || []) {
      // Check if savings_from_date has passed
      const action = payment.actions as unknown as { savings_from_date: string } | null;
      if (!action?.savings_from_date || action.savings_from_date > today) {
        continue; // Not yet due
      }

      try {
        await stripe.paymentIntents.capture(payment.stripe_payment_id!);
        await supabase
          .from("payments")
          .update({
            status: "captured",
            captured_at: new Date().toISOString(),
          })
          .eq("id", payment.id);
        captured++;
      } catch (err) {
        console.error(`Failed to capture ${payment.stripe_payment_id}:`, err);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      checked: (pendingPayments || []).length,
      captured,
      failed,
    });
  } catch (error) {
    console.error("Cron capture error:", error);
    return NextResponse.json(
      { error: "Capture cron fejlede" },
      { status: 500 }
    );
  }
}
