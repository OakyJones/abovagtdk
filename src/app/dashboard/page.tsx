"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Inspektoeren from "@/components/Inspektoeren";
import { services, getCancellationDate } from "@/lib/services";

interface Subscription {
  serviceName: string;
  knownServiceId?: string;
  monthlyAmount: number;
  transactionCount: number;
  lastSeen: string;
  matchedBy: "known_service" | "recurring_pattern";
  icon?: string;
}

type ActionType = "cancel" | "downgrade" | "keep" | null;

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected") === "true";
  const credentialsId = searchParams.get("credentialsId");
  const error = searchParams.get("error");

  const [step, setStep] = useState<"connect" | "scanning" | "results">(
    connected ? "scanning" : "connect"
  );
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [unknowns, setUnknowns] = useState<Subscription[]>([]);
  const [scanError, setScanError] = useState<string | null>(error || null);
  const [actions, setActions] = useState<Record<string, ActionType>>({});

  // Get userId from cookie or localStorage
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Try to get userId from localStorage (set during quiz)
    const stored = localStorage.getItem("abovagt_user_id");
    if (stored) setUserId(stored);
  }, []);

  // Auto-scan after bank connection
  useEffect(() => {
    if (connected && userId && step === "scanning") {
      runScan();
    }
  }, [connected, userId, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async () => {
    if (!userId) {
      setScanError("Du skal tage quizzen først for at forbinde din bank.");
      return;
    }

    try {
      const res = await fetch("/api/tink/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 503) {
          setScanError("Tink bankforbindelse er ikke aktiveret endnu. Vi arbejder på det!");
        } else {
          setScanError(data.error || "Kunne ikke oprette bankforbindelse");
        }
        return;
      }

      // Redirect to Tink Link
      window.location.href = data.url;
    } catch {
      setScanError("Kunne ikke oprette bankforbindelse");
    }
  };

  const runScan = async () => {
    setStep("scanning");
    setScanError(null);

    try {
      const res = await fetch("/api/tink/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, credentialsId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setScanError(data.error || "Scanning fejlede");
        setStep("connect");
        return;
      }

      setSubs(data.subscriptions || []);
      setUnknowns(data.unknownRecurring || []);
      setStep("results");
    } catch {
      setScanError("Scanning fejlede — prøv igen");
      setStep("connect");
    }
  };

  const totalMonthly = [...subs, ...unknowns].reduce(
    (sum, s) => sum + s.monthlyAmount,
    0
  );
  const totalSubs = subs.length + unknowns.length;

  const getServiceInfo = (sub: Subscription) => {
    if (sub.knownServiceId) {
      return services.find((s) => s.id === sub.knownServiceId);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <a href="/" className="text-xl font-bold tracking-tight">
              <span className="text-black">Abo</span>
              <span className="text-[#1B7A6E]">Vagt</span>
            </a>
            <span className="text-sm text-gray-500">Mit dashboard</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Step: Connect bank */}
        {step === "connect" && (
          <div className="max-w-md mx-auto text-center">
            <Inspektoeren
              pose="searching"
              size={120}
              speechBubble="Lad mig finde dine abonnementer!"
              className="mb-6"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A] mb-3">
              Forbind din bank
            </h1>
            <p className="text-gray-600 mb-8">
              Vi forbinder sikkert via Tink. Vi kan kun læse dine transaktioner
              — aldrig flytte penge.
            </p>

            {scanError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                <p className="text-sm text-red-700">{scanError}</p>
              </div>
            )}

            <button
              onClick={handleConnect}
              className="w-full px-6 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 text-lg"
            >
              Forbind min bank
            </button>

            <div className="mt-8 space-y-3">
              {[
                "Sikker forbindelse via Tink (reguleret af Finanstilsynet)",
                "Kun læseadgang — vi kan aldrig flytte penge",
                "Dine data slettes når du vil",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-left">
                  <svg
                    className="w-5 h-5 text-[#1B7A6E] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: Scanning */}
        {step === "scanning" && (
          <div className="max-w-md mx-auto text-center py-12">
            <Inspektoeren pose="searching" size={120} className="mb-6" />
            <h2 className="text-2xl font-bold text-[#1C2B2A] mb-3">
              Scanner dine transaktioner...
            </h2>
            <p className="text-gray-600 mb-8">
              Inspektøren leder efter abonnementer i dine banktransaktioner
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-3 border-[#1B7A6E] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* Step: Results */}
        {step === "results" && (
          <div>
            {/* Header with Inspektøren */}
            <div className="text-center mb-8">
              <Inspektoeren
                pose="pointing"
                size={120}
                speechBubble={`Jeg fandt ${totalSubs} abonnementer for ${totalMonthly.toLocaleString("da-DK")} kr/md!`}
                className="mb-4"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
                Dine abonnementer
              </h1>
              <p className="mt-2 text-gray-600 text-sm">
                Fundet via banktransaktioner fra de sidste 3 måneder
              </p>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Abonnementer fundet
                </p>
                <p className="text-3xl font-bold text-[#1C2B2A]">
                  {totalSubs}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Månedligt forbrug
                </p>
                <p className="text-3xl font-bold text-[#1C2B2A]">
                  {totalMonthly.toLocaleString("da-DK")} kr/md
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Årligt forbrug
                </p>
                <p className="text-3xl font-bold text-[#1C2B2A]">
                  {(totalMonthly * 12).toLocaleString("da-DK")} kr/år
                </p>
              </div>
            </div>

            {/* Known subscriptions */}
            {subs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#1C2B2A] mb-4 flex items-center gap-2">
                  <span className="text-[#1B7A6E]">&#x2713;</span> Genkendte
                  abonnementer
                </h2>
                <div className="space-y-3">
                  {subs.map((sub) => {
                    const svcInfo = getServiceInfo(sub);
                    const action = actions[sub.serviceName];
                    return (
                      <div
                        key={sub.serviceName}
                        className="bg-white rounded-xl border border-gray-200 px-5 py-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {sub.icon || "📦"}
                            </span>
                            <div>
                              <p className="font-semibold text-[#1C2B2A]">
                                {sub.serviceName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {sub.transactionCount} transaktioner fundet
                                {svcInfo && (
                                  <span className="ml-2 text-orange-600">
                                    {svcInfo.cancellation}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#1C2B2A]">
                              {sub.monthlyAmount} kr/md
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() =>
                              setActions({ ...actions, [sub.serviceName]: "cancel" })
                            }
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                              action === "cancel"
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            }`}
                          >
                            Opsig
                          </button>
                          {svcInfo?.downgrade && (
                            <button
                              onClick={() =>
                                setActions({
                                  ...actions,
                                  [sub.serviceName]: "downgrade",
                                })
                              }
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                action === "downgrade"
                                  ? "bg-[#1B7A6E] text-white border-[#1B7A6E]"
                                  : "bg-teal-50 text-[#1B7A6E] border-teal-200 hover:bg-teal-100"
                              }`}
                            >
                              Nedgrader
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setActions({ ...actions, [sub.serviceName]: "keep" })
                            }
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                              action === "keep"
                                ? "bg-gray-700 text-white border-gray-700"
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            Behold
                          </button>
                        </div>

                        {action === "cancel" && svcInfo && (
                          <div className="mt-3 bg-red-50 rounded-lg px-3 py-2.5 text-sm text-red-700">
                            Du kan spare <strong>{sub.monthlyAmount} kr/md</strong>
                            {svcInfo.cancellation !== "løbende" && (
                              <span>
                                {" "}— opsigelse træder i kraft{" "}
                                {getCancellationDate(svcInfo.cancellation)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unknown recurring */}
            {unknowns.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#1C2B2A] mb-4 flex items-center gap-2">
                  <span className="text-orange-500">?</span> Mulige
                  abonnementer
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Tilbagevendende betalinger vi ikke kunne genkende automatisk
                </p>
                <div className="space-y-3">
                  {unknowns.map((sub) => (
                    <div
                      key={sub.serviceName}
                      className="bg-white rounded-xl border border-gray-200 px-5 py-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📦</span>
                          <div>
                            <p className="font-semibold text-[#1C2B2A]">
                              {sub.serviceName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {sub.transactionCount} transaktioner •
                              Sidst set:{" "}
                              {new Date(sub.lastSeen).toLocaleDateString("da-DK")}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-[#1C2B2A]">
                          ~{sub.monthlyAmount} kr/md
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {subs.length === 0 && unknowns.length === 0 && (
              <div className="text-center py-12">
                <Inspektoeren pose="thumbsup" size={100} className="mb-4" />
                <p className="text-lg font-semibold text-[#1C2B2A]">
                  Ingen abonnementer fundet
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Vi fandt ingen tilbagevendende betalinger i dine
                  transaktioner
                </p>
              </div>
            )}

            {/* Summary */}
            {(subs.length > 0 || unknowns.length > 0) && (
              <div className="bg-[#1C2B2A] text-white rounded-2xl p-6 mb-8 text-center">
                <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
                  Samlet månedligt forbrug på abonnementer
                </p>
                <p className="text-4xl font-bold text-[#4ECDC4]">
                  {totalMonthly.toLocaleString("da-DK")} kr/md
                </p>
                <p className="text-sm text-white/50 mt-2">
                  = {(totalMonthly * 12).toLocaleString("da-DK")} kr/år
                </p>
              </div>
            )}

            {/* Back to home */}
            <div className="text-center">
              <a
                href="/"
                className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors"
              >
                ← Tilbage til forsiden
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
