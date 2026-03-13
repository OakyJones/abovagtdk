import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || "");
  return _resend;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface WastedService {
  name: string;
  price: number;
  frequency: string;
}

interface DowngradeSuggestion {
  name: string;
  fromLabel: string;
  toLabel: string;
  savingsPerMonth: number;
}

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      userId,
      quizResultId,
      totalServices,
      totalMonthly,
      totalYearly,
      yearlySavings,
      wastedServices,
      downgradeSuggestions,
    }: {
      email: string;
      userId: string | null;
      quizResultId: string;
      totalServices: number;
      totalMonthly: number;
      totalYearly: number;
      yearlySavings: number;
      wastedServices: WastedService[];
      downgradeSuggestions: DowngradeSuggestion[];
    } = await req.json();

    if (!email || !process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Missing email or API key" },
        { status: 400 }
      );
    }

    const hasWaste = wastedServices.length > 0;
    const hasDowngrades = downgradeSuggestions.length > 0;

    const wastedListHtml = wastedServices
      .map(
        (s) =>
          `<tr>
            <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;">
              <span style="font-weight:600;color:#111;">${s.name}</span>
              <br><span style="font-size:12px;color:#9ca3af;">Brugt: ${s.frequency}</span>
            </td>
            <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;text-align:right;">
              <span style="font-weight:700;color:#dc2626;">${s.price} kr/md</span>
            </td>
          </tr>`
      )
      .join("");

    const downgradeListHtml = downgradeSuggestions
      .map(
        (d) =>
          `<tr>
            <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;">
              <span style="font-weight:600;color:#111;">${d.name}</span>
              <br><span style="font-size:12px;color:#6b7280;">${d.fromLabel} → ${d.toLabel}</span>
            </td>
            <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;text-align:right;">
              <span style="font-weight:700;color:#1B7A6E;">Spar ${d.savingsPerMonth} kr/md</span>
            </td>
          </tr>`
      )
      .join("");

    const wastedMonthly = wastedServices.reduce((sum, s) => sum + s.price, 0);
    const downgradeMonthly = downgradeSuggestions.reduce(
      (sum, d) => sum + d.savingsPerMonth,
      0
    );
    const totalSavingsMonthly = wastedMonthly + downgradeMonthly;

    await getResend().emails.send({
      from: "AboVagt <tjek@abovagt.dk>",
      to: email,
      subject: "Dit abonnements-tjek fra AboVagt",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:28px;font-weight:700;">
        <span style="color:#000;">Abo</span><span style="color:#1B7A6E;">Vagt</span>
      </span>
    </div>

    <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">

      <!-- Heading -->
      <h1 style="font-size:22px;color:#111;margin:0 0 8px;">
        Dit abonnements-tjek
      </h1>
      <p style="color:#6b7280;margin:0 0 24px;font-size:15px;">
        Du har ${totalServices} abonnement${totalServices !== 1 ? "er" : ""}. Her er dit overblik.
      </p>

      <!-- Overview boxes -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="width:${hasWaste || hasDowngrades ? "33%" : "50%"};padding:12px;text-align:center;background:#f9fafb;border-radius:12px;">
            <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Månedligt forbrug</p>
            <p style="font-size:22px;font-weight:700;color:#111;margin:0;">${totalMonthly.toLocaleString("da-DK")} kr/md</p>
          </td>
          <td style="width:8px;"></td>
          <td style="width:${hasWaste || hasDowngrades ? "33%" : "50%"};padding:12px;text-align:center;background:#f9fafb;border-radius:12px;">
            <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Årligt forbrug</p>
            <p style="font-size:22px;font-weight:700;color:#111;margin:0;">${totalYearly.toLocaleString("da-DK")} kr/år</p>
          </td>
          ${
            hasWaste || hasDowngrades
              ? `
          <td style="width:8px;"></td>
          <td style="width:33%;padding:12px;text-align:center;background:#ecfdf5;border-radius:12px;border:2px solid #1B7A6E;">
            <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Mulig besparelse</p>
            <p style="font-size:22px;font-weight:700;color:#1B7A6E;margin:0;">${totalSavingsMonthly.toLocaleString("da-DK")} kr/md</p>
          </td>
          `
              : ""
          }
        </tr>
      </table>

      ${
        hasWaste
          ? `
      <!-- Wasted subscriptions -->
      <h2 style="font-size:16px;color:#111;margin:0 0 4px;">Abonnementer du bruger sjældent eller aldrig</h2>
      <p style="font-size:13px;color:#6b7280;margin:0 0 12px;">Estimeret besparelse: ${wastedMonthly.toLocaleString("da-DK")} kr/md</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#fef2f2;border-radius:12px;overflow:hidden;">
        <tr style="background:#fde8e8;">
          <td style="padding:8px 16px;font-size:12px;font-weight:600;color:#991b1b;">Abonnement</td>
          <td style="padding:8px 16px;font-size:12px;font-weight:600;color:#991b1b;text-align:right;">Pris</td>
        </tr>
        ${wastedListHtml}
      </table>
      `
          : ""
      }

      ${
        hasDowngrades
          ? `
      <!-- Downgrade suggestions -->
      <h2 style="font-size:16px;color:#111;margin:0 0 4px;">Nedgraderingsforslag</h2>
      <p style="font-size:13px;color:#6b7280;margin:0 0 12px;">Du bruger disse aktivt, men kan spare ved at skifte plan</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#ecfdf5;border-radius:12px;overflow:hidden;">
        <tr style="background:#d1fae5;">
          <td style="padding:8px 16px;font-size:12px;font-weight:600;color:#065f46;">Abonnement</td>
          <td style="padding:8px 16px;font-size:12px;font-weight:600;color:#065f46;text-align:right;">Besparelse</td>
        </tr>
        ${downgradeListHtml}
      </table>
      `
          : ""
      }

      ${
        !hasWaste && !hasDowngrades
          ? `
      <div style="background:#ecfdf5;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="font-size:15px;color:#065f46;font-weight:600;margin:0;">
          Flot — du bruger dine abonnementer godt!
        </p>
      </div>
      `
          : ""
      }

      ${
        hasWaste || hasDowngrades
          ? `
      <!-- Savings summary -->
      <div style="background:#1C2B2A;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Din mulige besparelse</p>
        <p style="font-size:32px;font-weight:700;color:#4ECDC4;margin:0;">${totalSavingsMonthly.toLocaleString("da-DK")} kr/md</p>
      </div>
      `
          : ""
      }

      <!-- CTA -->
      <div style="text-align:center;margin-top:24px;">
        <a href="https://abovagt.dk"
           style="display:inline-block;padding:16px 36px;background:#1B7A6E;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
          Vil du spare tid? Lad os hjælpe dig &rarr;
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;color:#9ca3af;font-size:12px;">
      <p style="margin:0 0 4px;">Du modtager denne email fordi du tog AboVagt quiz.</p>
      <p style="margin:0 0 12px;">Du kan altid afmelde dig.</p>
      <p style="margin:0;">
        <a href="https://abovagt.dk/afmeld?id=${quizResultId}" style="color:#9ca3af;text-decoration:underline;">
          Afmeld emails
        </a>
      </p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    });

    // Track in drip_emails table (day=0 = immediate quiz result email)
    if (userId) {
      try {
        await supabase.from("drip_emails").insert({
          user_id: userId,
          quiz_result_id: quizResultId,
          day: 0,
          sent_at: new Date().toISOString(),
        });
      } catch {
        // Don't fail the request if tracking fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send quiz result email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
