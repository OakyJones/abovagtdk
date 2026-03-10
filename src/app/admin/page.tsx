import { getSupabaseAdmin } from "@/lib/supabase-admin";
import QuizChart from "./QuizChart";

export const dynamic = "force-dynamic";

async function getStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalQuiz },
    { count: todayQuiz },
    { count: weekQuiz },
    { count: totalEmails },
    { count: tinkConnected },
    { data: savingsData },
    { data: thisMonthSavings },
    { data: recentQuiz },
    { data: last30Quiz },
    { data: allServices },
  ] = await Promise.all([
    getSupabaseAdmin().from("quiz_results").select("*", { count: "exact", head: true }),
    getSupabaseAdmin().from("quiz_results").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    getSupabaseAdmin().from("quiz_results").select("*", { count: "exact", head: true }).gte("created_at", weekStart),
    getSupabaseAdmin().from("users").select("*", { count: "exact", head: true }),
    getSupabaseAdmin().from("users").select("*", { count: "exact", head: true }).eq("tink_connected", true),
    getSupabaseAdmin().from("quiz_results").select("estimated_savings"),
    getSupabaseAdmin().from("quiz_results").select("estimated_savings").gte("created_at", monthStart),
    getSupabaseAdmin().from("quiz_results").select("id, email, selected_services, estimated_monthly_cost, estimated_savings, created_at").order("created_at", { ascending: false }).limit(20),
    getSupabaseAdmin().from("quiz_results").select("created_at").gte("created_at", thirtyDaysAgo),
    getSupabaseAdmin().from("quiz_results").select("selected_services"),
  ]);

  // Total savings (all-time)
  const totalSavings = (savingsData || []).reduce(
    (sum, r) => sum + (Number(r.estimated_savings) || 0),
    0
  );
  const totalSavingsUsers = (savingsData || []).filter(
    (r) => (Number(r.estimated_savings) || 0) > 0
  ).length;

  // This month savings
  const quizSavingsMonth = (thisMonthSavings || []).reduce(
    (sum, r) => sum + (Number(r.estimated_savings) || 0),
    0
  );
  const quizSavingsMonthUsers = (thisMonthSavings || []).filter(
    (r) => (Number(r.estimated_savings) || 0) > 0
  ).length;

  // Conversion rate
  const conversionRate = (totalQuiz || 0) > 0
    ? Math.round(((tinkConnected || 0) / (totalQuiz || 1)) * 100)
    : 0;

  // Quiz per day (last 30 days)
  const dailyCounts: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dailyCounts[key] = 0;
  }
  (last30Quiz || []).forEach((q) => {
    const key = new Date(q.created_at).toISOString().split("T")[0];
    if (key in dailyCounts) dailyCounts[key]++;
  });

  // Top 10 services
  const serviceTally: Record<string, number> = {};
  (allServices || []).forEach((q) => {
    const svcList = q.selected_services as string[];
    if (Array.isArray(svcList)) {
      svcList.forEach((s) => {
        serviceTally[s] = (serviceTally[s] || 0) + 1;
      });
    }
  });
  const top10 = Object.entries(serviceTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    totalQuiz: totalQuiz || 0,
    todayQuiz: todayQuiz || 0,
    weekQuiz: weekQuiz || 0,
    totalEmails: totalEmails || 0,
    conversionRate,
    totalSavings,
    totalSavingsUsers,
    quizSavingsMonth,
    quizSavingsMonthUsers,
    dailyCounts,
    top10,
    recentQuiz: recentQuiz || [],
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statCards = [
    { label: "Quiz i dag", value: stats.todayQuiz, color: "text-[#1B7A6E]" },
    { label: "Quiz denne uge", value: stats.weekQuiz, color: "text-[#1B7A6E]" },
    { label: "Quiz total", value: stats.totalQuiz, color: "text-[#1C2B2A]" },
    { label: "Emails indsamlet", value: stats.totalEmails, color: "text-blue-600" },
    { label: "Konvertering → bank", value: `${stats.conversionRate}%`, color: "text-orange-600" },
    {
      label: "Gns. besparelse/quiz",
      value: `${stats.totalQuiz > 0 ? Math.round(stats.totalSavings / stats.totalQuiz).toLocaleString("da-DK") : 0} kr/md`,
      color: "text-[#1B7A6E]",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h2>

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
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Besparelse via bank denne md</p>
          <p className="text-3xl font-bold text-gray-300">
            0 <span className="text-lg font-semibold">kr/md</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            0 brugere — Tink ikke live endnu
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
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

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Quiz-gennemførelser pr. dag (sidste 30 dage)
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

        {/* Recent quiz placeholder - shown in table below on mobile */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:block hidden">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Hurtig statistik
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Gns. abonnementer pr. quiz</span>
              <span className="font-medium text-gray-900">
                {stats.totalQuiz > 0
                  ? Math.round(
                      stats.recentQuiz.reduce(
                        (sum, q) =>
                          sum +
                          ((q.selected_services as string[])?.length || 0),
                        0
                      ) / stats.recentQuiz.length
                    )
                  : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gns. besparelse pr. quiz</span>
              <span className="font-medium text-[#1B7A6E]">
                {stats.totalQuiz > 0
                  ? Math.round(stats.totalSavings / stats.totalQuiz).toLocaleString("da-DK")
                  : 0}{" "}
                kr/md
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gns. månedligt forbrug</span>
              <span className="font-medium text-gray-900">
                {stats.recentQuiz.length > 0
                  ? Math.round(
                      stats.recentQuiz.reduce(
                        (sum, q) => sum + (Number(q.estimated_monthly_cost) || 0),
                        0
                      ) / stats.recentQuiz.length
                    ).toLocaleString("da-DK")
                  : 0}{" "}
                kr/md
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
                stats.recentQuiz.map((q) => (
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
                      {(q.selected_services as string[])?.length || 0}
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
