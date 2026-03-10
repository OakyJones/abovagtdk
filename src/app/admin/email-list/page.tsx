"use client";

import { useState, useEffect, useCallback } from "react";

interface EmailUser {
  id: string;
  email: string;
  created_at: string;
  newsletter_consent: boolean;
  contact_status: string;
  quiz_date: string;
  monthly_savings: number;
  monthly_cost: number;
  service_count: number;
}

interface Stats {
  total: number;
  newsletter: number;
  highSavings: number;
}

type Segment = "all" | "high-savings";

const statusLabels: Record<string, string> = {
  none: "Ikke kontaktet",
  contacted: "Kontaktet",
  converted: "Konverteret",
};

const statusColors: Record<string, string> = {
  none: "bg-gray-100 text-gray-600",
  contacted: "bg-blue-100 text-blue-700",
  converted: "bg-green-100 text-green-700",
};

export default function EmailListPage() {
  const [users, setUsers] = useState<EmailUser[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, newsletter: 0, highSavings: 0 });
  const [segment, setSegment] = useState<Segment>("all");
  const [newsletterOnly, setNewsletterOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (segment !== "all") params.set("segment", segment);
    if (newsletterOnly) params.set("newsletter", "true");

    const res = await fetch(`/api/admin/email-list?${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setStats(data.stats || { total: 0, newsletter: 0, highSavings: 0 });
    setLoading(false);
  }, [segment, newsletterOnly]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (userId: string, contact_status: string) => {
    await fetch("/api/admin/email-list", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, contact_status }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, contact_status } : u))
    );
  };

  const exportCSV = () => {
    const header = "Email,Quiz dato,Estimeret besparelse (kr/md),Månedligt forbrug (kr/md),Antal abonnementer,Newsletter,Status\n";
    const rows = users
      .map((u) =>
        [
          u.email,
          new Date(u.quiz_date).toLocaleDateString("da-DK"),
          u.monthly_savings,
          u.monthly_cost,
          u.service_count,
          u.newsletter_consent ? "Ja" : "Nej",
          statusLabels[u.contact_status] || u.contact_status,
        ].join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const segmentLabel = segment === "high-savings" ? "hoej-besparelse" : "alle";
    a.download = `abovagt-emails-${segmentLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email liste</h1>
        <button
          onClick={exportCSV}
          disabled={users.length === 0}
          className="px-4 py-2 bg-[#1B7A6E] text-white text-sm font-medium rounded-lg hover:bg-[#155F56] transition-colors disabled:opacity-40"
        >
          Eksporter CSV ({users.length})
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Total emails
          </p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Newsletter samtykke
          </p>
          <p className="text-2xl font-bold text-[#1B7A6E]">{stats.newsletter}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Høj besparelse (&gt;300 kr/md)
          </p>
          <p className="text-2xl font-bold text-orange-600">{stats.highSavings}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(
            [
              ["all", "Alle"],
              ["high-savings", "Høj besparelse (>300 kr/md)"],
            ] as [Segment, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSegment(key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                segment === key
                  ? "bg-[#1B7A6E] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={newsletterOnly}
            onChange={(e) => setNewsletterOnly(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#1B7A6E] focus:ring-[#1B7A6E]"
          />
          <span className="text-sm text-gray-600">Kun med newsletter samtykke</span>
        </label>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Indlæser...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Ingen brugere i dette segment
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Quiz dato
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">
                    Besparelse
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">
                    Forbrug
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">
                    Abo.
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">
                    NL
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(u.quiz_date).toLocaleDateString("da-DK")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#1B7A6E]">
                      {u.monthly_savings > 0
                        ? `${u.monthly_savings} kr/md`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {u.monthly_cost} kr/md
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {u.service_count}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.newsletter_consent ? (
                        <span className="text-green-600" title="Newsletter samtykke">
                          ✓
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.contact_status}
                        onChange={(e) => updateStatus(u.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${
                          statusColors[u.contact_status] || statusColors.none
                        }`}
                      >
                        <option value="none">Ikke kontaktet</option>
                        <option value="contacted">Kontaktet</option>
                        <option value="converted">Konverteret</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GDPR notice */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>GDPR:</strong> Kun brugere med newsletter samtykke (NL ✓) må
          kontaktes med markedsføring. Alle emails skal indeholde afmeldingslink.
          Quiz-resultat emails sendes kun med brugerens udtrykkelige accept.
        </p>
      </div>
    </div>
  );
}
