"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Er quizzen virkelig gratis?",
    answer:
      "Ja, 100%. Quizzen er og bliver altid gratis. Du får et estimat og tips helt uden at betale — ingen kreditkort, ingen binding, ingen skjulte gebyrer.",
  },
  {
    question: "Hvad er forskellen på quiz og fuld service?",
    answer:
      "Quizzen giver dig et estimat baseret på dine svar. Fuld service forbinder til din bank via Tink, finder alle dine faktiske abonnementer automatisk, og genererer færdige opsigelsesmails. Du betaler en engangsbetaling på 25% af besparelsen — maks 149 kr, ingen løbende udgifter.",
  },
  {
    question: "Er det sikkert at forbinde min bank?",
    answer:
      "Ja. Vi bruger Tink, som er ejet af Visa og reguleret under PSD2 af Finanstilsynet. Vi har kun læseadgang til dine transaktioner — vi kan aldrig flytte penge eller foretage betalinger. Det er den samme teknologi som bruges af Nordens største banker.",
  },
  {
    question: "Opsiger I abonnementer på mine vegne?",
    answer:
      "Nej, aldrig. Vi genererer færdige opsigelsesmails, men du trykker selv send. Du er altid i fuld kontrol over dine abonnementer. Vi handler aldrig uden din godkendelse.",
  },
  {
    question: "Hvornår skal jeg betale engangsbetalingen?",
    answer:
      "Kun når du faktisk sparer penge. Du betaler 25% af din månedlige besparelse som en engangsbetaling — maks 149 kr. Sparer du fx 200 kr/md, betaler du 50 kr. Sparer du 800 kr/md, betaler du 149 kr (maks). Ingen besparelse = ingen betaling.",
  },
  {
    question: "Hvad er AboVagt Monitoring?",
    answer:
      "Monitoring er et tilvalg til 15 kr/md. Vi scanner dine transaktioner kvartalsvis (hver 3. måned) og giver dig besked hvis der dukker nye abonnementer op, eller hvis dine eksisterende ændrer pris. Du kan opsige monitoring når som helst.",
  },
  {
    question: "Hvad sker der med mine data?",
    answer:
      "Dine data behandles i EU i fuld overensstemmelse med GDPR. Vi sælger aldrig dine oplysninger til tredjepart. Du kan til enhver tid bede om at få alle dine data slettet.",
  },
  {
    question: "Hvilke typer abonnementer finder I?",
    answer:
      "Vi finder alle tilbagevendende betalinger: streaming (Netflix, HBO, Spotify), software, fitness, forsikringer, mobilabonnementer, magasiner, og alt andet der trækkes automatisk.",
  },
];

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full py-5 flex items-center justify-between text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-lg font-medium text-gray-900">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform shrink-0 ml-4 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="pb-5">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="bg-white py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Ofte stillede spørgsmål
          </h2>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
          {faqs.map((faq) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
