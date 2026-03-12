// TODO: Skift til live Stripe credentials ved lancering
// Test kort: 4242 4242 4242 4242, 12/26, 123

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MAX_FEE_DKK = 35;
const MAX_FEE_OERE = MAX_FEE_DKK * 100;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Mangler userId" },
        { status: 400 }
      );
    }

    // Look up user
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

      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    // Always reserve 35 kr — captured if we find subscriptions, otherwise cancelled
    const paymentIntent = await stripe.paymentIntents.create({
      amount: MAX_FEE_OERE,
      currency: "dkk",
      customer: customerId,
      capture_method: "manual",
      metadata: {
        abovagt_user_id: userId,
        reservation_amount_dkk: String(MAX_FEE_DKK),
      },
      description: `AboVagt — reservation op til ${MAX_FEE_DKK} kr`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      reservedAmount: MAX_FEE_DKK,
    });
  } catch (error: unknown) {
    const err = error as { type?: string; message?: string; code?: string; statusCode?: number };
    console.error("Stripe PaymentIntent error:", {
      type: err.type,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
    });
    return NextResponse.json(
      {
        error: "Kunne ikke oprette betaling",
        detail: err.message || "Ukendt fejl",
      },
      { status: 500 }
    );
  }
}
