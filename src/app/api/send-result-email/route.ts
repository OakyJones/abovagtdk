import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      quizResultId,
      totalMonthly,
      totalYearly,
      yearlySavings,
      wastedServices,
    } = await req.json();

    if (!email || !process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Missing email or API key" }, { status: 400 });
    }

    const wastedListHtml = wastedServices
      .map(
        (s: { name: string; price: number }) =>
          `<tr>
            <td style="padding:8px 16px;border-bottom:1px solid #eee;">${s.name}</td>
            <td style="padding:8px 16px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${s.price} kr/md</td>
          </tr>`
      )
      .join("");

    const hasWaste = wastedServices.length > 0;

    await resend.emails.send({
      from: "AboVagt <noreply@abovagt.dk>",
      to: email,
      subject: hasWaste
        ? `Du kan spare ${yearlySavings.toLocaleString("da-DK")} kr/år på abonnementer`
        : "Dit AboVagt quiz-resultat",
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

      <h1 style="font-size:24px;color:#111;margin:0 0 8px;">
        ${hasWaste ? "Du har fundet besparelser!" : "Dit quiz-resultat"}
      </h1>
      <p style="color:#6b7280;margin:0 0 24px;font-size:15px;">
        Her er en oversigt over dine abonnementer.
      </p>

      <div style="display:flex;gap:12px;margin-bottom:24px;">
        <div style="flex:1;background:#f9fafb;border-radius:12px;padding:16px;text-align:center;">
          <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">Månedligt forbrug</p>
          <p style="font-size:24px;font-weight:700;color:#111;margin:0;">${totalMonthly} kr</p>
        </div>
        <div style="flex:1;background:#f9fafb;border-radius:12px;padding:16px;text-align:center;">
          <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">Årligt forbrug</p>
          <p style="font-size:24px;font-weight:700;color:#111;margin:0;">${totalYearly} kr</p>
        </div>
        ${hasWaste ? `
        <div style="flex:1;background:#ecfdf5;border-radius:12px;padding:16px;text-align:center;border:2px solid #1B7A6E;">
          <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">Mulig besparelse</p>
          <p style="font-size:24px;font-weight:700;color:#1B7A6E;margin:0;">${yearlySavings} kr/år</p>
        </div>
        ` : ""}
      </div>

      ${hasWaste ? `
      <h2 style="font-size:16px;color:#111;margin:0 0 12px;">Abonnementer du kan spare:</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${wastedListHtml}
      </table>
      ` : `
      <p style="color:#6b7280;font-size:15px;">
        Flot — du bruger dine abonnementer godt! Vidste du at du kan
        finde skjulte abonnementer ved at forbinde din bank?
      </p>
      `}

      <div style="text-align:center;margin-top:24px;">
        <a href="https://abovagt.dk"
           style="display:inline-block;padding:14px 32px;background:#1B7A6E;color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:16px;">
          ${hasWaste
            ? "Se hvordan du kan spare mere →"
            : "Tjek om du har skjulte abonnementer →"}
        </a>
        <p style="color:#9ca3af;font-size:13px;margin-top:12px;">
          Forbind din bank og find ALT — på 5 minutter.
        </p>
      </div>
    </div>

    <div style="text-align:center;margin-top:32px;color:#9ca3af;font-size:12px;">
      <p>Halvfems Procent · CVR [pending]</p>
      <p>
        <a href="https://abovagt.dk/afmeld?id=${quizResultId}" style="color:#9ca3af;">
          Afmeld emails
        </a>
      </p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
