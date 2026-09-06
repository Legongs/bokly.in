import React from "react";
import { Clock } from "lucide-react";
import { getStoreStatus } from "@/lib/business-hours";

interface BusinessHoursCardProps {
  schedule: any;
  timezone?: string | null;
  className?: string;
}

const DAYS_MAP: Record<string, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};

const DAYS_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function BusinessHoursCard({ schedule, timezone = "Asia/Jakarta", className = "" }: BusinessHoursCardProps) {
  if (!schedule || Object.keys(schedule).length === 0) return null;

  // Get current day to highlight it
  const tz = timezone || "Asia/Jakarta";
  // We can't use formatInTimeZone easily here because we want this to be Server Component if possible?
  // Actually, business-hours.ts uses date-fns-tz which works on server too.
  // Wait, to keep it simple and static/server render friendly, maybe we just render the list without dynamic highlighting,
  // or we render it dynamically on the client. Let's make it a simple Server Component since we just want to show the hours.
  // We can highlight "Hari Ini" if we want, but it's okay to just show the table.
  
  return (
    <div className={`bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm ${className}`}>
      <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-stone-900 text-lg">Jam Operasional</h3>
          <p className="text-xs text-stone-500">Waktu setempat ({tz})</p>
        </div>
      </div>
      
      <div className="p-5 sm:p-6">
        <ul className="space-y-3">
          {DAYS_ORDER.map((day) => {
            const daySchedule = schedule[day];
            if (!daySchedule) return null;

            const isOpen = daySchedule.isOpen;
            const openTime = daySchedule.openTime || daySchedule.open;
            const closeTime = daySchedule.closeTime || daySchedule.close;

            return (
              <li key={day} className="flex justify-between items-center text-sm">
                <span className="font-medium text-stone-600">{DAYS_MAP[day]}</span>
                {isOpen && openTime && closeTime ? (
                  <span className="font-semibold text-stone-900">
                    {openTime} - {closeTime}
                  </span>
                ) : (
                  <span className="font-semibold text-rose-500">Tutup</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
