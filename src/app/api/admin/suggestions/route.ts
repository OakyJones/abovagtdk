import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// GET: list unreviewed suggestions
export async function GET() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("unknown_services")
      .select("*")
      .eq("reviewed", false)
      .order("observation_count", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ suggestions: data || [] });
  } catch (error) {
    console.error("Admin suggestions error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST: approve a suggestion → insert into known_services + mark reviewed
export async function POST(req: NextRequest) {
  try {
    const {
      suggestionId,
      name,
      category,
      currentPrice,
      cancellationPeriodDays,
      bindingMonths,
      cancelUrl,
    } = await req.json();

    if (!suggestionId || !name || !category) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Insert into known_services
    const { error: insertError } = await getSupabaseAdmin()
      .from("known_services")
      .insert({
        name,
        category,
        current_price: currentPrice || null,
        cancellation_period_days: cancellationPeriodDays || 0,
        binding_months: bindingMonths || 0,
        cancel_url: cancelUrl || null,
      });

    if (insertError) throw insertError;

    // Mark suggestion as reviewed
    const { error: updateError } = await getSupabaseAdmin()
      .from("unknown_services")
      .update({ reviewed: true })
      .eq("id", suggestionId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin approve error:", error);
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
  }
}

// DELETE: dismiss a suggestion (mark as reviewed without adding)
export async function DELETE(req: NextRequest) {
  try {
    const { suggestionId } = await req.json();

    if (!suggestionId) {
      return NextResponse.json({ error: "Missing suggestionId" }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from("unknown_services")
      .update({ reviewed: true })
      .eq("id", suggestionId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin dismiss error:", error);
    return NextResponse.json({ error: "Failed to dismiss" }, { status: 500 });
  }
}
