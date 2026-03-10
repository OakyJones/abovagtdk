"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Inspektoeren from "@/components/Inspektoeren";
import { supabase } from "@/lib/supabase";

export default function ConnectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Indlæser...
        </div>
      }
    >
      <ConnectContent />
    </Suspense>
  );
}

function ConnectContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [step, setStep] = useState<"email" | "connecting">("email");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [connectError, setConnectError] = useState<string | null>(error || null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Indtast en gyldig email-adresse");
      return;
    }

    setLoading(true);
    setEmailError("");

    try {
      // Create or find user
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      let userId: string;

      if (existing) {
        userId = existing.id;
        await supabase
          .from("users")
          .update({
            newsletter_consent: newsletter,
            signup_path: "connect",
          })
          .eq("id", userId);
      } else {
        const { data: newUser } = await supabase
          .from("users")
          .insert({
            email,
            newsletter_consent: newsletter,
            signup_path: "connect",
          })
          .select("id")
          .single();
        if (!newUser) {
          setConnectError("Kunne ikke oprette bruger");
          setLoading(false);
          return;
        }
        userId = newUser.id;
      }

      localStorage.setItem("abovagt_user_id", userId);

      // Go directly to Tink
      setStep("connecting");
      const res = await fetch("/api/tink/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 503) {
          setConnectError(
            "Tink bankforbindelse er ikke aktiveret endnu. Vi arbejder på det!"
          );
        } else {
          setConnectError(data.error || "Kunne ikke oprette bankforbindelse");
        }
        setStep("email");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setConnectError("Noget gik galt — prøv igen");
      setStep("email");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <a href="/" className="text-xl font-bold tracking-tight">
              <span className="text-black">Abo</span>
              <span className="text-[#1B7A6E]">Vagt</span>
            </a>
            <span className="text-sm text-gray-500">Forbind din bank</span>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {step === "email" && (
          <div>
            <div className="text-center mb-8">
              <Inspektoeren
                pose="searching"
                size={120}
                speechBubble="Lad mig finde dine abonnementer!"
                className="mb-4"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A] mb-3">
                Find dine abonnementer automatisk
              </h1>
              <p className="text-gray-600">
                Indtast din email, og vi forbinder sikkert til din bank via Tink
                for at finde alle dine abonnementer.
              </p>
            </div>

            {connectError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                <p className="text-sm text-red-700">{connectError}</p>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="din@email.dk"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E]"
                />
                {emailError && (
                  <p className="mt-2 text-sm text-red-600">{emailError}</p>
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
                  Jeg accepterer at AboVagt forbinder til min bank via Tink (kun
                  læseadgang) og sender mig resultatet per email
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
                className="w-full px-6 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 text-lg"
              >
                {loading ? "Opretter forbindelse..." : "Forbind min bank →"}
              </button>
            </form>

            <div className="mt-8 space-y-3">
              {[
                "Sikker forbindelse via Tink (reguleret af Finanstilsynet)",
                "Kun læseadgang — vi kan aldrig flytte penge",
                "Dine data slettes når du vil",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-left">
                  <svg
                    className="w-5 h-5 text-[#1B7A6E] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-gray-400">
              Du kan altid afmelde dig. Vi deler aldrig din email med andre.
            </p>
          </div>
        )}

        {step === "connecting" && (
          <div className="text-center py-12">
            <Inspektoeren pose="searching" size={120} className="mb-6" />
            <h2 className="text-2xl font-bold text-[#1C2B2A] mb-3">
              Opretter bankforbindelse...
            </h2>
            <p className="text-gray-600 mb-8">
              Du bliver sendt videre til Tink om et øjeblik
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-3 border-[#1B7A6E] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
