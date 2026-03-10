import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, subscriptionId, type, savingsFromDate } = await req.json();

    if (!userId || !subscriptionId || !type) {
      return NextResponse.json(
        { error: "Mangler påkrævede felter" },
        { status: 400 }
      );
    }

    if (!["cancel", "downgrade"].includes(type)) {
      return NextResponse.json(
        { error: "Ugyldig handling" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("actions")
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        type,
        savings_from_date: savingsFromDate,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to save action:", error);
      return NextResponse.json(
        { error: "Kunne ikke gemme handling" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, actionId: data.id });
  } catch (error) {
    console.error("Action error:", error);
    return NextResponse.json(
      { error: "Kunne ikke gemme handling" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Mangler userId" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("actions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Kunne ikke hente handlinger" },
        { status: 500 }
      );
    }

    return NextResponse.json({ actions: data });
  } catch {
    return NextResponse.json(
      { error: "Kunne ikke hente handlinger" },
      { status: 500 }
    );
  }
}
