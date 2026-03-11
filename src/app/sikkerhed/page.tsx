import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SikkerhedPage() {
  const sections = [
    {
      icon: "\uD83D\uDD10",
      title: "Hvordan virker det?",
      content: [
        "Vi bruger Tink — en Open Banking-platform ejet af Visa — til at forbinde din bank sikkert.",
        "Tink er reguleret under EU\u2019s PSD2-lovgivning og godkendt af Finanstilsynet. Det er den samme teknologi som bruges af Nordens st\u00f8rste banker.",
        "N\u00e5r du forbinder din bank, opretter Tink en sikker, krypteret forbindelse. Vi f\u00e5r kun adgang til det vi har brug for: dine transaktioner.",
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
      note: "Vi har en AISP-licens (Account Information Service Provider) \u2014 det betyder kun l\u00e6seadgang. Det er teknisk umuligt for os at flytte penge.",
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
              Vi bruger bankindustriens egne v&aelig;rkt&oslash;jer til at beskytte dine data.
              Her kan du l&aelig;se pr&aelig;cis hvad vi kan &mdash; og hvad vi ikke kan.
            </p>
          </div>

          {/* Visa + Tink logos */}
          <div className="flex items-center justify-center gap-6 mb-12 sm:mb-16">
            <div className="bg-gray-50 rounded-xl border border-gray-200 px-6 py-4 flex items-center gap-4">
              <svg className="h-8" viewBox="0 0 1000 324" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M433.3 7.4l-96.6 230.3h-63.1L212.4 48.3c-3.7-14.6-6.9-19.9-18.2-26.1C178 13.8 151.2 6 127 1l1.5-7.4h101.7c13 0 24.6 8.6 27.6 23.5L281.5 155l62.9-161.5h63.1l25.8 13.9zm45.4-5.9l-49.7 236.2h-60.1l49.7-236.2h60.1zm227.3 159c.2-62.3-86.2-65.7-85.6-93.5.2-8.5 8.3-17.5 25.9-19.8 8.7-1.2 32.8-2.1 60.2 10.7l10.7-50.1C703.5 3 685.2-1.5 663-1.5c-59.4 0-101.2 31.6-101.5 76.8-.4 33.5 29.8 52.1 52.6 63.3 23.5 11.4 31.4 18.8 31.3 29-.2 15.6-18.8 22.6-36.1 22.8-30.4.5-48-8.2-62-14.7l-10.9 51.1c14.1 6.5 40.2 12.1 67.2 12.4 63.1 0 104.4-31.2 104.6-79.5M891.7 237.7h55.6L899.5 1.5h-51.3c-11.5 0-21.2 6.7-25.5 17.1l-89.9 219.1h63l12.5-34.7h77l7.3 34.7zm-67-82.3l31.6-87.2 18.2 87.2h-49.8z" fill="#1A1F71" transform="translate(50,40)"/>
              </svg>
              <div className="w-px h-8 bg-gray-300" />
              <div>
                <p className="text-lg font-bold text-[#1C2B2A]">Tink</p>
                <p className="text-xs text-gray-500">En del af Visa</p>
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
