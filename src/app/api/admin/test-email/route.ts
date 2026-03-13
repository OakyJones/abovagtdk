import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateCancelEmail, generateDowngradeEmail } from "@/lib/cancel-templates";

export const dynamic = "force-dynamic";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || "");
  return _resend;
}

type EmailType =
  | "quiz-result"
  | "cancel-preview"
  | "downgrade-preview"
  | "winback-day3"
  | "welcome";

function buildQuizResultHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:28px;font-weight:700;">
        <span style="color:#000;">Abo</span><span style="color:#1B7A6E;">Vagt</span>
      </span>
    </div>
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;color:#111;margin:0 0 8px;">Dit abonnements-tjek</h1>
      <p style="color:#6b7280;margin:0 0 24px;font-size:15px;">Du har 6 abonnementer. Her er dit overblik.</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="width:33%;padding:12px;text-align:center;background:#f9fafb;border-radius:12px;">
            <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">M&aring;nedligt forbrug</p>
            <p style="font-size:22px;font-weight:700;color:#111;margin:0;">847 kr/md</p>
          </td>
          <td style="width:8px;"></td>
          <td style="width:33%;padding:12px;text-align:center;background:#f9fafb;border-radius:12px;">
            <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">&Aring;rligt forbrug</p>
            <p style="font-size:22px;font-weight:700;color:#111;margin:0;">10.164 kr/&aring;r</p>
          </td>
          <td style="width:8px;"></td>
          <td style="width:33%;padding:12px;text-align:center;background:#ecfdf5;border-radius:12px;border:2px solid #1B7A6E;">
            <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Mulig besparelse</p>
            <p style="font-size:22px;font-weight:700;color:#1B7A6E;margin:0;">298 kr/md</p>
          </td>
        </tr>
      </table>

      <h2 style="font-size:16px;color:#111;margin:0 0 4px;">Abonnementer du bruger sj&aelig;ldent eller aldrig</h2>
      <p style="font-size:13px;color:#6b7280;margin:0 0 12px;">Estimeret besparelse: 298 kr/md</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#fef2f2;border-radius:12px;overflow:hidden;">
        <tr style="background:#fde8e8;">
          <td style="padding:8px 16px;font-size:12px;font-weight:600;color:#991b1b;">Abonnement</td>
          <td style="padding:8px 16px;font-size:12px;font-weight:600;color:#991b1b;text-align:right;">Pris</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;">
            <span style="font-weight:600;color:#111;">HBO Max</span>
            <br><span style="font-size:12px;color:#9ca3af;">Brugt: Aldrig</span>
          </td>
          <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;text-align:right;">
            <span style="font-weight:700;color:#dc2626;">149 kr/md</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;">
            <span style="font-weight:600;color:#111;">Viaplay</span>
            <br><span style="font-size:12px;color:#9ca3af;">Brugt: Sj&aelig;ldent</span>
          </td>
          <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;text-align:right;">
            <span style="font-weight:700;color:#dc2626;">149 kr/md</span>
          </td>
        </tr>
      </table>

      <div style="background:#1C2B2A;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Din mulige besparelse</p>
        <p style="font-size:32px;font-weight:700;color:#4ECDC4;margin:0;">298 kr/md</p>
      </div>

      <div style="text-align:center;margin-top:24px;">
        <a href="https://abovagt.dk" style="display:inline-block;padding:16px 36px;background:#1B7A6E;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
          Vil du spare tid? Lad os hj&aelig;lpe dig &rarr;
        </a>
      </div>
    </div>

    <div style="text-align:center;margin-top:32px;color:#9ca3af;font-size:12px;">
      <p style="margin:0 0 4px;">Du modtager denne email fordi du tog AboVagt quiz.</p>
      <p style="margin:0;">[TEST EMAIL]</p>
    </div>
  </div>
