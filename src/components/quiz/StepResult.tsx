"use client";

import { useEffect } from "react";
import {
  services,
  UsageFrequency,
  frequencyLabels,
  formatPrice,
  getEstimatedSavings,
  getCancellationDate,
} from "@/lib/services";
import Inspektoeren from "@/components/Inspektoeren";

interface Props {
  selectedServices: string[];
  customServices: { name: string; price: number }[];
  usageFrequency: Record<string, UsageFrequency>;
  onBack: () => void;
  onSave: (monthlyCost: number, monthlySavings: number) => void;
}

export default function StepResult({
  selectedServices,
  customServices,
  usageFrequency,
  onBack,
  onSave,
}: Props) {
  const selectedServiceObjects = services.filter((s) =>
    selectedServices.includes(s.id)
  );

  const totalMonthly =
    selectedServiceObjects.reduce((sum, s) => sum + s.monthlyPrice, 0) +
    customServices.reduce((sum, c) => sum + c.price, 0);

  const { monthlySavings, wastedServices } = getEstimatedSavings(
    selectedServices,
    usageFrequency
  );

  const wastedCustom = customServices.filter(
    (c) =>
      usageFrequency[c.name] === "rarely" ||
      usageFrequency[c.name] === "never"
  );
  const customWaste = wastedCustom.reduce((sum, c) => sum + c.price, 0);
  const totalMonthlySavings = monthlySavings + customWaste;
  const totalYearlySavings = totalMonthlySavings * 12;

  useEffect(() => {
    onSave(totalMonthly, totalMonthlySavings);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allWasted = [
    ...wastedServices.map((s) => ({
      id: s.id,
      name: s.name,
      icon: s.icon,
      price: s.monthlyPrice,
      priceLabel: formatPrice(s),
      freq: usageFrequency[s.id],
      cancellation: s.cancellation,
    })),
    ...wastedCustom.map((c) => ({
      id: c.name,
      name: c.name,
      icon: "📦",
      price: c.price,
      priceLabel: `${c.price} kr/md`,
      freq: usageFrequency[c.name],
      cancellation: "løbende" as const,
    })),
  ];

  return (
    <div>
      <div className="text-center mb-8 sm:mb-10">
        <Inspektoeren
          pose="waving"
          size={120}
          speechBubble={
            totalYearlySavings > 0
              ? `Jeg fandt ${totalYearlySavings.toLocaleString("da-DK")} kr du kan spare!`
              : "Flot — du bruger dine abonnementer godt!"
          }
          className="mb-4"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Dit resultat
        </h1>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Samlet forbrug</p>
          <p className="text-3xl font-bold text-gray-900">
            {totalMonthly.toLocaleString("da-DK")} kr
          </p>
          <p className="text-sm text-gray-500">pr. måned</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Årligt forbrug</p>
          <p className="text-3xl font-bold text-gray-900">
            {(totalMonthly * 12).toLocaleString("da-DK")} kr
          </p>
          <p className="text-sm text-gray-500">pr. år</p>
        </div>
        <div
          className={`rounded-xl border-2 p-6 text-center ${
            totalMonthlySavings > 0
              ? "bg-teal-50 border-[#1B7A6E]"
              : "bg-white border-gray-200"
          }`}
        >
          <p className="text-sm text-gray-500 mb-1">Mulig besparelse</p>
          <p
            className={`text-3xl font-bold ${
              totalMonthlySavings > 0 ? "text-[#1B7A6E]" : "text-gray-900"
            }`}
          >
            {totalYearlySavings.toLocaleString("da-DK")} kr
          </p>
          <p className="text-sm text-gray-500">pr. år</p>
        </div>
      </div>

      {/* Wasted services detail */}
      {allWasted.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Abonnementer du kan spare
          </h2>
          <div className="space-y-3">
            {allWasted.map((item) => (
              <div
                key={item.id}
                className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-orange-600">
                        Brugt: {frequencyLabels[item.freq]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{item.priceLabel}</p>
                    <p className="text-sm text-gray-500">
                      {(item.price * 12).toLocaleString("da-DK")} kr/år
                    </p>
                  </div>
                </div>
                {item.cancellation !== "løbende" && (
                  <div className="mt-3 flex items-start gap-2 bg-orange-100 rounded-lg px-3 py-2">
                    <svg
                      className="w-4 h-4 text-orange-600 mt-0.5 shrink-0"
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
                    <p className="text-sm text-orange-700">
                      <span className="font-medium">OBS:</span> {item.name} har{" "}
                      {item.cancellation} — du sparer fra{" "}
                      {getCancellationDate(item.cancellation)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two paths */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Hvad vil du gøre nu?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DIY */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 sm:p-8 flex flex-col">
            <div className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full w-fit mb-4">
              100% gratis
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Gør det selv
            </h3>
            <p className="text-gray-500 text-sm mb-6 flex-1">
              Du har nu listen over abonnementer du kan spare. Find selv
              opsigelsesinfo og send mails manuelt.
            </p>
            <a
              href="/"
              className="block w-full text-center px-6 py-3 bg-white text-gray-800 font-semibold rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors"
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Fix det for mig
            </h3>
            <p className="text-gray-600 text-sm mb-4 flex-1">
              Vi forbinder til din bank, finder alle abonnementer automatisk, og
              laver færdige opsigelsesmails du bare sender.
            </p>
            {totalYearlySavings > 0 && (
              <p className="text-sm text-[#1B7A6E] font-medium mb-4">
                Pris:{" "}
                {Math.round(totalYearlySavings * 0.25).toLocaleString("da-DK")}{" "}
                kr (25% af {totalYearlySavings.toLocaleString("da-DK")} kr
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
          className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          &larr; Tilbage til forbrugsvalg
        </button>
      </div>
    </div>
  );
}
