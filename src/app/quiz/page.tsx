"use client";

import { useState, useCallback } from "react";
import StepSelect from "@/components/quiz/StepSelect";
import StepUsage from "@/components/quiz/StepUsage";
import StepResult from "@/components/quiz/StepResult";
import { UsageFrequency } from "@/lib/services";
import { supabase } from "@/lib/supabase";

export default function QuizPage() {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServices, setCustomServices] = useState<
    { name: string; price: number }[]
  >([]);
  const [usageFrequency, setUsageFrequency] = useState<
    Record<string, UsageFrequency>
  >({});
  const [saved, setSaved] = useState(false);

  const saveResults = useCallback(
    async (
      monthlyCost: number,
      monthlySavings: number
    ) => {
      if (saved) return;
      try {
        const sessionId =
          typeof window !== "undefined"
            ? sessionStorage.getItem("quiz_session") ||
              (() => {
                const id = crypto.randomUUID();
                sessionStorage.setItem("quiz_session", id);
                return id;
              })()
            : crypto.randomUUID();

        await supabase.from("quiz_results").insert({
          session_id: sessionId,
          selected_services: [
            ...selectedServices,
            ...customServices.map((c) => c.name),
          ],
          usage_frequency: usageFrequency,
          estimated_monthly_cost: monthlyCost,
          estimated_savings: monthlySavings * 12,
          converted_to_scan: false,
        });
        setSaved(true);
      } catch {
        // Silently fail — quiz works without Supabase
      }
    },
    [saved, selectedServices, customServices, usageFrequency]
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
            <span className="text-sm text-gray-500">
              Trin {step} af 3
            </span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-1">
        <div
          className="bg-[#1B7A6E] h-1 transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {step === 1 && (
          <StepSelect
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            customServices={customServices}
            setCustomServices={setCustomServices}
            onNext={() => {
              // Initialize usage frequency for all selected
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
