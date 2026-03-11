"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Inspektoeren from "@/components/Inspektoeren";

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
      // Create or find user via server-side API
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newsletterConsent: newsletter,
          signupPath: "connect",
        }),
      });

      const regData = await regRes.json();

      if (!regRes.ok || !regData.userId) {
        setConnectError(regData.error || "Kunne ikke oprette bruger — prøv igen");
        setLoading(false);
        return;
      }

      const userId = regData.userId;
      localStorage.setItem("abovagt_user_id", userId);
      localStorage.setItem("abovagt_user_email", email);

      // Go to dashboard — card step comes first, then Tink
      window.location.href = "/dashboard";
    } catch {
      setConnectError("Noget gik galt — prøv igen");
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
            <span className="text-sm text-gray-500">Kom i gang</span>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
              Indtast din email for at komme i gang. Derefter registrerer du dit kort
              og forbinder din bank.
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
                Jeg accepterer{" "}
                <a href="/handelsbetingelser" className="text-[#1B7A6E] underline">handelsbetingelserne</a>
                {" "}og{" "}
                <a href="/privatlivspolitik" className="text-[#1B7A6E] underline">privatlivspolitikken</a>
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
              {loading ? "Opretter konto..." : "Kom i gang →"}
            </button>
          </form>

          {/* Tink/Visa trust box */}
          <div className="mt-8 bg-gray-50 rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              {/* Visa logo */}
              <svg className="h-6 shrink-0" viewBox="0 0 1000 324" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M433.3 7.4l-96.6 230.3h-63.1L212.4 48.3c-3.7-14.6-6.9-19.9-18.2-26.1C178 13.8 151.2 6 127 1l1.5-7.4h101.7c13 0 24.6 8.6 27.6 23.5L281.5 155l62.9-161.5h63.1l25.8 13.9zm45.4-5.9l-49.7 236.2h-60.1l49.7-236.2h60.1zm227.3 159c.2-62.3-86.2-65.7-85.6-93.5.2-8.5 8.3-17.5 25.9-19.8 8.7-1.2 32.8-2.1 60.2 10.7l10.7-50.1C703.5 3 685.2-1.5 663-1.5c-59.4 0-101.2 31.6-101.5 76.8-.4 33.5 29.8 52.1 52.6 63.3 23.5 11.4 31.4 18.8 31.3 29-.2 15.6-18.8 22.6-36.1 22.8-30.4.5-48-8.2-62-14.7l-10.9 51.1c14.1 6.5 40.2 12.1 67.2 12.4 63.1 0 104.4-31.2 104.6-79.5M891.7 237.7h55.6L899.5 1.5h-51.3c-11.5 0-21.2 6.7-25.5 17.1l-89.9 219.1h63l12.5-34.7h77l7.3 34.7zm-67-82.3l31.6-87.2 18.2 87.2h-49.8z" fill="#1A1F71" transform="translate(50,40)"/>
              </svg>
              <span className="text-xs text-gray-400">+</span>
              <span className="text-sm font-bold text-[#1C2B2A]">Tink</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Din bankforbindelse h&aring;ndteres af <strong>Tink</strong>, en del af <strong>Visa</strong>.
              Vi kan kun l&aelig;se dine transaktioner &mdash; aldrig flytte penge eller se dit saldo.
            </p>
            <a
              href="/sikkerhed"
              className="inline-block mt-3 text-sm font-medium text-[#1B7A6E] hover:underline"
            >
              L&aelig;s mere om sikkerheden &rarr;
            </a>
          </div>

          <div className="mt-5 space-y-3">
            {[
              "Ingen penge tr\u00e6kkes f\u00f8r du godkender",
              "Sikker bankforbindelse via Tink (kun l\u00e6seadgang)",
              "Dine data slettes n\u00e5r du vil",
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
      </div>
    </div>
  );
}
