"use client";

import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="text-2xl font-bold tracking-tight">
            <span className="text-black">Abo</span>
            <span className="text-[#1B7A6E]">Vagt</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#hvordan"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sådan virker det
            </a>
            <a
              href="#pris"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pris
            </a>
            <a
              href="#faq"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              FAQ
            </a>
            <a
              href="#quiz"
              className="inline-flex items-center px-5 py-2.5 bg-[#1B7A6E] text-white text-sm font-medium rounded-lg hover:bg-[#155F56] transition-colors"
            >
              Tag quizzen
            </a>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-100 pt-4 flex flex-col gap-4">
            <a
              href="#hvordan"
              className="text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setMenuOpen(false)}
            >
              Sådan virker det
            </a>
            <a
              href="#pris"
              className="text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setMenuOpen(false)}
            >
              Pris
            </a>
            <a
              href="#faq"
              className="text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setMenuOpen(false)}
            >
              FAQ
            </a>
            <a
              href="#quiz"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#1B7A6E] text-white text-sm font-medium rounded-lg hover:bg-[#155F56] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Tag quizzen
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
