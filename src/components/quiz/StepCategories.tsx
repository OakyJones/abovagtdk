"use client";

import { quizPages } from "@/lib/services";
import Inspektoeren from "@/components/Inspektoeren";

interface Props {
  selectedPages: string[];
  setSelectedPages: (pages: string[]) => void;
  onNext: () => void;
}

export default function StepCategories({
  selectedPages,
  setSelectedPages,
  onNext,
}: Props) {
  const toggle = (pageId: string) => {
    if (selectedPages.includes(pageId)) {
      setSelectedPages(selectedPages.filter((p) => p !== pageId));
    } else {
      setSelectedPages([...selectedPages, pageId]);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <Inspektoeren pose="searching" size={80} className="mb-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2B2A]">
          Hvilke typer abonnementer har du?
        </h1>
        <p className="mt-2 text-gray-600 text-sm sm:text-base">
          Vælg de kategorier der er relevante for dig
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto mb-8">
        {quizPages.map((page) => {
          const selected = selectedPages.includes(page.id);
          return (
            <button
              key={page.id}
              type="button"
              onClick={() => toggle(page.id)}
              className={`relative flex flex-col items-center gap-2 p-5 sm:p-6 rounded-2xl border-2 transition-all text-center ${
                selected
                  ? "bg-teal-50 border-[#1B7A6E] shadow-md shadow-teal-600/10"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              {selected && (
                <div className="absolute top-2.5 right-2.5">
                  <svg className="w-6 h-6 text-[#1B7A6E]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              )}
              <span className="text-3xl">{page.icon}</span>
              <span className={`text-sm font-semibold leading-tight ${
                selected ? "text-[#1B7A6E]" : "text-gray-700"
              }`}>
                {page.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <p className="text-sm text-gray-500">
            {selectedPages.length} {selectedPages.length === 1 ? "kategori" : "kategorier"} valgt
          </p>
          <button
            type="button"
            onClick={onNext}
            disabled={selectedPages.length === 0}
            className="px-8 py-3 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
          >
            Næste →
          </button>
        </div>
      </div>
    </div>
  );
}
