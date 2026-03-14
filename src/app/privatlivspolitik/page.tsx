import Footer from "@/components/Footer";

export const metadata = {
  title: "Privatlivspolitik – AboVagt",
  description: "Læs om hvordan AboVagt behandler dine personoplysninger.",
};

export default function PrivatlivspolitikPage() {
  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <a href="/" className="text-xl font-bold tracking-tight">
                <span className="text-black">Abo</span>
                <span className="text-[#1B7A6E]">Vagt</span>
              </a>
              <span className="text-sm text-gray-500">Privatlivspolitik</span>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1C2B2A] mb-2">Privatlivspolitik</h1>
          <p className="text-sm text-gray-500 mb-10">Sidst opdateret: 10. marts 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            {/* Dataansvarlig */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Hvem er vi?</h2>
              <p className="text-gray-700 leading-relaxed">
                AboVagt drives af <strong>Halvfems Procent</strong>, CVR 46314697.
                Du kan kontakte os på{" "}
                <a href="mailto:hej@abovagt.dk" className="text-[#1B7A6E] hover:underline">hej@abovagt.dk</a>.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Vi er dataansvarlige for de personoplysninger, vi behandler om dig, når du bruger abovagt.dk.
              </p>
            </section>

            {/* Hvilke data */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Hvilke oplysninger indsamler vi?</h2>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="font-semibold text-[#1C2B2A] mb-1">Email-adresse</p>
                  <p className="text-sm text-gray-600">Til at oprette din konto og sende opsigelsesmails på dine vegne.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="font-semibold text-[#1C2B2A] mb-1">Quiz-svar</p>
                  <p className="text-sm text-gray-600">Dine svar i vores abonnementsquiz bruges til at estimere din besparelse.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="font-semibold text-[#1C2B2A] mb-1">Bankdata via open banking</p>
                  <p className="text-sm text-gray-600">
                    Vi henter dine transaktioner via reguleret open banking (PSD2) for at finde abonnementer. Vi har <strong>kun læseadgang</strong> — vi kan aldrig flytte penge eller ændre noget i din bank.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="font-semibold text-[#1C2B2A] mb-1">Betalingsoplysninger</p>
                  <p className="text-sm text-gray-600">Kortoplysninger håndteres af Stripe. Vi ser aldrig dit fulde kortnummer.</p>
                </div>
              </div>
            </section>

            {/* Formål */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Hvad bruger vi dine data til?</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#1B7A6E] mt-1 shrink-0">&#10003;</span>
                  <span>Levere abonnementsanalyse baseret på dine banktransaktioner</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1B7A6E] mt-1 shrink-0">&#10003;</span>
                  <span>Generere og sende opsigelsesmails til dine udbydere</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1B7A6E] mt-1 shrink-0">&#10003;</span>
                  <span>Behandle din betaling via Stripe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1B7A6E] mt-1 shrink-0">&#10003;</span>
                  <span>Forbedre vores service og finde fejl</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500 mt-3">
                Retsgrundlag: Opfyldelse af aftale (GDPR art. 6, stk. 1, litra b) og berettiget interesse (litra f) til forbedring af service.
              </p>
            </section>

            {/* Open banking */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Bankdata og open banking</h2>
              <p className="text-gray-700 leading-relaxed">
                Vi bruger GoCardless Bank Account Data (tidligere Nordigen) til at hente dine banktransaktioner. GoCardless er en autoriseret AISP (Account Information Service Provider) med licens i EU under PSD2-regulering. Halvfems Procent har ikke egen AISP-licens &mdash; vi opererer under GoCardless&apos; licens. Bankdata behandles under GoCardless&apos; egen privatlivspolitik.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Vi har udelukkende <strong>læseadgang</strong> til dine transaktioner. Vi kan aldrig initiere betalinger, overførsler eller andre ændringer i din bank.
              </p>
            </section>

            {/* AI-analyse */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">AI-analyse af transaktioner</h2>
              <p className="text-gray-700 leading-relaxed">
                Dine banktransaktioner analyseres af Anthropic Claude (AI) for at identificere abonnementer og beregne besparelser. Transaktionsdata sendes krypteret til Anthropic, som behandler data udelukkende til din analyse. Vi arbejder p&aring; at etablere en formel databehandleraftale med Anthropic. Data gemmes ikke af AI-tjenesten efterf&oslash;lgende.
              </p>
            </section>

            {/* Dataopbevaring */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Hvor opbevares dine data?</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Al data opbevares inden for EU:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-sm font-semibold text-[#1C2B2A]">Supabase</p>
                  <p className="text-xs text-gray-500">Database — Frankfurt, Tyskland</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-sm font-semibold text-[#1C2B2A]">GoCardless (open banking)</p>
                  <p className="text-xs text-gray-500">Bankdata — EU</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-sm font-semibold text-[#1C2B2A]">Resend</p>
                  <p className="text-xs text-gray-500">Email — EU</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-sm font-semibold text-[#1C2B2A]">Stripe</p>
                  <p className="text-xs text-gray-500">Betaling — EU</p>
                </div>
              </div>
            </section>

            {/* Opbevaringsperiode */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Hvor l&aelig;nge opbevarer vi dine data?</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 shrink-0">&bull;</span>
                  <span><strong>Quiz-data:</strong> Op til 12 m&aring;neder, derefter slettet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 shrink-0">&bull;</span>
                  <span><strong>Bankdata:</strong> Slettes umiddelbart efter scanning. Vi gemmer kun de fundne abonnementer, ikke dine r&aring; transaktioner.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 shrink-0">&bull;</span>
                  <span><strong>Betalingsdata:</strong> 5 &aring;r i henhold til bogf&oslash;ringsloven</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 shrink-0">&bull;</span>
                  <span><strong>Konto og email:</strong> S&aring; l&aelig;nge du har en aktiv konto, eller indtil du beder om sletning</span>
                </li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Vi bruger <strong>ikke</strong> cookies til tracking eller markedsf&oslash;ring. Vores analytics (Umami) er helt cookiefri og anonymiseret.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Stripe kan s&aelig;tte teknisk n&oslash;dvendige cookies i forbindelse med betaling. Disse er p&aring;kr&aelig;vede for at servicen fungerer og kr&aelig;ver ikke samtykke.
              </p>
            </section>

            {/* Nyhedsbrev */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Nyhedsbrev</h2>
              <p className="text-gray-700 leading-relaxed">
                Vi sender kun nyhedsbreve, hvis du aktivt har givet samtykke. Du kan altid afmelde dig via linket i bunden af hver email.
              </p>
            </section>

            {/* Rettigheder */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Dine rettigheder</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Du har f&oslash;lgende rettigheder efter GDPR:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#1B7A6E] mt-1 shrink-0">&#10003;</span>
                  <span><strong>Indsigt</strong> — f&aring; at vide hvilke data vi har om dig</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1B7A6E] mt-1 shrink-0">&#10003;</span>
                  <span><strong>Rettelse</strong> — f&aring; forkerte oplysninger rettet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1B7A6E] mt-1 shrink-0">&#10003;</span>
                  <span><strong>Sletning</strong> — f&aring; dine data slettet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1B7A6E] mt-1 shrink-0">&#10003;</span>
                  <span><strong>Dataportabilitet</strong> — f&aring; dine data udleveret i et maskinl&aelig;sbart format</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#1B7A6E] mt-1 shrink-0">&#10003;</span>
                  <span><strong>Klage</strong> — du kan klage til Datatilsynet (datatilsynet.dk)</span>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                Kontakt os p&aring;{" "}
                <a href="mailto:hej@abovagt.dk" className="text-[#1B7A6E] hover:underline">hej@abovagt.dk</a>{" "}
                for at ud&oslash;ve dine rettigheder. Vi svarer inden 30 dage.
              </p>
            </section>

            {/* Ændringer */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">&AElig;ndringer</h2>
              <p className="text-gray-700 leading-relaxed">
                Vi kan opdatere denne privatlivspolitik. Ved v&aelig;sentlige &aelig;ndringer informerer vi dig via email. Den seneste version finder du altid her p&aring; siden.
              </p>
            </section>
          </div>

          <div className="mt-12 text-center">
            <a href="/" className="text-gray-500 hover:text-[#1C2B2A] text-sm transition-colors">&larr; Tilbage til forsiden</a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
