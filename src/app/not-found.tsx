"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    window.umami?.track("error_page", { path: pathname });
  }, [pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50/30 to-white">
      <div className="text-center px-4">
        <p className="text-6xl font-bold text-[#1B7A6E] mb-4">404</p>
        <h1 className="text-2xl font-bold text-[#1C2B2A] mb-2">Siden blev ikke fundet</h1>
        <p className="text-gray-600 mb-6">Den side du leder efter eksisterer ikke.</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all"
        >
          Tilbage til forsiden
        </a>
      </div>
    </div>
  );
}
