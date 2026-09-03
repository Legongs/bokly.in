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
 <div className="space-y-5">
 {/* ── Horizontal Scroll Date Picker ── */}
 <div>
 <div className="flex items-center justify-between mb-3">
 <label className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
 <CalendarIcon className="w-4 h-4 text-teal-600" />
 Pilih Tanggal Kunjungan Kamu
 </label>
 <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 ">
 Tersedia s/d 14 Hari
 </span>
 </div>

 <div className="flex gap-2 overflow-x-auto pb-2 pt-0.5 no-scrollbar touch-pan-x -mx-1 px-1">
 {availableDays.map((day) => {
 const isSelected = activeDate === day.dateString;
 return (
 <button
 key={day.dateString}
 type="button"
 onClick={() => handleDateSelect(day.dateString)}
 className={cn(
 "flex flex-col items-center justify-center min-w-[68px] h-[84px] rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none flex-shrink-0 relative",
 isSelected
 ? "border-teal-600 bg-teal-600 text-white shadow-lg shadow-teal-600/25 scale-[1.03]"
 : "border-stone-200 bg-white hover:border-teal-400 hover:bg-teal-50/40 :bg-teal-950/20 text-stone-700 "
 )}
 >
 {day.isToday && (
 <span
 className={cn(
 "absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-tight",
 isSelected
 ? "bg-white text-teal-700"
 : "bg-teal-500 text-white"
 )}
 >
 Hari Ini
 </span>
 )}
 <span
 className={cn(
 "text-[11px] uppercase font-medium tracking-wide",
 isSelected ? "text-teal-100" : "text-stone-400"
 )}
 >
 {day.dayName}
 </span>
 <span className="text-[22px] font-extrabold leading-tight">
 {day.dayNumber}
 </span>
 <span
 className={cn(
 "text-[10px]",
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
 <div className="flex items-center justify-between mb-2.5">
 <label className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
 <Clock className="w-4 h-4 text-teal-600" />
 Pilih Jam Kosongnya
 </label>
 {isPending && (
 <span className="flex items-center gap-1 text-[11px] text-stone-400">
 <Loader2 className="w-3 h-3 animate-spin" />
 Tunggu ya...
 </span>
 )}
 </div>

 <div className={cn("grid grid-cols-3 sm:grid-cols-4 gap-2 transition-opacity", isPending && "opacity-50 pointer-events-none")}>
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
 "py-2.5 px-2 rounded-xl text-sm font-medium border text-center transition-all duration-150 relative",
 unavailable
 ? "bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed"
 : isSelected
 ? "border-teal-600 bg-teal-600 text-white font-semibold shadow-md shadow-teal-600/20 scale-[1.02]"
 : "border-stone-200 bg-white hover:border-teal-500 hover:bg-teal-50/40 :bg-teal-950/20 text-stone-800 active:scale-95"
 )}
 >
 {unavailable && (
 <span className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
 <span className="w-full h-[1.5px] bg-stone-300 absolute rotate-[-15deg]" />
 </span>
 )}
 <span className={cn(unavailable && "opacity-40")}>{time}</span>
 </button>
 );
 })}
 </div>

 {/* Legend */}
 <div className="flex items-center gap-4 mt-3 text-[11px] text-stone-400">
 <span className="flex items-center gap-1">
 <span className="w-3 h-3 rounded border-2 border-teal-600 bg-teal-600 inline-block" />
 Dipilih
 </span>
 <span className="flex items-center gap-1">
 <span className="w-3 h-3 rounded border border-stone-200 bg-white inline-block" />
 Tersedia
 </span>
 <span className="flex items-center gap-1">
 <span className="w-3 h-3 rounded border border-stone-100 bg-stone-50 inline-block" />
 Tidak Tersedia
 </span>
 </div>
 </div>
 </div>
 );
}
