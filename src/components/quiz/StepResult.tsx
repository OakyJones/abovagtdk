"use client";

import { useEffect, useState } from "react";
import {
  services,
  UsageFrequency,
  frequencyLabels,
  formatPrice,
  getEstimatedSavings,
  getCancellationDate,
  getEffectivePrice,
  getSelectedTierLabel,
  getTierDowngrade,
} from "@/lib/services";
import Inspektoeren from "@/components/Inspektoeren";

interface Props {
  selectedServices: string[];
  selectedPlans: Record<string, string>;
  customServices: { name: string; price: number }[];
  usageFrequency: Record<string, UsageFrequency>;
  onBack: () => void;
  onSave: (monthlyCost: number, monthlySavings: number) => void;
}

type ActionType = "cancel" | "downgrade" | "keep";

export default function StepResult({
  selectedServices,
  selectedPlans,
  customServices,
  usageFrequency,
  onBack,
  onSave,
}: Props) {
  const selectedServiceObjects = services.filter((s) =>
    selectedServices.includes(s.id)
  );

  const totalMonthly =
    selectedServiceObjects.reduce((sum, s) => sum + getEffectivePrice(s, selectedPlans), 0) +
    customServices.reduce((sum, c) => sum + c.price, 0);

  const { monthlySavings, wastedServices } = getEstimatedSavings(
    selectedServices,
    usageFrequency,
    selectedPlans
  );

  const wastedCustom = customServices.filter(
    (c) =>
      usageFrequency[c.name] === "rarely" ||
      usageFrequency[c.name] === "never"
  );
  const customWaste = wastedCustom.reduce((sum, c) => sum + c.price, 0);

  // Downgrade candidates: services used daily/weekly that have a downgrade path
  const downgradeServices = selectedServiceObjects.filter((s) => {
    const downgrade = getTierDowngrade(s, selectedPlans);
    return (
      downgrade &&
      (usageFrequency[s.id] === "daily" || usageFrequency[s.id] === "weekly")
    );
  });
  const downgradeSavings = downgradeServices.reduce(
    (sum, s) => sum + (getTierDowngrade(s, selectedPlans)?.savingsPerMonth || 0),
    0
  );

  const totalMonthlySavings = monthlySavings + customWaste;
  const grandTotalMonthly = totalMonthlySavings + downgradeSavings;

  // Track user actions per service
  const [actions, setActions] = useState<Record<string, ActionType>>({});

  const setAction = (id: string, action: ActionType) => {
    setActions((prev) => ({ ...prev, [id]: action }));
  };

  useEffect(() => {
    onSave(totalMonthly, grandTotalMonthly);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allWasted = [
    ...wastedServices.map((s) => {
      const price = getEffectivePrice(s, selectedPlans);
      const tierLabel = getSelectedTierLabel(s, selectedPlans);
      return {
        id: s.id,
        name: tierLabel ? `${s.name} (${tierLabel})` : s.name,
        icon: s.icon,
        price,
        priceLabel: `${price} kr/md`,
        freq: usageFrequency[s.id],
        cancellation: s.cancellation,
        downgrade: getTierDowngrade(s, selectedPlans),
      };
    }),
    ...wastedCustom.map((c) => ({
      id: c.name,
      name: c.name,
      icon: "📦",
      price: c.price,
      priceLabel: `${c.price} kr/md`,
      freq: usageFrequency[c.name],
      cancellation: "løbende" as const,
      downgrade: undefined,
    })),
  ];

  return (
    <div>
      {/* Header with Inspektøren */}
      <div className="text-center mb-8 sm:mb-10">
        <Inspektoeren
          pose="waving"
          size={120}
          speechBubble={
            grandTotalMonthly > 0
              ? `Du kan spare ${grandTotalMonthly.toLocaleString("da-DK")} kr/md!`
              : "Flot — du bruger dine abonnementer godt!"
          }
          className="mb-4"
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
          Dit resultat
        </h1>
        <p className="mt-2 text-gray-600 text-sm">
          Her er en oversigt over dine abonnementer og besparelser
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
          className={`rounded-2xl border-2 p-5 text-center ${
            grandTotalMonthly > 0
              ? "bg-teal-50 border-[#1B7A6E]"
              : "bg-white border-gray-200"
          }`}
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mulig besparelse</p>
          <p
            className={`text-3xl font-bold ${
              grandTotalMonthly > 0 ? "text-[#1B7A6E]" : "text-[#1C2B2A]"
            }`}
          >
            {grandTotalMonthly.toLocaleString("da-DK")} kr/md
          </p>
        </div>
      </div>

      {/* Wasted services — cancel suggestions */}
      {allWasted.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#1C2B2A] mb-1 flex items-center gap-2">
            <span className="text-red-500">&#x2716;</span> Abonnementer du kan opsige
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Du bruger disse sjældent eller aldrig — spar {totalMonthlySavings.toLocaleString("da-DK")} kr/md
          </p>
          <div className="space-y-3">
            {allWasted.map((item) => {
              const action = actions[item.id];
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="font-semibold text-[#1C2B2A]">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            Brugt: <span className={`font-medium ${item.freq === "never" ? "text-red-600" : "text-orange-600"}`}>
                              {frequencyLabels[item.freq]}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#1C2B2A]">{item.priceLabel}</p>
                      </div>
                    </div>

                    {/* Action chips */}
                    <div className="flex gap-2 mt-3">
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
                      {item.downgrade && (
                        <button
                          onClick={() => setAction(item.id, "downgrade")}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            action === "downgrade"
                              ? "bg-[#1B7A6E] text-white border-[#1B7A6E]"
                              : "bg-teal-50 text-[#1B7A6E] border-teal-200 hover:bg-teal-100"
                          }`}
                        >
                          Nedgrader (spar {item.downgrade.savingsPerMonth} kr/md)
                        </button>
                      )}
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
                    </div>

                    {/* Downgrade detail */}
                    {action === "downgrade" && item.downgrade && (
                      <div className="mt-3 bg-teal-50 rounded-lg px-3 py-2.5 flex items-start gap-2">
                        <svg className="w-4 h-4 text-[#1B7A6E] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <p className="text-sm text-[#1B7A6E]">
                          <span className="font-medium">{item.name} {item.downgrade.fromLabel}</span>
                          {" → "}
                          <span className="font-medium">{item.name} {item.downgrade.toLabel}</span>
                          {" — spar "}
                          <span className="font-bold">{item.downgrade.savingsPerMonth} kr/md</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Cancellation notice */}
                  {item.cancellation !== "løbende" && (
                    <div className="bg-orange-50 border-t border-orange-200 px-5 py-2.5 flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-orange-700">
                        <span className="font-semibold">OBS:</span> {item.name} har {item.cancellation} — du sparer fra {getCancellationDate(item.cancellation)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Downgrade suggestions for active services */}
      {downgradeServices.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#1C2B2A] mb-1 flex items-center gap-2">
            <span className="text-[#1B7A6E]">&#x2193;</span> Nedgraderingsforslag
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Du bruger disse aktivt — men du kan stadig spare ved at nedgradere
          </p>
          <div className="space-y-3">
            {downgradeServices.map((s) => {
              const action = actions[s.id];
              const dg = getTierDowngrade(s, selectedPlans)!;
              const tierLabel = getSelectedTierLabel(s, selectedPlans);
              const price = getEffectivePrice(s, selectedPlans);
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-xl border border-gray-200 px-5 py-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{s.icon}</span>
                      <div>
                        <p className="font-semibold text-[#1C2B2A]">
                          {tierLabel ? `${s.name} (${tierLabel})` : s.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Brugt: <span className="text-green-600 font-medium">{frequencyLabels[usageFrequency[s.id]]}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1C2B2A]">{price} kr/md</p>
                    </div>
                  </div>

                  <div className="mt-3 bg-teal-50/60 rounded-lg px-4 py-3 border border-teal-100">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#1B7A6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <p className="text-sm text-[#1C2B2A]">
                          <span className="font-medium">{dg.fromLabel}</span>
                          {" → "}
                          <span className="font-semibold text-[#1B7A6E]">{dg.toLabel}</span>
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#1B7A6E]">
                        Spar {dg.savingsPerMonth} kr/md
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setAction(s.id, "downgrade")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        action === "downgrade"
                          ? "bg-[#1B7A6E] text-white border-[#1B7A6E]"
                          : "bg-teal-50 text-[#1B7A6E] border-teal-200 hover:bg-teal-100"
                      }`}
                    >
                      Nedgrader
                    </button>
                    <button
                      onClick={() => setAction(s.id, "keep")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        action === "keep"
                          ? "bg-gray-700 text-white border-gray-700"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      Behold nuværende
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Savings summary */}
      {grandTotalMonthly > 0 && (
        <div className="bg-[#1C2B2A] text-white rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-4 text-center">Din samlede besparelse</h3>
          <div className="grid grid-cols-2 gap-4">
            {totalMonthlySavings > 0 && (
              <div className="text-center">
                <p className="text-xs text-white/60 uppercase tracking-wider">Opsigelser</p>
                <p className="text-2xl font-bold text-white">{totalMonthlySavings.toLocaleString("da-DK")} kr/md</p>
              </div>
            )}
            {downgradeSavings > 0 && (
              <div className="text-center">
                <p className="text-xs text-white/60 uppercase tracking-wider">Nedgraderinger</p>
                <p className="text-2xl font-bold text-[#4ECDC4]">{downgradeSavings.toLocaleString("da-DK")} kr/md</p>
              </div>
            )}
          </div>
          <div className="border-t border-white/20 mt-4 pt-4 text-center">
            <p className="text-xs text-white/60 uppercase tracking-wider">I alt mulig besparelse</p>
            <p className="text-4xl font-bold text-[#4ECDC4]">{grandTotalMonthly.toLocaleString("da-DK")} kr/md</p>
          </div>
        </div>
      )}

      {/* Two paths */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#1C2B2A] mb-4 text-center">
          Hvad vil du gøre nu?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DIY */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 sm:p-8 flex flex-col">
            <div className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full w-fit mb-4">
              100% gratis
            </div>
            <h3 className="text-xl font-bold text-[#1C2B2A] mb-2">
              Gør det selv
            </h3>
            <p className="text-gray-500 text-sm mb-6 flex-1">
              Du har nu dit overblik over abonnementer du kan spare på. Find
              opsigelsesinfo og send mails manuelt.
            </p>
            <a
              href="/"
              className="block w-full text-center px-6 py-3 bg-white text-[#1C2B2A] font-semibold rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Jeg klarer det selv
            </a>
          </div>

          {/* Full service */}
          <div className="relative bg-teal-50 rounded-2xl border-2 border-[#1B7A6E] p-6 sm:p-8 flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
              Anbefalet
            </div>
            <div className="flex items-start justify-between mb-4">
              <div className="inline-flex items-center gap-2 bg-[#1B7A6E]/10 text-[#1B7A6E] text-xs font-bold px-3 py-1.5 rounded-full w-fit">
                25% af besparelsen
              </div>
              <Inspektoeren pose="searching" size={48} />
            </div>
            <h3 className="text-xl font-bold text-[#1C2B2A] mb-2">
              Hjælp mig med det
            </h3>
            <p className="text-gray-600 text-sm mb-4 flex-1">
              Forbind din bank, find alle abonnementer automatisk, og få
              færdige opsigelsesmails du bare sender.
            </p>
            {grandTotalMonthly > 0 && (
              <p className="text-sm text-[#1B7A6E] font-medium mb-4">
                Pris:{" "}
                {Math.round(grandTotalMonthly * 0.25).toLocaleString("da-DK")}{" "}
                kr/md (25% af {grandTotalMonthly.toLocaleString("da-DK")} kr/md
                besparelse)
              </p>
            )}
            <a
              href="#kom-igang"
              className="block w-full text-center px-6 py-3 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20"
            >
              Find mine abonnementer &rarr;
            </a>
          </div>
        </div>
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
