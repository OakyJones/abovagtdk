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

        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Engangsbetaling */}
          <div className="relative bg-white rounded-2xl border-2 border-[#1B7A6E] p-8 shadow-lg flex flex-col">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
              Ingen risiko
            </div>

            <div className="text-center mb-8">
              <p className="text-sm font-semibold text-[#1B7A6E] uppercase tracking-wide">
                Fuld service
              </p>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-5xl sm:text-6xl font-bold text-gray-900">
                  25%
                </span>
                <span className="text-gray-500">af besparelsen</span>
              </div>
              <p className="mt-2 text-gray-500">
                En engangsbetaling — kun når du faktisk sparer.
              </p>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              {[
                "Quizzen er og bliver 100% gratis",
                "Automatisk scanning via bankforbindelse",
                "AI-analyse af alle abonnementer",
                "Færdige opsigelsesmails",
                "En engangsbetaling — kun ved reel besparelse",
                "Ingen binding eller skjulte gebyrer",
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

            <p className="text-center text-sm text-gray-500">
              Eksempel: Sparer du 200 kr/md, betaler du 50 kr en gang.
            </p>
          </div>

          {/* Monitoring */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
              Tilvalg
            </div>

            <div className="text-center mb-8">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                AboVagt Monitoring
              </p>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-5xl sm:text-6xl font-bold text-gray-900">
                  15
                </span>
                <span className="text-gray-500">kr/md</span>
              </div>
              <p className="mt-2 text-gray-500">
                Vi holder øje — du slipper for overraskelser.
              </p>
            </div>

            <div className="space-y-4 mb-8 flex-1">
              {[
                "Kvartalsvis scanning af dine transaktioner",
                "Automatisk besked ved nye abonnementer",
                "Besked ved prisændringer på eksisterende",
                "Overblik over dit abonnementsforbrug over tid",
                "Kan opsiges når som helst",
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

            <p className="text-center text-sm text-gray-500">
              Tilføj efter din første scanning — kræver bankforbindelse.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
