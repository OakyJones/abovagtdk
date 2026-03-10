import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, totalSavings, completedActions } = await req.json();

    if (!userId || !totalSavings || totalSavings <= 0) {
      return NextResponse.json(
        { error: "Mangler påkrævede felter" },
        { status: 400 }
      );
    }

    // Calculate fee: 25% of savings, max 149 kr, in øre (smallest currency unit)
    const feeDKK = Math.min(Math.round(totalSavings * 0.25), 149);
    const feeOere = feeDKK * 100;

    if (feeOere <= 0) {
      return NextResponse.json(
        { error: "Ingen betaling nødvendig" },
        { status: 400 }
      );
    }

    // Look up user email
    const supabase = getSupabaseAdmin();
    const { data: user } = await supabase
      .from("users")
      .select("email, stripe_customer_id")
      .eq("id", userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: "Bruger ikke fundet" },
        { status: 404 }
      );
    }

    const stripe = getStripe();

    // Create or reuse Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { abovagt_user_id: userId },
      });
      customerId = customer.id;

      // Save customer ID
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    // Create PaymentIntent with manual capture (delayed capture)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: feeOere,
      currency: "dkk",
      customer: customerId,
      capture_method: "manual", // Delayed capture
      metadata: {
        abovagt_user_id: userId,
        total_savings_dkk: String(totalSavings),
        fee_dkk: String(feeDKK),
        actions_count: String(completedActions?.length || 0),
        actions_summary: JSON.stringify(
          (completedActions || []).slice(0, 10).map((a: { type: string; serviceName: string; savings: number }) => ({
            type: a.type,
            service: a.serviceName,
            savings: a.savings,
          }))
        ),
      },
      description: `AboVagt opsigelsesgebyr — ${feeDKK} kr (besparelse: ${totalSavings} kr/md)`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: feeDKK,
    });
  } catch (error) {
    console.error("Stripe PaymentIntent error:", error);
    return NextResponse.json(
      { error: "Kunne ikke oprette betaling" },
      { status: 500 }
    );
  }
}