</body>
</html>`.trim();
}

function buildCancelPreviewHtml(): string {
  const { subject: emailSubject, body: emailBody } = generateCancelEmail(
    "netflix",
    "Netflix",
    "Test Bruger"
  );
  const bodyHtml = emailBody
    .split("\n")
    .map((line: string) =>
      line.trim() === ""
        ? "<br>"
        : `<p style="color:#111;font-size:15px;margin:0 0 8px;">${line}</p>`
    )
    .join("\n");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">
      <p style="color:#6b7280;font-size:12px;margin:0 0 16px;">[TEST] Emne: ${emailSubject}</p>
      ${bodyHtml}
    </div>
    <div style="text-align:center;margin-top:24px;color:#9ca3af;font-size:12px;">
      <p>Sendt via AboVagt &middot; abovagt.dk &middot; [TEST EMAIL]</p>
    </div>
  </div>
</body>
</html>`.trim();
}

function buildDowngradePreviewHtml(): string {
  const result = generateDowngradeEmail(
    "spotify",
    "Spotify",
    "Test Bruger",
    "Premium",
    "Free",
    0
  );
  const emailBody = result?.body || "Ingen nedgraderingsmail tilgængelig for denne service.";
  const emailSubject = result?.subject || "Nedgradering";
  const bodyHtml = emailBody
    .split("\n")
    .map((line: string) =>
      line.trim() === ""
        ? "<br>"
        : `<p style="color:#111;font-size:15px;margin:0 0 8px;">${line}</p>`
    )
    .join("\n");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">
      <p style="color:#6b7280;font-size:12px;margin:0 0 16px;">[TEST] Emne: ${emailSubject}</p>
      ${bodyHtml}
    </div>
    <div style="text-align:center;margin-top:24px;color:#9ca3af;font-size:12px;">
      <p>Sendt via AboVagt &middot; abovagt.dk &middot; [TEST EMAIL]</p>
    </div>
  </div>
</body>
</html>`.trim();
}

function buildWinbackDay3Html(recipientEmail: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:28px;font-weight:700;">
        <span style="color:#000;">Abo</span><span style="color:#1B7A6E;">Vagt</span>
      </span>
    </div>
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;color:#111;margin:0 0 8px;">Har du handlet p&aring; dine resultater?</h1>
      <p style="color:#6b7280;margin:0 0 24px;font-size:15px;">
        For 3 dage siden tog du AboVagt-quizzen og fandt besparelsesmuligheder.
      </p>

      <div style="background:#ecfdf5;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;border:2px solid #1B7A6E;">
        <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">Din estimerede besparelse</p>
        <p style="font-size:32px;font-weight:700;color:#1B7A6E;margin:0;">298 kr/md</p>
        <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">= 3.576 kr/&aring;r</p>
      </div>

      <p style="color:#374151;font-size:15px;margin:0 0 16px;">
        Det tager kun 2 minutter at forbinde din bank &mdash; s&aring; finder vi pr&aelig;cis hvad du kan spare, og laver f&aelig;rdige opsigelsesmails.
      </p>

      <div style="text-align:center;margin-top:24px;">
        <a href="https://abovagt.dk/connect"
           style="display:inline-block;padding:16px 36px;background:#1B7A6E;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
          Find mine abonnementer &rarr;
        </a>
      </div>

      <p style="color:#9ca3af;font-size:13px;text-align:center;margin:16px 0 0;">
        35 kr hvis vi finder abonnementer &mdash; ellers gratis
      </p>
    </div>

    <div style="text-align:center;margin-top:32px;color:#9ca3af;font-size:12px;">
      <p style="margin:0 0 4px;">Win-back dag 3 &middot; Sendt til ${recipientEmail}</p>
      <p style="margin:0;">[TEST EMAIL]</p>
    </div>
  </div>
</body>
</html>`.trim();
}

