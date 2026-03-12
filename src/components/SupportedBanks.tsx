"use client";

import { useState, useEffect } from "react";

interface Institution {
  id: string;
  name: string;
  logo: string;
}

interface SupportedBanksProps {
  /** Compact mode for embedding in signup flow */
  compact?: boolean;
}

/** Hardcoded fallback when GoCardless API is unavailable */
const FALLBACK_BANKS: Institution[] = [
  { id: "danske-bank", name: "Danske Bank", logo: "" },
  { id: "nordea", name: "Nordea", logo: "" },
  { id: "jyske-bank", name: "Jyske Bank", logo: "" },
  { id: "sydbank", name: "Sydbank", logo: "" },
  { id: "nykredit", name: "Nykredit", logo: "" },
  { id: "spar-nord", name: "Spar Nord", logo: "" },
  { id: "lunar", name: "Lunar", logo: "" },
  { id: "arbejdernes-landsbank", name: "Arbejdernes Landsbank", logo: "" },
  { id: "al-bank", name: "AL Bank", logo: "" },
  { id: "saxo-bank", name: "Saxo Bank", logo: "" },
];

export default function SupportedBanks({ compact = false }: SupportedBanksProps) {
  const [banks, setBanks] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    fetch("/api/gocardless/institutions")
      .then((res) => res.json())
      .then((data) => {
        const list = data.institutions || [];
        if (list.length > 0) {
          setBanks(list);
        } else {
          setBanks(FALLBACK_BANKS);
          setUsingFallback(true);
        }
      })
      .catch(() => {
        setBanks(FALLBACK_BANKS);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return compact ? null : (
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mt-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (compact) {
    return (
      <div className="mt-6">
        <p className="text-sm font-medium text-gray-500 mb-3 text-center">
          Vi understøtter {usingFallback ? "alle større" : `${banks.length}+`} danske banker, bl.a.:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {banks.slice(0, 8).map((bank) => (
            <div
              key={bank.id}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2"
              title={bank.name}
            >
              {bank.logo ? (
                <img
                  src={bank.logo}
                  alt={bank.name}
                  className="w-6 h-6 object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="w-6 h-6 bg-[#1B7A6E] text-white text-xs font-bold rounded flex items-center justify-center">
                  {bank.name.charAt(0)}
                </span>
              )}
              <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                {bank.name.length > 18 ? bank.name.slice(0, 18) + "..." : bank.name}
              </span>
            </div>
          ))}
          {banks.length > 8 && (
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-500 font-medium">
                +{banks.length - 8} flere
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section id="banker" className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Vi understøtter din bank
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            {usingFallback
              ? "Vi understøtter alle større danske banker via sikker bankforbindelse"
              : `Vi understøtter ${banks.length}+ danske banker via sikker bankforbindelse`}
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {banks.map((bank) => (
            <div
              key={bank.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
              title={bank.name}
            >
              {bank.logo ? (
                <img
                  src={bank.logo}
                  alt={bank.name}
                  className="w-10 h-10 object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="w-10 h-10 bg-[#1B7A6E] text-white text-sm font-bold rounded-lg flex items-center justify-center">
                  {bank.name.charAt(0)}
                </span>
              )}
              <span className="text-xs text-gray-700 font-medium text-center leading-tight">
                {bank.name}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Kan du ikke finde din bank? Vi tilføjer løbende nye banker.
        </p>
      </div>
    </section>
  );
}
