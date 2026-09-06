// components/customer/booking-context-bar.tsx
// Sticky mini-bar yang menampilkan konteks pilihan saat ini (service + slot)
// Aturan ui_ux.md: membumi, transition-all duration-200, thumb-centric, copywriting kasual
"use client";

import React from "react";
import { CalendarDays, Clock, Scissors } from "lucide-react";
import { calcEndTime } from "@/lib/booking-utils";
import type { Service } from "@/types/database.types";
import type { ThemeStyle } from "@/lib/booking-utils";

interface BookingContextBarProps {
  selectedService: Service | null;
  selectedDate: string;
  selectedTime: string;
  t: ThemeStyle;
  /** Hanya tampil mulai step ini ke atas */
  showFromStep: number;
  activeStep: number;
}

export function BookingContextBar({
  selectedService, selectedDate, selectedTime, t, showFromStep, activeStep,
}: BookingContextBarProps) {
  // Tidak tampil jika belum ada yang dipilih atau belum sampai step yang relevan
  const hasService = !!selectedService;
  const hasSlot    = !!(selectedDate && selectedTime);
  const isVisible  = activeStep >= showFromStep && (hasService || hasSlot);

  if (!isVisible) return null;

  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })
    : null;

  const endTime = selectedTime && selectedService
    ? calcEndTime(selectedTime, selectedService.duration_minutes)
    : null;

  return (
    <div
      className={`
        pt-3 mt-3 border-t border-stone-100
        transition-all duration-200
      `}
      aria-label="Pilihan kamu sejauh ini"
    >
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">

        {/* Service pill */}
        {hasService && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${t.bgLight} ${t.textPrimary} border ${t.borderLight}`}>
            <Scissors className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[120px]">{selectedService!.name}</span>
          </div>
        )}

        {/* Separator dot — hanya jika keduanya ada */}
        {hasService && hasSlot && (
          <span className="text-stone-300 text-xs flex-shrink-0">·</span>
        )}

        {/* Date pill */}
        {hasSlot && formattedDate && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 bg-stone-50 text-stone-700 border border-stone-200">
            <CalendarDays className="w-3 h-3 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
        )}

        {/* Time pill */}
        {hasSlot && selectedTime && endTime && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 bg-stone-50 text-stone-700 border border-stone-200">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>{selectedTime} – {endTime}</span>
          </div>
        )}

        {/* Teks panduan kasual sesuai ui_ux.md */}
        {hasService && !hasSlot && (
          <span className="text-xs text-stone-400 flex-shrink-0 italic">
            — pilih jam dulu yuk 👇
          </span>
        )}

      </div>
    </div>
  );
}
