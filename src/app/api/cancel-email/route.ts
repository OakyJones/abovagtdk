import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      userEmail,
      userName,
      serviceName,
      serviceId,
      subscriptionId,
      type,
      emailSubject,
      emailBody,
      toEmail,
      savingsFromDate,
      monthlyAmount,
      newPlan,
      newPrice,
    } = await req.json();

    if (!userId || !userEmail || !emailSubject || !emailBody) {
      return NextResponse.json(
        { error: "Mangler påkrævede felter" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email-service ikke konfigureret" },
        { status: 500 }
      );
    }

    // Send email via Resend with user's email as reply-to
    // If we have a toEmail (service's email), send to that
    // Otherwise send to the user as confirmation
    const recipientEmail = toEmail || userEmail;

    await resend.emails.send({
      from: `AboVagt <noreply@abovagt.dk>`,
      to: recipientEmail,
      replyTo: userEmail,
      subject: emailSubject,
      text: emailBody,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">
      ${emailBody.split("\n").map((line: string) =>
        line.trim() === ""
          ? "<br>"
          : `<p style="color:#111;font-size:15px;margin:0 0 8px;">${line}</p>`
      ).join("\n")}
    </div>
    <div style="text-align:center;margin-top:24px;color:#9ca3af;font-size:12px;">
      <p>Sendt via AboVagt · abovagt.dk</p>
    </div>
  </div>
</body>
</html>`.trim(),
    });

    // Save action to database
    const supabase = getSupabaseAdmin();

    const { data: action, error: dbError } = await supabase
      .from("actions")
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        type: type || "cancel",
        savings_from_date: savingsFromDate,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Failed to save action:", dbError);
      // Email was sent, so still return success but note the DB error
      return NextResponse.json({
        success: true,
        emailSent: true,
        actionSaved: false,
        error: "Email sendt, men kunne ikke gemme handling i database",
      });
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      actionSaved: true,
      actionId: action.id,
    });
  } catch (error) {
    console.error("Cancel email error:", error);
    return NextResponse.json(
      { error: "Kunne ikke sende opsigelsesmail" },
      { status: 500 }
    );
  }
}
