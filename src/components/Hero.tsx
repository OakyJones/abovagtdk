export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
            Stop med at betale for det{" "}
            <span className="text-[#1B7A6E]">du ikke bruger</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600">
            Vælg hvordan du vil spare:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {/* Vej 1: Gratis quiz */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Gratis
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Jeg vil selv udforske
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Få overblik på egen hånd — helt uden forpligtelser.
            </p>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Tag vores gratis quiz",
                "Se estimeret forbrug på dine abonnementer",
                "Få tips til hvad du kan opsige",
                "Kræver ingen login eller bankforbindelse",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
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
                  <span className="text-gray-600 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="#quiz"
              className="block w-full text-center px-6 py-3.5 bg-gray-100 text-gray-800 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Tag den gratis quiz
              <span className="ml-1">&rarr;</span>
            </a>
          </div>

          {/* Vej 2: Fuld service */}
          <div className="relative bg-white rounded-2xl border-2 border-[#1B7A6E] p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
              Mest populær
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-teal-50 text-[#1B7A6E] text-sm font-medium px-3 py-1.5 rounded-full">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                25% af besparelsen
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Fix det for mig
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Vi klarer det tunge arbejde — du sparer tid og penge.
            </p>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Vi forbinder til din bank via Tink — kun læseadgang",
                "AI finder alle dine abonnementer automatisk",
                "Vi laver færdige opsigelsesmails — du trykker send",
                "5 minutter i stedet for 3 timer",
                "Du betaler kun når du sparer penge",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
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
                  <span className="text-gray-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <a
              href="#kom-igang"
              className="block w-full text-center px-6 py-3.5 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30"
            >
              Find mine abonnementer
              <span className="ml-1">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
