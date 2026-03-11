import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Webhook } from "svix";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getTag(toEmail: string): string {
  const addr = toEmail.toLowerCase().trim();
  if (addr.startsWith("support@")) return "support";
  if (addr.startsWith("info@")) return "general";
  if (addr.startsWith("hej@")) return "general";
  return "other";
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Verify Svix webhook signature if secret is configured
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    if (secret) {
      const svixId = req.headers.get("svix-id");
      const svixTimestamp = req.headers.get("svix-timestamp");
      const svixSignature = req.headers.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: "Missing svix headers" }, { status: 401 });
      }

      const wh = new Webhook(secret);
      try {
        wh.verify(rawBody, {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        });
      } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);

    // Resend sends different event types
    const eventType = body.type;

    // Only process inbound email events
    if (eventType !== "email.received") {
      return NextResponse.json({ received: true });
    }

    const data = body.data;
    const fromEmail = data.from || data.envelope?.from || "";
    const toEmail = data.to?.[0] || data.envelope?.to?.[0] || "";
    const subject = data.subject || "(Intet emne)";
    const bodyHtml = data.html || null;
    const bodyText = data.text || null;
    const tag = getTag(toEmail);

    const supabase = getSupabase();

    // Insert email
    const { data: inserted, error } = await supabase
      .from("inbound_emails")
      .insert({
        from_email: fromEmail,
        to_email: toEmail,
        subject,
        body_html: bodyHtml,
        body_text: bodyText,
        tag,
        is_read: false,
        direction: "inbound",
        received_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to save inbound email:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    // Save attachments if any
    if (data.attachments && Array.isArray(data.attachments) && inserted) {
      const attachments = data.attachments.map(
        (att: { filename?: string; content_type?: string }) => ({
          email_id: inserted.id,
          filename: att.filename || "unknown",
          content_type: att.content_type || "application/octet-stream",
          storage_path: null,
        })
      );

      if (attachments.length > 0) {
        await supabase.from("email_attachments").insert(attachments);
      }
    }

    return NextResponse.json({ received: true, id: inserted?.id });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
