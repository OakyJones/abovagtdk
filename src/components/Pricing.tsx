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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Gratis */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10 flex flex-col">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Quiz
            </p>
            <p className="mt-4 text-4xl sm:text-5xl font-bold text-gray-900">
              Gratis
            </p>
            <p className="mt-2 text-gray-500">Altid. Ingen hager.</p>

            <div className="mt-8 space-y-4 flex-1">
              {[
                "Personlig quiz om dine abonnementer",
                "Estimeret forbrug og besparelse",
                "Tips til hvad du kan opsige",
                "Ingen login påkrævet",
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
                  <span className="text-gray-600 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <a
              href="#quiz"
              className="mt-8 block w-full text-center px-6 py-3.5 bg-gray-100 text-gray-800 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Tag den gratis quiz &rarr;
            </a>
          </div>

          {/* Fuld service */}
          <div className="relative bg-white rounded-2xl border-2 border-[#1B7A6E] p-8 sm:p-10 shadow-lg flex flex-col">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
              Anbefalet
            </div>

            <p className="text-sm font-semibold text-[#1B7A6E] uppercase tracking-wide">
              Fuld service
            </p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                25%
              </span>
              <span className="text-gray-500">af besparelsen</span>
            </div>
            <p className="mt-2 text-gray-500">
              Du betaler kun når du vælger at handle.
            </p>

            <div className="mt-8 space-y-4 flex-1">
              {[
                "Alt fra gratis — plus:",
                "Automatisk scanning via bankforbindelse",
                "AI-analyse af alle abonnementer",
                "Færdige opsigelsesmails",
                "Du betaler kun ved reel besparelse",
              ].map((feature, i) => (
                <div key={feature} className="flex items-start gap-3">
                  <svg
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      i === 0 ? "text-transparent" : "text-[#1B7A6E]"
                    }`}
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
                  <span
                    className={`text-sm ${
                      i === 0
                        ? "text-gray-400 font-medium -ml-8"
                        : "text-gray-700"
                    }`}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="#kom-igang"
              className="mt-8 block w-full text-center px-6 py-3.5 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20"
            >
              Find mine abonnementer &rarr;
            </a>

            <p className="mt-3 text-center text-xs text-gray-500">
              Eksempel: Sparer du 2.400 kr/år, betaler du 600 kr.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
