import { formatInTimeZone } from "date-fns-tz";
import { parse } from "date-fns";

export type WeeklySchedule = {
  [day: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
};

export type StoreStatus = "open" | "closed" | "closing_soon";

/**
 * Mengecek apakah outlet sedang buka berdasarkan jam operasional (weekly_schedule)
 * dan zona waktu (timezone) dari tenant.
 * Mengembalikan status: "open", "closed", atau "closing_soon" (jika sisa < 1 jam).
 */
export function getStoreStatus(schedule: any, timezone: string = "Asia/Jakarta"): StoreStatus {
  if (!schedule || Object.keys(schedule).length === 0) return "open"; // Default fallback kalau tenant lama/baru belum atur jadwal

  try {
    const tz = timezone || "Asia/Jakarta";
    const now = new Date();
    
    // Dapatkan hari saat ini di zona waktu tenant (lowercase english: monday, tuesday, etc)
    const currentDay = formatInTimeZone(now, tz, "EEEE").toLowerCase();
    
    // Dapatkan jam saat ini di zona waktu tenant (format HH:mm)
    const currentTimeStr = formatInTimeZone(now, tz, "HH:mm");
    
    const daySchedule = schedule[currentDay];
    
    if (!daySchedule) return "closed";
    if (!daySchedule.isOpen) return "closed";
    
    // Cek apakah jam saat ini berada di antara open/openTime dan close/closeTime
    // Support kedua format schema DB/demo
    const openTime = daySchedule.openTime || daySchedule.open;
    const closeTime = daySchedule.closeTime || daySchedule.close;
    
    if (!openTime || !closeTime) return "closed";
    
    if (currentTimeStr >= openTime && currentTimeStr < closeTime) {
      // Hitung selisih jam untuk closing_soon (kurang dari 1 jam)
      const currentMinutes = parseInt(currentTimeStr.split(":")[0]) * 60 + parseInt(currentTimeStr.split(":")[1]);
      const closeMinutes = parseInt(closeTime.split(":")[0]) * 60 + parseInt(closeTime.split(":")[1]);
      
      if (closeMinutes - currentMinutes <= 60) {
        return "closing_soon";
      }
      return "open";
    }
    
    return "closed";
  } catch (error) {
    console.error("Error checking store hours:", error);
    return "open"; // Fallback jika terjadi error parsing waktu
  }
}

// Retain isStoreOpen for backward compatibility elsewhere if needed
export function isStoreOpen(schedule: any, timezone: string = "Asia/Jakarta"): boolean {
  return getStoreStatus(schedule, timezone) !== "closed";
}
