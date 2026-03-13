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
  const [shared, setShared] = useState(false);

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
      icon: "\uD83D\uDCE6",
      price: c.price,
    }));

    return [...known, ...custom];
  }, [selectedServices, selectedPlans, customServices]);

  const totalMonthly = allItems.reduce((sum, item) => sum + item.price, 0);
  const totalYearly = totalMonthly * 12;
  const totalSavings = userActions.totalSavings;
  const savingsYearly = totalSavings * 12;

  const cancelledItems = allItems.filter((i) => userActions.actions[i.id] === "cancel");
  const downgradedItems = allItems.filter((i) => userActions.actions[i.id] === "downgrade");
  const keptItems = allItems.filter((i) => !userActions.actions[i.id] || userActions.actions[i.id] === "keep");

  useEffect(() => {
    if (saved) return;
    onSave(totalMonthly, totalSavings, userActions);
    setSaved(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleShare = async () => {
    const text = totalSavings > 0
      ? `Jeg fandt ud af at jeg kan spare ${totalSavings.toLocaleString("da-DK")} kr/md p\u00e5 mine abonnementer med AboVagt! Tag quizzen: https://abovagt.dk/quiz`
      : `Jeg har ${allItems.length} abonnementer for ${totalMonthly.toLocaleString("da-DK")} kr/md. Hvad med dig? Tag quizzen: https://abovagt.dk/quiz`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
        setShared(true);
        window.umami?.track("quiz_share", { method: "native" });
        return;
      } catch {
        // Fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      window.umami?.track("quiz_share", { method: "clipboard" });
      setTimeout(() => setShared(false), 3000);
    } catch {
      // Ignore
    }
  };

  return (
    <div>
      {/* Header with mascot */}
      <div className="text-center mb-8">
        <Inspektoeren
          pose="waving"
          size={120}
          speechBubble={
            totalSavings > 0
              ? `Du kan spare ${totalSavings.toLocaleString("da-DK")} kr/md!`
              : "Flot \u2014 du har styr p\u00e5 dine abonnementer!"
          }
          className="mb-4"
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
          Dit resultat
        </h1>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Abonnementer</p>
          <p className="text-2xl font-bold text-[#1C2B2A]">{allItems.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Forbrug</p>
          <p className="text-2xl font-bold text-[#1C2B2A]">
            {totalMonthly.toLocaleString("da-DK")} <span className="text-sm font-normal text-gray-500">kr/md</span>
          </p>
          <p className="text-xs text-gray-400">{totalYearly.toLocaleString("da-DK")} kr/\u00e5r</p>
        </div>
        <div className={`rounded-2xl border-2 p-4 text-center ${
          totalSavings > 0 ? "bg-teal-50 border-[#1B7A6E]" : "bg-white border-gray-200"
        }`}>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Besparelse</p>
          <p className={`text-2xl font-bold ${totalSavings > 0 ? "text-[#1B7A6E]" : "text-[#1C2B2A]"}`}>
            {totalSavings.toLocaleString("da-DK")} <span className="text-sm font-normal">kr/md</span>
          </p>
          {totalSavings > 0 && (
            <p className="text-xs text-[#1B7A6E]">{savingsYearly.toLocaleString("da-DK")} kr/\u00e5r</p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Handlinger</p>
          <div className="flex justify-center gap-2 mt-1">
            {cancelledItems.length > 0 && (
              <span className="text-xs font-bold text-red-600">{cancelledItems.length} opsiges</span>
            )}
            {downgradedItems.length > 0 && (
              <span className="text-xs font-bold text-orange-600">{downgradedItems.length} nedgr.</span>
            )}
            {cancelledItems.length === 0 && downgradedItems.length === 0 && (
              <span className="text-xs font-bold text-[#1B7A6E]">Ingen</span>
            )}
          </div>
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
              = {savingsYearly.toLocaleString("da-DK")} kr/\u00e5r
            </p>
          </div>
        </div>
      )}

      {/* Kept services */}
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

      {/* Primary CTA — Engangsscanning */}
      <div className="relative bg-teal-50 rounded-2xl border-2 border-[#1B7A6E] p-6 sm:p-8 mb-4">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide whitespace-nowrap">
          N\u00e6ste skridt
        </div>

        <div className="flex items-start justify-between mt-1 mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C2B2A]">
            {totalSavings > 0
              ? "Vil du finde de pr\u00e6cise tal?"
              : "Vil du finde skjulte abonnementer?"}
          </h2>
          <Inspektoeren pose="searching" size={48} />
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Vi forbinder sikkert til din bank via PSD2 og finder alle dine
          abonnementer automatisk &mdash; ogs\u00e5 dem du har glemt.
        </p>

        <a
          href="/connect"
          onClick={() => window.umami?.track("quiz_cta_engang", { monthly: totalMonthly, savings: totalSavings })}
          className="block w-full text-center px-6 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 text-lg"
        >
          Find mine abonnementer (35 kr) &rarr;
        </a>

        <p className="mt-3 text-center text-xs text-gray-500">
          Kun hvis vi finder noget. Ingen binding.
        </p>
      </div>

      {/* Secondary CTA — Monitoring */}
      <a
        href="/connect"
        onClick={() => window.umami?.track("quiz_cta_monitoring", { monthly: totalMonthly, savings: totalSavings })}
        className="block w-full text-center px-5 py-3 bg-white text-[#1B7A6E] font-semibold rounded-xl border border-[#1B7A6E] hover:bg-teal-50 transition-colors text-sm mb-8"
      >
        Start monitoring (15 kr/md) &rarr;
      </a>

      {/* Share button */}
      <div className="text-center mb-8">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
        >
          {shared ? (
            <>
              <svg className="w-5 h-5 text-[#1B7A6E]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Kopieret!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Del dit resultat
            </>
          )}
        </button>
      </div>

      {/* Back */}
      <div className="text-center">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors"
        >
          \u2190 Tilbage
        </button>
      </div>
    </div>
  );
}
