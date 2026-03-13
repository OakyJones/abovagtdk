"use client";

import { useState, useCallback, useEffect } from "react";
import StepEmail from "@/components/quiz/StepEmail";
import StepCategories from "@/components/quiz/StepCategories";
import StepSelect from "@/components/quiz/StepSelect";
import StepResult from "@/components/quiz/StepResult";
import { supabase } from "@/lib/supabase";

const stepLabels = ["", "Kategorier", "Abonnementer", "Resultat"];

export default function QuizPage() {
  const [step, setStep] = useState(0); // 0=email, 1=categories, 2=services, 3=result
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<Record<string, string>>({});
  const [customServices, setCustomServices] = useState<
    { name: string; price: number }[]
  >([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof umami !== 'undefined') umami.track('quiz_start');
  }, []);

  const handleEmailSubmit = async (userEmail: string, newsletterConsent: boolean) => {
    setEmail(userEmail);
    if (typeof umami !== 'undefined') umami.track('quiz_email_entered');

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          newsletterConsent,
          signupPath: "quiz",
        }),
      });

      const data = await res.json();
      if (res.ok && data.userId) {
        setUserId(data.userId);
        localStorage.setItem("abovagt_user_id", data.userId);
      }
    } catch {
      // Continue without user — quiz still works
    }

    window.umami?.track("quiz_start");
    setStep(1);
  };

  const saveResults = useCallback(
    async (monthlyCost: number) => {
      if (saved) return;

      const allServices = [
        ...selectedServices,
        ...customServices.map((c) => c.name),
      ];

      try {
        const quizInsert = await supabase
          .from("quiz_results")
          .insert({
            user_id: userId,
            email,
            selected_services: allServices,
            selected_plans: selectedPlans,
            estimated_monthly_cost: monthlyCost,
            estimated_savings: 0,
            converted_to_scan: false,
          })
          .select("id")
          .single();

        const quizResult = quizInsert.data;

        if (userId) {
          await supabase
            .from("users")
            .update({ quiz_completed: true })
            .eq("id", userId);
        }

        if (quizResult) {
          await fetch("/api/quiz-result-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              userId,
              quizResultId: quizResult.id,
              totalServices: allServices.length,
              totalMonthly: monthlyCost,
              totalYearly: monthlyCost * 12,
              yearlySavings: 0,
              wastedServices: [],
              downgradeSuggestions: [],
            }),
          });
        }

        // Save custom services to unknown_services for admin review
        if (customServices.length > 0) {
          for (const cs of customServices) {
            try {
              const { data: existing } = await supabase
                .from("unknown_services")
                .select("id, observation_count, observed_price")
                .eq("transaction_name", cs.name)
                .maybeSingle();

              if (existing) {
                const newCount = existing.observation_count + 1;
                const avgPrice = existing.observed_price
                  ? (existing.observed_price * existing.observation_count + cs.price) / newCount
                  : cs.price;
                await supabase
                  .from("unknown_services")
                  .update({
                    observation_count: newCount,
                    observed_price: Math.round(avgPrice),
                  })
                  .eq("id", existing.id);
              } else {
                await supabase.from("unknown_services").insert({
                  transaction_name: cs.name,
                  observed_price: cs.price,
                  observation_count: 1,
                  reviewed: false,
                });
              }
            } catch {
              // Continue even if tracking fails
            }
          }
        }

        if (typeof umami !== 'undefined') umami.track('quiz_complete', { total_md: monthlyCost, services: allServices.length });
        setSaved(true);
      } catch {
        // Silently fail
      }
    },
    [saved, selectedServices, selectedPlans, customServices, email, userId]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <a href="/" className="text-xl font-bold tracking-tight">
              <span className="text-black">Abo</span>
              <span className="text-[#1B7A6E]">Vagt</span>
            </a>
            {step > 0 && (
              <span className="text-sm text-gray-500">
                Trin {step} af 3
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      {step > 0 && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step >= s
                        ? "bg-[#1B7A6E] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : (
                      s
                    )}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${
                    step >= s ? "text-[#1B7A6E]" : "text-gray-400"
                  }`}>
                    {stepLabels[s]}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#1B7A6E] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {step === 0 && <StepEmail onNext={handleEmailSubmit} />}
        {step === 1 && (
          <StepCategories
            selectedPages={selectedPages}
            setSelectedPages={setSelectedPages}
            onNext={() => {
              window.umami?.track("quiz_categories_selected", { count: selectedPages.length });
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <StepSelect
            selectedPages={selectedPages}
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            selectedPlans={selectedPlans}
            setSelectedPlans={setSelectedPlans}
            customServices={customServices}
            setCustomServices={setCustomServices}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <StepResult
            selectedServices={selectedServices}
            selectedPlans={selectedPlans}
            customServices={customServices}
            onBack={() => setStep(2)}
            onSave={saveResults}
          />
        )}
      </div>
    </div>
  );
}
