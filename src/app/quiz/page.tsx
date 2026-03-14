"use client";

import { useState, useCallback, useEffect } from "react";
import StepCategories from "@/components/quiz/StepCategories";
import StepEmail from "@/components/quiz/StepEmail";
import StepSelect from "@/components/quiz/StepSelect";
import StepActions from "@/components/quiz/StepActions";
import StepResult from "@/components/quiz/StepResult";
import { services, getEffectivePrice, getTierDowngrade } from "@/lib/services";
import { getSupabase } from "@/lib/supabase";
import type { UserActions } from "@/components/quiz/StepActions";
import { trackEvent } from "@/lib/analytics";

const stepLabels = ["Kategorier", "Email", "Abonnementer", "Gennemgå", "Resultat"];

export default function QuizPage() {
  // 1=categories, 2=email, 3=services, 4=actions, 5=result
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<Record<string, string>>({});
  const [customServices, setCustomServices] = useState<
    { name: string; price: number }[]
  >([]);
  const [userActions, setUserActions] = useState<UserActions>({
    actions: {},
    downgradeTargets: {},
    totalSavings: 0,
  });
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
        localStorage.setItem("abovagt_user_email", userEmail);
      }
    } catch {
      // Continue without user — quiz still works
    }

    trackEvent("quiz_started");
    setStep(3);
  };

  const saveResults = useCallback(
    async (monthlyCost: number, monthlySavings: number, actions: UserActions) => {
      if (saved) return;

      const supabase = getSupabase();
      const allServices = [
        ...selectedServices,
        ...customServices.map((c) => c.name),
      ];

      // Build user_actions for DB
      const dbActions: Record<string, { action: string; downgradeToTier?: string }> = {};
      allServices.forEach((id) => {
        const action = actions.actions[id] || "keep";
        dbActions[id] = { action };
        if (action === "downgrade" && actions.downgradeTargets[id]) {
          dbActions[id].downgradeToTier = actions.downgradeTargets[id];
        }
      });

      try {
        let quizInsert = await supabase
          .from("quiz_results")
          .insert({
            user_id: userId,
            email,
            selected_services: allServices,
            selected_plans: selectedPlans,
            estimated_monthly_cost: monthlyCost,
            estimated_savings: monthlySavings,
            converted_to_scan: false,
            user_actions: dbActions,
          })
          .select("id")
          .single();

        // Fallback without user_actions if column doesn't exist
        if (quizInsert.error) {
          quizInsert = await supabase
            .from("quiz_results")
            .insert({
              user_id: userId,
              email,
              selected_services: allServices,
              selected_plans: selectedPlans,
              estimated_monthly_cost: monthlyCost,
              estimated_savings: monthlySavings,
              converted_to_scan: false,
            })
            .select("id")
            .single();
        }

        const quizResult = quizInsert.data;

        if (userId) {
          await supabase
            .from("users")
            .update({ quiz_completed: true })
            .eq("id", userId);
        }

        if (quizResult) {
          // Build wasted services (cancelled ones)
          const cancelledIds = allServices.filter((id) => actions.actions[id] === "cancel");
          const wastedDetails = cancelledIds.map((id) => {
            const svc = services.find((s) => s.id === id);
            return {
              name: svc?.name || id,
              price: svc
                ? getEffectivePrice(svc, selectedPlans)
                : customServices.find((c) => c.name === id)?.price || 0,
              frequency: "Opsagt via quiz",
            };
          });

          // Build downgrade suggestions
          const downgradeSuggestions = services
            .filter(
              (s) =>
                selectedServices.includes(s.id) &&
                actions.actions[s.id] === "downgrade" &&
                getTierDowngrade(s, selectedPlans)
            )
            .map((s) => {
              const dg = getTierDowngrade(s, selectedPlans)!;
              return {
                name: s.name,
                fromLabel: dg.fromLabel,
                toLabel: dg.toLabel,
                savingsPerMonth: dg.savingsPerMonth,
              };
            });

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
              yearlySavings: monthlySavings * 12,
              wastedServices: wastedDetails,
              downgradeSuggestions,
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

        if (typeof umami !== 'undefined') umami.track('quiz_complete', { total_md: monthlySavings, services: allServices.length });
        setSaved(true);
      } catch {
        // Silently fail
      }
    },
    [saved, selectedServices, selectedPlans, customServices, email, userId]
  );

  const displayStep = step;
  const totalDisplaySteps = 4;
  // Map step 1-5 to display 1-4 (step 5=result doesn't show in progress)
  const progressStep = Math.min(step, 4);

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
            {step < 5 && (
              <span className="text-sm text-gray-500">
                Trin {progressStep} af {totalDisplaySteps}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      {step < 5 && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      progressStep >= s
                        ? "bg-[#1B7A6E] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {progressStep > s ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : (
                      s
                    )}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${
                    progressStep >= s ? "text-[#1B7A6E]" : "text-gray-400"
                  }`}>
                    {stepLabels[s - 1]}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#1B7A6E] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(progressStep / totalDisplaySteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
          <StepEmail
            onNext={handleEmailSubmit}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepSelect
            selectedPages={selectedPages}
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            selectedPlans={selectedPlans}
            setSelectedPlans={setSelectedPlans}
            customServices={customServices}
            setCustomServices={setCustomServices}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <StepActions
            selectedServices={selectedServices}
            selectedPlans={selectedPlans}
            customServices={customServices}
            onBack={() => setStep(3)}
            onNext={(actions) => {
              setUserActions(actions);
              setStep(5);
            }}
          />
        )}
        {step === 5 && (
          <StepResult
            selectedServices={selectedServices}
            selectedPlans={selectedPlans}
            customServices={customServices}
            userActions={userActions}
            onBack={() => setStep(4)}
            onSave={saveResults}
          />
        )}
      </div>
    </div>
  );
}
