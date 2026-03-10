import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body, replyToMessageId } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "Missing to, subject, or body" },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY || "");

    // Send via Resend
    const { error: sendError } = await resend.emails.send({
      from: "AboVagt <hej@abovagt.dk>",
      to,
      subject,
      html: body,
      ...(replyToMessageId ? { headers: { "In-Reply-To": replyToMessageId } } : {}),
    });

    if (sendError) {
      console.error("Failed to send email:", sendError);
      return NextResponse.json(
        { error: sendError.message },
        { status: 500 }
      );
    }

    // Save to inbound_emails as outbound
    const supabase = getSupabaseAdmin();
    await supabase.from("inbound_emails").insert({
      from_email: "hej@abovagt.dk",
      to_email: to,
      subject,
      body_html: body,
      body_text: null,
      tag: "outbound",
      is_read: true,
      direction: "outbound",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