function buildWelcomeHtml(recipientEmail: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:28px;font-weight:700;">
        <span style="color:#000;">Abo</span><span style="color:#1B7A6E;">Vagt</span>
      </span>
    </div>
    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">
      <h1 style="font-size:22px;color:#111;margin:0 0 8px;">Velkommen til AboVagt!</h1>
      <p style="color:#6b7280;margin:0 0 24px;font-size:15px;">
        Tak fordi du oprettede en konto. Vi er klar til at hj&aelig;lpe dig med at f&aring; styr p&aring; dine abonnementer.
      </p>

      <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
        <h2 style="font-size:16px;color:#111;margin:0 0 12px;">S&aring;dan kommer du i gang:</h2>
        <table style="width:100%;">
          <tr>
            <td style="padding:8px 0;vertical-align:top;">
              <span style="display:inline-block;width:24px;height:24px;background:#1B7A6E;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;">1</span>
            </td>
            <td style="padding:8px 0 8px 12px;color:#374151;font-size:14px;">Forbind din bank via sikker open banking (kun l&aelig;seadgang)</td>
          </tr>
          <tr>
            <td style="padding:8px 0;vertical-align:top;">
              <span style="display:inline-block;width:24px;height:24px;background:#1B7A6E;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;">2</span>
            </td>
            <td style="padding:8px 0 8px 12px;color:#374151;font-size:14px;">Vi finder automatisk alle dine abonnementer</td>
          </tr>
          <tr>
            <td style="padding:8px 0;vertical-align:top;">
              <span style="display:inline-block;width:24px;height:24px;background:#1B7A6E;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;">3</span>
            </td>
            <td style="padding:8px 0 8px 12px;color:#374151;font-size:14px;">V&aelig;lg hvad du vil opsige &mdash; vi laver f&aelig;rdige mails</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin-top:24px;">
        <a href="https://abovagt.dk/dashboard"
           style="display:inline-block;padding:16px 36px;background:#1B7A6E;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
          G&aring; til dit dashboard &rarr;
        </a>
      </div>
    </div>

    <div style="text-align:center;margin-top:32px;color:#9ca3af;font-size:12px;">
      <p style="margin:0 0 4px;">Velkommen-email &middot; Sendt til ${recipientEmail}</p>
      <p style="margin:0;">[TEST EMAIL]</p>
    </div>
  </div>
</body>
</html>`.trim();
}

const emailTypeLabels: Record<EmailType, string> = {
  "quiz-result": "Quiz resultat-email",
  "cancel-preview": "Opsigelsesmail (preview)",
  "downgrade-preview": "Nedgraderingsmail (preview)",
  "winback-day3": "Win-back drip (dag 3)",
  welcome: "Velkommen/bekræftelse",
};

export async function POST(req: NextRequest) {
  try {
    const { to, emailType } = (await req.json()) as {
      to: string;
      emailType: EmailType;
    };

    if (!to || !emailType) {
      return NextResponse.json(
        { error: "Mangler modtager eller email-type" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY ikke konfigureret" },
        { status: 500 }
      );
    }

    const label = emailTypeLabels[emailType] || emailType;
    let html: string;
    let subject: string;

    switch (emailType) {
      case "quiz-result":
        html = buildQuizResultHtml();
        subject = `[TEST] Dit abonnements-tjek fra AboVagt`;
        break;
      case "cancel-preview":
        html = buildCancelPreviewHtml();
        subject = `[TEST] Opsigelsesmail — Netflix`;
        break;
      case "downgrade-preview":
        html = buildDowngradePreviewHtml();
        subject = `[TEST] Nedgraderingsmail — Spotify`;
        break;
      case "winback-day3":
        html = buildWinbackDay3Html(to);
        subject = `[TEST] Har du handlet på dine resultater?`;
        break;
      case "welcome":
        html = buildWelcomeHtml(to);
        subject = `[TEST] Velkommen til AboVagt!`;
        break;
      default:
        return NextResponse.json(
          { error: `Ukendt email-type: ${emailType}` },
          { status: 400 }
        );
    }

    const { data, error: sendError } = await getResend().emails.send({
      from: "AboVagt <tjek@abovagt.dk>",
      to,
      subject,
      html,
      tags: [{ name: "type", value: `test-${emailType}` }],
    });

    if (sendError) {
      return NextResponse.json(
        {
          error: sendError.message,
          type: label,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id || null,
      type: label,
      to,
      subject,
    });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { error: "Kunne ikke sende test-email" },
      { status: 500 }
    );
  }
}
