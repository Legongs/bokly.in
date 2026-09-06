"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBookedSlotsForDate } from "@/lib/actions/booking.actions";

interface DateSlotPickerProps {
 tenantId: string;
 serviceDurationMinutes: number;
 openTime: string;
 closeTime: string;
 onSelectSlot: (date: string, time: string) => void;
 selectedDate?: string;
 selectedTime?: string;
 staffId?: string;
 maxCapacity?: number;
 weeklySchedule?: any;
 minimumNoticeHours?: number;
 themeColor?: "indigo" | "rose" | "orange" | "violet" | "blue";
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
 weeklySchedule,
 minimumNoticeHours = 1,
 themeColor = "indigo",
}: DateSlotPickerProps) {
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
 const dayNameEn = d.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
 // Check if closed based on weekly_schedule
 let isClosed = false;
 if (weeklySchedule && weeklySchedule[dayNameEn]) {
   isClosed = !weeklySchedule[dayNameEn].isOpen;
 }

 return { dateString, dayName, dayNumber, monthName, isToday, dayNameEn, isClosed };
 });
 }, [weeklySchedule]);

 const [activeDate, setActiveDate] = useState<string>(
 externalDate || availableDays[0].dateString
 );
 const [activeTime, setActiveTime] = useState<string>(externalTime || "");
 const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
 const [isPending, startTransition] = useTransition();

 // Generate time slots dynamically based on weeklySchedule or default openTime/closeTime
 const TIME_SLOTS = React.useMemo(() => {
   // Temukan nama hari dari activeDate
   const activeDateObj = new Date(activeDate);
   const dayNameEn = activeDateObj.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
   
   let dayOpenTime = openTime;
   let dayCloseTime = closeTime;

   if (weeklySchedule && weeklySchedule[dayNameEn]) {
     if (!weeklySchedule[dayNameEn].isOpen) return [];
     dayOpenTime = weeklySchedule[dayNameEn].openTime || openTime;
     dayCloseTime = weeklySchedule[dayNameEn].closeTime || closeTime;
   }

   const slots = [];
   const [startH, startM] = dayOpenTime.split(":").map(Number);
   const [closeH, closeM] = dayCloseTime.split(":").map(Number);
   
   let currentMinutes = startH * 60 + startM;
   const closingMinutes = closeH * 60 + closeM;

   while (currentMinutes <= closingMinutes) {
     const h = Math.floor(currentMinutes / 60);
     const m = currentMinutes % 60;
     slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
     currentMinutes += 30; // Step 30 menit
   }
   return slots;
 }, [openTime, closeTime, activeDate, weeklySchedule]);

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

   const activeDateObj = new Date(activeDate);
   const dayNameEn = activeDateObj.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
   
   let dayCloseTime = closeTime;
   if (weeklySchedule && weeklySchedule[dayNameEn] && weeklySchedule[dayNameEn].closeTime) {
     dayCloseTime = weeklySchedule[dayNameEn].closeTime;
   }

   const [closeH, closeM] = dayCloseTime.split(":").map(Number);
   const closeTotalMinutes = closeH * 60 + closeM;
   if (tEnd > closeTotalMinutes) return true;

   // Check minimum notice if it's today
   const selectedDayObj = availableDays.find(d => d.dateString === activeDate);
   if (selectedDayObj?.isToday) {
     const now = new Date();
     const currentMinutes = now.getHours() * 60 + now.getMinutes();
     if (tStart < currentMinutes + (minimumNoticeHours * 60)) {
       return true;
     }
   }

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

  const themeColors: Record<string, any> = {
  indigo: {
    icon: "text-indigo-500",
    dateSelected: "border-indigo-500 bg-indigo-500 text-white shadow-indigo-500/30",
    dateHover: "hover:border-indigo-200 hover:bg-indigo-50/50",
    todayBadgeSelected: "text-indigo-600",
    dayNameSelected: "text-indigo-50",
    dayNameHover: "group-hover:text-indigo-600",
    monthNameSelected: "text-indigo-100",
    timeLoading: "text-indigo-600 bg-indigo-50",
    timeSelected: "border-indigo-500 bg-indigo-500 text-white shadow-indigo-500/25",
    timeHover: "hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700",
    legendSelected: "border-indigo-500 bg-indigo-500",
  },
  rose: {
    icon: "text-rose-500",
    dateSelected: "border-rose-500 bg-rose-500 text-white shadow-rose-500/30",
    dateHover: "hover:border-rose-200 hover:bg-rose-50/50",
    todayBadgeSelected: "text-rose-600",
    dayNameSelected: "text-rose-50",
    dayNameHover: "group-hover:text-rose-600",
    monthNameSelected: "text-rose-100",
    timeLoading: "text-rose-600 bg-rose-50",
    timeSelected: "border-rose-500 bg-rose-500 text-white shadow-rose-500/25",
    timeHover: "hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700",
    legendSelected: "border-rose-500 bg-rose-500",
  },
  orange: {
    icon: "text-orange-500",
    dateSelected: "border-orange-500 bg-orange-500 text-white shadow-orange-500/30",
    dateHover: "hover:border-orange-200 hover:bg-orange-50/50",
    todayBadgeSelected: "text-orange-600",
    dayNameSelected: "text-orange-50",
    dayNameHover: "group-hover:text-orange-600",
    monthNameSelected: "text-orange-100",
    timeLoading: "text-orange-600 bg-orange-50",
    timeSelected: "border-orange-500 bg-orange-500 text-white shadow-orange-500/25",
    timeHover: "hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700",
    legendSelected: "border-orange-500 bg-orange-500",
  },
  violet: {
    icon: "text-violet-500",
    dateSelected: "border-violet-500 bg-violet-500 text-white shadow-violet-500/30",
    dateHover: "hover:border-violet-200 hover:bg-violet-50/50",
    todayBadgeSelected: "text-violet-600",
    dayNameSelected: "text-violet-50",
    dayNameHover: "group-hover:text-violet-600",
    monthNameSelected: "text-violet-100",
    timeLoading: "text-violet-600 bg-violet-50",
    timeSelected: "border-violet-500 bg-violet-500 text-white shadow-violet-500/25",
    timeHover: "hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700",
    legendSelected: "border-violet-500 bg-violet-500",
  },
  blue: {
    icon: "text-blue-500",
    dateSelected: "border-blue-500 bg-blue-500 text-white shadow-blue-500/30",
    dateHover: "hover:border-blue-200 hover:bg-blue-50/50",
    todayBadgeSelected: "text-blue-600",
    dayNameSelected: "text-blue-50",
    dayNameHover: "group-hover:text-blue-600",
    monthNameSelected: "text-blue-100",
    timeLoading: "text-blue-600 bg-blue-50",
    timeSelected: "border-blue-500 bg-blue-500 text-white shadow-blue-500/25",
    timeHover: "hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
    legendSelected: "border-blue-500 bg-blue-500",
  },
 };
 
 const tc = themeColors[themeColor] || themeColors.indigo;

  return (
    <div className="space-y-8">
      {/* ── Horizontal Scroll Date Picker ── */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <label className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <CalendarIcon className={cn("w-5 h-5", tc.icon)} />
              Pilih Tanggal
            </label>
            <p className="text-xs text-stone-500 mt-1">Geser untuk melihat hingga 14 hari ke depan</p>
          </div>
        </div>

        {/* Scroll Container with soft edges */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 pt-2 touch-pan-x -mx-1 px-1">
          {availableDays.map((day) => {
            const isSelected = activeDate === day.dateString;
            const isClosed = day.isClosed;
            return (
              <button
                key={day.dateString}
                type="button"
                disabled={isClosed}
                onClick={() => handleDateSelect(day.dateString)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[72px] h-[96px] rounded-[2.5rem] border transition-all duration-300 cursor-pointer select-none flex-shrink-0 relative group",
                  isClosed ? "opacity-50 cursor-not-allowed bg-stone-100 border-stone-200" :
                  isSelected
                    ? cn(tc.dateSelected, "scale-105 z-10")
                    : cn("border-stone-100 bg-white shadow-sm text-stone-600", tc.dateHover)
                )}
              >
                {day.isToday && !isClosed && (
                  <span
                    className={cn(
                      "absolute -top-2 -right-1 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm z-20 transition-colors",
                      isSelected
                        ? cn("bg-white", tc.todayBadgeSelected)
                        : "bg-rose-500 text-white"
                    )}
                  >
                    Hari Ini
                  </span>
                )}
                <span
                  className={cn(
                    "text-[11px] uppercase font-semibold tracking-wider mb-0.5",
                    isSelected ? tc.dayNameSelected : cn("text-stone-400", tc.dayNameHover)
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
                    isSelected ? tc.monthNameSelected : "text-stone-500"
                  )}
                >
                  {day.monthName}
                </span>
                {isClosed && (
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <span className="w-full h-[2px] bg-stone-400 absolute rotate-[-30deg]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Time Slot Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-base font-extrabold text-stone-900 flex items-center gap-2">
            <Clock className={cn("w-5 h-5", tc.icon)} />
            Pilih Jam Kosong
          </label>
          {isPending && (
            <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full animate-pulse", tc.timeLoading)}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Tunggu...
            </span>
          )}
        </div>

        {isPending ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="py-3 px-2 rounded-2xl border border-stone-100 bg-stone-100 animate-pulse h-11" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 transition-opacity">
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
                      ? cn(tc.timeSelected, "scale-[1.03]")
                      : cn("border-stone-100 bg-white shadow-sm text-stone-700 active:scale-95", tc.timeHover)
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
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-6 text-xs font-medium text-stone-500 bg-stone-50/50 p-3 rounded-2xl border border-stone-100">
          <span className="flex items-center gap-1.5">
            <span className={cn("w-3.5 h-3.5 rounded-full border shadow-sm", tc.legendSelected)} />
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
