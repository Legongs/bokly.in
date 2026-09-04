// components/customer/step-staff-select.tsx
// Step 2 (Opsional): Pilih Staff — hanya muncul jika tenant punya >1 pegawai
"use client";

import React from "react";
import { User, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Staff } from "@/types/database.types";
import type { ThemeStyle } from "@/lib/booking-utils";
import type { BusinessDictionary } from "@/lib/dictionaries";

interface StepStaffSelectProps {
  staffList: Staff[];
  selectedStaff: Staff | null;
  activeStep: number;
  t: ThemeStyle;
  dictionary?: BusinessDictionary;
  onSelectStaff: (staff: Staff) => void;
  onChangeStep: (step: number) => void;
}

export function StepStaffSelect({
  staffList, selectedStaff, activeStep, t, dictionary,
  onSelectStaff, onChangeStep,
}: StepStaffSelectProps) {
  const isActive = activeStep === 2;

  return (
    <Card className={`border-none shadow-md shadow-stone-200/50 rounded-3xl overflow-hidden bg-white transition-all ${!isActive ? "opacity-70 grayscale-[0.3]" : ""}`}>
      <CardHeader className="pb-3 border-b border-stone-50 bg-stone-50/30 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2 text-stone-800">
            <span className={`w-6 h-6 rounded-full ${isActive ? t.bgStep : "bg-stone-200"} ${isActive ? t.textPrimary : "text-stone-500"} text-xs font-extrabold flex items-center justify-center flex-shrink-0`}>
              2
            </span>
            Pilih {dictionary?.staffLabel || "Pegawai"}
          </CardTitle>
          {isActive && (
            <CardDescription className="text-stone-500 mt-1">
              Kamu mau dilayani oleh siapa?
            </CardDescription>
          )}
        </div>
        {activeStep > 2 && (
          <Button variant="ghost" size="sm" onClick={() => onChangeStep(2)} className="text-stone-500 hover:text-stone-800 shrink-0 h-8 transition-colors duration-200">
            Ubah
          </Button>
        )}
      </CardHeader>

      {/* Grid pilihan staff */}
      <CardContent className={`pt-4 ${isActive ? "grid grid-cols-2 gap-3" : "hidden"}`}>
        {staffList.map((staff) => {
          const isSelected = selectedStaff?.id === staff.id;
          return (
            <div
              key={staff.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelectStaff(staff)}
              onKeyDown={(e) => e.key === "Enter" && onSelectStaff(staff)}
              className={`p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-center select-none ${
                isSelected
                  ? `${t.borderPrimary} ${t.bgLight} shadow-sm ${t.shadowPrimary}`
                  : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 active:scale-[0.98]"
              }`}
            >
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 overflow-hidden border-2 transition-colors duration-200 ${isSelected ? `border-transparent ${t.bgPrimary}` : "border-stone-100 bg-stone-100"}`}>
                {staff.id === "any" ? (
                  <Users className={`w-5 h-5 ${isSelected ? "text-white" : "text-stone-400"}`} />
                ) : staff.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={staff.image_url} alt={staff.name} className="w-full h-full object-cover" />
                ) : (
                  <User className={`w-5 h-5 ${isSelected ? "text-white" : "text-stone-400"}`} />
                )}
              </div>
              <h4 className={`font-semibold text-sm transition-colors duration-200 ${isSelected ? t.textPrimary : "text-stone-700"}`}>
                {staff.name}
              </h4>
            </div>
          );
        })}
      </CardContent>

      {/* Ringkasan staff — collapsed */}
      {activeStep > 2 && selectedStaff && (
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-100">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-stone-200 flex-shrink-0">
              {selectedStaff.id === "any" ? (
                <Users className="w-5 h-5 text-stone-500" />
              ) : selectedStaff.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedStaff.image_url} alt={selectedStaff.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-stone-500" />
              )}
            </div>
            <p className="text-sm font-bold text-stone-800">{selectedStaff.name}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
