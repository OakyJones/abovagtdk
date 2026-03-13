"use client";

import { useEffect, useMemo, useState } from "react";
import {
  services,
  getEffectivePrice,
  getSelectedTierLabel,
} from "@/lib/services";
import Inspektoeren from "@/components/Inspektoeren";

interface Props {
  selectedServices: string[];
  selectedPlans: Record<string, string>;
  customServices: { name: string; price: number }[];
  onBack: () => void;
  onSave: (monthlyCost: number) => void;
}

export default function StepResult({
  selectedServices,
  selectedPlans,
  customServices,
  onBack,
  onSave,
}: Props) {
  const [saved, setSaved] = useState(false);

  const allItems = useMemo(() => {
    const known = services
      .filter((s) => selectedServices.includes(s.id))
      .map((s) => {
        const price = getEffectivePrice(s, selectedPlans);
        const tierLabel = getSelectedTierLabel(s, selectedPlans);
        return {
          id: s.id,
          name: tierLabel ? `${s.name} (${tierLabel})` : s.name,
          icon: s.icon,
          price,
        };
      });

    const custom = customServices.map((c) => ({
      id: c.name,
      name: c.name,
      icon: "📦",
      price: c.price,
    }));

    return [...known, ...custom];
  }, [selectedServices, selectedPlans, customServices]);

  const totalMonthly = allItems.reduce((sum, item) => sum + item.price, 0);
  const totalYearly = totalMonthly * 12;

  useEffect(() => {
    if (saved) return;
    onSave(totalMonthly);
    setSaved(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <Inspektoeren
          pose="waving"
          size={120}
          speechBubble={
            totalMonthly > 500
              ? `${totalMonthly.toLocaleString("da-DK")} kr/md — det kan vi nok finde besparelser i!`
              : `${totalMonthly.toLocaleString("da-DK")} kr/md — lad os se om du kan spare!`
          }
          className="mb-4"
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
          Dit abonnementsoverblik
        </h1>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Abonnementer</p>
          <p className="text-3xl font-bold text-[#1C2B2A]">{allItems.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Månedligt forbrug</p>
          <p className="text-3xl font-bold text-[#1C2B2A]">
            {totalMonthly.toLocaleString("da-DK")} kr
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Årligt forbrug</p>
          <p className="text-3xl font-bold text-[#1C2B2A]">
            {totalYearly.toLocaleString("da-DK")} kr
          </p>
        </div>
      </div>

      {/* Service list */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#1C2B2A] mb-4">
          Dine abonnementer
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {allItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-[#1C2B2A]">{item.name}</span>
              </div>
              <span className="font-bold text-[#1C2B2A]">{item.price} kr/md</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insight box */}
      <div className="bg-[#1C2B2A] text-white rounded-2xl p-6 mb-8 text-center">
        <p className="text-xs text-white/60 uppercase tracking-wider mb-2">
          Estimeret årligt forbrug på abonnementer
        </p>
        <p className="text-4xl font-bold text-[#4ECDC4]">
          {totalYearly.toLocaleString("da-DK")} kr/år
        </p>
        <p className="text-sm text-white/60 mt-2">
          De fleste danskere kan spare 15-30% ved at gennemgå deres abonnementer
        </p>
      </div>

      {/* CTA */}
      <div className="relative bg-teal-50 rounded-2xl border-2 border-[#1B7A6E] p-6 sm:p-8 mb-8">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
          Næste skridt
        </div>

        <div className="flex items-start justify-between mt-1 mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C2B2A]">
            Vil du finde ud af præcis hvor meget du kan spare?
          </h2>
          <Inspektoeren pose="searching" size={48} />
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Vi forbinder sikkert til din bank via PSD2 og finder alle dine
          abonnementer automatisk — også dem du har glemt.
        </p>

        <ul className="text-sm text-gray-700 space-y-2 mb-6">
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#1B7A6E] shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Finder skjulte abonnementer i dine transaktioner
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#1B7A6E] shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Laver færdige opsigelsesmails du selv sender
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#1B7A6E] shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Koster maks 45 kr — en gang, ingen binding
          </li>
        </ul>

        <a
          href="/connect"
          onClick={() => window.umami?.track("quiz_cta_click", { monthly: totalMonthly })}
          className="block w-full text-center px-6 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 text-lg"
        >
          Find mine abonnementer →
        </a>

        <p className="mt-4 text-center text-xs text-gray-500">
          Ingen binding. Ingen skjulte gebyrer.
        </p>
      </div>

      {/* Back */}
      <div className="text-center">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors"
        >
          ← Tilbage
        </button>
      </div>
    </div>
  );
}
