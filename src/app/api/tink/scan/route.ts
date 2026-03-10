import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getDelegatedToken, getUserToken, getTransactions, getAccounts } from "@/lib/tink";
import { scanTransactions } from "@/lib/subscription-scanner";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId, credentialsId, code } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!process.env.TINK_CLIENT_ID || !process.env.TINK_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "Tink is not configured" },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get user token — use code from Tink Link callback if available, otherwise try delegation
    let userToken: string;
    if (code) {
      userToken = await getUserToken(code);
    } else {
      userToken = await getDelegatedToken(userId);
    }

    // Fetch accounts
    const accounts = await getAccounts(userToken);

    // Save bank connection
    const { data: bankConn } = await supabase
      .from("bank_connections")
      .insert({
        user_id: userId,
        tink_credential_id: credentialsId || null,
        bank_name: accounts?.[0]?.financialInstitutionId || "Ukendt bank",
        connected_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    // Update user
    await supabase
      .from("users")
      .update({ tink_connected: true })
      .eq("id", userId);

    // Fetch transactions (last 3 months)
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const transactions = await getTransactions(userToken, threeMonthsAgo);

    // Scan for subscriptions
    const { subscriptions, unknownRecurring } = scanTransactions(transactions);

    // Save found subscriptions
    for (const sub of subscriptions) {
      await supabase.from("subscriptions").insert({
        user_id: userId,
        service_name: sub.serviceName,
        known_service_id: null, // Would need UUID lookup
        monthly_amount: sub.monthlyAmount,
        detected_at: new Date().toISOString(),
        status: "active",
      });
    }

    // Save unknown recurring to unknown_services
    for (const unk of unknownRecurring) {
      const { data: existing } = await supabase
        .from("unknown_services")
        .select("id, observation_count")
        .eq("transaction_name", unk.serviceName)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("unknown_services")
          .update({ observation_count: existing.observation_count + 1 })
          .eq("id", existing.id);
      } else {
        await supabase.from("unknown_services").insert({
          transaction_name: unk.serviceName,
          observed_price: unk.monthlyAmount,
          observation_count: 1,
          reviewed: false,
        });
      }
    }

    // Save scan record
    if (bankConn) {
      await supabase.from("scans").insert({
        user_id: userId,
        bank_connection_id: bankConn.id,
        transactions_found: transactions.length,
        subscriptions_found: subscriptions.length + unknownRecurring.length,
      });
    }

    return NextResponse.json({
      success: true,
      subscriptions,
      unknownRecurring,
      transactionsScanned: transactions.length,
    });
  } catch (error) {
    console.error("Tink scan error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scan failed" },
      { status: 500 }
    );
  }
}
