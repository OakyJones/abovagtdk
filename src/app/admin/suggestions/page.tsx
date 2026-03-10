"use client";

import { useState, useEffect, useCallback } from "react";

interface Suggestion {
  id: string;
  transaction_name: string;
  observed_price: number | null;
  observation_count: number;
  reviewed: boolean;
}

const categories = [
  { value: "streaming", label: "Streaming & TV" },
  { value: "music", label: "Musik & lydbøger" },
  { value: "fitness", label: "Fitness" },
  { value: "software", label: "Software & cloud" },
  { value: "gaming", label: "Gaming" },
  { value: "food", label: "Madlevering & bokse" },
  { value: "news", label: "Aviser & magasiner" },
  { value: "telecom", label: "Mobil & internet" },
  { value: "dating", label: "Dating" },
  { value: "misc", label: "Diverse" },
];

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("misc");
  const [formPrice, setFormPrice] = useState("");
  const [formCancellation, setFormCancellation] = useState("0");
  const [formBinding, setFormBinding] = useState("0");
  const [formCancelUrl, setFormCancelUrl] = useState("");

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/suggestions");
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const startEditing = (s: Suggestion) => {
    setEditingId(s.id);
    setFormName(s.transaction_name);
    setFormCategory("misc");
    setFormPrice(s.observed_price ? String(Math.round(s.observed_price)) : "");
    setFormCancellation("0");
    setFormBinding("0");
    setFormCancelUrl("");
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleApprove = async () => {
    if (!editingId || !formName || !formCategory) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestionId: editingId,
          name: formName,
          category: formCategory,
          currentPrice: formPrice ? parseInt(formPrice) : null,
          cancellationPeriodDays: parseInt(formCancellation) || 0,
          bindingMonths: parseInt(formBinding) || 0,
          cancelUrl: formCancelUrl || null,
        }),
      });

      if (res.ok) {
        setSuggestions((prev) => prev.filter((s) => s.id !== editingId));
        setEditingId(null);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const res = await fetch("/api/admin/suggestions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId: id }),
      });

      if (res.ok) {
        setSuggestions((prev) => prev.filter((s) => s.id !== id));
        if (editingId === id) setEditingId(null);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Brugerforeslåede abonnementer
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Abonnementer brugere har tilføjet manuelt i quizzen. Godkend dem for
          at tilføje til known_services.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          Henter forslag...
        </div>
      ) : suggestions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          Ingen nye forslag
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Suggestion header */}
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 text-base">
                      {s.transaction_name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-500">
                        Foreslået{" "}
                        <span className="font-medium text-gray-700">
                          {s.observation_count}x
                        </span>
                      </span>
                      {s.observed_price && (
                        <span className="text-sm text-gray-500">
                          Gns. pris:{" "}
                          <span className="font-medium text-gray-700">
                            {Math.round(s.observed_price)} kr/md
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {editingId !== s.id && (
                    <>
                      <button
                        onClick={() => startEditing(s)}
                        className="px-4 py-2 text-sm font-medium bg-[#1B7A6E] text-white rounded-lg hover:bg-[#155F56] transition-colors"
                      >
                        Tilføj til quiz
                      </button>
                      <button
                        onClick={() => handleDismiss(s.id)}
                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Afvis
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Edit form */}
              {editingId === s.id && (
                <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Navn
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Kategori
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E] bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Pris (kr/md)
                      </label>
                      <input
                        type="number"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder={
                          s.observed_price
                            ? String(Math.round(s.observed_price))
                            : ""
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Opsigelsesperiode (dage)
                      </label>
                      <select
                        value={formCancellation}
                        onChange={(e) => setFormCancellation(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E] bg-white"
                      >
                        <option value="0">Løbende (ingen)</option>
                        <option value="30">1 måned</option>
                        <option value="90">3 måneder</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Binding (måneder)
                      </label>
                      <select
                        value={formBinding}
                        onChange={(e) => setFormBinding(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E] bg-white"
                      >
                        <option value="0">Ingen binding</option>
                        <option value="6">6 måneder</option>
                        <option value="12">12 måneder</option>
                        <option value="24">24 måneder</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Opsigelseslink (valgfrit)
                      </label>
                      <input
                        type="url"
                        value={formCancelUrl}
                        onChange={(e) => setFormCancelUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={handleApprove}
                      disabled={saving || !formName || !formCategory}
                      className="px-5 py-2 text-sm font-semibold bg-[#1B7A6E] text-white rounded-lg hover:bg-[#155F56] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {saving ? "Gemmer..." : "Godkend og tilføj"}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Annuller
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
