export default function Hero() {
  return (
    <section
      id="quiz"
      className="relative overflow-hidden bg-gradient-to-b from-teal-50/50 to-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
            Stop med at betale for det{" "}
            <span className="text-[#1B7A6E]">du ikke bruger</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Den gennemsnitlige dansker spilder tusindvis af kroner hvert år på
            glemte abonnementer. Vi finder dem på 5 minutter — helt gratis.
          </p>
          <div className="mt-10">
            <a
              href="#quiz"
              className="inline-flex items-center px-8 py-4 bg-[#1B7A6E] text-white text-lg font-semibold rounded-xl hover:bg-[#155F56] transition-all shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 hover:-translate-y-0.5"
            >
              Tag quizzen gratis
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Ingen kreditkort. Ingen binding. 100% gratis quiz.
          </p>
        </div>
      </div>
    </section>
  );
}
