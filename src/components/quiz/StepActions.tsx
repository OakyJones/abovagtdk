"use client";

import { useState, useMemo } from "react";
import {
  services,
  Service,
  getEffectivePrice,
  getSelectedTierLabel,
  getLowerTiers,
  getTierDowngrade,
} from "@/lib/services";
import Inspektoeren from "@/components/Inspektoeren";

type ActionType = "keep" | "downgrade" | "cancel";

export interface UserActions {
  actions: Record<string, ActionType>;
  downgradeTargets: Record<string, string>;
  totalSavings: number;
}

interface Props {
  selectedServices: string[];
  selectedPlans: Record<string, string>;
  customServices: { name: string; price: number }[];
  onBack: () => void;
  onNext: (userActions: UserActions) => void;
}

interface ServiceItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  isCustom: boolean;
  service?: Service;
  lowerTiers: { tierId: string; label: string; price: number; savingsPerMonth: number }[];
  legacyDowngrade?: { fromLabel: string; toLabel: string; savingsPerMonth: number };
}

export default function StepActions({
  selectedServices,
  selectedPlans,
  customServices,
  onBack,
  onNext,
}: Props) {
  const [actions, setActions] = useState<Record<string, ActionType>>({});
  const [downgradeTargets, setDowngradeTargets] = useState<Record<string, string>>({});

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
      isCustom: true,
      service: undefined,
      lowerTiers: [] as ServiceItem["lowerTiers"],
      legacyDowngrade: undefined,
    }));

    return [...known, ...custom];
  }, [selectedServices, selectedPlans, customServices]);

  const totalMonthly = allItems.reduce((sum, item) => sum + item.price, 0);

  const getAction = (id: string): ActionType => actions[id] || "keep";

  const hasDowngrade = (item: ServiceItem) =>
    item.lowerTiers.length > 0 || !!item.legacyDowngrade;

  const getDowngradeSavings = (item: ServiceItem): number => {
    if (item.lowerTiers.length > 0) {
      const targetId = downgradeTargets[item.id];
      const target = item.lowerTiers.find((t) => t.tierId === targetId);
      return target?.savingsPerMonth || item.lowerTiers[0].savingsPerMonth;
    }
    return item.legacyDowngrade?.savingsPerMonth || 0;
  };

  const cancelSavings = allItems
    .filter((item) => getAction(item.id) === "cancel")
    .reduce((sum, item) => sum + item.price, 0);

  const downgradeSavings = allItems
    .filter((item) => getAction(item.id) === "downgrade")
    .reduce((sum, item) => sum + getDowngradeSavings(item), 0);

  const totalSavings = cancelSavings + downgradeSavings;

  return (
    <div>
      <div className="text-center mb-6">
        <Inspektoeren pose="searching" size={80} className="mb-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
          Hvad vil du gøre med hvert abonnement?
        </h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">
          Vælg behold, nedgrader eller opsig for hvert abonnement
        </p>
      </div>

      {/* Live savings counter */}
      <div className={`sticky top-14 z-40 rounded-2xl p-4 mb-6 text-center transition-all ${
        totalSavings > 0
          ? "bg-[#1C2B2A] text-white"
          : "bg-gray-100 text-gray-600"
      }`}>
        <p className="text-xs uppercase tracking-wider opacity-60 mb-1">
          Din potentielle besparelse
        </p>
        <p className={`text-3xl font-bold ${totalSavings > 0 ? "text-[#4ECDC4]" : ""}`}>
          {totalSavings.toLocaleString("da-DK")} kr/md
        </p>
        {totalSavings > 0 && (
          <p className="text-sm opacity-50 mt-0.5">
            = {(totalSavings * 12).toLocaleString("da-DK")} kr/år
          </p>
        )}
      </div>

      {/* Service cards */}
      <div className="space-y-3 mb-8">
        {allItems.map((item) => {
          const action = getAction(item.id);
          const canDowngrade = hasDowngrade(item);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
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
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className={`font-semibold ${action === "cancel" ? "text-gray-400 line-through" : "text-[#1C2B2A]"}`}>
                        {item.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${action === "cancel" ? "text-gray-400 line-through" : "text-[#1C2B2A]"}`}>
                      {item.price} kr/md
                    </p>
                    {action === "cancel" && (
                      <p className="text-xs text-red-600 font-semibold">
                        Spar {item.price} kr/md
                      </p>
                    )}
                    {action === "downgrade" && (
                      <p className="text-xs text-orange-600 font-semibold">
                        Spar {getDowngradeSavings(item)} kr/md
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setActions((prev) => ({ ...prev, [item.id]: "keep" }));
                      window.umami?.track("quiz_action", { service: item.name, action: "keep" });
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${
                      action === "keep"
                        ? "bg-[#1B7A6E] text-white border-[#1B7A6E]"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Behold
                  </button>
                  {canDowngrade && (
                    <button
                      onClick={() => {
                        setActions((prev) => ({ ...prev, [item.id]: "downgrade" }));
                        window.umami?.track("quiz_action", { service: item.name, action: "downgrade" });
                      }}
                      className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${
                        action === "downgrade"
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-orange-600 border-orange-200 hover:bg-orange-50"
                      }`}
                    >
                      Nedgrader
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActions((prev) => ({ ...prev, [item.id]: "cancel" }));
                      window.umami?.track("quiz_action", { service: item.name, action: "cancel" });
                    }}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${
                      action === "cancel"
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white text-red-600 border-red-200 hover:bg-red-50"
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
                                onChange={() => setDowngradeTargets((prev) => ({ ...prev, [item.id]: tier.tierId }))}
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

                {/* Legacy downgrade info */}
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
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors"
          >
            ← Tilbage
          </button>
          <button
            type="button"
            onClick={() => onNext({ actions, downgradeTargets, totalSavings })}
            className="px-8 py-3 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20"
          >
            Se dit resultat →
          </button>
        </div>
      </div>
    </div>
  );
}
