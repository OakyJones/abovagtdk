export default function ValueProp() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Er din tid penge værd?
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            De fleste bruger 2+ timer på at gennemgå kontoudtog, ringe til
            kundeservice og skrive opsigelsesmails. Vi gør det på 5 minutter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Uden AboVagt
            </p>
            <ul className="space-y-3">
              {[
                "Gennemgå kontoudtog manuelt",
                "Google hver enkelt tjeneste",
                "Find opsigelsesvilkår",
                "Skriv opsigelsesmails fra bunden",
                "Hold styr på hvad der er opsagt",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-400 mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-600">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-2xl font-bold text-gray-900">
              ~2 timer
            </p>
          </div>

          <div className="bg-teal-50 rounded-2xl p-8 border-2 border-[#1B7A6E]/20">
            <p className="text-sm font-semibold text-[#1B7A6E] uppercase tracking-wide mb-4">
              Med AboVagt
            </p>
            <ul className="space-y-3">
              {[
                "Vi finder dine abonnementer via din bank",
                "AI analyserer hvad du kan spare",
                "Du får færdige opsigelsesmails",
                "Du trykker send — du er i kontrol",
                "Alt samlet ét sted",
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
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-2xl font-bold text-[#1B7A6E]">
              5 minutter
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-gray-500">
          Alt for 25% af det du sparer — og kun hvis du vælger at handle.
        </p>
      </div>
    </section>
  );
}
