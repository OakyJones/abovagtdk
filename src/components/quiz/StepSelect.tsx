"use client";

import { useState } from "react";
import {
  services,
  Service,
  categoryLabels,
  categoryOrder,
  formatPrice,
} from "@/lib/services";

interface Props {
  selectedServices: string[];
  setSelectedServices: (services: string[]) => void;
  customServices: { name: string; price: number }[];
  setCustomServices: (services: { name: string; price: number }[]) => void;
  onNext: () => void;
}

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

  const totalSelected = selectedServices.length + customServices.length;
  const monthlyTotal =
    services
      .filter((s) => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.monthlyPrice, 0) +
    customServices.reduce((sum, c) => sum + c.price, 0);

  const catServices = services.filter((s) => s.category === activeCategory);

  // Count selected per category
  const selectedPerCategory = (cat: string) =>
    services.filter((s) => s.category === cat && selectedServices.includes(s.id))
      .length;

  return (
    <div>
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Hvilke abonnementer har du?
        </h1>
        <p className="mt-3 text-gray-600">
          Vælg alle de tjenester du betaler for i dag
        </p>
      </div>

      {/* Category tabs */}
      <div className="mb-6 -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          {categoryOrder.map((cat) => {
            const count = selectedPerCategory(cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-[#1B7A6E] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {categoryLabels[cat]}
                {count > 0 && (
                  <span
                    className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
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
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
              activeCategory === "custom"
                ? "bg-[#1B7A6E] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Andet
            {customServices.length > 0 && (
              <span
                className={`ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
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
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-sm text-gray-500">{c.price} kr/md</p>
                  </div>
                  <button
                    onClick={() => removeCustom(c.name)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Fjern ${c.name}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
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
                <span className="text-gray-900 font-semibold ml-2">
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
          ? "border-[#1B7A6E] bg-teal-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2">
          <svg
            className="w-5 h-5 text-[#1B7A6E]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      )}
      <span className="text-2xl">{service.icon}</span>
      <span className="text-sm font-medium text-gray-900 leading-tight">
        {service.name}
      </span>
      <span className="text-xs text-gray-500">{formatPrice(service)}</span>
      {service.cancellation !== "løbende" && (
        <span className="text-[10px] text-orange-600 font-medium">
          {service.cancellation}
        </span>
      )}
    </button>
  );
}
