// components/customer/step-date-time.tsx
// Step 3/2: Pilih Tanggal & Jam — wrapper DateSlotPicker
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateSlotPicker } from "./date-slot-picker";
import { calcEndTime } from "@/lib/booking-utils";
import type { Service, Staff, Tenant } from "@/types/database.types";
import type { ThemeStyle } from "@/lib/booking-utils";
import type { BusinessDictionary } from "@/lib/dictionaries";

interface StepDateTimeProps {
  tenant: Tenant;
  selectedService: Service | null;
  selectedStaff: Staff | null;
  selectedDate: string;
  selectedTime: string;
  staffList: Staff[];
  activeStep: number;
  t: ThemeStyle;
  dictionary?: BusinessDictionary;
  /** Total durasi semua layanan (multi-service). Jika tidak ada, fallback ke selectedService.duration_minutes */
  totalDuration?: number;
  onSelectSlot: (date: string, time: string) => void;
  onChangeStep: (step: number) => void;
}

export function StepDateTime({
  tenant, selectedService, selectedStaff, selectedDate, selectedTime,
  staffList, activeStep, t, dictionary, totalDuration, onSelectSlot, onChangeStep,
}: StepDateTimeProps) {
  // Durasi efektif: totalDuration (multi-service) atau fallback ke layanan tunggal
  const effectiveDuration = totalDuration ?? selectedService?.duration_minutes ?? 0;
  // Step nomor dinamis: jika ada pilih staff, step ini adalah 3, jika tidak 2
  const stepNumber = staffList.length > 1 ? 3 : 2;
  const isActive   = activeStep === stepNumber;

  return (
    <Card className={`border-none shadow-md shadow-stone-200/50 rounded-3xl overflow-hidden bg-white mt-5 transition-all ${!isActive ? "opacity-70 grayscale-[0.3]" : ""}`}>
      <CardHeader className="pb-3 border-b border-stone-50 bg-stone-50/30 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2 text-stone-800">
            <span className={`w-6 h-6 rounded-full ${isActive ? t.bgStep : "bg-stone-200"} ${isActive ? t.textPrimary : "text-stone-500"} text-xs font-extrabold flex items-center justify-center flex-shrink-0`}>
              {stepNumber}
            </span>
            Kapan Mau Datang?
          </CardTitle>
          {selectedService && isActive && (
            <CardDescription className="text-stone-500 mt-1">
              Total durasi:{" "}
              <strong className="text-stone-700">{effectiveDuration} menit</strong>.
              Slot tidak tersedia jika sudah dipesan atau melebihi jam operasional.
            </CardDescription>
          )}
        </div>
        {activeStep > stepNumber && (
          <Button variant="ghost" size="sm" onClick={() => onChangeStep(stepNumber)} className="text-stone-500 hover:text-stone-800 shrink-0 h-8 transition-colors duration-200">
            Ubah
          </Button>
        )}
      </CardHeader>

      {/* DateSlotPicker — aktif */}
      <CardContent className={`pt-4 ${isActive ? "block" : "hidden"}`}>
        {selectedService && (staffList.length <= 1 || selectedStaff) ? (
          <DateSlotPicker
            tenantId={tenant.id}
            serviceDurationMinutes={effectiveDuration}
            openTime={(tenant as any).open_time || "09:00"}
            closeTime={(tenant as any).close_time || "21:00"}
            staffId={selectedStaff?.id === "any" ? undefined : selectedStaff?.id}
            maxCapacity={(selectedStaff?.id === "any" || !selectedStaff) ? Math.max(1, staffList.length) * (selectedService.max_capacity || 1) : (selectedService.max_capacity || 1)}
            weeklySchedule={(tenant as any).weekly_schedule}
            minimumNoticeHours={(tenant as any).minimum_notice_hours}
            onSelectSlot={onSelectSlot}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            themeColor={dictionary?.themeColor}
          />
        ) : (
          <p className="text-sm text-stone-400 text-center py-4">
            {staffList.length > 1 && !selectedStaff
              ? `Pilih ${dictionary?.staffLabel?.toLowerCase() || "pegawai"}nya dulu ya biar jamnya muncul.`
              : `Pilih ${dictionary?.serviceLabel?.toLowerCase() || "layanan"}nya dulu ya biar jamnya muncul.`}
          </p>
        )}
      </CardContent>

      {/* Ringkasan slot — collapsed */}
      {activeStep > stepNumber && selectedDate && selectedTime && (
        <CardContent className="pt-4 pb-4">
          <div className="flex justify-between items-center bg-stone-50 p-3 rounded-2xl border border-stone-100">
            <div>
              <p className="text-sm font-bold text-stone-800">
                {new Date(selectedDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-xs text-stone-500">
                {selectedTime} – {calcEndTime(selectedTime, effectiveDuration)} WIB
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
