import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const BLACKLIST = [
  "overførsel", "løn", "husleje", "rente", "skat",
  "elgiganten", "h&m", "netto", "føtex", "bilka",
  "rema", "aldi", "lidl", "matas", "normal",
  "ikea", "jysk", "bauhaus", "power", "coop",
  "dba", "dividende", "udbetaling", "indbetaling",
];

export async function POST(req: NextRequest) {
  try {
    const { name, category, avg_price } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    // Check blacklist
    const nameLower = name.toLowerCase().trim();
    const blacklisted = BLACKLIST.some(
      (b) => nameLower.includes(b) || b.includes(nameLower)
    );

    if (blacklisted) {
      return NextResponse.json({
        result: {
          name,
          category: category || "misc",
          is_subscription: false,
          rejection_reason: `"${name}" er sandsynligvis ikke et abonnement (butik, bankoverførsel eller lignende)`,
          plans: [],
          cancellation_period_days: 0,
          binding_months: 0,
          cancellation_url: null,
          cancellation_email: null,
        },
        source: "blacklist",
      });
    }

    // Use Claude Haiku for AI enrichment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const prompt = `Du er en dansk abonnementsekspert. For denne service, returner KUN valid JSON (ingen markdown, ingen forklaring):
{
  "name": "Korrekt officielt navn",
  "category": "streaming|musik|fitness|software|gaming|mad|aviser|mobil|dating|forsikring|diverse",
  "cancellation_period_days": number (0 for løbende),
  "binding_months": number (0 for ingen),
  "cancellation_url": "direkte link til opsigelse" eller null,
  "cancellation_email": "email til opsigelse" eller null,
  "is_subscription": true eller false,
  "rejection_reason": "hvis ikke abonnement, forklar hvorfor" eller null,
  "plans": [
    { "name": "Plan-navn", "price_dkk": 79, "features": "kort beskrivelse" }
  ]
}
Returner ALLE tilgængelige planer/tiers med danske priser i DKK.
Hvis servicen ikke er et abonnement (fx en butik, bank, engangskøb), sæt is_subscription til false og forklar i rejection_reason.

Service: ${name}${avg_price ? `, gennemsnitspris fra brugere: ${avg_price} kr/md` : ""}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse AI response", raw: text },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ result, source: "ai" });
  } catch (error) {
    console.error("Enrich service error:", error);
    return NextResponse.json(
      { error: "Failed to enrich service" },
      { status: 500 }
    );
  }
}
