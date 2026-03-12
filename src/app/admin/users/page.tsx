"use client";

import { useState, useEffect, useCallback } from "react";

interface UserRow {
  id: string;
  email: string;
  created_at: string;
  track: string;
  status: string;
  statusColor: string;
  sub_count: number;
  savings_md: number;
  tink_connected: boolean;
  has_paid: boolean;
  newsletter_consent: boolean | null;
  contact_status: string | null;
  monitoring_active: boolean;
}

interface UserDetail {
  user: Record<string, unknown>;
  quiz_results: Record<string, unknown>[];
  bank_connections: Record<string, unknown>[];
  scans: Record<string, unknown>[];
  subscriptions: Record<string, unknown>[];
  actions: Record<string, unknown>[];
  payments: Record<string, unknown>[];
}

const statusBadge = (status: string, color: string) => {
  const colors: Record<string, string> = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-100 text-blue-700",
    teal: "bg-teal-100 text-teal-700",
    green: "bg-green-100 text-green-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${colors[color] || colors.gray}`}>
      {status}
    </span>
  );
};

function UserDetailPanel({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users?userId=${userId}`);
        const json = await res.json();
        setData(json);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <p className="text-center text-gray-400">Henter brugerdata...</p>
        </div>
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4">
          <p className="text-center text-red-500">Bruger ikke fundet</p>
          <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:text-gray-700">Luk</button>
        </div>
      </div>
    );
  }

  const u = data.user;
  const fmtDate = (d: unknown) =>
    d ? new Date(d as string).toLocaleString("da-DK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mt-6">
      <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{u.email as string}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Oprettet</p>
            <p className="font-medium">{fmtDate(u.created_at)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Tink</p>
            <p className="font-medium">{u.tink_connected ? "Forbundet" : "Nej"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Stripe Customer</p>
            <p className="font-medium text-xs break-all">{(u.stripe_customer_id as string) || "—"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Signup Path</p>
            <p className="font-medium">{(u.signup_path as string) || "—"}</p>
          </div>
        </div>

        {/* Email & Monitoring status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mt-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Newsletter consent</p>
            <p className="font-medium">
              {u.newsletter_consent === true ? (
                <span className="text-green-600">Ja</span>
              ) : u.newsletter_consent === false ? (
                <span className="text-red-600">Nej</span>
              ) : (
                <span className="text-gray-400">Ikke sat</span>
              )}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Contact status</p>
            <p className="font-medium">
              {(u.contact_status as string) === "active" ? (
                <span className="text-green-600">Active</span>
              ) : (u.contact_status as string) === "unsubscribed" ? (
                <span className="text-red-600">Unsubscribed</span>
              ) : (u.contact_status as string) === "bounced" ? (
                <span className="text-red-600">Bounced</span>
              ) : (
                <span className="text-gray-400">{(u.contact_status as string) || "—"}</span>
              )}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Consent ændret</p>
            <p className="font-medium">{fmtDate(u.newsletter_consent_updated_at)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Monitoring</p>
            <p className="font-medium">
              {(u.signup_path as string) === "monitoring" ? (
                (u.contact_status as string) === "unsubscribed" ? (
                  <span className="text-red-600">Afmeldt</span>
                ) : (
                  <span className="text-green-600">Aktiv</span>
                )
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </p>
          </div>
        </div>

        {/* Quiz Results */}
        <Section title={`Quiz resultater (${data.quiz_results.length})`}>
          {data.quiz_results.length === 0 ? (
            <p className="text-sm text-gray-400">Ingen quiz resultater</p>
          ) : (
            <div className="space-y-2">
              {data.quiz_results.map((q, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{fmtDate(q.created_at)}</span>
                    <span className="font-medium text-[#1B7A6E]">{q.estimated_savings as number} kr/md</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Services: {Array.isArray(q.selected_services) ? (q.selected_services as string[]).join(", ") : "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Subscriptions */}
        <Section title={`Abonnementer fundet (${data.subscriptions.length})`}>
          {data.subscriptions.length === 0 ? (
            <p className="text-sm text-gray-400">Ingen abonnementer fundet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="pb-2 pr-4">Navn</th>
                    <th className="pb-2 pr-4">Pris</th>
                    <th className="pb-2">Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {data.subscriptions.map((s, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-1.5 pr-4 font-medium">{s.name as string || s.merchant_name as string || "—"}</td>
                      <td className="py-1.5 pr-4">{s.price as number || s.amount as number || "—"} kr/md</td>
                      <td className="py-1.5 text-gray-500">{s.category as string || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Actions */}
        <Section title={`Handlinger (${data.actions.length})`}>
          {data.actions.length === 0 ? (
            <p className="text-sm text-gray-400">Ingen handlinger</p>
          ) : (
            <div className="space-y-1">
              {data.actions.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${a.type === "cancel" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                      {a.type === "cancel" ? "Opsig" : "Nedgrader"}
                    </span>
                    <span>{a.service_name as string || "—"}</span>
                  </div>
                  <span className="font-medium text-[#1B7A6E]">-{a.savings as number || 0} kr/md</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Payments */}
        <Section title={`Betalinger (${data.payments.length})`}>
          {data.payments.length === 0 ? (
            <p className="text-sm text-gray-400">Ingen betalinger</p>
          ) : (
            <div className="space-y-2">
              {data.payments.map((p, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm flex justify-between">
                  <div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${p.status === "captured" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {p.status as string}
                    </span>
                    <span className="ml-2 text-gray-500">{fmtDate(p.created_at || p.paid_at)}</span>
                  </div>
                  <span className="font-medium">{p.amount as number} kr</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        sort,
        order,
        page: String(page),
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [search, sort, order, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const toggleSort = (col: string) => {
    if (sort === col) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(col);
      setOrder("desc");
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sort !== col) return <span className="text-gray-300 ml-1">&uarr;&darr;</span>;
    return (
      <span className="text-[#1B7A6E] ml-1">
        {order === "asc" ? "\u2191" : "\u2193"}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Brugere{" "}
          <span className="text-gray-400 font-normal text-base">({total})</span>
        </h2>
        <input
          type="text"
          placeholder="Søg email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E] w-64"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th
                  onClick={() => toggleSort("email")}
                  className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                >
                  Email <SortIcon col="email" />
                </th>
                <th
                  onClick={() => toggleSort("created_at")}
                  className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
                >
                  Oprettet <SortIcon col="created_at" />
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spor
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  Abon.
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  Besparelse/md
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                  Tink
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                  Betalt
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                  Email opt-in
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                  Mon. aktiv
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-400">
                    Henter...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-400">
                    {search ? "Ingen brugere fundet" : "Ingen brugere endnu"}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString("da-DK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.track === "Quiz" ? "bg-blue-50 text-blue-600" :
                        user.track === "Monitoring" ? "bg-purple-50 text-purple-600" :
                        "bg-teal-50 text-teal-600"
                      }`}>
                        {user.track}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {statusBadge(user.status, user.statusColor)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">
                      {user.sub_count || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#1B7A6E]">
                      {user.savings_md
                        ? `${user.savings_md.toLocaleString("da-DK")} kr`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.tink_connected ? (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Ja</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">Nej</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.has_paid ? (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Ja</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">Nej</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.newsletter_consent === true ? (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Ja</span>
                      ) : user.newsletter_consent === false ? (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-600">Nej</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.monitoring_active ? (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Aktiv</span>
                      ) : user.track === "Monitoring" ? (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-600">Afmeldt</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Side {page} af {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Forrige
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Næste
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User detail modal */}
      {selectedUserId && (
        <UserDetailPanel userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}
