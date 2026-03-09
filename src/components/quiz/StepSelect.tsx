"use client";

import { useState, useRef, useEffect } from "react";
import {
  services,
  Service,
  categoryLabels,
  categoryOrder,
  formatPrice,
} from "@/lib/services";
import Inspektoeren from "@/components/Inspektoeren";

interface Props {
  selectedServices: string[];
  setSelectedServices: (services: string[]) => void;
  customServices: { name: string; price: number }[];
  setCustomServices: (services: { name: string; price: number }[]) => void;
  onNext: () => void;
}

const categoryIcons: Record<string, string> = {
  streaming: "🎬",
  music: "🎵",
  fitness: "💪",
  software: "💻",
  gaming: "🎮",
  food: "🍽️",
  news: "📰",
  telecom: "📱",
  dating: "💜",
  misc: "📦",
};

export default function StepSelect({
  selectedServices,
  setSelectedServices,
  customServices,
  setCustomServices,
  onNext,
}: Props) {
  const [activeCategory, setActiveCategory] = useState("streaming");
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) => {
    setSelectedServices(
      selectedServices.includes(id)
        ? selectedServices.filter((s) => s !== id)
        : [...selectedServices, id]
    );
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

  // Scroll active tab into view
  useEffect(() => {
    if (tabsRef.current) {
      const activeTab = tabsRef.current.querySelector('[data-active="true"]');
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [activeCategory]);

  const totalSelected = selectedServices.length + customServices.length;
  const monthlyTotal =
    services
      .filter((s) => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.monthlyPrice, 0) +
    customServices.reduce((sum, c) => sum + c.price, 0);

  const catServices = services.filter((s) => s.category === activeCategory);

  const selectedPerCategory = (cat: string) =>
    services.filter((s) => s.category === cat && selectedServices.includes(s.id))
      .length;

  const activeCatIndex = categoryOrder.indexOf(activeCategory);

  const goToPrevCategory = () => {
    if (activeCatIndex > 0) {
      setActiveCategory(categoryOrder[activeCatIndex - 1]);
    }
  };

  const goToNextCategory = () => {
    if (activeCategory === "custom") return;
    if (activeCatIndex < categoryOrder.length - 1) {
      setActiveCategory(categoryOrder[activeCatIndex + 1]);
    } else {
      setActiveCategory("custom");
    }
  };

  return (
    <div>
      <div className="text-center mb-6 sm:mb-8">
        <Inspektoeren pose="searching" size={80} className="mb-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
          Hvilke abonnementer har du?
        </h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">
          Vælg alle de tjenester du betaler for — gennemgå alle {categoryOrder.length} kategorier
        </p>
      </div>

      {/* Category counter */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {categoryOrder.map((cat, i) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              activeCategory === cat
                ? "bg-[#1B7A6E] scale-125"
                : selectedPerCategory(cat) > 0
                ? "bg-[#1B7A6E]/40"
                : "bg-gray-300"
            }`}
            title={categoryLabels[cat]}
            aria-label={`Gå til ${categoryLabels[cat]} (${i + 1} af ${categoryOrder.length})`}
          />
        ))}
        <button
          onClick={() => setActiveCategory("custom")}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            activeCategory === "custom"
              ? "bg-[#1B7A6E] scale-125"
              : customServices.length > 0
              ? "bg-[#1B7A6E]/40"
              : "bg-gray-300"
          }`}
          title="Andet"
          aria-label="Gå til Andet"
        />
      </div>

      {/* Category tabs — scrollable */}
      <div className="mb-5 -mx-4 px-4 relative">
        <div ref={tabsRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categoryOrder.map((cat) => {
            const count = selectedPerCategory(cat);
            return (
              <button
                key={cat}
                data-active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat
                    ? "bg-[#1B7A6E] text-white shadow-md shadow-teal-600/20"
                    : count > 0
                    ? "bg-teal-50 text-[#1B7A6E] border border-[#1B7A6E]/20 hover:bg-teal-100"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className="text-base">{categoryIcons[cat]}</span>
                {categoryLabels[cat]}
                {count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
                      activeCategory === cat
                        ? "bg-white/20 text-white"
                        : "bg-[#1B7A6E] text-white"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => setActiveCategory("custom")}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all shrink-0 ${
              activeCategory === "custom"
                ? "bg-[#1B7A6E] text-white shadow-md shadow-teal-600/20"
                : customServices.length > 0
                ? "bg-teal-50 text-[#1B7A6E] border border-[#1B7A6E]/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            ✏️ Andet
            {customServices.length > 0 && (
              <span
                className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
                  activeCategory === "custom"
                    ? "bg-white/20 text-white"
                    : "bg-[#1B7A6E] text-white"
                }`}
              >
                {customServices.length}
              </span>
            )}
          </button>
        </div>
        {/* Fade indicators */}
        <div className="absolute right-4 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      {/* Active category label with nav arrows */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevCategory}
          disabled={activeCatIndex <= 0 && activeCategory !== "custom"}
          className="p-2 rounded-lg text-gray-400 hover:text-[#1B7A6E] hover:bg-teal-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Forrige kategori"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-[#1C2B2A]">
          {activeCategory === "custom" ? "Andet" : `${categoryIcons[activeCategory]} ${categoryLabels[activeCategory]}`}
          <span className="text-sm font-normal text-gray-500 ml-2">
            {activeCategory === "custom"
              ? ""
              : `${activeCatIndex + 1} / ${categoryOrder.length}`}
          </span>
        </h2>
        <button
          onClick={goToNextCategory}
          disabled={activeCategory === "custom" || activeCatIndex >= categoryOrder.length - 1}
          className="p-2 rounded-lg text-gray-400 hover:text-[#1B7A6E] hover:bg-teal-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Næste kategori"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Service grid */}
      {activeCategory !== "custom" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
          {catServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              selected={selectedServices.includes(service.id)}
              onToggle={() => toggle(service.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mb-8">
          {customServices.length > 0 && (
            <div className="space-y-2 mb-6">
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
                    onClick={() => removeCustom(c.name)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Fjern ${c.name}`}
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
              onClick={addCustom}
              className="px-4 py-2.5 bg-[#1B7A6E] text-white font-medium rounded-xl hover:bg-[#155F56] transition-colors text-sm"
            >
              Tilføj
            </button>
          </div>
        </div>
      )}

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mt-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <p className="text-sm text-gray-500">
              {totalSelected} valgt
              {monthlyTotal > 0 && (
                <span className="text-[#1C2B2A] font-semibold ml-2">
                  ~{monthlyTotal.toLocaleString("da-DK")} kr/md
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onNext}
            disabled={totalSelected === 0}
            className="px-8 py-3 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
          >
            Videre &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  selected,
  onToggle,
}: {
  service: Service;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all text-center ${
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
      <span className="text-xs text-gray-500">{formatPrice(service)}</span>
      {service.cancellation !== "løbende" && (
        <span className="text-[10px] text-orange-600 font-medium">
          {service.cancellation}
        </span>
      )}
      {service.downgrade && (
        <span className="text-[10px] text-[#1B7A6E] font-medium">
          Nedgradering mulig
        </span>
      )}
    </button>
  );
}
