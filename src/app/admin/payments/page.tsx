"use client";

import { useState, useEffect } from "react";

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  stripe_payment_id: string;
  status: string;
  paid_at: string;
  captured_at: string | null;
  users: { email: string } | null;
}

interface PaymentStats {
  totalRevenueMonth: number;
  totalAuthorizedMonth: number;
  totalRefundedMonth: number;
  totalPaymentsMonth: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [totalInDb, setTotalInDb] = useState<number | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      if (res.ok) {
        setPayments(data.payments || []);
        setStats(data.stats || null);
        setTotalInDb(data.totalInDb ?? null);
      } else {
        setFetchError(`${data.error || "Ukendt fejl"}${data.hint ? ` — hint: ${data.hint}` : ""}${data.code ? ` [${data.code}]` : ""}`);
        setTotalInDb(data.totalInDb ?? null);
      }
    } catch (err) {
      setFetchError("Netværksfejl: " + (err instanceof Error ? err.message : "Ukendt"));
    }
    setLoading(false);
  };

  const handleCapture = async (paymentIntentId: string) => {
    if (!confirm("Er du sikker på at du vil capture denne betaling?")) return;

    try {
      const res = await fetch("/api/stripe/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId }),
      });
      if (res.ok) {
        fetchPayments();
      }
    } catch {
      alert("Kunne ikke capture betaling");
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "authorized":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Reserveret
          </span>
        );
      case "captured":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Trukket
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Refunderet
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#1B7A6E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Betalinger</h2>
        <button
          onClick={fetchPayments}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Opdater
        </button>
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-red-800">Fejl ved hentning af betalinger:</p>
          <p className="text-sm text-red-700 mt-1">{fetchError}</p>
          {totalInDb !== null && (
            <p className="text-xs text-red-600 mt-1">
              Rows i payments-tabellen: {totalInDb}
            </p>
          )}
        </div>
      )}

      {/* Debug info when 0 shown but data exists */}
      {!fetchError && totalInDb !== null && payments.length === 0 && totalInDb > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-sm text-amber-800">
            Der er <span className="font-bold">{totalInDb}</span> betalinger i databasen, men forespørgslen returnerer 0.
            Muligt problem med kolonne-navne, foreign key join (users), eller RLS trods service_role_key.
          </p>
        </div>
      )}

      {/* Info when table is genuinely empty */}
      {!fetchError && totalInDb === 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <p className="text-sm text-blue-800">
            Payments-tabellen er tom (0 rows). Der er endnu ingen gennemførte betalinger.
            Betalinger oprettes når en bruger gennemfører hele flowet: kort → bank → scan → bekræft.
          </p>
        </div>
      )}

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border-2 border-green-100 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Omsætning denne md
            </p>
            <p className="text-3xl font-bold text-green-600">
              {stats.totalRevenueMonth.toLocaleString("da-DK")}{" "}
              <span className="text-lg font-semibold">kr</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl border-2 border-yellow-100 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Reserveret denne md
            </p>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.totalAuthorizedMonth.toLocaleString("da-DK")}{" "}
              <span className="text-lg font-semibold">kr</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl border-2 border-red-100 p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Refunderet denne md
            </p>
            <p className="text-3xl font-bold text-red-600">
              {stats.totalRefundedMonth.toLocaleString("da-DK")}{" "}
              <span className="text-lg font-semibold">kr</span>
            </p>
          </div>
          <div className="bg-[#1C2B2A] rounded-2xl p-5">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-2">
              Betalinger denne md
            </p>
            <p className="text-3xl font-bold text-[#4ECDC4]">
              {stats.totalPaymentsMonth}
            </p>
          </div>
        </div>
      )}

      {/* Payments table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">
            Seneste 50 betalinger
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
                  Beløb
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stripe ID
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                  Handling
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Ingen betalinger endnu
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-900 font-medium">
                      {(p.users as { email: string } | null)?.email || "Ukendt"}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {p.paid_at
                        ? new Date(p.paid_at).toLocaleDateString("da-DK", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-900">
                      {Number(p.amount).toLocaleString("da-DK")} kr
                    </td>
                    <td className="px-6 py-3 text-center">
                      {statusBadge(p.status)}
                    </td>
                    <td className="px-6 py-3 text-gray-500 font-mono text-xs">
                      {p.stripe_payment_id
                        ? `${p.stripe_payment_id.slice(0, 20)}...`
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {p.status === "authorized" && (
                        <button
                          onClick={() => handleCapture(p.stripe_payment_id)}
                          className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          Capture
                        </button>
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
