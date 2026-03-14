"use client";

import { useSearchParams, Suspense } from "next/navigation";
import Footer from "@/components/Footer";

function AfmeldContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <a href="/" className="text-xl font-bold tracking-tight">
              <span className="text-black">Abo</span>
              <span className="text-[#1B7A6E]">Vagt</span>
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-24 text-center">
        {success ? (
          <>
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#1B7A6E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1C2B2A] mb-3">Du er nu afmeldt</h1>
            <p className="text-gray-600 mb-8">
              Du vil ikke modtage flere nyhedsbreve eller tips fra os. Dit quiz-resultat og eventuelle scanninger er ikke p&aring;virket.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#1C2B2A] mb-3">Afmeld nyhedsbrev</h1>
            <p className="text-gray-600 mb-8">
              Brug linket i din email for at afmelde dig.
            </p>
          </>
        )}
        <a
          href="/"
          className="inline-block px-6 py-3 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-colors"
        >
          Tilbage til forsiden
        </a>
      </div>

      <Footer />
    </div>
  );
}

export default function AfmeldPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Indl&aelig;ser...</div>}>
      <AfmeldContent />
    </Suspense>
  );
}
