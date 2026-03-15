import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const emailTypeLabels: Record<number, string> = {
  0: "Quiz-resultat",
  3: "Dag 3 reminder",
  7: "Dag 7 reminder",
  14: "Dag 14 reminder",
  90: "Dag 90 reminder",
};

export default async function AdminEmailsPage() {
  const { data: emails, error } = await getSupabaseAdmin()
    .from("drip_emails")
    .select("id, user_id, quiz_result_id, day, sent_at, clicked")
    .order("sent_at", { ascending: false, nullsFirst: false })
    .limit(100);

  // Get user emails for the user_ids
  const userIds = Array.from(new Set((emails || []).map((e) => e.user_id)));
  const { data: users } = await getSupabaseAdmin()
    .from("users")
    .select("id, email")
    .in("id", userIds.length > 0 ? userIds : ["none"]);

  const userMap = new Map((users || []).map((u) => [u.id, u.email]));

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Emails</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Sendt i alt
          </p>
          <p className="text-2xl font-bold text-[#1C2B2A]">
            {(emails || []).filter((e) => e.sent_at).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Klikket
          </p>
          <p className="text-2xl font-bold text-[#1B7A6E]">
            {(emails || []).filter((e) => e.clicked).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Klik-rate
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {(emails || []).length > 0
              ? Math.round(
                  ((emails || []).filter((e) => e.clicked).length /
                    (emails || []).filter((e) => e.sent_at).length) *
                    100
                ) || 0
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sendt
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-red-500">
                    Fejl: {error.message}
                  </td>
                </tr>
              ) : (emails || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                    Ingen emails sendt endnu
                  </td>
                </tr>
              ) : (
                (emails || []).map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-900 font-medium">
                      {userMap.get(email.user_id) || "Ukendt"}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {emailTypeLabels[email.day] || `Dag ${email.day}`}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {email.sent_at
                        ? new Date(email.sent_at).toLocaleDateString("da-DK", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {!email.sent_at ? (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          Afventer
                        </span>
                      ) : email.clicked ? (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Klikket
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          Sendt
                        </span>
                      )}
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
