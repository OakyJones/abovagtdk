"use client";

import { services, UsageFrequency, frequencyLabels, formatPrice, getEffectivePrice, getSelectedTierLabel } from "@/lib/services";
import Inspektoeren from "@/components/Inspektoeren";

interface Props {
  selectedServices: string[];
  selectedPlans: Record<string, string>;
  customServices: { name: string; price: number }[];
  usageFrequency: Record<string, UsageFrequency>;
  setUsageFrequency: (freq: Record<string, UsageFrequency>) => void;
  onBack: () => void;
  onNext: () => void;
}

const frequencies: UsageFrequency[] = ["daily", "weekly", "rarely", "never"];

const frequencyStyles: Record<UsageFrequency, string> = {
  daily: "bg-green-50 text-green-700 border-green-200",
  weekly: "bg-blue-50 text-blue-700 border-blue-200",
  rarely: "bg-orange-50 text-orange-700 border-orange-200",
  never: "bg-red-50 text-red-700 border-red-200",
};

const frequencyActiveStyles: Record<UsageFrequency, string> = {
  daily: "bg-green-500 text-white border-green-500 shadow-sm",
  weekly: "bg-blue-500 text-white border-blue-500 shadow-sm",
  rarely: "bg-orange-500 text-white border-orange-500 shadow-sm",
  never: "bg-red-500 text-white border-red-500 shadow-sm",
};

export default function StepUsage({
  selectedServices,
  selectedPlans,
  customServices,
  usageFrequency,
  setUsageFrequency,
  onBack,
  onNext,
}: Props) {
  const setFrequency = (id: string, freq: UsageFrequency) => {
    setUsageFrequency({ ...usageFrequency, [id]: freq });
  };

  const allItems: {
    id: string;
    name: string;
    icon: string;
    priceLabel: string;
    monthlyPrice: number;
  }[] = [
    ...services
      .filter((s) => selectedServices.includes(s.id))
      .map((s) => {
        const tierLabel = getSelectedTierLabel(s, selectedPlans);
        const price = getEffectivePrice(s, selectedPlans);
        return {
          id: s.id,
          name: tierLabel ? `${s.name} (${tierLabel})` : s.name,
          icon: s.icon,
          priceLabel: `${price} kr/md`,
          monthlyPrice: price,
        };
      }),
    ...customServices.map((c) => ({
      id: c.name,
      name: c.name,
      icon: "📦",
      priceLabel: `${c.price} kr/md`,
      monthlyPrice: c.price,
    })),
  ];

  const wastingCount = allItems.filter(
    (item) =>
      usageFrequency[item.id] === "rarely" ||
      usageFrequency[item.id] === "never"
  ).length;

  const wastingMonthly = allItems
    .filter(
      (item) =>
        usageFrequency[item.id] === "rarely" ||
        usageFrequency[item.id] === "never"
    )
    .reduce((sum, item) => sum + item.monthlyPrice, 0);

  return (
    <div>
      <div className="text-center mb-6 sm:mb-8">
        <Inspektoeren
          pose="pointing"
          size={80}
          speechBubble={
            wastingCount > 0
              ? `Du har ${wastingCount} abonnement${wastingCount !== 1 ? "er" : ""} der ser mistænkelig${wastingCount !== 1 ? "e" : "t"} ud!`
              : "Vær ærlig — det er her besparelserne gemmer sig!"
          }
          className="mb-3"
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
          Hvor tit bruger du dem?
        </h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">
          Vær ærlig — det er her besparelserne gemmer sig
        </p>
      </div>

      <div className="space-y-3">
        {allItems.map((item) => {
          const freq = usageFrequency[item.id] || "weekly";
          const isWasting = freq === "rarely" || freq === "never";

          return (
            <div
              key={item.id}
              className={`rounded-xl border-2 p-4 sm:p-5 transition-all ${
                isWasting
                  ? "border-orange-300 bg-orange-50/50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:min-w-[200px]">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-medium text-[#1C2B2A]">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.priceLabel}</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-1">
                  {frequencies.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFrequency(item.id, f)}
                      className={`flex-1 px-2 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
                        freq === f
                          ? frequencyActiveStyles[f]
                          : `${frequencyStyles[f]} hover:opacity-80`
                      }`}
                    >
                      {frequencyLabels[f]}
                    </button>
                  ))}
                </div>
              </div>

              {isWasting && (
                <p className="mt-3 text-sm text-orange-600 font-medium flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  Du bruger {item.priceLabel} på noget du{" "}
                  {freq === "never" ? "aldrig bruger" : "sjældent bruger"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mt-8">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-600 font-medium hover:text-[#1C2B2A] transition-colors"
          >
            &larr; Tilbage
          </button>
          <div className="text-center hidden sm:block">
            {wastingCount > 0 && (
              <p className="text-sm text-orange-600 font-medium">
                {wastingCount} abonnement{wastingCount !== 1 ? "er" : ""} —{" "}
                {wastingMonthly.toLocaleString("da-DK")} kr/md du kan spare
              </p>
            )}
          </div>
          <button
            onClick={onNext}
            className="px-8 py-3 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20"
          >
            Se resultat &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
