"use client";

import { useState } from "react";
import {
  services,
  Service,
  ServiceTier,
  categoryLabels,
  quizPages,
  formatPrice,
  getDefaultTier,
  getEffectivePrice,
} from "@/lib/services";
import Inspektoeren from "@/components/Inspektoeren";

interface Props {
  selectedPages: string[];
  selectedServices: string[];
  setSelectedServices: (services: string[]) => void;
  selectedPlans: Record<string, string>;
  setSelectedPlans: (plans: Record<string, string>) => void;
  customServices: { name: string; price: number }[];
  setCustomServices: (services: { name: string; price: number }[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function StepSelect({
  selectedPages,
  selectedServices,
  setSelectedServices,
  selectedPlans,
  setSelectedPlans,
  customServices,
  setCustomServices,
  onBack,
  onNext,
}: Props) {
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [tierPickerFor, setTierPickerFor] = useState<string | null>(null);

  const toggle = (service: Service) => {
    if (selectedServices.includes(service.id)) {
      setSelectedServices(selectedServices.filter((s) => s !== service.id));
      const newPlans = { ...selectedPlans };
      delete newPlans[service.id];
      setSelectedPlans(newPlans);
      setTierPickerFor(null);
    } else if (service.tiers) {
      setTierPickerFor(service.id);
    } else {
      setSelectedServices([...selectedServices, service.id]);
    }
  };

  const selectTier = (service: Service, tier: ServiceTier) => {
    if (!selectedServices.includes(service.id)) {
      setSelectedServices([...selectedServices, service.id]);
    }
    setSelectedPlans({ ...selectedPlans, [service.id]: tier.id });
    setTierPickerFor(null);
  };

  const addCustom = () => {
    const name = customName.trim();
    const price = parseInt(customPrice);
    if (!name || isNaN(price) || price <= 0) return;
    if (customServices.some((c) => c.name === name)) return;
    setCustomServices([...customServices, { name, price }]);
    setCustomName("");
    setCustomPrice("");
  };

  const removeCustom = (name: string) => {
    setCustomServices(customServices.filter((c) => c.name !== name));
  };

  const totalSelected = selectedServices.length + customServices.length;
  const monthlyTotal =
    services
      .filter((s) => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + getEffectivePrice(s, selectedPlans), 0) +
    customServices.reduce((sum, c) => sum + c.price, 0);

  // Build sections from selected quiz pages
  const activeCategories = selectedPages.flatMap(
    (pageId) => quizPages.find((p) => p.id === pageId)?.categories || []
  );

  const groupedSections = activeCategories
    .map((cat) => ({
      category: cat,
      label: categoryLabels[cat],
      services: services.filter((s) => s.category === cat),
    }))
    .filter((g) => g.services.length > 0);

  return (
    <div>
      <div className="text-center mb-6">
        <Inspektoeren pose="searching" size={80} className="mb-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
          Hvilke abonnementer betaler du for?
        </h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">
          Tryk på de services du har
        </p>
      </div>

      {/* Live counter */}
      {totalSelected > 0 && (
        <div className="sticky top-14 z-40 bg-[#1B7A6E] text-white rounded-2xl p-3 mb-6 text-center">
          <p className="text-sm font-semibold">
            Du har valgt {totalSelected} abonnement{totalSelected !== 1 ? "er" : ""}
            <span className="opacity-70 ml-2">
              ~{monthlyTotal.toLocaleString("da-DK")} kr/md
            </span>
          </p>
        </div>
      )}

      {/* All sections in one scrollable view */}
      <div className="mb-6 space-y-6">
        {groupedSections.map((group) => (
          <div key={group.category}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {group.label}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {group.services.map((service) => {
                const selected = selectedServices.includes(service.id);
                const tierLabel = selected && service.tiers && selectedPlans[service.id]
                  ? service.tiers.find((t) => t.id === selectedPlans[service.id])?.label
                  : null;

                return (
                  <div key={service.id} className="relative">
                    <button
                      type="button"
                      onClick={() => toggle(service)}
                      className={`relative w-full flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all text-center ${
                        selected
                          ? "border-[#1B7A6E] bg-teal-50 shadow-sm shadow-teal-600/10"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      {selected && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-5 h-5 text-[#1B7A6E]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </div>
                      )}
                      <span className="text-2xl">{service.icon}</span>
                      <span className="text-sm font-medium text-[#1C2B2A] leading-tight">
                        {service.name}
                      </span>
                      {tierLabel ? (
                        <span className="text-xs text-[#1B7A6E] font-medium">
                          {tierLabel} — {getEffectivePrice(service, selectedPlans)} kr/md
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {formatPrice(service)}
                        </span>
                      )}
                      {service.tiers && !selected && (
                        <span className="text-[10px] text-[#1B7A6E] font-medium">
                          {service.tiers.length} planer
                        </span>
                      )}
                      {selected && service.tiers && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTierPickerFor(tierPickerFor === service.id ? null : service.id);
                          }}
                          className="text-[10px] text-[#1B7A6E] font-medium underline underline-offset-2 hover:text-[#155F56]"
                        >
                          Skift plan
                        </button>
                      )}
                    </button>

                    {/* Tier picker popup */}
                    {tierPickerFor === service.id && service.tiers && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setTierPickerFor(null)}
                        />
                        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white rounded-xl border-2 border-[#1B7A6E] shadow-xl p-3 min-w-[200px]">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Vælg din plan
                          </p>
                          <div className="space-y-1.5">
                            {service.tiers.map((tier) => {
                              const isSelected = selectedPlans[service.id] === tier.id;
                              const isDefaultTier = tier.id === getDefaultTier(service)?.id;
                              return (
                                <button
                                  key={tier.id}
                                  type="button"
                                  onClick={() => selectTier(service, tier)}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                                    isSelected
                                      ? "bg-[#1B7A6E] text-white"
                                      : "bg-gray-50 hover:bg-teal-50 text-gray-900"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{tier.label}</span>
                                    {isDefaultTier && !isSelected && (
                                      <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
                                        Populær
                                      </span>
                                    )}
                                  </div>
                                  <span className={`text-sm font-bold ${isSelected ? "text-white" : "text-[#1C2B2A]"}`}>
                                    {tier.price} kr/md
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom services section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Andet
          </h2>
          {customServices.length > 0 && (
            <div className="space-y-2 mb-3">
              {customServices.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between bg-teal-50 border border-[#1B7A6E]/20 rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-[#1C2B2A]">{c.name}</p>
                    <p className="text-sm text-gray-500">{c.price} kr/md</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustom(c.name)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Navn (f.eks. Wolt+)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E]"
            />
            <input
              type="number"
              placeholder="Kr/md"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              className="w-24 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E]"
            />
            <button
              type="button"
              onClick={addCustom}
              className="px-4 py-2.5 bg-[#1B7A6E] text-white font-medium rounded-xl hover:bg-[#155F56] transition-colors text-sm"
            >
              Tilføj
            </button>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors"
            >
              ← Tilbage
            </button>
            {totalSelected > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">
                {totalSelected} valgt
                <span className="text-[#1C2B2A] font-semibold ml-2">
                  ~{monthlyTotal.toLocaleString("da-DK")} kr/md
                </span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              window.umami?.track("quiz_services_selected", { count: totalSelected, total_md: monthlyTotal });
              onNext();
            }}
            disabled={totalSelected === 0}
            className="px-8 py-3 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
          >
            Se hvad du kan spare →
          </button>
        </div>
      </div>
    </div>
  );
}
