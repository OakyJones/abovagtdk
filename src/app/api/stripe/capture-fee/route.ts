import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || "");
  return _resend;
}

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, userId, totalSavings, completedActions, consentGivenAt } = await req.json();

    if (!paymentIntentId || !userId || !totalSavings || totalSavings <= 0) {
      return NextResponse.json(
        { error: "Mangler påkrævede felter" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "requires_capture") {
      return NextResponse.json(
        { error: "Betaling ikke klar til capture" },
        { status: 400 }
      );
    }

    // Verify this PI belongs to the user
    if (paymentIntent.metadata.abovagt_user_id !== userId) {
      return NextResponse.json(
        { error: "Betaling tilhører ikke denne bruger" },
        { status: 403 }
      );
    }

    // Flat fee: 35 kr if subscriptions found
    const feeDKK = 35;
    const feeOere = feeDKK * 100;

    if (feeOere <= 0) {
      // Cancel the reservation if no savings
      await stripe.paymentIntents.cancel(paymentIntentId);
      return NextResponse.json(
        { error: "Ingen besparelse at betale for" },
        { status: 400 }
      );
    }

    // Partial capture — only charge the actual fee, rest is released automatically
    await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: feeOere,
    });

    // Update PI metadata with actual amounts
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        ...paymentIntent.metadata,
        total_savings_dkk: String(totalSavings),
        fee_dkk: String(feeDKK),
        captured: "true",
        actions_count: String(completedActions?.length || 0),
        actions_summary: JSON.stringify(
          (completedActions || []).slice(0, 10).map((a: { type: string; serviceName: string; savings: number }) => ({
            type: a.type,
            service: a.serviceName,
            savings: a.savings,
          }))
        ),
      },
    });

    // Generate order number
    const orderNumber = `AV-${Date.now().toString(36).toUpperCase()}`;

    // Save payment record to DB
    const supabase = getSupabaseAdmin();

    const { data: actionData } = await supabase
      .from("actions")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    await supabase.from("payments").insert({
      user_id: userId,
      action_id: actionData?.id,
      amount: feeDKK,
      stripe_payment_id: paymentIntentId,
      status: "captured",
      paid_at: new Date().toISOString(),
      captured_at: new Date().toISOString(),
      consent_given_at: consentGivenAt || new Date().toISOString(),
      order_number: orderNumber,
    });

    // Send order confirmation email
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (user?.email && process.env.RESEND_API_KEY) {
      const actionsHtml = (completedActions || [])
        .map(
          (a: { type: string; serviceName: string; savings: number }) =>
            `<tr>
              <td style="padding:8px 16px;border-bottom:1px solid #eee;">${a.serviceName}</td>
              <td style="padding:8px 16px;border-bottom:1px solid #eee;text-align:center;">${a.type === "cancel" ? "Opsigelse" : "Nedgradering"}</td>
              <td style="padding:8px 16px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">-${a.savings} kr/md</td>
            </tr>`
        )
        .join("");

      const orderDate = new Date().toLocaleDateString("da-DK", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      await getResend().emails.send({
        from: "AboVagt <noreply@abovagt.dk>",
        to: user.email,
        subject: `Ordrebekræftelse ${orderNumber} — AboVagt`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:24px;font-weight:700;">
        <span style="color:#000;">Abo</span><span style="color:#1B7A6E;">Vagt</span>
      </span>
    </div>

    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;color:#111;margin:0 0 4px;">Ordrebekr&aelig;ftelse</h1>
      <p style="color:#6b7280;margin:0 0 24px;font-size:14px;">
        Ordrenummer: <strong>${orderNumber}</strong> &middot; ${orderDate}
      </p>

      <div style="background:#ecfdf5;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;border:2px solid #1B7A6E;">
        <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">Din m&aring;nedlige besparelse</p>
        <p style="font-size:32px;font-weight:700;color:#1B7A6E;margin:0;">${totalSavings} kr/md</p>
        <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">= ${totalSavings * 12} kr/&aring;r</p>
      </div>

      <h2 style="font-size:15px;color:#111;margin:0 0 12px;">Ydelsen inkluderer:</h2>
      <ul style="margin:0 0 20px;padding-left:20px;color:#374151;font-size:14px;line-height:1.7;">
        <li>Automatisk scanning af dine abonnementer via bankforbindelse</li>
        <li>Identifikation af besparelsesmuligheder</li>
        <li>F&aelig;rdige opsigelsesmails klar til afsendelse</li>
      </ul>

      <h2 style="font-size:15px;color:#111;margin:0 0 12px;">Dine handlinger:</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 16px;text-align:left;font-size:12px;color:#6b7280;">Service</th>
            <th style="padding:8px 16px;text-align:center;font-size:12px;color:#6b7280;">Handling</th>
            <th style="padding:8px 16px;text-align:right;font-size:12px;color:#6b7280;">Besparelse</th>
          </tr>
        </thead>
        <tbody>${actionsHtml}</tbody>
      </table>

      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#6b7280;font-size:14px;">Pris (engangsbetaling)</span>
          <span style="font-weight:600;color:#111;font-size:14px;">${feeDKK} kr</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#6b7280;font-size:14px;">Status</span>
          <span style="font-weight:600;color:#1B7A6E;font-size:14px;">Betalt</span>
        </div>
      </div>

      <div style="border-top:1px solid #e5e7eb;padding-top:20px;margin-bottom:20px;">
        <h2 style="font-size:15px;color:#111;margin:0 0 8px;">Fortrydelsesret</h2>
        <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.6;">
          Du har givet samtykke til at ydelsen starter med det samme. Da ydelsen (opsigelsesmails) er leveret digitalt,
          bortfalder fortrydelsesretten jf. forbrugeraftalelovens &sect; 18, stk. 2, nr. 13, n&aring;r ydelsen er fuldt leveret.
          S&aring;fremt ydelsen endnu ikke er fuldt leveret, kan du fortryde ved at kontakte os inden 14 dage.
        </p>
      </div>

      <div style="border-top:1px solid #e5e7eb;padding-top:20px;">
        <h2 style="font-size:15px;color:#111;margin:0 0 8px;">Vilk&aring;r</h2>
        <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.6;">
          Se vores fulde <a href="https://abovagt.dk/handelsbetingelser" style="color:#1B7A6E;">handelsbetingelser</a>
          og <a href="https://abovagt.dk/privatlivspolitik" style="color:#1B7A6E;">privatlivspolitik</a>.
        </p>
      </div>
    </div>

    <div style="text-align:center;margin-top:32px;color:#9ca3af;font-size:12px;line-height:1.8;">
      <p style="margin:0;">Halvfems Procent &middot; CVR 46314697</p>
      <p style="margin:0;">Kontakt: <a href="mailto:hej@abovagt.dk" style="color:#1B7A6E;">hej@abovagt.dk</a></p>
    </div>
  </div>
</body>
</html>`.trim(),
      });
    }

    return NextResponse.json({
      success: true,
      capturedAmount: feeDKK,
      totalSavings,
      orderNumber,
    });
  } catch (error) {
    console.error("Stripe capture-fee error:", error);
    return NextResponse.json(
      { error: "Kunne ikke gennemføre betaling" },
      { status: 500 }
    );
  }
}
