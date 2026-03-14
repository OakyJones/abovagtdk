import Footer from "@/components/Footer";
import { COMPANY } from "@/lib/company-info";

export const metadata = {
  title: "Handelsbetingelser – AboVagt",
  description: "Vilkår for brug af AboVagt.dk.",
};

export default function HandelsbetingelserPage() {
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
              <span className="text-sm text-gray-500">Handelsbetingelser</span>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1C2B2A] mb-2">Handelsbetingelser</h1>
          <p className="text-sm text-gray-500 mb-10">Sidst opdateret: 14. marts 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            {/* Virksomhed */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Om os</h2>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Virksomhed</p>
                    <p className="font-semibold text-[#1C2B2A]">{COMPANY.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">CVR</p>
                    <p className="font-semibold text-[#1C2B2A]">{COMPANY.cvr}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <a href={`mailto:${COMPANY.email}`} className="font-semibold text-[#1B7A6E] hover:underline">{COMPANY.email}</a>
                  </div>
                  <div>
                    <p className="text-gray-500">Hjemmeside</p>
                    <p className="font-semibold text-[#1C2B2A]">{COMPANY.website}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Adresse</p>
                    <p className="font-semibold text-[#1C2B2A]">{COMPANY.address}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Telefon</p>
                    <p className="font-semibold text-[#1C2B2A]">{COMPANY.phone}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Ydelse */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Hvad leverer vi?</h2>
              <p className="text-gray-700 leading-relaxed">
                AboVagt er en digital service, der analyserer dine banktransaktioner for at finde abonnementer.
                Vi genererer f&aelig;rdige opsigelsesmails, som du selv gennemg&aring;r og sender.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
                <p className="text-sm text-amber-800">
                  <strong>Vigtigt:</strong> Vi opsiger <strong>ikke</strong> abonnementer p&aring; dine vegne.
                  Vi genererer opsigelsesmails, som du selv gennemg&aring;r, redigerer og sender. Du har altid fuld kontrol.
                </p>
              </div>
            </section>

            {/* Priser */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Priser</h2>
              <div className="space-y-3">
                <div className="bg-white rounded-xl border-2 border-[#1B7A6E] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-[#1C2B2A]">Abonnementsanalyse + opsigelsesmails</p>
                    <span className="text-xs bg-teal-100 text-[#1B7A6E] font-semibold px-2 py-1 rounded-full">Engangsbetaling</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Flat engangsbetaling p&aring; <strong>35 kr inkl. moms</strong> — kun hvis vi finder abonnementer.
                    Finder vi ingen abonnementer, betaler du ingenting.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Betalingen d&aelig;kker scanning, analyse og f&aelig;rdige opsigelsesmails.
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-[#1C2B2A]">AboVagt Monitoring</p>
                    <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-1 rounded-full">M&aring;nedligt</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    <strong>15 kr/md inkl. moms</strong> — kvartalsvis scanning af dine transaktioner med besked ved nye abonnementer eller pris&aelig;ndringer.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Kan opsiges n&aring;r som helst. Ingen binding.
                  </p>
                </div>
              </div>
            </section>

            {/* Betaling */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Betaling</h2>
              <p className="text-gray-700 leading-relaxed">
                Betaling sker via Stripe (Visa/Mastercard/Dankort). Ved engangsscanning reserveres 35 kr p&aring; dit kort. Finder vi abonnementer og du godkender, tr&aelig;kkes bel&oslash;bet. Finder vi ingen abonnementer, frigives reservationen automatisk og du betaler ingenting.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                For AboVagt Monitoring tr&aelig;kkes 15 kr/md via Stripe. F&oslash;rste betaling sker ved tilmelding.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Alle priser er i DKK inkl. 25% moms.
              </p>
            </section>

            {/* Opsigelse af Monitoring */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Opsigelse af Monitoring</h2>
              <p className="text-gray-700 leading-relaxed">
                AboVagt Monitoring kan opsiges n&aring;r som helst uden varsel. Du kan opsige ved at:
              </p>
              <ul className="space-y-2 text-gray-700 mt-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 shrink-0">&bull;</span>
                  <span>Sende en email til <a href={`mailto:${COMPANY.email}`} className="text-[#1B7A6E] hover:underline">{COMPANY.email}</a> med emnet &quot;Opsig monitoring&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 shrink-0">&bull;</span>
                  <span>Bruge opsigelsesknappen i dit dashboard (n&aring;r tilg&aelig;ngelig)</span>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-2">
                Opsigelsen tr&aelig;der i kraft ved udgangen af den igangv&aelig;rende betalingsperiode. Der sker ingen tilbagebetaling for allerede betalt periode. Ingen binding, ingen opsigelsesgebyr.
              </p>
            </section>

            {/* Fortrydelsesret */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Fortrydelsesret</h2>
              <p className="text-gray-700 leading-relaxed">
                Som forbruger har du 14 dages fortrydelsesret ved k&oslash;b foretaget online, jf. forbrugeaftaleloven. Fristen l&oslash;ber fra den dag, aftalen indg&aring;s.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Da AboVagt leverer en digital tjenesteydelse, beder vi dig ved k&oslash;b om udtrykkeligt at samtykke til, at ydelsen p&aring;begyndes inden fortrydelsesfristen udl&oslash;ber. N&aring;r tjenesteydelsen er fuldt udf&oslash;rt (scanning gennemf&oslash;rt og opsigelsesmails leveret), bortfalder din fortrydelsesret, jf. forbrugeraftalelovens &sect; 18, stk. 2, nr. 2.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Hvis du fortryder inden ydelsen er fuldt udf&oslash;rt, kan du kontakte os p&aring;{' '}
                <a href={`mailto:${COMPANY.email}`} className="text-[#1B7A6E] hover:underline">{COMPANY.email}</a>.
                Du skal betale et bel&oslash;b, der st&aring;r i forhold til den del af ydelsen, der allerede er leveret.
              </p>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mt-4">
                <h3 className="font-bold text-[#1C2B2A] text-sm mb-2">Standardfortrydelsesformular</h3>
                <p className="text-xs text-gray-500 mb-3">(Denne formular udfyldes og returneres kun, hvis fortrydelsesretten g&oslash;res g&aelig;ldende)</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Til: {COMPANY.name}, {COMPANY.address}, {COMPANY.email}:</p>
                  <p>Jeg meddeler herved, at jeg &oslash;nsker at g&oslash;re fortrydelsesretten g&aelig;ldende i forbindelse med min k&oslash;bsaftale om levering af f&oslash;lgende tjenesteydelse: AboVagt abonnementsanalyse</p>
                  <p className="mt-2">Bestilt den: _______________</p>
                  <p>Forbrugerens navn: _______________</p>
                  <p>Forbrugerens adresse: _______________</p>
                  <p>Forbrugerens underskrift (kun ved papir): _______________</p>
                  <p>Dato: _______________</p>
                </div>
              </div>
            </section>

            {/* Lovvalg og tvister */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Lovvalg og tvister</h2>
              <p className="text-gray-700 leading-relaxed">
                Aftalen er underlagt dansk ret. Eventuelle tvister afg&oslash;res ved danske domstole.
              </p>
            </section>

            {/* Ansvar */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Ansvar og begr&aelig;nsninger</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 shrink-0">&bull;</span>
                  <span>Vi genererer opsigelsesmails baseret p&aring; bedste viden. Du er selv ansvarlig for at gennemg&aring; og sende dem.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 shrink-0">&bull;</span>
                  <span>Vi garanterer ikke, at en udbyder accepterer opsigelsen. Nogle udbydere kr&aelig;ver opsigelse via bestemte kanaler.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 shrink-0">&bull;</span>
                  <span>Vores abonnementsscanning er baseret p&aring; transaktionsm&oslash;nstre og kan v&aelig;re ufuldst&aelig;ndig.</span>
                </li>
              </ul>
            </section>

            {/* Klage */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">Klage</h2>
              <p className="text-gray-700 leading-relaxed">
                Har du en klage, s&aring; kontakt os f&oslash;rst p&aring;{" "}
                <a href={`mailto:${COMPANY.email}`} className="text-[#1B7A6E] hover:underline">{COMPANY.email}</a>.
                Vi g&oslash;r vores bedste for at l&oslash;se det.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Kan vi ikke finde en l&oslash;sning, kan du klage til:
              </p>
              <div className="mt-3 space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="font-semibold text-[#1C2B2A] text-sm">Center for Klageløsning</p>
                  <p className="text-xs text-gray-500">N&aelig;vnenes Hus, Toldboden 2, 8800 Viborg</p>
                  <a href="https://naevneneshus.dk" target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B7A6E] hover:underline">naevneneshus.dk</a>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="font-semibold text-[#1C2B2A] text-sm">EU&apos;s online klageportal</p>
                  <p className="text-xs text-gray-500">For gr&aelig;nseoverskridende tvister</p>
                  <a href="https://ec.europa.eu/odr" target="_blank" rel="noopener noreferrer" className="text-xs text-[#1B7A6E] hover:underline">ec.europa.eu/odr</a>
                </div>
              </div>
            </section>

            {/* Ændringer */}
            <section>
              <h2 className="text-xl font-bold text-[#1C2B2A] mb-3">&AElig;ndringer af vilk&aring;r</h2>
              <p className="text-gray-700 leading-relaxed">
                Vi kan &aelig;ndre disse vilk&aring;r. Ved v&aelig;sentlige &aelig;ndringer informerer vi dig via email. Den seneste version finder du altid her p&aring; siden.
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
