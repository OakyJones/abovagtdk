"use client";

import { useEffect, useMemo, useState } from "react";
import {
  services,
  getEffectivePrice,
  getSelectedTierLabel,
} from "@/lib/services";
import Inspektoeren from "@/components/Inspektoeren";
import type { UserActions } from "./StepActions";

interface Props {
  selectedServices: string[];
  selectedPlans: Record<string, string>;
  customServices: { name: string; price: number }[];
  userActions: UserActions;
  onBack: () => void;
  onSave: (monthlyCost: number, monthlySavings: number, actions: UserActions) => void;
}

export default function StepResult({
  selectedServices,
  selectedPlans,
  customServices,
  userActions,
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
  const totalSavings = userActions.totalSavings;
  const afterSavings = totalMonthly - totalSavings;

  const cancelledItems = allItems.filter((i) => userActions.actions[i.id] === "cancel");
  const downgradedItems = allItems.filter((i) => userActions.actions[i.id] === "downgrade");
  const keptItems = allItems.filter((i) => !userActions.actions[i.id] || userActions.actions[i.id] === "keep");

  useEffect(() => {
    if (saved) return;
    onSave(totalMonthly, totalSavings, userActions);
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
            totalSavings > 0
              ? `Du kan spare ${totalSavings.toLocaleString("da-DK")} kr/md!`
              : "Flot — du har styr på dine abonnementer!"
          }
          className="mb-4"
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
          Dit resultat
        </h1>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Abonnementer</p>
          <p className="text-3xl font-bold text-[#1C2B2A]">{allItems.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nuværende forbrug</p>
          <p className="text-3xl font-bold text-[#1C2B2A]">
            {totalMonthly.toLocaleString("da-DK")} kr/md
          </p>
        </div>
        <div className={`rounded-2xl border-2 p-5 text-center transition-all ${
          totalSavings > 0
            ? "bg-teal-50 border-[#1B7A6E]"
            : "bg-white border-gray-200"
        }`}>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Mulig besparelse</p>
          <p className={`text-3xl font-bold ${totalSavings > 0 ? "text-[#1B7A6E]" : "text-[#1C2B2A]"}`}>
            {totalSavings.toLocaleString("da-DK")} kr/md
          </p>
        </div>
      </div>

      {/* Savings breakdown */}
      {totalSavings > 0 && (
        <div className="bg-[#1C2B2A] text-white rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-4 text-center">Din besparelse</h3>

          {cancelledItems.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-white/80 mb-1.5">
                <span className="font-bold text-red-400">Opsiger</span> {cancelledItems.length} {cancelledItems.length === 1 ? "abonnement" : "abonnementer"}
              </p>
              {cancelledItems.map((item) => (
                <p key={item.id} className="text-xs text-white/50 pl-3">
                  {item.icon} {item.name}: {item.price} kr/md
                </p>
              ))}
            </div>
          )}

          {downgradedItems.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-white/80 mb-1.5">
                <span className="font-bold text-[#4ECDC4]">Nedgraderer</span> {downgradedItems.length} {downgradedItems.length === 1 ? "abonnement" : "abonnementer"}
              </p>
              {downgradedItems.map((item) => (
                <p key={item.id} className="text-xs text-white/50 pl-3">
                  {item.icon} {item.name}
                </p>
              ))}
            </div>
          )}

          <div className="border-t border-white/20 mt-4 pt-4 text-center">
            <p className="text-xs text-white/60 uppercase tracking-wider">Samlet besparelse</p>
            <p className="text-4xl font-bold text-[#4ECDC4]">
              {totalSavings.toLocaleString("da-DK")} kr/md
            </p>
            <p className="text-sm text-white/50 mt-1">
              = {(totalSavings * 12).toLocaleString("da-DK")} kr/år
            </p>
          </div>
        </div>
      )}

      {/* Service list */}
      {keptItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Beholder ({keptItems.length})
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {keptItems.map((item) => (
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
      )}

      {/* CTA */}
      <div className="relative bg-teal-50 rounded-2xl border-2 border-[#1B7A6E] p-6 sm:p-8 mb-8">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
          Næste skridt
        </div>

        <div className="flex items-start justify-between mt-1 mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C2B2A]">
            {totalSavings > 0
              ? "Vil du have hjælp til at spare?"
              : "Vil du finde skjulte abonnementer?"}
          </h2>
          <Inspektoeren pose="searching" size={48} />
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Vi forbinder sikkert til din bank via PSD2 og finder alle dine
          abonnementer automatisk — også dem du har glemt.
        </p>

        {totalSavings > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mulig besparelse</span>
                <span className="text-sm font-bold text-[#1C2B2A]">{totalSavings.toLocaleString("da-DK")} kr/md</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Du betaler</span>
                <span className="text-sm font-bold text-[#1C2B2A]">maks 45 kr (en gang)</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1B7A6E]">Nyt månedligt forbrug</span>
                <span className="text-lg font-bold text-[#1B7A6E]">{afterSavings.toLocaleString("da-DK")} kr/md</span>
              </div>
            </div>
          </div>
        )}

        <a
          href="/connect"
          onClick={() => window.umami?.track("quiz_cta_click", { monthly: totalMonthly, savings: totalSavings })}
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
