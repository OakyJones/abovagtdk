import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getRequisition, getAccountTransactions, getAccountDetails, GoCardlessTransaction } from "@/lib/gocardless";
import { scanTransactions } from "@/lib/subscription-scanner";
import { TinkTransaction } from "@/lib/tink";

export const dynamic = "force-dynamic";

/** Convert GoCardless transaction to TinkTransaction format for the scanner */
function toTinkFormat(tx: GoCardlessTransaction): TinkTransaction {
  const amount = parseFloat(tx.transactionAmount.amount);
  // GoCardless uses negative amounts for debits (same as Tink's unscaledValue sign)
  const unscaled = Math.round(amount * 100);

  return {
    id: tx.transactionId || `gc-${tx.bookingDate}-${Math.random().toString(36).slice(2, 8)}`,
    accountId: "",
    amount: {
      value: { unscaledValue: String(unscaled), scale: "2" },
      currencyCode: tx.transactionAmount.currency,
    },
    descriptions: {
      original: tx.remittanceInformationUnstructured || tx.creditorName || tx.additionalInformation || "Ukendt",
      display: tx.creditorName || tx.remittanceInformationUnstructured || tx.additionalInformation || "Ukendt",
    },
    dates: {
      booked: tx.bookingDate,
    },
    status: "BOOKED",
  };
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!process.env.GOCARDLESS_SECRET_ID || !process.env.GOCARDLESS_SECRET_KEY) {
      return NextResponse.json(
        { error: "GoCardless er ikke konfigureret" },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get user's requisition ID
    const { data: user } = await supabase
      .from("users")
      .select("id, gocardless_requisition_id")
      .eq("id", userId)
      .single();

    if (!user?.gocardless_requisition_id) {
      return NextResponse.json(
        { error: "Ingen bankforbindelse fundet — forbind din bank først" },
        { status: 400 }
      );
    }

    // Get requisition to find account IDs
    const requisition = await getRequisition(user.gocardless_requisition_id);

    if (requisition.status !== "LN") {
      return NextResponse.json(
        { error: `Bankforbindelsen er ikke klar (status: ${requisition.status}). Prøv at forbinde igen.` },
        { status: 400 }
      );
    }

    if (!requisition.accounts || requisition.accounts.length === 0) {
      return NextResponse.json(
        { error: "Ingen konti fundet via bankforbindelsen" },
        { status: 400 }
      );
    }

    // Fetch transactions from all accounts (last 90 days)
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    let allGcTransactions: GoCardlessTransaction[] = [];
    let bankName = "Ukendt bank";

    for (const accountId of requisition.accounts) {
      try {
        const [transactions, details] = await Promise.all([
          getAccountTransactions(accountId, threeMonthsAgo),
          getAccountDetails(accountId),
        ]);
        allGcTransactions = allGcTransactions.concat(transactions);
        if (details.institution_id) bankName = details.institution_id;
      } catch (e) {
        console.error(`GoCardless account ${accountId} error:`, e);
        // Continue with other accounts
      }
    }

    // Save bank connection
    const { data: bankConn } = await supabase
      .from("bank_connections")
      .insert({
        user_id: userId,
        tink_credential_id: user.gocardless_requisition_id,
        bank_name: bankName,
        provider: "gocardless",
        connected_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    // Update user
    await supabase
      .from("users")
      .update({ tink_connected: true })
      .eq("id", userId);

    // Convert to Tink format for scanner compatibility
    const tinkTransactions: TinkTransaction[] = allGcTransactions.map(toTinkFormat);

    // Scan for subscriptions
    const { subscriptions, unknownRecurring, totalMonthlySpend } = scanTransactions(tinkTransactions);

    // Save found subscriptions
    for (const sub of subscriptions) {
      await supabase.from("subscriptions").insert({
        user_id: userId,
        service_name: sub.serviceName,
        known_service_id: null,
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
        transactions_found: allGcTransactions.length,
        subscriptions_found: subscriptions.length + unknownRecurring.length,
      });
    }

    return NextResponse.json({
      success: true,
      subscriptions,
      unknownRecurring,
      transactionsScanned: allGcTransactions.length,
      totalMonthlySpend,
    });
  } catch (error) {
    console.error("GoCardless scan error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scan fejlede" },
      { status: 500 }
    );
  }
}
