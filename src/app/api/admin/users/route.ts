import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "created_at";
  const order = searchParams.get("order") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 50;
  const offset = (page - 1) * limit;

  try {
    let query = getSupabaseAdmin()
      .from("users")
      .select("*", { count: "exact" });

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

    // Get quiz results for these users
    const userIds = (users || []).map((u) => u.id);
    const { data: quizResults } = await getSupabaseAdmin()
      .from("quiz_results")
      .select("user_id, selected_services, estimated_savings, created_at")
      .in("user_id", userIds.length > 0 ? userIds : ["none"]);

    // Merge quiz data into users
    const enriched = (users || []).map((user) => {
      const quiz = (quizResults || []).find((q) => q.user_id === user.id);
      return {
        ...user,
        quiz_date: quiz?.created_at || null,
        service_count: quiz?.selected_services
          ? (quiz.selected_services as string[]).length
          : 0,
        estimated_savings: quiz?.estimated_savings || 0,
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
