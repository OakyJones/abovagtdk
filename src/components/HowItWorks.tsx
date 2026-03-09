const quizSteps = [
  {
    number: "1",
    title: "Tag quizzen",
    description: "Svar på et par hurtige spørgsmål om dine abonnementer og vaner.",
  },
  {
    number: "2",
    title: "Se dit overblik",
    description: "Få et estimat over hvad du bruger — og hvad du kan spare.",
  },
  {
    number: "3",
    title: "Opsig selv",
    description: "Brug vores tips til at opsige det du ikke bruger.",
  },
];

const fullSteps = [
  {
    number: "1",
    title: "Forbind din bank",
    description: "Sikker forbindelse via Tink. Vi kan kun læse — aldrig flytte penge.",
  },
  {
    number: "2",
    title: "AI analyserer",
    description: "Vores AI finder alle abonnementer og beregner din besparelse.",
  },
  {
    number: "3",
    title: "Du trykker send",
    description: "Vi genererer opsigelsesmails. Du godkender og sender dem selv.",
  },
];

export default function HowItWorks() {
  return (
    <section id="hvordan" className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Sådan virker det
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Uanset hvilken vej du vælger, er processen enkel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Quiz-spor */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Gratis quiz
              </span>
            </div>
            <div className="space-y-6">
              {quizSteps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fuld service-spor */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-flex items-center gap-2 bg-teal-50 text-[#1B7A6E] text-sm font-semibold px-4 py-2 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Fuld service
              </span>
            </div>
            <div className="space-y-6">
              {fullSteps.map((step) => (
                <div key={step.number} className="flex gap-4">
                  <div className="w-10 h-10 bg-[#1B7A6E] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
