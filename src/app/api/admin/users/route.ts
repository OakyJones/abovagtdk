import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "created_at";
  const order = searchParams.get("order") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const userId = searchParams.get("userId"); // single user detail
  const limit = 50;
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();

  try {
    // Single user detail mode
    if (userId) {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !user) {
        return NextResponse.json({ error: "Bruger ikke fundet" }, { status: 404 });
      }

      // Fetch all related data in parallel
      const [quizRes, bankRes, scansRes, actionsRes, paymentsRes] = await Promise.all([
        supabase.from("quiz_results").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("bank_connections").select("*").eq("user_id", userId),
        supabase.from("scans").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("actions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("payments").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);

      // Get subscriptions from scans
      const scanIds = (scansRes.data || []).map((s: { id: string }) => s.id);
      const subsRes = scanIds.length > 0
        ? await supabase.from("subscriptions").select("*").in("scan_id", scanIds)
        : { data: [] };

      return NextResponse.json({
        user,
        quiz_results: quizRes.data || [],
        bank_connections: bankRes.data || [],
        scans: scansRes.data || [],
        subscriptions: subsRes.data || [],
        actions: actionsRes.data || [],
        payments: paymentsRes.data || [],
      });
    }

    // List mode
    let query = supabase.from("users").select("*", { count: "exact" });

    if (search) {
      query = query.ilike("email", `%${search}%`);
    }

    const validSorts = ["email", "created_at", "quiz_completed", "tink_connected"];
    const sortCol = validSorts.includes(sort) ? sort : "created_at";

    query = query
      .order(sortCol, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    const { data: users, count, error } = await query;

    if (error) throw error;

    const userIds = (users || []).map((u: { id: string }) => u.id);
    const none = ["none"];
    const ids = userIds.length > 0 ? userIds : none;

    // Fetch related data in parallel
    const [quizRes, bankRes, scansRes, actionsRes, paymentsRes] = await Promise.all([
      supabase.from("quiz_results").select("user_id, selected_services, estimated_savings, created_at").in("user_id", ids),
      supabase.from("bank_connections").select("user_id").in("user_id", ids),
      supabase.from("scans").select("id, user_id").in("user_id", ids),
      supabase.from("actions").select("user_id, type, savings").in("user_id", ids),
      supabase.from("payments").select("user_id, status, amount").in("user_id", ids),
    ]);

    // Get subscription counts per scan
    const scanIds = (scansRes.data || []).map((s: { id: string }) => s.id);
    const subsRes = scanIds.length > 0
      ? await supabase.from("subscriptions").select("scan_id").in("scan_id", scanIds)
      : { data: [] };

    // Build lookup maps
    const quizMap = new Map<string, { services: number; savings: number; date: string }>();
    for (const q of quizRes.data || []) {
      if (!quizMap.has(q.user_id)) {
        quizMap.set(q.user_id, {
          services: Array.isArray(q.selected_services) ? q.selected_services.length : 0,
          savings: q.estimated_savings || 0,
          date: q.created_at,
        });
      }
    }

    const bankSet = new Set((bankRes.data || []).map((b: { user_id: string }) => b.user_id));

    // Map scan_id -> user_id
    const scanUserMap = new Map<string, string>();
    const userScanSet = new Set<string>();
    for (const s of scansRes.data || []) {
      scanUserMap.set(s.id, s.user_id);
      userScanSet.add(s.user_id);
    }

    // Count subscriptions per user
    const subCountMap = new Map<string, number>();
    for (const sub of subsRes.data || []) {
      const uid = scanUserMap.get(sub.scan_id);
      if (uid) {
        subCountMap.set(uid, (subCountMap.get(uid) || 0) + 1);
      }
    }

    // Sum savings from actions per user
    const actionSavingsMap = new Map<string, number>();
    const actionSet = new Set<string>();
    for (const a of actionsRes.data || []) {
      actionSet.add(a.user_id);
      actionSavingsMap.set(a.user_id, (actionSavingsMap.get(a.user_id) || 0) + (a.savings || 0));
    }

    // Payment status per user
    const paymentMap = new Map<string, string>();
    for (const p of paymentsRes.data || []) {
      if (!paymentMap.has(p.user_id) || p.status === "captured") {
        paymentMap.set(p.user_id, p.status);
      }
    }

    // Determine status and track for each user
    const enriched = (users || []).map((user: Record<string, unknown>) => {
      const quiz = quizMap.get(user.id as string);
      const hasBank = bankSet.has(user.id as string);
      const hasScans = userScanSet.has(user.id as string);
      const hasActions = actionSet.has(user.id as string);
      const payStatus = paymentMap.get(user.id as string);
      const subCount = subCountMap.get(user.id as string) || 0;
      const actionSavings = actionSavingsMap.get(user.id as string) || 0;

      // Determine track
      let track = "Engang";
      if (quiz && !hasBank) track = "Quiz";
      if ((user.signup_path as string) === "monitoring") track = "Monitoring";

      // Determine status (highest achieved)
      let status = "Email signup";
      let statusColor = "gray";
      if (quiz) { status = "Quiz færdig"; statusColor = "blue"; }
      if (hasBank) { status = "Bank forbundet"; statusColor = "teal"; }
      if (hasScans) { status = "Scannet"; statusColor = "green"; }
      if (hasActions) { status = "Handlet"; statusColor = "emerald"; }
      if (payStatus === "captured") { status = "Betalt"; statusColor = "amber"; }

      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        track,
        status,
        statusColor,
        sub_count: subCount,
        savings_md: actionSavings,
        tink_connected: hasBank || user.tink_connected,
        has_paid: payStatus === "captured",
        newsletter_consent: user.newsletter_consent ?? null,
        contact_status: user.contact_status || null,
        monitoring_active: (user.signup_path as string) === "monitoring" && payStatus === "captured" && user.contact_status !== "unsubscribed",
      };
    });

    return NextResponse.json({
      users: enriched,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
