"use client";

function ComingSoonBadge() {
  return (
    <div className="absolute -top-3 -right-3 z-10 pointer-events-none">
      <div className="bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md -rotate-12 whitespace-nowrap">
        Kommer snart 🚀
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pris" className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Simpel, fair prissætning
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Quizzen er altid gratis. Fuld service koster kun en del af det du
            sparer.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

          {/* Quiz — gratis, INGEN badge */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col overflow-visible">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide whitespace-nowrap">
              100% gratis
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Quiz</h3>

            <div className="space-y-4 mb-8 flex-1">
              {[
                "Tag gratis quiz",
                "Se estimeret forbrug",
                "Få tips",
                "Kræver ingen login",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-[#1B7A6E] mt-0.5 shrink-0"
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
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <a
              href="/quiz"
              onClick={() => { if (typeof window !== 'undefined' && window.umami) { window.umami.track('signup_quiz'); } }}
              className="block w-full text-center px-5 py-3 bg-white text-[#1B7A6E] font-semibold rounded-xl border border-[#1B7A6E] hover:bg-teal-50 transition-colors text-sm"
            >
              Tag den gratis quiz &rarr;
            </a>
          </div>

          {/* Engangsscanning — "Kommer snart" badge */}
          <div className="relative bg-white rounded-2xl border-2 border-[#1B7A6E] p-8 shadow-lg flex flex-col overflow-visible">
            <ComingSoonBadge />
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide whitespace-nowrap">
              Mest popul&aelig;r
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Engangsscanning</h3>

            <div className="space-y-4 mb-8 flex-1">
              {[
                "Sikker bankforbindelse (kun læseadgang)",
                "AI finder abonnementer",
                "Du vælger hvad der skal opsiges",
                "Du betaler først når DU har godkendt",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-[#1B7A6E] mt-0.5 shrink-0"
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
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <a
              href="/connect"
              onClick={() => { if (typeof window !== 'undefined' && window.umami) { window.umami.track('signup_engang'); } }}
              className="block w-full text-center px-5 py-3 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#166459] transition-colors text-sm mb-3"
            >
              Find mine abonnementer &rarr;
            </a>
            <p className="text-center text-xs text-gray-500">
              35 kr efter du har godkendt dine opsigelser — ellers gratis
            </p>
          </div>

          {/* Monitoring — "Kommer snart" badge */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col overflow-visible">
            <ComingSoonBadge />
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide whitespace-nowrap">
              L&oslash;bende kontrol
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Monitoring</h3>

            <div className="space-y-4 mb-8 flex-1">
              {[
                "Kvartalsvis scanning",
                "Nye abonnementer opdages",
                "Prisændringer + alternativer",
                "Inkl. engangsscanning ved opstart",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400 mt-0.5 shrink-0"
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
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <a
              href="/connect"
              onClick={() => { if (typeof window !== 'undefined' && window.umami) { window.umami.track('signup_monitoring'); } }}
              className="block w-full text-center px-5 py-3 bg-white text-[#1B7A6E] font-semibold rounded-xl border border-[#1B7A6E] hover:bg-teal-50 transition-colors text-sm mb-3"
            >
              Start monitoring &rarr;
            </a>
            <p className="text-center text-xs text-gray-500">
              15 kr/md — inkl. f&oslash;rste scanning + opsigelseshj&aelig;lp
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
