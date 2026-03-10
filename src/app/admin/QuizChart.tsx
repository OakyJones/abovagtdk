"use client";

export default function QuizChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="flex items-end gap-[3px] h-40">
      {entries.map(([date, count]) => {
        const height = Math.max((count / maxVal) * 100, count > 0 ? 4 : 1);
        const day = new Date(date).getDate();
        const isMonday = new Date(date).getDay() === 1;

        return (
          <div
            key={date}
            className="flex-1 flex flex-col items-center gap-1 group relative"
          >
            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {day}/{new Date(date).getMonth() + 1}: {count} quiz
            </div>

            {/* Bar */}
            <div
              className={`w-full rounded-t transition-all ${
                count > 0
                  ? "bg-[#1B7A6E] group-hover:bg-[#155F56]"
                  : "bg-gray-200"
              }`}
              style={{ height: `${height}%` }}
            />

            {/* Label every Monday */}
            {isMonday && (
              <span className="text-[9px] text-gray-400 -rotate-0">
                {day}/{new Date(date).getMonth() + 1}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
