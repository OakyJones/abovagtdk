"use client";

import { useState, useCallback } from "react";
import StepEmail from "@/components/quiz/StepEmail";
import StepSelect from "@/components/quiz/StepSelect";
import StepUsage from "@/components/quiz/StepUsage";
import StepResult from "@/components/quiz/StepResult";
import { UsageFrequency, services } from "@/lib/services";
import { supabase } from "@/lib/supabase";

const stepLabels = ["", "Vælg abonnementer", "Hvor tit bruger du dem?", "Resultat"];

export default function QuizPage() {
  const [step, setStep] = useState(0); // 0=email, 1=select, 2=usage, 3=result
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServices, setCustomServices] = useState<
    { name: string; price: number }[]
  >([]);
  const [usageFrequency, setUsageFrequency] = useState<
    Record<string, UsageFrequency>
  >({});
  const [saved, setSaved] = useState(false);

  const handleEmailSubmit = async (userEmail: string) => {
    setEmail(userEmail);

    try {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", userEmail)
        .maybeSingle();

      if (existing) {
        setUserId(existing.id);
      } else {
        const { data: newUser } = await supabase
          .from("users")
          .insert({ email: userEmail })
          .select("id")
          .single();
        if (newUser) setUserId(newUser.id);
      }
    } catch {
      // Continue without user — quiz still works
    }

    setStep(1);
  };

  const saveResults = useCallback(
    async (monthlyCost: number, monthlySavings: number) => {
      if (saved) return;

      const allServices = [
        ...selectedServices,
        ...customServices.map((c) => c.name),
      ];
      const yearlySavings = monthlySavings * 12;

      try {
        const { data: quizResult } = await supabase
          .from("quiz_results")
          .insert({
            user_id: userId,
            email,
            selected_services: allServices,
            usage_frequency: usageFrequency,
            estimated_monthly_cost: monthlyCost,
            estimated_savings: yearlySavings,
            converted_to_scan: false,
          })
          .select("id")
          .single();

        if (userId) {
          await supabase
            .from("users")
            .update({ quiz_completed: true })
            .eq("id", userId);
        }

        if (quizResult) {
          const frequencyLabelMap: Record<string, string> = {
            daily: "Dagligt",
            weekly: "Ugentligt",
            rarely: "Sjældent",
            never: "Aldrig",
          };

          const wastedNames = allServices.filter(
            (id) =>
              usageFrequency[id] === "rarely" ||
              usageFrequency[id] === "never"
          );
          const wastedDetails = wastedNames.map((id) => {
            const svc = services.find((s) => s.id === id);
            return {
              name: svc?.name || id,
              price: svc?.monthlyPrice ||
                customServices.find((c) => c.name === id)?.price ||
                0,
              frequency: frequencyLabelMap[usageFrequency[id]] || "Ukendt",
            };
          });

          // Downgrade suggestions: services used daily/weekly with downgrade options
          const downgradeSuggestions = services
            .filter(
              (s) =>
                selectedServices.includes(s.id) &&
                s.downgrade &&
                (usageFrequency[s.id] === "daily" ||
                  usageFrequency[s.id] === "weekly")
            )
            .map((s) => ({
              name: s.name,
              fromLabel: s.downgrade!.fromLabel,
              toLabel: s.downgrade!.toLabel,
              savingsPerMonth: s.downgrade!.savingsPerMonth,
            }));

          const downgradeSavingsTotal = downgradeSuggestions.reduce(
            (sum, d) => sum + d.savingsPerMonth * 12,
            0
          );

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
              yearlySavings: yearlySavings + downgradeSavingsTotal,
              wastedServices: wastedDetails,
              downgradeSuggestions,
            }),
          });
        }

        setSaved(true);
      } catch {
        // Silently fail
      }
    },
    [saved, selectedServices, customServices, usageFrequency, email, userId]
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

      {/* Progress bar with step labels */}
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
          <StepSelect
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            customServices={customServices}
            setCustomServices={setCustomServices}
            onNext={() => {
              const freq: Record<string, UsageFrequency> = {};
              selectedServices.forEach((id) => {
                freq[id] = usageFrequency[id] || "weekly";
              });
              customServices.forEach((c) => {
                freq[c.name] = usageFrequency[c.name] || "weekly";
              });
              setUsageFrequency(freq);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <StepUsage
            selectedServices={selectedServices}
            customServices={customServices}
            usageFrequency={usageFrequency}
            setUsageFrequency={setUsageFrequency}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <StepResult
            selectedServices={selectedServices}
            customServices={customServices}
            usageFrequency={usageFrequency}
            onBack={() => setStep(2)}
            onSave={saveResults}
          />
        )}
      </div>
    </div>
  );
}
