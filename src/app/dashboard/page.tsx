"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Inspektoeren from "@/components/Inspektoeren";
import { services, Service, ServiceTier, getCancellationDate } from "@/lib/services";

interface Subscription {
  serviceName: string;
  knownServiceId?: string;
  monthlyAmount: number;
  transactionCount: number;
  lastSeen: string;
  matchedBy: "known_service" | "recurring_pattern";
  icon?: string;
}

type ActionType = "keep" | "downgrade" | "cancel";

interface DashboardItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  transactionCount: number;
  lastSeen: string;
  isKnown: boolean;
  service?: Service;
  matchedTier?: ServiceTier;
  lowerTiers: { tierId: string; label: string; price: number; savingsPerMonth: number }[];
  legacyDowngrade?: { fromLabel: string; toLabel: string; savingsPerMonth: number };
  cancellation?: string;
}

/** Find the tier closest to a detected price */
function matchTierByPrice(service: Service, detectedPrice: number): ServiceTier | undefined {
  if (!service.tiers) return undefined;
  let best: ServiceTier | undefined;
  let bestDiff = Infinity;
  for (const tier of service.tiers) {
    const diff = Math.abs(tier.price - detectedPrice);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = tier;
    }
  }
  // Only match if within 30% of tier price
  if (best && bestDiff / best.price > 0.3) return undefined;
  return best;
}

