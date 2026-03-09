"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Er quizzen virkelig gratis?",
    answer:
      "Ja, 100%. Du kan tage quizzen og få din personlige rapport helt uden at betale en krone. Vi tager kun betaling, hvis du vælger at følge vores anbefalinger og faktisk sparer penge.",
  },
  {
    question: "Hvordan beregner I besparelsen?",
    answer:
      "Vi analyserer dine svar og sammenligner med gennemsnitlige priser og forbrugsmønstre for lignende abonnementer i Danmark. Besparelsen er baseret på den faktiske pris, du betaler, versus hvad du reelt bruger.",
  },
  {
    question: "Hvad sker der med mine data?",
    answer:
      "Dine data behandles fortroligt og i overensstemmelse med GDPR. Vi deler aldrig dine oplysninger med tredjepart, og du kan til enhver tid bede om at få dine data slettet.",
  },
  {
    question: "Hvornår skal jeg betale de 25%?",
    answer:
      "Først når du har gennemført opsigelsen af abonnementer og kan dokumentere din besparelse. Vi sender en faktura baseret på den faktiske årlige besparelse, du opnår.",
  },
  {
    question: "Hvilke typer abonnementer dækker I?",
    answer:
      "Vi dækker alle typer tilbagevendende betalinger: streaming, software, fitness, forsikringer, mobilabonnementer, magasiner, og meget mere. Hvis du betaler for det månedligt eller årligt, kan vi hjælpe.",
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
    <section id="faq" className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Ofte stillede spørgsmål
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
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
