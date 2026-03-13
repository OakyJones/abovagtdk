import { getSupabaseAdmin } from "@/lib/supabase-admin";
import QuizChart from "./QuizChart";

export const dynamic = "force-dynamic";

interface QueryError {
  message: string;
  table: string;
}

async function getStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const errors: QueryError[] = [];
  const supabase = getSupabaseAdmin();

  // Run all queries with individual error handling
  const [
    quizTotalRes,
    quizTodayRes,
    quizWeekRes,
    usersTotalRes,
    tinkRes,
    savingsRes,
    savingsMonthRes,
    recentRes,
    last30Res,
    allSvcRes,
    inboundRes,
    actionsRes,
    newsletterRes,
    bankConnectionsRes,
  ] = await Promise.all([
    supabase.from("quiz_results").select("*", { count: "exact", head: true }),
    supabase.from("quiz_results").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    supabase.from("quiz_results").select("*", { count: "exact", head: true }).gte("created_at", weekStart),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("tink_connected", true),
    supabase.from("quiz_results").select("estimated_savings"),
    supabase.from("quiz_results").select("estimated_savings").gte("created_at", monthStart),
    supabase.from("quiz_results").select("id, email, selected_services, estimated_monthly_cost, estimated_savings, created_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("quiz_results").select("created_at").gte("created_at", thirtyDaysAgo),
    supabase.from("quiz_results").select("selected_services"),
    supabase.from("inbound_emails").select("*", { count: "exact", head: true }),
    supabase.from("actions").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("newsletter_consent", true),
    supabase.from("bank_connections").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
  ]);

  // Log and collect errors (skip bank_connections — table may not exist yet)
  const results = [
    { name: "quiz_results (total)", res: quizTotalRes },
    { name: "quiz_results (today)", res: quizTodayRes },
    { name: "quiz_results (week)", res: quizWeekRes },
    { name: "users (total)", res: usersTotalRes },
    { name: "users (tink)", res: tinkRes },
    { name: "quiz_results (savings)", res: savingsRes },
    { name: "quiz_results (savings month)", res: savingsMonthRes },
    { name: "quiz_results (recent)", res: recentRes },
    { name: "quiz_results (last30)", res: last30Res },
    { name: "quiz_results (services)", res: allSvcRes },
    { name: "inbound_emails", res: inboundRes },
    { name: "actions", res: actionsRes },
    { name: "users (newsletter)", res: newsletterRes },
  ];

  for (const { name, res } of results) {
    if (res.error) {
      console.error(`[Admin Dashboard] Query error for ${name}:`, res.error.message, res.error);
      errors.push({ table: name, message: res.error.message });
    }
  }

  const totalQuiz = quizTotalRes.count ?? 0;
  const todayQuiz = quizTodayRes.count ?? 0;
  const weekQuiz = quizWeekRes.count ?? 0;
  const totalEmails = usersTotalRes.count ?? 0;
  const tinkConnected = tinkRes.count ?? 0;
  const totalInbound = inboundRes.count ?? 0;
  const totalActions = actionsRes.count ?? 0;
  const totalNewsletter = newsletterRes.count ?? 0;
  const bankConnectionsThisMonth = bankConnectionsRes.count ?? 0;

  const savingsData = savingsRes.data || [];
  const thisMonthSavings = savingsMonthRes.data || [];
  const recentQuiz = recentRes.data || [];
  const last30Quiz = last30Res.data || [];
  const allServices = allSvcRes.data || [];

  // Total savings (all-time)
  const totalSavings = savingsData.reduce(
    (sum: number, r: { estimated_savings: number }) => sum + (Number(r.estimated_savings) || 0),
    0
  );
  const totalSavingsUsers = savingsData.filter(
    (r: { estimated_savings: number }) => (Number(r.estimated_savings) || 0) > 0
  ).length;

  // This month savings
  const quizSavingsMonth = thisMonthSavings.reduce(
    (sum: number, r: { estimated_savings: number }) => sum + (Number(r.estimated_savings) || 0),
    0
  );
  const quizSavingsMonthUsers = thisMonthSavings.filter(
    (r: { estimated_savings: number }) => (Number(r.estimated_savings) || 0) > 0
  ).length;

  // Conversion rate
  const conversionRate = totalQuiz > 0
    ? Math.round((tinkConnected / (totalQuiz || 1)) * 100)
    : 0;

  // Quiz per day (last 30 days)
  const dailyCounts: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyCounts[key] = 0;
  }
  last30Quiz.forEach((q: { created_at: string }) => {
    const key = new Date(q.created_at).toISOString().split("T")[0];
    if (key in dailyCounts) dailyCounts[key]++;
  });

  // Top 10 services
  const serviceTally: Record<string, number> = {};
  allServices.forEach((q: { selected_services: string[] }) => {
    const svcList = q.selected_services;
    if (Array.isArray(svcList)) {
      svcList.forEach((s: string) => {
        serviceTally[s] = (serviceTally[s] || 0) + 1;
      });
    }
  });
  const top10 = Object.entries(serviceTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    totalQuiz,
    todayQuiz,
    weekQuiz,
    totalEmails,
    tinkConnected,
    totalInbound,
    totalActions,
    totalNewsletter,
    conversionRate,
    totalSavings,
    totalSavingsUsers,
    quizSavingsMonth,
    quizSavingsMonthUsers,
    dailyCounts,
    top10,
    recentQuiz,
    errors,
    bankConnectionsThisMonth,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { label: "Quiz i dag", value: stats.todayQuiz, color: "text-[#1B7A6E]" },
    { label: "Quiz denne uge", value: stats.weekQuiz, color: "text-[#1B7A6E]" },
    { label: "Quiz total", value: stats.totalQuiz, color: "text-[#1C2B2A]" },
    { label: "Brugere", value: stats.totalEmails, color: "text-blue-600" },
    { label: "Newsletter", value: stats.totalNewsletter, color: "text-purple-600" },
    { label: "Konvertering → bank", value: `${stats.conversionRate}%`, color: "text-orange-600" },
    { label: "Bankforbindelser", value: stats.tinkConnected, color: "text-orange-600" },
    { label: "Opsigelser/handlinger", value: stats.totalActions, color: "text-red-600" },
    { label: "Inbound emails", value: stats.totalInbound, color: "text-indigo-600" },
    {
      label: "Gns. besparelse/quiz",
      value: `${stats.totalQuiz > 0 ? Math.round(stats.totalSavings / stats.totalQuiz).toLocaleString("da-DK") : 0} kr/md`,
      color: "text-[#1B7A6E]",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h2>

      {/* Query errors */}
      {stats.errors.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-bold text-red-800 mb-2">
            Database-fejl ({stats.errors.length})
          </h3>
          <p className="text-xs text-red-600 mb-2">
            Nogle queries fejlede. Tjek RLS policies og tabel-struktur.
          </p>
          <div className="space-y-1">
            {stats.errors.map((e, i) => (
              <p key={i} className="text-xs text-red-700 font-mono">
                {e.table}: {e.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Savings overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border-2 border-teal-100 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Besparelse via quiz denne md</p>
          <p className="text-3xl font-bold text-[#1B7A6E]">
            {stats.quizSavingsMonth.toLocaleString("da-DK")} <span className="text-lg font-semibold">kr/md</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.quizSavingsMonthUsers} bruger{stats.quizSavingsMonthUsers !== 1 ? "e" : ""}
          </p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Bankforbindelser denne md</p>
          <p className="text-3xl font-bold text-[#1B7A6E]">
            {stats.bankConnectionsThisMonth} <span className="text-lg font-semibold">/ 50</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            GoCardless open banking (PSD2)
          </p>
        </div>
        <div className="bg-teal-50 rounded-2xl border-2 border-[#1B7A6E] p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Samlet besparelse denne md</p>
          <p className="text-3xl font-bold text-[#1B7A6E]">
            {stats.quizSavingsMonth.toLocaleString("da-DK")} <span className="text-lg font-semibold">kr/md</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.quizSavingsMonthUsers} bruger{stats.quizSavingsMonthUsers !== 1 ? "e" : ""}
          </p>
        </div>
        <div className="bg-[#1C2B2A] rounded-2xl p-5">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Samlet besparelse all-time</p>
          <p className="text-3xl font-bold text-[#4ECDC4]">
            {stats.totalSavings.toLocaleString("da-DK")} <span className="text-lg font-semibold">kr/md</span>
          </p>
          <p className="text-xs text-white/40 mt-1">
            {stats.totalSavingsUsers} bruger{stats.totalSavingsUsers !== 1 ? "e" : ""}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              {card.label}
            </p>
            <p className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* GoCardless / Bank connection quota */}
      <div className={`rounded-2xl border-2 p-5 mb-8 ${
        stats.bankConnectionsThisMonth >= 40
          ? "bg-red-50 border-red-300"
          : "bg-white border-gray-200"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Bankforbindelser denne måned
            </p>
            <p className={`text-3xl font-bold ${
              stats.bankConnectionsThisMonth >= 40 ? "text-red-600" : "text-[#1B7A6E]"
            }`}>
              {stats.bankConnectionsThisMonth}
              <span className="text-lg font-semibold text-gray-400"> / 50</span>
            </p>
          </div>
          <div className="text-right">
            <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  stats.bankConnectionsThisMonth >= 40
                    ? "bg-red-500"
                    : stats.bankConnectionsThisMonth >= 25
                    ? "bg-yellow-500"
                    : "bg-[#1B7A6E]"
                }`}
                style={{ width: `${Math.min((stats.bankConnectionsThisMonth / 50) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {50 - stats.bankConnectionsThisMonth} tilbage
            </p>
          </div>
        </div>
        {stats.bankConnectionsThisMonth >= 40 && (
          <div className="mt-3 bg-red-100 rounded-lg px-3 py-2">
            <p className="text-sm text-red-700 font-medium">
              Advarsel: {stats.bankConnectionsThisMonth}/50 connections brugt — tæt på grænsen!
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Quiz-gennemf&oslash;relser pr. dag (sidste 30 dage)
        </h3>
        <QuizChart data={stats.dailyCounts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top 10 services */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Top 10 mest valgte abonnementer
          </h3>
          {stats.top10.length === 0 ? (
            <p className="text-sm text-gray-400">Ingen data endnu</p>
          ) : (
            <div className="space-y-2">
              {stats.top10.map(([name, count], i) => {
                const maxCount = stats.top10[0][1] as number;
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-5 text-right">
                      {i + 1}.
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-medium text-gray-900">
                          {name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {count}x
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-[#1B7A6E] h-1.5 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:block hidden">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Hurtig statistik
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Gns. abonnementer pr. quiz</span>
              <span className="font-medium text-gray-900">
                {stats.recentQuiz.length > 0
                  ? Math.round(
                      stats.recentQuiz.reduce(
                        (sum: number, q: { selected_services: string[] }) =>
                          sum +
                          (q.selected_services?.length || 0),
                        0
                      ) / stats.recentQuiz.length
                    )
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gns. besparelse pr. quiz</span>
              <span className="font-medium text-[#1B7A6E]">
                {stats.totalQuiz > 0
                  ? `${Math.round(stats.totalSavings / stats.totalQuiz).toLocaleString("da-DK")} kr/md`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gns. m&aring;nedligt forbrug</span>
              <span className="font-medium text-gray-900">
                {stats.recentQuiz.length > 0
                  ? `${Math.round(
                      stats.recentQuiz.reduce(
                        (sum: number, q: { estimated_monthly_cost: number }) => sum + (Number(q.estimated_monthly_cost) || 0),
                        0
                      ) / stats.recentQuiz.length
                    ).toLocaleString("da-DK")} kr/md`
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent quiz results */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">
            Seneste 20 quiz-resultater
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dato
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  Abonnementer
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  Mdr. forbrug
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  Besparelse
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentQuiz.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Ingen quiz-resultater endnu
                  </td>
                </tr>
              ) : (
                stats.recentQuiz.map((q: { id: string; email: string; created_at: string; selected_services: string[]; estimated_monthly_cost: number; estimated_savings: number }) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-900 font-medium">
                      {q.email}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(q.created_at).toLocaleDateString("da-DK", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-900">
                      {q.selected_services?.length || 0}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-900">
                      {Number(q.estimated_monthly_cost || 0).toLocaleString("da-DK")} kr/md
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-[#1B7A6E]">
                      {Number(q.estimated_savings || 0).toLocaleString("da-DK")} kr/md
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
