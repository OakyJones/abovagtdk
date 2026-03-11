import { getSupabaseAdmin } from "@/lib/supabase-admin";

async function getUserCount(): Promise<number> {
  try {
    const { count } = await getSupabaseAdmin()
      .from("users")
      .select("*", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function Stats() {
  const userCount = await getUserCount();

  const stats = [
    {
      value: "8\u201315",
      label: "abonnementer",
      description: "har den gennemsnitlige dansker",
    },
    {
      value: "200 kr/md",
      label: "spildt i snit",
      description: "p\u00e5 glemte eller ubrugte abonnementer",
    },
    {
      value: "5 min",
      label: "er alt det tager",
      description: "at finde dine skjulte udgifter",
    },
  ];

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-[#1B7A6E]">
                {stat.value}
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {stat.label}
              </p>
              <p className="mt-1 text-sm text-gray-500">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Live counter */}
        {userCount > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-5 py-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B7A6E] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1B7A6E]" />
              </span>
              <span className="text-sm font-medium text-[#1C2B2A]">
                {userCount.toLocaleString("da-DK")} danskere har allerede scannet
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