/** Get all tiers cheaper than the matched tier */
function getLowerTiersFromTier(
  service: Service,
  matchedTier: ServiceTier
): DashboardItem["lowerTiers"] {
  if (!service.tiers) return [];
  const currentIndex = service.tiers.findIndex((t) => t.id === matchedTier.id);
  if (currentIndex <= 0) return [];
  return service.tiers
    .slice(0, currentIndex)
    .map((t) => ({
      tierId: t.id,
      label: t.label,
      price: t.price,
      savingsPerMonth: matchedTier.price - t.price,
    }))
    .reverse();
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Indlæser...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("connected") === "true";
  const credentialsId = searchParams.get("credentialsId");
  const tinkCode = searchParams.get("code");
  const error = searchParams.get("error");

  const [step, setStep] = useState<"connect" | "scanning" | "results">(
    connected ? "scanning" : "connect"
  );
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [unknowns, setUnknowns] = useState<Subscription[]>([]);
  const [scanError, setScanError] = useState<string | null>(error || null);
  const [actions, setActions] = useState<Record<string, ActionType>>({});
  const [downgradeTargets, setDowngradeTargets] = useState<Record<string, string>>({});

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("abovagt_user_id");
    if (stored) setUserId(stored);
  }, []);

  useEffect(() => {
    if (connected && userId && step === "scanning") {
      runScan();
    }
  }, [connected, userId, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async () => {
    if (!userId) {
      window.location.href = "/connect";
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
          setScanError(
            "Tink bankforbindelse er ikke aktiveret endnu. Vi arbejder på det!"
          );
        } else {
          setScanError(data.error || "Kunne ikke oprette bankforbindelse");
        }
        return;
      }

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
        body: JSON.stringify({ userId, credentialsId, code: tinkCode }),
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

  // Build unified list of all items with tier info
  const allItems: DashboardItem[] = useMemo(() => {
    const knownItems: DashboardItem[] = subs.map((sub) => {
      const service = sub.knownServiceId
        ? services.find((s) => s.id === sub.knownServiceId)
        : undefined;

      let matchedTier: ServiceTier | undefined;
      let lowerTiers: DashboardItem["lowerTiers"] = [];
      let legacyDowngrade: DashboardItem["legacyDowngrade"];

      if (service) {
        matchedTier = matchTierByPrice(service, sub.monthlyAmount);
        if (matchedTier) {
          lowerTiers = getLowerTiersFromTier(service, matchedTier);
        } else if (service.downgrade) {
          legacyDowngrade = service.downgrade;
        }
      }

      const displayName =
        matchedTier && service
          ? `${service.name} (${matchedTier.label})`
          : sub.serviceName;

      return {
        id: sub.serviceName,
        name: displayName,
        icon: sub.icon || "📦",
        price: sub.monthlyAmount,
        transactionCount: sub.transactionCount,
        lastSeen: sub.lastSeen,
        isKnown: true,
        service,
        matchedTier,
        lowerTiers,
        legacyDowngrade,
        cancellation: service?.cancellation,
      };
    });

    const unknownItems: DashboardItem[] = unknowns.map((sub) => ({
      id: sub.serviceName,
      name: sub.serviceName,
      icon: "📦",
      price: sub.monthlyAmount,
      transactionCount: sub.transactionCount,
      lastSeen: sub.lastSeen,
      isKnown: false,
      lowerTiers: [],
    }));

    return [...knownItems, ...unknownItems];
  }, [subs, unknowns]);

  // Initialize actions to "keep" for new items
  useEffect(() => {
    const initial: Record<string, ActionType> = {};
    allItems.forEach((item) => {
      if (!actions[item.id]) initial[item.id] = "keep";
    });
    if (Object.keys(initial).length > 0) {
      setActions((prev) => ({ ...initial, ...prev }));
    }
  }, [allItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalMonthly = allItems.reduce((sum, item) => sum + item.price, 0);
  const totalSubs = allItems.length;

  // Dynamic savings
  const cancelledItems = allItems.filter((item) => actions[item.id] === "cancel");
  const downgradedItems = allItems.filter((item) => actions[item.id] === "downgrade");

  const cancelSavings = cancelledItems.reduce((sum, item) => sum + item.price, 0);

  const getDowngradeSavingsForItem = (item: DashboardItem): number => {
    if (item.lowerTiers.length > 0) {
      const targetTierId = downgradeTargets[item.id];
      const target = item.lowerTiers.find((t) => t.tierId === targetTierId);
      return target?.savingsPerMonth || item.lowerTiers[0].savingsPerMonth;
    }
    return item.legacyDowngrade?.savingsPerMonth || 0;
  };

  const downgradeSavings = downgradedItems.reduce(
    (sum, item) => sum + getDowngradeSavingsForItem(item),
    0
  );

  const totalSavings = cancelSavings + downgradeSavings;
  const hasDowngrade = (item: DashboardItem) =>
    item.lowerTiers.length > 0 || !!item.legacyDowngrade;

  const setAction = (id: string, action: ActionType) => {
    setActions((prev) => ({ ...prev, [id]: action }));
  };

  const setDowngradeTarget = (id: string, tierId: string) => {
    setDowngradeTargets((prev) => ({ ...prev, [id]: tierId }));
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
                speechBubble={
                  totalSavings > 0
                    ? `Du kan spare ${totalSavings.toLocaleString("da-DK")} kr/md!`
                    : `Jeg fandt ${totalSubs} abonnementer for ${totalMonthly.toLocaleString("da-DK")} kr/md!`
                }
                className="mb-4"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
                Dine abonnementer
              </h1>
              <p className="mt-2 text-gray-600 text-sm">
                Vælg hvad du vil gøre med hvert abonnement
              </p>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
              <div
                className={`rounded-2xl border-2 p-5 text-center transition-all ${
                  totalSavings > 0
                    ? "bg-teal-50 border-[#1B7A6E]"
                    : "bg-white border-gray-200"
                }`}
              >
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Din besparelse
                </p>
                <p
                  className={`text-3xl font-bold ${
                    totalSavings > 0 ? "text-[#1B7A6E]" : "text-[#1C2B2A]"
                  }`}
                >
                  {totalSavings.toLocaleString("da-DK")} kr/md
                </p>
              </div>
            </div>

            {/* All subscriptions with action buttons */}
            {allItems.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#1C2B2A] mb-4">
                  Dine abonnementer
                </h2>
                <div className="space-y-3">
                  {allItems.map((item) => {
                    const action = actions[item.id] || "keep";
                    const canDowngrade = hasDowngrade(item);

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border overflow-hidden transition-all ${
                          action === "cancel"
                            ? "border-red-300"
                            : action === "downgrade"
                            ? "border-orange-300"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="px-5 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{item.icon}</span>
                              <div>
                                <p
                                  className={`font-semibold ${
                                    action === "cancel"
                                      ? "text-gray-400 line-through"
                                      : "text-[#1C2B2A]"
                                  }`}
                                >
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.transactionCount} transaktioner fundet
                                  {item.cancellation &&
                                    item.cancellation !== "løbende" && (
                                      <span className="ml-2 text-orange-600">
                                        {item.cancellation}
                                      </span>
                                    )}
                                  {!item.isKnown && (
                                    <span className="ml-2 text-orange-500">
                                      Muligt abonnement
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-bold ${
                                  action === "cancel"
                                    ? "text-gray-400 line-through"
                                    : "text-[#1C2B2A]"
                                }`}
                              >
                                {item.price} kr/md
                              </p>
                              {action === "cancel" && (
                                <p className="text-xs text-red-600 font-medium">
                                  Spar {item.price} kr/md
                                </p>
                              )}
                              {action === "downgrade" && (
                                <p className="text-xs text-orange-600 font-medium">
                                  Spar {getDowngradeSavingsForItem(item)} kr/md
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => setAction(item.id, "keep")}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                action === "keep"
                                  ? "bg-gray-700 text-white border-gray-700"
                                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              Behold
                            </button>
                            {canDowngrade && (
                              <button
                                onClick={() => setAction(item.id, "downgrade")}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                  action === "downgrade"
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                                }`}
                              >
                                Nedgrader
                              </button>
                            )}
                            <button
                              onClick={() => setAction(item.id, "cancel")}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                action === "cancel"
                                  ? "bg-red-500 text-white border-red-500"
                                  : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                              }`}
                            >
                              Opsig
                            </button>
                          </div>

                          {/* Downgrade tier picker */}
                          {action === "downgrade" &&
                            item.lowerTiers.length > 0 && (
                              <div className="mt-3 bg-orange-50 rounded-lg px-4 py-3 border border-orange-100">
                                <p className="text-xs text-orange-700 font-semibold mb-2">
                                  Vælg billigere plan:
                                </p>
                                <div className="space-y-1.5">
                                  {item.lowerTiers.map((tier) => {
                                    const isSelected =
                                      (downgradeTargets[item.id] ||
                                        item.lowerTiers[0].tierId) ===
                                      tier.tierId;
                                    return (
                                      <label
                                        key={tier.tierId}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                          isSelected
                                            ? "bg-orange-100 border border-orange-300"
                                            : "bg-white border border-gray-200 hover:bg-orange-50"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="radio"
                                            name={`downgrade-${item.id}`}
                                            checked={isSelected}
                                            onChange={() =>
                                              setDowngradeTarget(
                                                item.id,
                                                tier.tierId
                                              )
                                            }
                                            className="w-3.5 h-3.5 text-orange-500 focus:ring-orange-400"
                                          />
                                          <span className="text-sm text-gray-800">
                                            {item.service?.name} {tier.label}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {tier.price} kr/md
                                          </span>
                                        </div>
                                        <span className="text-xs font-bold text-orange-600">
                                          Spar {tier.savingsPerMonth} kr/md
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          {/* Legacy downgrade info */}
                          {action === "downgrade" &&
                            item.lowerTiers.length === 0 &&
                            item.legacyDowngrade && (
                              <div className="mt-3 bg-orange-50 rounded-lg px-3 py-2.5 flex items-start gap-2">
                                <svg
                                  className="w-4 h-4 text-orange-500 mt-0.5 shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                  />
                                </svg>
                                <p className="text-sm text-orange-700">
                                  <span className="font-medium">
                                    {item.legacyDowngrade.fromLabel}
                                  </span>
                                  {" → "}
                                  <span className="font-medium">
                                    {item.legacyDowngrade.toLabel}
                                  </span>
                                  {" — spar "}
                                  <span className="font-bold">
                                    {item.legacyDowngrade.savingsPerMonth} kr/md
                                  </span>
                                </p>
                              </div>
                            )}

                          {/* Cancel info */}
                          {action === "cancel" &&
                            item.cancellation &&
                            item.cancellation !== "løbende" && (
                              <div className="mt-3 bg-red-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                                <svg
                                  className="w-4 h-4 text-red-500 shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <p className="text-xs text-red-700">
                                  <span className="font-semibold">OBS:</span>{" "}
                                  {item.service?.name || item.name} har{" "}
                                  {item.cancellation} — du sparer fra{" "}
                                  {getCancellationDate(
                                    item.cancellation as
                                      | "løbende"
                                      | "1 md opsigelse"
                                      | "12 md binding"
                                  )}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No results */}
            {allItems.length === 0 && (
              <div className="text-center py-12">
                <Inspektoeren pose="thumbsup" size={100} className="mb-4" />
                <p className="text-lg font-semibold text-[#1C2B2A]">
                  Ingen abonnementer fundet
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Vi fandt ingen tilbagevendende betalinger i dine transaktioner
                </p>
              </div>
            )}

            {/* Dynamic savings summary */}
            {allItems.length > 0 && (
              <div className="bg-[#1C2B2A] text-white rounded-2xl p-6 mb-8">
                <h3 className="text-lg font-bold mb-4 text-center">
                  Din samlede besparelse
                </h3>

                {cancelledItems.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-white/80">
                      Opsigelser:{" "}
                      <span className="font-bold text-white">
                        {cancelSavings.toLocaleString("da-DK")} kr/md
                      </span>
                      <span className="text-white/50 ml-1">
                        ({cancelledItems.length}{" "}
                        {cancelledItems.length === 1
                          ? "abonnement"
                          : "abonnementer"}
                        )
                      </span>
                    </p>
                    <div className="mt-1.5 space-y-1">
                      {cancelledItems.map((item) => (
                        <p
                          key={item.id}
                          className="text-xs text-white/50 pl-2"
                        >
                          {item.icon} {item.name}: {item.price} kr/md
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {downgradedItems.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-white/80">
                      Nedgraderinger:{" "}
                      <span className="font-bold text-[#4ECDC4]">
                        {downgradeSavings.toLocaleString("da-DK")} kr/md
                      </span>
                      <span className="text-white/50 ml-1">
                        ({downgradedItems.length}{" "}
                        {downgradedItems.length === 1
                          ? "abonnement"
                          : "abonnementer"}
                        )
                      </span>
                    </p>
                    <div className="mt-1.5 space-y-1">
                      {downgradedItems.map((item) => (
                        <p
                          key={item.id}
                          className="text-xs text-white/50 pl-2"
                        >
                          {item.icon} {item.name}: spar{" "}
                          {getDowngradeSavingsForItem(item)} kr/md
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-white/20 mt-4 pt-4 text-center">
                  <p className="text-xs text-white/60 uppercase tracking-wider">
                    Samlet besparelse
                  </p>
                  <p className="text-4xl font-bold text-[#4ECDC4]">
                    {totalSavings.toLocaleString("da-DK")} kr/md
                  </p>
                  {totalSavings > 0 && (
                    <p className="text-sm text-white/50 mt-1">
                      = {(totalSavings * 12).toLocaleString("da-DK")} kr/år
                    </p>
                  )}
                </div>

                {totalSavings === 0 && (
                  <p className="text-center text-sm text-white/60 mt-2">
                    Vælg &quot;Opsig&quot; eller &quot;Nedgrader&quot; ovenfor
                    for at se din besparelse
                  </p>
                )}
              </div>
            )}

            {/* Pricing CTA */}
            {totalSavings > 0 && (() => {
              const fee = Math.round(totalSavings * 0.25);
              const kept = totalSavings - fee;
              return (
                <div className="relative bg-teal-50 rounded-2xl border-2 border-[#1B7A6E] p-6 sm:p-8 mb-8">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                    Din pris
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5 mt-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Din besparelse
                        </span>
                        <span className="text-sm font-bold text-[#1C2B2A]">
                          {totalSavings.toLocaleString("da-DK")} kr/md
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Du betaler
                        </span>
                        <span className="text-sm font-bold text-[#1C2B2A]">
                          {fee.toLocaleString("da-DK")} kr (en gang)
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#1B7A6E]">
                          Du beholder
                        </span>
                        <span className="text-lg font-bold text-[#1B7A6E]">
                          {kept.toLocaleString("da-DK")} kr/md — hver måned
                          fremover
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-center text-xs text-gray-500">
                    Ingen binding. Ingen skjulte gebyrer. Du betaler kun en
                    gang.
                  </p>
                </div>
              );
            })()}

            {/* Monitoring upsell */}
            {allItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#1C2B2A] mb-1">
                      AboVagt Monitoring
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Vi scanner dine transaktioner kvartalsvis og giver dig besked
                      ved nye abonnementer eller prisændringer.
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-[#1C2B2A]">
                        15 kr/md
                      </span>
                      <span className="text-xs text-gray-500">
                        Kvartalsvis scanning &middot; Opsig når som helst
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Back to home */}
            <div className="text-center">
              <a
                href="/"
                className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors"
              >
                &larr; Tilbage til forsiden
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
