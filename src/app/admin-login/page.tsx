"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Inspektoeren from "@/components/Inspektoeren";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        setError("Forkert adgangskode");
      }
    } catch {
      setError("Kunne ikke forbinde til serveren");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Inspektoeren pose="waving" size={80} className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-black">Abo</span>
            <span className="text-[#1B7A6E]">Vagt</span>{" "}
            <span className="text-gray-500 font-normal">Admin</span>
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adgangskode
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Indtast admin-adgangskode"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E]"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={!password || loading}
            className="w-full mt-4 px-6 py-3 bg-[#1B7A6E] text-white font-semibold rounded-xl hover:bg-[#155F56] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Logger ind..." : "Log ind"}
          </button>
        </form>
      </div>
    </div>
  );
}
