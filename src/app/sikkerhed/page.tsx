import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SikkerhedPage() {
  const sections = [
    {
      icon: "\uD83D\uDD10",
      title: "Hvordan virker det?",
      content: [
        "Vi bruger sikker open banking til at forbinde din bank. Forbindelsen er reguleret under EU\u2019s PSD2-lovgivning og er godkendt af de relevante finanstilsyn.",
        "Du v\u00e6lger selv din bank og logger ind via bankens egen loginside (fx MitID). Vi f\u00e5r kun adgang til det vi har brug for: dine transaktioner.",
        "Alle data overf\u00f8res krypteret og vi har kun l\u00e6seadgang (AISP) \u2014 vi kan aldrig flytte penge.",
      ],
    },
    {
      icon: "\uD83D\uDC41\uFE0F",
      title: "Hvad kan vi se?",
      items: [
        "Transaktioner (k\u00f8b, abonnementer, overf\u00f8rsler)",
        "Transaktionsdato og bel\u00f8b",
        "Betalingsmodtager (fx Netflix, Spotify)",
      ],
      note: "Det er alt. Vi bruger dette til at identificere tilbagevendende betalinger og finde dine abonnementer.",
    },
    {
      icon: "\uD83D\uDEAB",
      title: "Hvad kan vi IKKE?",
      items: [
        "Vi kan aldrig flytte penge fra din konto",
        "Vi kan aldrig foretage betalinger",
        "Vi kan ikke se din saldo",
        "Vi kan ikke se dit kontonummer eller registreringsnummer",
        "Vi kan ikke \u00e6ndre noget i din bank",
      ],
      note: "Vi har kun l\u00e6seadgang via AISP (Account Information Service Provider) \u2014 det er teknisk umuligt for os at flytte penge.",
    },
    {
      icon: "\uD83D\uDDC4\uFE0F",
      title: "Hvor er mine data?",
      items: [
        "Alle data opbevares i EU (Frankfurt, Tyskland)",
        "Krypteret b\u00e5de under overf\u00f8rsel (TLS 1.3) og opbevaring (AES-256)",
        "Bankdata slettes automatisk efter 30 dage",
        "Du kan til enhver tid bede om fuld sletning af alle dine data",
        "Vi s\u00e6lger aldrig dine oplysninger til tredjepart",
      ],
      note: "Vi f\u00f8lger GDPR fuldt ud og er registreret som dataansvarlig.",
    },
    {
      icon: "\uD83C\uDDE9\uD83C\uDDF0",
      title: "Hvem st\u00e5r bag?",
      content: [
        "AboVagt drives af Halvfems Procent, en dansk virksomhed med CVR-nummer 46314697.",
        "Vi er en dansk startup med fokus p\u00e5 at hj\u00e6lpe danskere med at f\u00e5 styr p\u00e5 deres abonnementer og spare penge.",
        "Du kan altid kontakte os p\u00e5 hej@abovagt.dk.",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C2B2A]">
              Din sikkerhed er vores prioritet
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Vi bruger reguleret open banking (PSD2) til at beskytte dine data.
              Her kan du l&aelig;se pr&aelig;cis hvad vi kan &mdash; og hvad vi ikke kan.
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12 sm:mb-16">
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-3 flex items-center gap-3">
              <span className="text-xl">{"\uD83D\uDD12"}</span>
              <div>
                <p className="text-sm font-bold text-[#1C2B2A]">PSD2/AISP</p>
                <p className="text-xs text-gray-500">Kun l&aelig;seadgang</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-3 flex items-center gap-3">
              <span className="text-xl">{"\uD83C\uDDEA\uD83C\uDDFA"}</span>
              <div>
                <p className="text-sm font-bold text-[#1C2B2A]">EU-reguleret</p>
                <p className="text-xs text-gray-500">Open banking</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-3 flex items-center gap-3">
              <span className="text-xl">{"\uD83D\uDEE1\uFE0F"}</span>
              <div>
                <p className="text-sm font-bold text-[#1C2B2A]">GDPR</p>
                <p className="text-xs text-gray-500">Fuld compliance</p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section) => (
              <div
                key={section.title}
                className="bg-gray-50 rounded-2xl border border-gray-200 p-6 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0 mt-0.5">{section.icon}</span>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">
                      {section.title}
                    </h2>

                    {section.content && (
                      <div className="space-y-2">
                        {section.content.map((p, i) => (
                          <p key={i} className="text-gray-600 leading-relaxed">
                            {p}
                          </p>
                        ))}
                      </div>
                    )}

                    {section.items && (
                      <ul className="space-y-2 mb-3">
                        {section.items.map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <svg
                              className={`w-5 h-5 mt-0.5 shrink-0 ${
                                section.title.includes("IKKE")
                                  ? "text-red-500"
                                  : "text-[#1B7A6E]"
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {section.title.includes("IKKE") ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              )}
                            </svg>
                            <span className="text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.note && (
                      <p className="text-sm text-gray-500 italic mt-2">
                        {section.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              Har du sp&oslash;rgsm&aring;l om sikkerhed? Skriv til os p&aring;{" "}
              <a href="mailto:hej@abovagt.dk" className="text-[#1B7A6E] font-medium underline">
                hej@abovagt.dk
              </a>
            </p>
            <a
              href="/connect"
              className="inline-block px-8 py-4 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 text-lg"
            >
              Kom i gang &mdash; det tager 2 minutter &rarr;
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
