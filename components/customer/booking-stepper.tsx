// components/customer/booking-stepper.tsx
// Progress indicator asimetris — dots + label mini, thumb-centric
// Aturan ui_ux.md: asimetri terkendali, warna membumi, transition-all duration-200
"use client";

import React from "react";
import { Check } from "lucide-react";
import type { ThemeStyle } from "@/lib/booking-utils";
import type { BusinessDictionary } from "@/lib/dictionaries";

interface Step {
  label: string;
  sublabel?: string;
}

interface BookingStepperProps {
  steps: Step[];
  activeStep: number; // 1-indexed
  t: ThemeStyle;
}

export function BookingStepper({ steps, activeStep, t }: BookingStepperProps) {
  return (
    <div className="flex items-center justify-between px-1 mb-5" role="list" aria-label="Langkah pemesanan">
      {steps.map((step, idx) => {
        const stepNum   = idx + 1;
        const isDone    = stepNum < activeStep;
        const isActive  = stepNum === activeStep;
        const isUpcoming = stepNum > activeStep;

        return (
          <React.Fragment key={stepNum}>
            {/* Step node */}
            <div
              role="listitem"
              aria-current={isActive ? "step" : undefined}
              className="flex flex-col items-center gap-1 min-w-0"
            >
              {/* Circle */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  isDone
                    ? `bg-emerald-500 text-white shadow-sm shadow-emerald-200`
                    : isActive
                    ? `${t.bgPrimary} text-white shadow-md ${t.shadowBtn} scale-110`
                    : `bg-stone-100 text-stone-400`
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                ) : (
                  <span className="text-[11px] font-extrabold">{stepNum}</span>
                )}
              </div>

              {/* Label — hanya tampil di active & done, hidden di upcoming (biar asimetris) */}
              <span
                className={`text-[10px] font-semibold text-center leading-tight max-w-[56px] truncate transition-all duration-200 ${
                  isDone
                    ? "text-emerald-600"
                    : isActive
                    ? `${t.textPrimary}`
                    : "text-stone-300"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line — tidak ada di step terakhir */}
            {idx < steps.length - 1 && (
              <div className="flex-1 mx-1.5 mt-[-12px]">
                <div
                  className={`h-0.5 rounded-full transition-all duration-300 ${
                    stepNum < activeStep ? "bg-emerald-400" : "bg-stone-150"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
