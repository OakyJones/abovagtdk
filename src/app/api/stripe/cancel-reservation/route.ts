import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, userId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Mangler paymentIntentId" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verify ownership
    if (userId && paymentIntent.metadata.abovagt_user_id !== userId) {
      return NextResponse.json(
        { error: "Betaling tilhører ikke denne bruger" },
        { status: 403 }
      );
    }

    // Only cancel if still in requires_capture state
    if (paymentIntent.status === "requires_capture") {
      await stripe.paymentIntents.cancel(paymentIntentId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel reservation error:", error);
    return NextResponse.json(
      { error: "Kunne ikke annullere reservation" },
      { status: 500 }
    );
  }
}
