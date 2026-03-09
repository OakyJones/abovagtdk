"use client";

import { useState, useCallback } from "react";
import StepEmail from "@/components/quiz/StepEmail";
import StepSelect from "@/components/quiz/StepSelect";
import StepUsage from "@/components/quiz/StepUsage";
import StepResult from "@/components/quiz/StepResult";
import { UsageFrequency, services } from "@/lib/services";
import { supabase } from "@/lib/supabase";

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
      // Upsert user — insert or get existing
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
        // Save quiz result
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

        // Mark user as quiz completed
        if (userId) {
          await supabase
            .from("users")
            .update({ quiz_completed: true })
            .eq("id", userId);
        }

        // Send result email
        if (quizResult) {
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
            };
          });

          await fetch("/api/send-result-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              quizResultId: quizResult.id,
              totalMonthly: monthlyCost,
              totalYearly: monthlyCost * 12,
              yearlySavings,
              wastedServices: wastedDetails,
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

  const totalSteps = 4;
  const displayStep = step === 0 ? 0 : step;

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
      <div className="w-full bg-gray-200 h-1">
        <div
          className="bg-[#1B7A6E] h-1 transition-all duration-500 ease-out"
          style={{ width: `${(displayStep / totalSteps) * 100}%` }}
        />
      </div>

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
