"use client";

import { useState, useEffect } from "react";
import Inspektoeren from "@/components/Inspektoeren";
import { trackEvent } from "@/lib/analytics";

interface Props {
  onNext: (email: string, newsletterConsent: boolean) => void;
  onBack?: () => void;
}

export default function StepEmail({ onNext, onBack }: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof umami !== 'undefined') umami.track('quiz_email_shown');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Indtast en gyldig email-adresse");
      return;
    }

    setLoading(true);
    setError("");
    trackEvent("quiz_email_submitted");
    onNext(email, newsletter);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <Inspektoeren pose="waving" size={100} className="mb-4" />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Indtast din email for at se dit resultat
        </h1>
        <p className="mt-3 text-gray-600">
          Dit resultat sendes til din inbox. 100% gratis, ingen spam.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="din@email.dk"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            required
            className="w-full px-4 py-3.5 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E]"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#1B7A6E] focus:ring-[#1B7A6E]"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            Jeg accepterer at AboVagt må sende mig mit quiz-resultat per email
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-[#1B7A6E] focus:ring-[#1B7A6E]"
          />
          <span className="text-sm text-gray-600 leading-relaxed">
            Hold mig opdateret med tips til at spare penge på abonnementer
          </span>
        </label>

        <button
          type="submit"
          disabled={!email || !consent || loading}
          className="w-full px-6 py-3.5 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
        >
          {loading ? "Vent..." : "Fortsæt →"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400">
        Du kan altid afmelde dig. Vi deler aldrig din email med andre.
      </p>

      {onBack && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors"
          >
            ← Tilbage
          </button>
        </div>
      )}
    </div>
  );
}
