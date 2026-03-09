const weDoItems = [
  {
    text: "Finder dine abonnementer via bankforbindelse (Tink/Visa)",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    text: "Analyserer og anbefaler hvad du kan spare",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    text: "Genererer færdige opsigelsesmails klar til afsendelse",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const youDoItems = [
  {
    text: "Du trykker send — du er altid i kontrol",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
];

const neverItems = [
  {
    text: "Vi opsiger aldrig noget på dine vegne",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

export default function WhatWeDo() {
  return (
    <section className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Du har fuld kontrol — altid
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Vi giver dig værktøjerne. Du bestemmer hvad der sker.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-[#1B7A6E] mb-5">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vi gør
            </h3>
            <ul className="space-y-4">
              {weDoItems.map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="text-[#1B7A6E] mt-0.5 shrink-0">{item.icon}</span>
                  <span className="text-gray-600 text-sm leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-[#1B7A6E]/20">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-[#1B7A6E] mb-5">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Du gør
            </h3>
            <ul className="space-y-4">
              {youDoItems.map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="text-[#1B7A6E] mt-0.5 shrink-0">{item.icon}</span>
                  <span className="text-gray-600 text-sm leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Du vælger selv hvilke abonnementer du vil opsige. Vi sender aldrig noget uden din godkendelse.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500 mb-5">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vi gør aldrig
            </h3>
            <ul className="space-y-4">
              {neverItems.map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="text-red-500 mt-0.5 shrink-0">{item.icon}</span>
                  <span className="text-gray-600 text-sm leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Din sikkerhed og kontrol er vores førsteprioritet. Vi handler aldrig uden dit samtykke.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
