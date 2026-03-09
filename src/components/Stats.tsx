const stats = [
  {
    value: "8–15",
    label: "abonnementer",
    description: "har den gennemsnitlige dansker",
  },
  {
    value: "2.400 kr",
    label: "spildt årligt",
    description: "på glemte eller ubrugte tjenester",
  },
  {
    value: "5 min",
    label: "er alt det tager",
    description: "at finde dine skjulte udgifter",
  },
];

export default function Stats() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-[#1B7A6E]">
                {stat.value}
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {stat.label}
              </p>
              <p className="mt-1 text-sm text-gray-500">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
