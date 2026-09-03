"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBookedSlotsForDate } from "@/lib/actions/booking.actions";

interface DateSlotPickerProps {
 tenantId: string;
 /** Duration of selected service in minutes */
 serviceDurationMinutes: number;
 openTime: string;
 closeTime: string;
 onSelectSlot: (date: string, time: string) => void;
 selectedDate?: string;
 selectedTime?: string;
 staffId?: string;
 maxCapacity?: number;
}

type BookedSlot = { start_time: string; end_time: string; buffer_minutes: number; staff_id: string | null };

export function DateSlotPicker({
 tenantId,
 serviceDurationMinutes,
 openTime,
 closeTime,
 onSelectSlot,
 selectedDate: externalDate,
 selectedTime: externalTime,
 staffId,
 maxCapacity = 1,
}: DateSlotPickerProps) {
 // Generate time slots dynamically based on openTime and closeTime
 const TIME_SLOTS = React.useMemo(() => {
   const slots = [];
   const [startH, startM] = openTime.split(":").map(Number);
   const [endH, endM] = closeTime.split(":").map(Number);
   
   let currentMinutes = startH * 60 + startM;
   const closingMinutes = endH * 60 + endM;

   while (currentMinutes <= closingMinutes) {
     const h = Math.floor(currentMinutes / 60);
     const m = currentMinutes % 60;
     slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
     currentMinutes += 60; // Step 1 jam
   }
   return slots;
 }, [openTime, closeTime]);

 // Generate 14 days from today
 const availableDays = React.useMemo(() => {
 const today = new Date();
 return Array.from({ length: 14 }, (_, i) => {
 const d = new Date(today);
 d.setDate(today.getDate() + i);
 const dateString = d.toISOString().split("T")[0];
 const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
 const dayNumber = d.getDate();
 const monthName = d.toLocaleDateString("id-ID", { month: "short" });
 const isToday = i === 0;
 return { dateString, dayName, dayNumber, monthName, isToday };
 });
 }, []);

 const [activeDate, setActiveDate] = useState<string>(
 externalDate || availableDays[0].dateString
 );
 const [activeTime, setActiveTime] = useState<string>(externalTime || "");
 const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
 const [isPending, startTransition] = useTransition();

 // Fetch booked slots whenever date or tenantId changes
 useEffect(() => {
  startTransition(async () => {
    const res = await getBookedSlotsForDate(tenantId, activeDate, staffId);
    if (res.success && res.data) {
      setBookedSlots(res.data);
    }
  });
 }, [activeDate, tenantId, staffId]);

 const handleDateSelect = (dateStr: string) => {
 setActiveDate(dateStr);
 setActiveTime("");
 setBookedSlots([]);
 };

 const handleTimeSelect = (timeStr: string) => {
 setActiveTime(timeStr);
 onSelectSlot(activeDate, timeStr);
 };

 /**
 * A slot is unavailable if:
 * 1. Already booked by another customer (overlapping)
 * 2. Service duration would cause end_time to exceed closeTime
 */
 const isSlotUnavailable = (time: string): boolean => {
   const [h, m] = time.split(":").map(Number);
   const tStart = h * 60 + m;
   const tEnd = tStart + serviceDurationMinutes;

   const [closeH, closeM] = closeTime.split(":").map(Number);
   const closeTotalMinutes = closeH * 60 + closeM;
   if (tEnd > closeTotalMinutes) return true;

   // Check overlaps
   let overlappingCount = 0;
   for (const b of bookedSlots) {
     const [bStartH, bStartM] = b.start_time.split(":").map(Number);
     const [bEndH, bEndM] = b.end_time.split(":").map(Number);
     const bStart = bStartH * 60 + bStartM;
     const bEnd = bEndH * 60 + bEndM + b.buffer_minutes;

     if (tStart < bEnd && tEnd > bStart) {
       if (staffId) {
         if (b.staff_id === staffId || !b.staff_id) return true;
       } else {
         overlappingCount++;
       }
     }
   }

   if (!staffId && overlappingCount >= maxCapacity) {
     return true;
   }

   return false;
 };

  return (
    <div className="space-y-8">
      {/* ── Horizontal Scroll Date Picker ── */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <label className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-teal-500" />
              Pilih Tanggal
            </label>
            <p className="text-xs text-stone-500 mt-1">Geser untuk melihat hingga 14 hari ke depan</p>
          </div>
        </div>

        {/* Scroll Container with soft edges */}
        <div className="flex gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar touch-pan-x -mx-1 px-1">
          {availableDays.map((day) => {
            const isSelected = activeDate === day.dateString;
            return (
              <button
                key={day.dateString}
                type="button"
                onClick={() => handleDateSelect(day.dateString)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[72px] h-[96px] rounded-[2.5rem] border transition-all duration-300 cursor-pointer select-none flex-shrink-0 relative group",
                  isSelected
                    ? "border-teal-500 bg-teal-500 text-white shadow-xl shadow-teal-500/30 scale-105 z-10"
                    : "border-stone-100 bg-white hover:border-teal-200 hover:bg-teal-50/50 text-stone-600 shadow-sm"
                )}
              >
                {day.isToday && (
                  <span
                    className={cn(
                      "absolute -top-2 -right-1 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm z-20 transition-colors",
                      isSelected
                        ? "bg-white text-teal-600"
                        : "bg-rose-500 text-white"
                    )}
                  >
                    Hari Ini
                  </span>
                )}
                <span
                  className={cn(
                    "text-[11px] uppercase font-semibold tracking-wider mb-0.5",
                    isSelected ? "text-teal-50" : "text-stone-400 group-hover:text-teal-600"
                  )}
                >
                  {day.dayName}
                </span>
                <span className="text-2xl font-black tracking-tight leading-none mb-0.5">
                  {day.dayNumber}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isSelected ? "text-teal-100" : "text-stone-500"
                  )}
                >
                  {day.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Time Slot Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-500" />
            Pilih Jam Kosong
          </label>
          {isPending && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Tunggu...
            </span>
          )}
        </div>

        <div className={cn("grid grid-cols-3 sm:grid-cols-4 gap-3 transition-opacity", isPending && "opacity-50 pointer-events-none")}>
          {TIME_SLOTS.map((time) => {
            const unavailable = isSlotUnavailable(time);
            const isSelected = activeTime === time;

            return (
              <button
                key={time}
                type="button"
                disabled={unavailable}
                onClick={() => handleTimeSelect(time)}
                title={unavailable ? "Slot ini tidak tersedia" : undefined}
                className={cn(
                  "py-3 px-2 rounded-2xl text-sm font-bold border transition-all duration-300 relative overflow-hidden",
                  unavailable
                    ? "bg-stone-50/50 text-stone-300 border-stone-200 border-dashed cursor-not-allowed"
                    : isSelected
                    ? "border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/25 scale-[1.03]"
                    : "border-stone-100 bg-white shadow-sm hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 text-stone-700 active:scale-95"
                )}
              >
                {unavailable && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <span className="w-full h-[2px] bg-stone-300 absolute rotate-[-20deg]" />
                  </span>
                )}
                <span className={cn("relative z-10", unavailable && "opacity-60")}>{time}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-6 text-xs font-medium text-stone-500 bg-stone-50/50 p-3 rounded-2xl border border-stone-100">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full border border-teal-500 bg-teal-500 shadow-sm" />
            Pilihanmu
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full border border-stone-200 bg-white shadow-sm" />
            Tersedia
          </span>
          <span className="flex items-center gap-1.5 opacity-70">
            <span className="w-3.5 h-3.5 rounded-full border border-stone-200 border-dashed bg-stone-50" />
            Penuh / Lewat
          </span>
        </div>
      </div>
    </div>
  );
}
