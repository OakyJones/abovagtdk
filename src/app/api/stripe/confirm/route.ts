import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, userId, completedActions, totalSavings } = await req.json();

    if (!paymentIntentId || !userId) {
      return NextResponse.json(
        { error: "Mangler påkrævede felter" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "requires_capture") {
      return NextResponse.json(
        { error: "Betaling ikke gennemført" },
        { status: 400 }
      );
    }

    const feeDKK = paymentIntent.amount / 100;
    const supabase = getSupabaseAdmin();

    // Get first action for the user to link payment
    const { data: actionData } = await supabase
      .from("actions")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Save payment record
    await supabase.from("payments").insert({
      user_id: userId,
      action_id: actionData?.id,
      amount: feeDKK,
      stripe_payment_id: paymentIntentId,
      status: "authorized",
      paid_at: new Date().toISOString(),
    });

    // Get user email for receipt
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    // Send receipt email
    if (user?.email && process.env.RESEND_API_KEY) {
      const actionsHtml = (completedActions || [])
        .map(
          (a: { type: string; serviceName: string; savings: number }) =>
            `<tr>
              <td style="padding:8px 16px;border-bottom:1px solid #eee;">${a.serviceName}</td>
              <td style="padding:8px 16px;border-bottom:1px solid #eee;text-align:center;">${a.type === "cancel" ? "Opsagt" : "Nedgraderet"}</td>
              <td style="padding:8px 16px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">-${a.savings} kr/md</td>
            </tr>`
        )
        .join("");

      await resend.emails.send({
        from: "AboVagt <noreply@abovagt.dk>",
        to: user.email,
        subject: `Kvittering — du sparer nu ${totalSavings} kr/md`,
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
      <h1 style="font-size:24px;color:#111;margin:0 0 8px;">Tak for din betaling!</h1>
      <p style="color:#6b7280;margin:0 0 24px;font-size:15px;">
        Her er din kvittering for AboVagt opsigelsesservice.
      </p>

      <div style="background:#ecfdf5;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;border:2px solid #1B7A6E;">
        <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">Din månedlige besparelse</p>
        <p style="font-size:32px;font-weight:700;color:#1B7A6E;margin:0;">${totalSavings} kr/md</p>
        <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">= ${totalSavings * 12} kr/år</p>
      </div>

      <h2 style="font-size:16px;color:#111;margin:0 0 12px;">Dine handlinger:</h2>
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

      <div style="background:#f9fafb;border-radius:12px;padding:16px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#6b7280;font-size:14px;">Betalt</span>
          <span style="font-weight:600;color:#111;font-size:14px;">${feeDKK} kr (én gang)</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#6b7280;font-size:14px;">Status</span>
          <span style="font-weight:600;color:#1B7A6E;font-size:14px;">Reserveret — trækkes ved bekræftet besparelse</span>
        </div>
      </div>

      <p style="color:#9ca3af;font-size:13px;margin:0;">
        Beløbet er reserveret på dit kort og trækkes først når din besparelse er bekræftet.
        Hvis opsigelsen ikke gennemføres, refunderer vi automatisk.
      </p>

      <div style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:20px;">
        <h2 style="font-size:15px;color:#111;margin:0 0 8px;">Fortrydelsesret</h2>
        <p style="color:#6b7280;font-size:13px;margin:0;line-height:1.6;">
          Du har givet samtykke til at ydelsen startede med det samme.
          Din fortrydelsesret er bortfaldet ved levering af ydelsen, jf. forbrugeraftalelovens &sect; 18, stk. 2.
        </p>
      </div>

      <div style="border-top:1px solid #e5e7eb;padding-top:20px;margin-top:20px;">
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
      amount: feeDKK,
      status: "authorized",
    });
  } catch (error) {
    console.error("Payment confirm error:", error);
    return NextResponse.json(
      { error: "Kunne ikke bekræfte betaling" },
      { status: 500 }
    );
  }
}
