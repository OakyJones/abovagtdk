"use client";

import { useState, useEffect, useCallback } from "react";

interface Suggestion {
  id: string;
  transaction_name: string;
  observed_price: number | null;
  observation_count: number;
  reviewed: boolean;
}

interface AIPlan {
  name: string;
  price_dkk: number;
  features: string;
  selected?: boolean;
}

interface AIResult {
  name: string;
  category: string;
  cancellation_period_days: number;
  binding_months: number;
  cancellation_url: string | null;
  cancellation_email: string | null;
  is_subscription: boolean;
  rejection_reason: string | null;
  plans: AIPlan[];
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
  { value: "insurance", label: "Forsikring" },
  { value: "misc", label: "Diverse" },
];

// Map AI category strings to our values
const categoryMap: Record<string, string> = {
  streaming: "streaming",
  musik: "music",
  music: "music",
  fitness: "fitness",
  software: "software",
  gaming: "gaming",
  mad: "food",
  food: "food",
  aviser: "news",
  news: "news",
  mobil: "telecom",
  telecom: "telecom",
  dating: "dating",
  forsikring: "insurance",
  insurance: "insurance",
  diverse: "misc",
  misc: "misc",
};

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // AI state per suggestion
  const [enriching, setEnriching] = useState<Record<string, boolean>>({});
  const [aiResults, setAiResults] = useState<Record<string, AIResult>>({});
  const [aiErrors, setAiErrors] = useState<Record<string, string>>({});

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("misc");
  const [formPrice, setFormPrice] = useState("");
  const [formCancellation, setFormCancellation] = useState("0");
  const [formBinding, setFormBinding] = useState("0");
  const [formCancelUrl, setFormCancelUrl] = useState("");
  const [formCancelEmail, setFormCancelEmail] = useState("");
  const [formPlans, setFormPlans] = useState<AIPlan[]>([]);

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

  const handleEnrich = async (s: Suggestion) => {
    setEnriching((prev) => ({ ...prev, [s.id]: true }));
    setAiErrors((prev) => ({ ...prev, [s.id]: "" }));

    try {
      const res = await fetch("/api/admin/enrich-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: s.transaction_name,
          category: "misc",
          avg_price: s.observed_price ? Math.round(s.observed_price) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAiErrors((prev) => ({ ...prev, [s.id]: data.error || "AI-fejl" }));
        return;
      }

      const result: AIResult = data.result;
      // Mark all plans as selected by default
      if (result.plans) {
        result.plans = result.plans.map((p) => ({ ...p, selected: true }));
      }
      setAiResults((prev) => ({ ...prev, [s.id]: result }));

      // Auto-open editing with AI values pre-filled
      setEditingId(s.id);
      const mappedCategory = categoryMap[result.category?.toLowerCase()] || "misc";
      setFormName(result.name || s.transaction_name);
      setFormCategory(mappedCategory);
      setFormCancellation(String(result.cancellation_period_days || 0));
      setFormBinding(String(result.binding_months || 0));
      setFormCancelUrl(result.cancellation_url || "");
      setFormCancelEmail(result.cancellation_email || "");
      setFormPlans(result.plans || []);

      // Set price to first plan's price if available
      if (result.plans?.length > 0) {
        const defaultPlan = result.plans.find((p) => p.selected) || result.plans[0];
        setFormPrice(String(defaultPlan.price_dkk));
      } else {
        setFormPrice(s.observed_price ? String(Math.round(s.observed_price)) : "");
      }
    } catch {
      setAiErrors((prev) => ({ ...prev, [s.id]: "Kunne ikke kontakte AI" }));
    } finally {
      setEnriching((prev) => ({ ...prev, [s.id]: false }));
    }
  };

  const startEditing = (s: Suggestion) => {
    setEditingId(s.id);
    setFormName(s.transaction_name);
    setFormCategory("misc");
    setFormPrice(s.observed_price ? String(Math.round(s.observed_price)) : "");
    setFormCancellation("0");
    setFormBinding("0");
    setFormCancelUrl("");
    setFormCancelEmail("");
    setFormPlans([]);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const togglePlan = (index: number) => {
    setFormPlans((prev) =>
      prev.map((p, i) => (i === index ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleApprove = async () => {
    if (!editingId || !formName || !formCategory) return;
    setSaving(true);

    try {
      const selectedPlans = formPlans.filter((p) => p.selected);

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
          cancelEmail: formCancelEmail || null,
          plans: selectedPlans.length > 0 ? selectedPlans : undefined,
        }),
      });

      if (res.ok) {
        setSuggestions((prev) => prev.filter((s) => s.id !== editingId));
        setAiResults((prev) => {
          const copy = { ...prev };
          delete copy[editingId!];
          return copy;
        });
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
        setAiResults((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      }
    } catch {
      // ignore
    }
  };

  const aiResult = (id: string) => aiResults[id];
  const isNotSubscription = (id: string) =>
    aiResults[id] && !aiResults[id].is_subscription;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Brugerforeslåede abonnementer
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Abonnementer brugere har tilføjet manuelt i quizzen. Godkend til
          known_services eller afvis.
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
          {suggestions.map((s) => {
            const ai = aiResult(s.id);
            const notSub = isNotSubscription(s.id);

            return (
              <div
                key={s.id}
                className={`bg-white rounded-xl border overflow-hidden transition-colors ${
                  notSub
                    ? "border-amber-300 bg-amber-50/30"
                    : ai
                    ? "border-blue-200"
                    : "border-gray-200"
                }`}
              >
                {/* Suggestion header */}
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-base">
                          {s.transaction_name}
                        </p>
                        {ai && !notSub && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            AI-undersøgt
                          </span>
                        )}
                      </div>
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

                      {/* Not-a-subscription warning */}
                      {notSub && (
                        <div className="mt-2 flex items-center gap-2 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2">
                          <span className="text-base">&#x26A0;&#xFE0F;</span>
                          <p className="text-sm text-amber-800">
                            <span className="font-semibold">
                              Ikke et abonnement:
                            </span>{" "}
                            {ai?.rejection_reason || "Ukendt årsag"}
                          </p>
                        </div>
                      )}

                      {/* AI error */}
                      {aiErrors[s.id] && (
                        <p className="mt-1 text-xs text-red-600">
                          AI-fejl: {aiErrors[s.id]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {editingId !== s.id && (
                      <>
                        <button
                          onClick={() => handleEnrich(s)}
                          disabled={enriching[s.id]}
                          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {enriching[s.id]
                            ? "Undersøger..."
                            : "🤖 Undersøg"}
                        </button>
                        <button
                          onClick={() => startEditing(s)}
                          className="px-4 py-2 text-sm font-medium bg-[#1B7A6E] text-white rounded-lg hover:bg-[#155F56] transition-colors"
                        >
                          Godkend
                        </button>
                        <button
                          onClick={() => handleDismiss(s.id)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            notSub
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "text-gray-500 bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          &#x274C; Irrelevant
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* AI plans preview (when enriched but not editing) */}
                {ai && ai.is_subscription && ai.plans?.length > 0 && editingId !== s.id && (
                  <div className="border-t border-blue-100 bg-blue-50/50 px-6 py-3">
                    <p className="text-xs font-semibold text-blue-700 mb-2">
                      AI fandt {ai.plans.length} planer:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ai.plans.map((p, i) => (
                        <span
                          key={i}
                          className="text-xs bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-gray-700"
                        >
                          <span className="font-medium">{p.name}</span>{" "}
                          <span className="text-blue-600 font-bold">
                            {p.price_dkk} kr/md
                          </span>
                          {p.features && (
                            <span className="text-gray-400 ml-1">
                              — {p.features}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edit form */}
                {editingId === s.id && (
                  <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
                    {/* AI badge */}
                    {ai && ai.is_subscription && (
                      <div className="mb-4 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                        <span>🤖</span>
                        <span>
                          Felter pre-udfyldt af AI. Gennemse og ret om
                          nødvendigt.
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Navn
                          {ai && (
                            <span className="ml-1 text-blue-500 font-normal">
                              (AI)
                            </span>
                          )}
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
                          {ai && (
                            <span className="ml-1 text-blue-500 font-normal">
                              (AI)
                            </span>
                          )}
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
                          {ai && (
                            <span className="ml-1 text-blue-500 font-normal">
                              (AI)
                            </span>
                          )}
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
                          {ai && (
                            <span className="ml-1 text-blue-500 font-normal">
                              (AI)
                            </span>
                          )}
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
                          Opsigelseslink
                          {ai?.cancellation_url && (
                            <span className="ml-1 text-blue-500 font-normal">
                              (AI)
                            </span>
                          )}
                        </label>
                        <input
                          type="url"
                          value={formCancelUrl}
                          onChange={(e) => setFormCancelUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Opsigelsesmail
                          {ai?.cancellation_email && (
                            <span className="ml-1 text-blue-500 font-normal">
                              (AI)
                            </span>
                          )}
                        </label>
                        <input
                          type="email"
                          value={formCancelEmail}
                          onChange={(e) => setFormCancelEmail(e.target.value)}
                          placeholder="opsigelse@service.dk"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B7A6E]/30 focus:border-[#1B7A6E]"
                        />
                      </div>
                    </div>

                    {/* Plans from AI */}
                    {formPlans.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Planer / tiers{" "}
                          <span className="text-blue-500 font-normal">
                            (AI — vælg hvilke der skal tilføjes)
                          </span>
                        </label>
                        <div className="space-y-2">
                          {formPlans.map((plan, i) => (
                            <label
                              key={i}
                              className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                                plan.selected
                                  ? "bg-blue-50 border-blue-300"
                                  : "bg-white border-gray-200 opacity-60"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={plan.selected || false}
                                onChange={() => togglePlan(i)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1 flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium text-gray-900">
                                    {plan.name}
                                  </span>
                                  {plan.features && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      — {plan.features}
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm font-bold text-blue-600">
                                  {plan.price_dkk} kr/md
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

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
            );
          })}
        </div>
      )}
    </div>
  );
}
