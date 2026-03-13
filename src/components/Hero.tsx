"use client";

import { useEffect } from "react";
import Inspektoeren from "./Inspektoeren";

const track = (event: string, data?: Record<string, string | number>) => {
  if (typeof umami !== 'undefined') umami.track(event, data);
};

const checkIcon = (color: string) => (
  <svg
    className={`w-5 h-5 ${color} mt-0.5 shrink-0`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const shieldIcon = (
  <svg className="w-5 h-5 text-[#1B7A6E] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default function Hero() {
  useEffect(() => {
    track('page_view_home');
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C2B2A] leading-tight">
            Stop med at betale for det{" "}
            <span className="text-[#1B7A6E]">du ikke bruger</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600">
            V&aelig;lg hvordan du vil spare:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {/* Quiz */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="absolute -top-3 left-5 bg-gray-700 text-white text-[11px] font-bold px-3 py-1 rounded-full">
              100% gratis
            </div>

            <h2 className="text-xl font-bold text-[#1C2B2A] mt-2 mb-6">Quiz</h2>

            <ul className="space-y-2.5 mb-8 flex-1">
              {[
                "Tag gratis quiz",
                "Se estimeret forbrug",
                "F\u00e5 tips",
                "Kr\u00e6ver ingen login",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  {checkIcon("text-gray-400")}
                  <span className="text-gray-600 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="/quiz"
              onClick={() => track('click_quiz')}
              className="block w-full text-center px-5 py-3 bg-white text-[#1C2B2A] font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
            >
              Tag den gratis quiz &rarr;
            </a>
          </div>

          {/* Engangsscanning — highlighted */}
          <div className="relative bg-teal-50/60 rounded-2xl border-2 border-[#1B7A6E] p-6 sm:p-7 shadow-lg hover:shadow-xl transition-shadow flex flex-col md:-mt-2 md:mb-[-8px]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
              Mest popul&aelig;r
            </div>

            <div className="flex items-start justify-between mt-2 mb-4">
              <h2 className="text-xl font-bold text-[#1C2B2A]">Engangsscanning</h2>
              <Inspektoeren
                pose="searching"
                size={52}
                speechBubble="Jeg finder dem!"
              />
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {[
                "Bank via Tink (kun l\u00e6seadgang)",
                "AI finder abonnementer",
                "F\u00e6rdige opsigelsesmails",
                "Betal kun n\u00e5r du sparer",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  {checkIcon("text-[#1B7A6E]")}
                  <span className="text-gray-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="/connect"
              onClick={() => track('click_engang')}
              className="block w-full text-center px-5 py-3 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-md shadow-teal-600/20 text-sm"
            >
              Find mine abonnementer &rarr;
            </a>
            <p className="mt-2.5 text-center text-[11px] text-gray-500">
              Engangsbetaling: 25% af besparelsen &mdash; maks 149 kr
            </p>
          </div>

          {/* Monitoring */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="absolute -top-3 left-5 bg-gray-700 text-white text-[11px] font-bold px-3 py-1 rounded-full">
              L&oslash;bende kontrol
            </div>

            <h2 className="text-xl font-bold text-[#1C2B2A] mt-2 mb-6">Monitoring</h2>

            <ul className="space-y-2.5 mb-8 flex-1">
              {[
                "Kvartalsvis scanning",
                "Nye abonnementer opdages",
                "Pris\u00e6ndringer + alternativer",
                "Inkl. engangsscanning ved opstart",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  {checkIcon("text-gray-400")}
                  <span className="text-gray-600 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="/connect"
              onClick={() => track('click_monitoring')}
              className="block w-full text-center px-5 py-3 bg-white text-[#1C2B2A] font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
            >
              Start monitoring &rarr;
            </a>
            <p className="mt-2.5 text-center text-[11px] text-gray-500">
              15 kr/md &mdash; inkl. f&oslash;rste scanning + opsigelseshj&aelig;lp
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-12 sm:mt-16">
          {[
            "GDPR-compliant",
            "Kun l\u00e6seadgang til bank",
            "Ingen binding",
            "Dansk virksomhed",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              {shieldIcon}
              <span className="text-sm text-gray-600">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
