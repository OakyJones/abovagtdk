import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createRequisition } from "@/lib/gocardless";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId, institutionId } = await req.json();

    if (!userId || !institutionId) {
      return NextResponse.json(
        { error: "Mangler userId eller institutionId" },
        { status: 400 }
      );
    }

    if (!process.env.GOCARDLESS_SECRET_ID || !process.env.GOCARDLESS_SECRET_KEY) {
      return NextResponse.json(
        { error: "GoCardless er ikke konfigureret" },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verify user exists
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "Bruger ikke fundet" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://abovagt.dk";
    const redirectUrl = `${baseUrl}/api/callback/gocardless?userId=${userId}`;

    const requisition = await createRequisition({
      institutionId,
      redirectUrl,
      referenceId: userId,
    });

    // Store requisition ID on user for later retrieval
    await supabase
      .from("users")
      .update({ gocardless_requisition_id: requisition.id })
      .eq("id", userId);

    return NextResponse.json({ url: requisition.link });
  } catch (error) {
    console.error("GoCardless link error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kunne ikke oprette bankforbindelse" },
      { status: 500 }
    );
  }
}
