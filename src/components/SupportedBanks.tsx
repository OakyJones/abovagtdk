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

/** Banks to show first (priority order) */
const PRIORITY_IDS = [
  "danske-bank", "nordea", "jyske-bank", "sydbank",
  "nykredit", "spar-nord", "lunar",
];

function sortBanks(banks: Institution[]): Institution[] {
  const priority = new Map(PRIORITY_IDS.map((id, i) => [id, i]));
  return [...banks].sort((a, b) => {
    const pa = priority.get(a.id) ?? 999;
    const pb = priority.get(b.id) ?? 999;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name, "da");
  });
}

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
          setBanks(sortBanks(list));
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
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mt-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-28 bg-gray-100 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ---- Compact mode (signup flow) ---- */
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

  /* ---- Full landing-page section ---- */
  const bankCount = usingFallback ? "10+" : `${banks.length}`;

  return (
    <section id="banker" className="bg-white py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Count badge + heading */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-[#1B7A6E] text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {bankCount} banker understøttet i Danmark
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Vi understøtter disse banker
          </h2>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Forbind din bank sikkert via Tink og lad os finde dine skjulte abonnementer
          </p>
        </div>

        {/* Large bank card grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {banks.map((bank) => (
            <div
              key={bank.id}
              className="bg-gray-50 rounded-2xl border border-gray-200 p-5 sm:p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:border-[#1B7A6E]/30 transition-all"
              title={bank.name}
            >
              {bank.logo ? (
                <img
                  src={bank.logo}
                  alt={bank.name}
                  className="w-14 h-14 object-contain"
                  loading="lazy"
                />
              ) : (
                <span className="w-14 h-14 bg-[#1B7A6E] text-white text-lg font-bold rounded-xl flex items-center justify-center">
                  {bank.name.charAt(0)}
                </span>
              )}
              <span className="text-sm text-gray-800 font-semibold text-center leading-tight">
                {bank.name}
              </span>
            </div>
          ))}
        </div>

        {/* "Flere på vej" + email CTA */}
        <div className="mt-10 sm:mt-14 text-center">
          <p className="text-base text-gray-700 font-medium">
            Og mange flere er på vej — vi tilføjer løbende nye banker
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Kan du ikke finde din bank?{" "}
            <a
              href="mailto:hej@abovagt.dk"
              className="text-[#1B7A6E] font-semibold hover:underline"
            >
              Skriv til os på hej@abovagt.dk
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
