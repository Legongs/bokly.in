import { formatInTimeZone } from "date-fns-tz";
import { parse } from "date-fns";

export type WeeklySchedule = {
  [day: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
};

/**
 * Mengecek apakah outlet sedang buka berdasarkan jam operasional (weekly_schedule)
 * dan zona waktu (timezone) dari tenant.
 */
export function isStoreOpen(schedule: any, timezone: string = "Asia/Jakarta"): boolean {
  if (!schedule) return true; // Default fallback kalau tenant lama belum atur jadwal

  try {
    const tz = timezone || "Asia/Jakarta";
    
    // Dapatkan hari saat ini di zona waktu tenant (lowercase english: monday, tuesday, etc)
    const currentDay = formatInTimeZone(new Date(), tz, "EEEE").toLowerCase();
    
    // Dapatkan jam saat ini di zona waktu tenant (format HH:mm)
    const currentTimeStr = formatInTimeZone(new Date(), tz, "HH:mm");
    
    const daySchedule = schedule[currentDay];
    
    if (!daySchedule) return false;
    if (!daySchedule.isOpen) return false;
    
    // Cek apakah jam saat ini berada di antara openTime dan closeTime
    const openTime = daySchedule.openTime;
    const closeTime = daySchedule.closeTime;
    
    if (currentTimeStr >= openTime && currentTimeStr <= closeTime) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking store hours:", error);
    return true; // Fallback jika terjadi error parsing waktu
  }
}
