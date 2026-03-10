"use client";

import { useState } from "react";
import Inspektoeren from "@/components/Inspektoeren";

interface Props {
  onNext: (email: string) => void;
}

export default function StepEmail({ onNext }: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    onNext(email);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <Inspektoeren pose="waving" size={100} className="mb-4" />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Indtast din email for at gemme dit resultat
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
            Jeg accepterer at AboVagt må sende mig mit resultat og tips til
            at spare på abonnementer
          </span>
        </label>

        <button
          type="submit"
          disabled={!email || !consent || loading}
          className="w-full px-6 py-3.5 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
        >
          {loading ? "Vent..." : "Start quizzen →"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-400">
        Du kan altid afmelde dig. Vi deler aldrig din email med andre.
      </p>
    </div>
  );
}
