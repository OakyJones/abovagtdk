"use client";

import { useEffect, useState, useMemo } from "react";
import {
  services,
  Service,
  UsageFrequency,
  frequencyLabels,
  getCancellationDate,
  getEffectivePrice,
  getSelectedTierLabel,
  getTierDowngrade,
  getLowerTiers,
} from "@/lib/services";
import Inspektoeren from "@/components/Inspektoeren";

interface Props {
  selectedServices: string[];
  selectedPlans: Record<string, string>;
  customServices: { name: string; price: number }[];
  usageFrequency: Record<string, UsageFrequency>;
  onBack: () => void;
  onSave: (
    monthlyCost: number,
    monthlySavings: number,
    userActions: Record<string, { action: string; downgradeToTier?: string }>
  ) => void;
}

type ActionType = "keep" | "downgrade" | "cancel";

interface ServiceItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  freq: UsageFrequency;
  cancellation: string;
  isCustom: boolean;
  service?: Service;
  lowerTiers: { tierId: string; label: string; price: number; savingsPerMonth: number }[];
  legacyDowngrade?: { fromLabel: string; toLabel: string; savingsPerMonth: number };
}

export default function StepResult({
  selectedServices,
  selectedPlans,
  customServices,
  usageFrequency,
  onBack,
  onSave,
}: Props) {
  const [actions, setActions] = useState<Record<string, ActionType>>({});
  const [downgradeTargets, setDowngradeTargets] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  // Build unified list of all services
  const allItems: ServiceItem[] = useMemo(() => {
    const known = services
      .filter((s) => selectedServices.includes(s.id))
      .map((s) => {
        const price = getEffectivePrice(s, selectedPlans);
        const tierLabel = getSelectedTierLabel(s, selectedPlans);
        const lowerTiers = getLowerTiers(s, selectedPlans);
        const legacyDowngrade = !s.tiers ? getTierDowngrade(s, selectedPlans) || undefined : undefined;
        return {
          id: s.id,
          name: tierLabel ? `${s.name} (${tierLabel})` : s.name,
          icon: s.icon,
          price,
          freq: usageFrequency[s.id],
          cancellation: s.cancellation,
          isCustom: false,
          service: s,
          lowerTiers,
          legacyDowngrade,
        };
      });

    const custom = customServices.map((c) => ({
      id: c.name,
      name: c.name,
      icon: "📦",
      price: c.price,
      freq: usageFrequency[c.name],
      cancellation: "løbende",
      isCustom: true,
      service: undefined,
      lowerTiers: [],
      legacyDowngrade: undefined,
    }));

    return [...known, ...custom];
  }, [selectedServices, selectedPlans, customServices, usageFrequency]);

  // Initialize all actions to "keep"
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

  // Calculate dynamic savings based on user choices
  const cancelledItems = allItems.filter((item) => actions[item.id] === "cancel");
  const downgradedItems = allItems.filter((item) => actions[item.id] === "downgrade");

  const cancelSavings = cancelledItems.reduce((sum, item) => sum + item.price, 0);

  const downgradeSavings = downgradedItems.reduce((sum, item) => {
    if (item.lowerTiers.length > 0) {
      const targetTierId = downgradeTargets[item.id];
      const target = item.lowerTiers.find((t) => t.tierId === targetTierId);
      return sum + (target?.savingsPerMonth || item.lowerTiers[0].savingsPerMonth);
    }
    if (item.legacyDowngrade) {
      return sum + item.legacyDowngrade.savingsPerMonth;
    }
    return sum;
  }, 0);

  const totalSavings = cancelSavings + downgradeSavings;

  // Save once when component mounts (and again when actions change via effect)
  useEffect(() => {
    if (saved) return;
    const userActions: Record<string, { action: string; downgradeToTier?: string }> = {};
    allItems.forEach((item) => {
      const action = actions[item.id] || "keep";
      userActions[item.id] = { action };
      if (action === "downgrade" && downgradeTargets[item.id]) {
        userActions[item.id].downgradeToTier = downgradeTargets[item.id];
      }
    });
    onSave(totalMonthly, totalSavings, userActions);
    setSaved(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setAction = (id: string, action: ActionType) => {
    setActions((prev) => ({ ...prev, [id]: action }));
  };

  const setDowngradeTarget = (id: string, tierId: string) => {
    setDowngradeTargets((prev) => ({ ...prev, [id]: tierId }));
  };

  const hasDowngrade = (item: ServiceItem) =>
    item.lowerTiers.length > 0 || !!item.legacyDowngrade;

  const getDowngradeSavingsForItem = (item: ServiceItem): number => {
    if (item.lowerTiers.length > 0) {
      const targetTierId = downgradeTargets[item.id];
      const target = item.lowerTiers.find((t) => t.tierId === targetTierId);
      return target?.savingsPerMonth || item.lowerTiers[0].savingsPerMonth;
    }
    return item.legacyDowngrade?.savingsPerMonth || 0;
  };

  return (
    <div>
      {/* Header with Inspektoeren */}
      <div className="text-center mb-8 sm:mb-10">
        <Inspektoeren
          pose="waving"
          size={120}
          speechBubble={
            totalSavings > 0
              ? `Du kan spare ${totalSavings.toLocaleString("da-DK")} kr/md!`
              : "Flot — du bruger dine abonnementer godt!"
          }
          className="mb-4"
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
          Dit resultat
        </h1>
        <p className="mt-2 text-gray-600 text-sm">
          Vælg hvad du vil gøre med hvert abonnement
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Månedligt forbrug</p>
          <p className="text-3xl font-bold text-[#1C2B2A]">
            {totalMonthly.toLocaleString("da-DK")} kr/md
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Årligt forbrug</p>
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
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Din besparelse</p>
          <p
            className={`text-3xl font-bold ${
              totalSavings > 0 ? "text-[#1B7A6E]" : "text-[#1C2B2A]"
            }`}
          >
            {totalSavings.toLocaleString("da-DK")} kr/md
          </p>
        </div>
      </div>

      {/* All services with action buttons */}
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
                        <p className={`font-semibold ${action === "cancel" ? "text-gray-400 line-through" : "text-[#1C2B2A]"}`}>
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Brugt:{" "}
                          <span
                            className={`font-medium ${
                              item.freq === "never"
                                ? "text-red-600"
                                : item.freq === "rarely"
                                ? "text-orange-600"
                                : item.freq === "weekly"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          >
                            {frequencyLabels[item.freq]}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${action === "cancel" ? "text-gray-400 line-through" : "text-[#1C2B2A]"}`}>
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
                  {action === "downgrade" && item.lowerTiers.length > 0 && (
                    <div className="mt-3 bg-orange-50 rounded-lg px-4 py-3 border border-orange-100">
                      <p className="text-xs text-orange-700 font-semibold mb-2">Vælg billigere plan:</p>
                      <div className="space-y-1.5">
                        {item.lowerTiers.map((tier) => {
                          const isSelected = (downgradeTargets[item.id] || item.lowerTiers[0].tierId) === tier.tierId;
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
                                  onChange={() => setDowngradeTarget(item.id, tier.tierId)}
                                  className="w-3.5 h-3.5 text-orange-500 focus:ring-orange-400"
                                />
                                <span className="text-sm text-gray-800">
                                  {item.service?.name} {tier.label}
                                </span>
                                <span className="text-xs text-gray-500">{tier.price} kr/md</span>
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

                  {/* Legacy downgrade info (services without tiers, like SATS/Dropbox) */}
                  {action === "downgrade" && item.lowerTiers.length === 0 && item.legacyDowngrade && (
                    <div className="mt-3 bg-orange-50 rounded-lg px-3 py-2.5 flex items-start gap-2">
                      <svg className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <p className="text-sm text-orange-700">
                        <span className="font-medium">{item.legacyDowngrade.fromLabel}</span>
                        {" → "}
                        <span className="font-medium">{item.legacyDowngrade.toLabel}</span>
                        {" — spar "}
                        <span className="font-bold">{item.legacyDowngrade.savingsPerMonth} kr/md</span>
                      </p>
                    </div>
                  )}

                  {/* Cancel info */}
                  {action === "cancel" && item.cancellation !== "løbende" && (
                    <div className="mt-3 bg-red-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-red-700">
                        <span className="font-semibold">OBS:</span> {item.service?.name || item.name} har {item.cancellation} — du sparer fra {getCancellationDate(item.cancellation as "løbende" | "1 md opsigelse" | "12 md binding")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic savings summary */}
      <div className="bg-[#1C2B2A] text-white rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-bold mb-4 text-center">Din samlede besparelse</h3>

        {cancelledItems.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/80">
                Du sparer <span className="font-bold text-white">{cancelSavings.toLocaleString("da-DK")} kr/md</span> ved at opsige {cancelledItems.length} {cancelledItems.length === 1 ? "abonnement" : "abonnementer"}
              </p>
            </div>
            <div className="mt-1.5 space-y-1">
              {cancelledItems.map((item) => (
                <p key={item.id} className="text-xs text-white/50 pl-2">
                  {item.icon} {item.name}: {item.price} kr/md
                </p>
              ))}
            </div>
          </div>
        )}

        {downgradedItems.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/80">
                Du sparer <span className="font-bold text-[#4ECDC4]">{downgradeSavings.toLocaleString("da-DK")} kr/md</span> ved at nedgradere {downgradedItems.length} {downgradedItems.length === 1 ? "abonnement" : "abonnementer"}
              </p>
            </div>
            <div className="mt-1.5 space-y-1">
              {downgradedItems.map((item) => (
                <p key={item.id} className="text-xs text-white/50 pl-2">
                  {item.icon} {item.name}: spar {getDowngradeSavingsForItem(item)} kr/md
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-white/20 mt-4 pt-4 text-center">
          <p className="text-xs text-white/60 uppercase tracking-wider">Samlet besparelse</p>
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
            Vælg &quot;Opsig&quot; eller &quot;Nedgrader&quot; ovenfor for at se din besparelse
          </p>
        )}
      </div>

      {/* CTA: Skal vi hjælpe dig? */}
      <div className="relative bg-teal-50 rounded-2xl border-2 border-[#1B7A6E] p-6 sm:p-8 mb-8">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
          Anbefalet
        </div>

        <div className="flex items-start justify-between mt-1 mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C2B2A]">
            Skal vi hjælpe dig?
          </h2>
          <Inspektoeren pose="searching" size={48} />
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Vi forbinder til din bank, finder alle dine abonnementer, og laver
          færdige opsigelsesmails du selv sender.
        </p>

        {totalSavings > 0 && (() => {
          const fee = Math.round(totalSavings * 0.25);
          const kept = totalSavings - fee;
          return (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Din besparelse</span>
                  <span className="text-sm font-bold text-[#1C2B2A]">{totalSavings.toLocaleString("da-DK")} kr/md</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Du betaler</span>
                  <span className="text-sm font-bold text-[#1C2B2A]">{fee.toLocaleString("da-DK")} kr (en gang)</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1B7A6E]">Du beholder</span>
                  <span className="text-lg font-bold text-[#1B7A6E]">{kept.toLocaleString("da-DK")} kr/md — hver måned fremover</span>
                </div>
              </div>
            </div>
          );
        })()}

        <a
          href="/connect"
          className="block w-full text-center px-6 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 text-lg"
        >
          Find mine abonnementer &rarr;
        </a>

        <p className="mt-4 text-center text-xs text-gray-500">
          Ingen binding. Ingen skjulte gebyrer. Du betaler kun en gang.
        </p>
      </div>

      {/* Back */}
      <div className="text-center">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors"
        >
          &larr; Tilbage til forbrugsvalg
        </button>
      </div>
    </div>
  );
}
