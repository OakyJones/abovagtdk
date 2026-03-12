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
      "Quizzen giver dig et estimat baseret på dine svar. Fuld service forbinder til din bank via sikker open banking (PSD2), finder alle dine faktiske abonnementer automatisk, og genererer færdige opsigelsesmails. Du betaler 35 kr hvis vi finder abonnementer — ellers er det gratis. Ingen løbende udgifter.",
  },
  {
    question: "Er det sikkert at forbinde min bank?",
    answer:
      "Ja. Vi bruger reguleret open banking (PSD2) til at forbinde din bank. Vi har kun læseadgang til dine transaktioner — vi kan aldrig flytte penge eller foretage betalinger. Du logger ind via din banks egen loginside (fx MitID).",
  },
  {
    question: "Opsiger I abonnementer på mine vegne?",
    answer:
      "Nej, aldrig. Vi genererer færdige opsigelsesmails, men du trykker selv send. Du er altid i fuld kontrol over dine abonnementer. Vi handler aldrig uden din godkendelse.",
  },
  {
    question: "Hvornår skal jeg betale engangsbetalingen?",
    answer:
      "Kun når vi faktisk finder abonnementer. Du betaler en flat engangsbetaling på 35 kr. Finder vi ingen abonnementer, betaler du ingenting.",
  },
  {
    question: "Hvad er AboVagt Monitoring?",
    answer:
      "Monitoring er et tilvalg til 15 kr/md. Vi scanner dine transaktioner kvartalsvis (hver 3. måned) og giver dig besked hvis der dukker nye abonnementer op, eller hvis dine eksisterende ændrer pris. Du kan opsige monitoring når som helst.",
  },
  {
    question: "Kan I se min saldo?",
    answer:
      "Nej. Vi har kun AISP-adgang (Account Information Service Provider) via reguleret open banking. Det betyder vi kun har adgang til dine transaktioner — aldrig din saldo, kontonummer eller andre følsomme oplysninger.",
  },
  {
    question: "Kan I flytte mine penge?",
    answer:
      "Nej, aldrig. Vi har kun læseadgang (AISP) — ikke betalingsadgang (PISP). Det er teknisk umuligt for os at flytte penge, foretage betalinger eller ændre noget i din bank. Vi kan udelukkende læse dine transaktioner.",
  },
  {
    question: "Hvad er open banking?",
    answer:
      "Open banking er EU-reguleret teknologi (PSD2) der giver dig mulighed for sikkert at dele dine transaktionsdata med tjenester som AboVagt. Du logger ind via din banks egen loginside (fx MitID), og vi får kun læseadgang. Det er den samme regulering som bruges af banker og fintech-tjenester i hele Europa.",
  },
  {
    question: "Hvad sker der med mine data?",
    answer:
      "Dine data behandles i EU (Frankfurt) i fuld overensstemmelse med GDPR. Alt er krypteret både under overførsel og opbevaring. Vi sletter dine bankdata automatisk efter 30 dage. Du kan til enhver tid bede om at få alle dine data slettet. Vi sælger aldrig dine oplysninger til tredjepart.",
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
