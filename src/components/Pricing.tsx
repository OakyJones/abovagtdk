export default function Pricing() {
  return (
    <section id="pris" className="bg-white py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Du betaler kun hvis du sparer
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Ingen risiko. Quizzen er gratis, og du betaler kun en andel af det,
            du faktisk sparer.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative bg-white rounded-2xl border-2 border-[#1B7A6E] p-8 sm:p-10 shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1B7A6E] text-white text-sm font-medium px-4 py-1.5 rounded-full">
              Ingen risiko
            </div>

            <div className="text-center">
              <p className="text-5xl sm:text-6xl font-bold text-gray-900">
                25<span className="text-3xl">%</span>
              </p>
              <p className="mt-2 text-lg text-gray-600">
                af din dokumenterede besparelse
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                "Gratis quiz og analyse",
                "Personlig spareplan",
                "Ingen binding eller skjulte gebyrer",
                "Du betaler kun når du sparer",
                "Fuld gennemsigtighed i beregningen",
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
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <a
                href="#quiz"
                className="block w-full text-center px-8 py-4 bg-[#1B7A6E] text-white text-lg font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 hover:shadow-xl"
              >
                Kom i gang — det er gratis
              </a>
            </div>

            <p className="mt-4 text-center text-sm text-gray-500">
              Eksempel: Sparer du 2.400 kr/år, betaler du 600 kr.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
