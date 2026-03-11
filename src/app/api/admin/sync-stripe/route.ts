import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// Sync captured Stripe PaymentIntents to the payments table
export async function POST() {
  try {
    const stripe = getStripe();
    const supabase = getSupabaseAdmin();

    // Fetch recent PaymentIntents from Stripe that have been captured
    // and belong to AboVagt (have our metadata)
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
    });

    const results: { synced: string[]; skipped: string[]; errors: string[] } = {
      synced: [],
      skipped: [],
      errors: [],
    };

    for (const pi of paymentIntents.data) {
      // Only process AboVagt payments
      if (!pi.metadata?.abovagt_user_id) {
        results.skipped.push(`${pi.id} (no abovagt metadata)`);
        continue;
      }

      // Only process succeeded/captured payments
      if (pi.status !== "succeeded") {
        results.skipped.push(`${pi.id} (status: ${pi.status})`);
        continue;
      }

      const userId = pi.metadata.abovagt_user_id;
      const feeDkk = pi.metadata.fee_dkk ? Number(pi.metadata.fee_dkk) : Math.round((pi.amount_received || 0) / 100);

      // Check if already in DB
      const { data: existing } = await supabase
        .from("payments")
        .select("id")
        .eq("stripe_payment_id", pi.id)
        .maybeSingle();

      if (existing) {
        results.skipped.push(`${pi.id} (already in DB)`);
        continue;
      }

      // Find action for this user
      const { data: actionData } = await supabase
        .from("actions")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Generate order number from PI creation time
      const orderNumber = `AV-${pi.created.toString(36).toUpperCase()}`;

      const { error: insertError } = await supabase.from("payments").insert({
        user_id: userId,
        action_id: actionData?.id || null,
        amount: feeDkk,
        stripe_payment_id: pi.id,
        status: "captured",
        paid_at: new Date(pi.created * 1000).toISOString(),
        captured_at: new Date(pi.created * 1000).toISOString(),
        consent_given_at: pi.metadata.consent_given_at || new Date(pi.created * 1000).toISOString(),
        order_number: orderNumber,
      });

      if (insertError) {
        results.errors.push(`${pi.id}: ${insertError.message}`);
      } else {
        results.synced.push(`${pi.id} (${feeDkk} kr, user: ${userId})`);
      }
    }

    return NextResponse.json({
      success: true,
      total_from_stripe: paymentIntents.data.length,
      ...results,
    });
  } catch (error) {
    console.error("Stripe sync error:", error);
    return NextResponse.json(
      { error: "Sync fejlede", detail: String(error) },
      { status: 500 }
    );
  }
}
