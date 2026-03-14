const points = [
  {
    title: "Kun læseadgang",
    description:
      "Vi kan kun se dine transaktioner. Vi kan aldrig flytte, overføre eller røre dine penge.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: "PSD2-reguleret",
    description:
      "Vi bruger PSD2-regulerede open banking-udbydere, der er godkendt af relevante finanstilsynsmyndigheder i EU.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Du er i kontrol",
    description:
      "Vi opsiger aldrig noget på dine vegne. Vi laver mails — du trykker send. Du kan slette dine data når som helst.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: "GDPR-compliant",
    description:
      "Dine data behandles i EU og i fuld overensstemmelse med GDPR. Vi sælger aldrig dine oplysninger.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

export default function Security() {
  return (
    <section id="sikkerhed" className="bg-white py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Din sikkerhed er vores fundament
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Vi bruger reguleret open banking (PSD2) til bankforbindelse — den samme
            teknologi som banker og fintech i hele Europa stoler på.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {points.map((point) => (
            <div
              key={point.title}
              className="bg-gray-50 rounded-2xl p-6 sm:p-8"
            >
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-[#1B7A6E] mb-4">
                {point.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {point.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
