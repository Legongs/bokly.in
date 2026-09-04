// lib/booking-utils.ts
// Utilitas perhitungan waktu dan format IDR untuk BookingFlow
// DO NOT TOUCH THIS LINE AI — fungsi-fungsi ini dipakai di server dan client

/** Format angka menjadi format Rupiah (IDR). */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/** Hitung jam selesai dari jam mulai + durasi (menit). */
export function calcEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + durationMinutes;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

/** Generate link Google Calendar dari detail booking. */
export function generateGCalLink(details: {
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  businessName: string;
}): string {
  const toGCalDate = (date: string, time: string) =>
    `${date.replace(/-/g, "")}T${time.replace(/:/g, "")}00`;
  const start = toGCalDate(details.date, details.startTime);
  const end = toGCalDate(details.date, details.endTime);
  const text = encodeURIComponent(`${details.serviceName} @ ${details.businessName}`);
  const loc = encodeURIComponent(details.businessName);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${loc}`;
}

/** Peta tema warna berdasarkan string themeColor. */
export type ThemeKey = "teal" | "rose" | "orange" | "violet" | "blue";

export interface ThemeStyle {
  bgLight: string;
  bgLighter: string;
  borderPrimary: string;
  borderLight: string;
  bgPrimary: string;
  bgPrimaryHover: string;
  textPrimary: string;
  shadowPrimary: string;
  shadowBtn: string;
  ringPrimary: string;
  bgBadge: string;
  hoverBorder: string;
  gradient: string;
  bgStep: string;
}

export const THEME_STYLES: Record<ThemeKey, ThemeStyle> = {
  teal:   { bgLight: "bg-teal-50/80",   bgLighter: "bg-teal-50/30",   borderPrimary: "border-teal-600",   borderLight: "border-teal-200",   bgPrimary: "bg-teal-600",   bgPrimaryHover: "hover:bg-teal-700",   textPrimary: "text-teal-700",   shadowPrimary: "shadow-teal-600/10",   shadowBtn: "shadow-teal-600/30",   ringPrimary: "focus:ring-teal-500",   bgBadge: "bg-teal-100",   hoverBorder: "hover:border-teal-400",   gradient: "from-teal-50/80",   bgStep: "bg-teal-100"   },
  rose:   { bgLight: "bg-rose-50/80",   bgLighter: "bg-rose-50/30",   borderPrimary: "border-rose-600",   borderLight: "border-rose-200",   bgPrimary: "bg-rose-600",   bgPrimaryHover: "hover:bg-rose-700",   textPrimary: "text-rose-700",   shadowPrimary: "shadow-rose-600/10",   shadowBtn: "shadow-rose-600/30",   ringPrimary: "focus:ring-rose-500",   bgBadge: "bg-rose-100",   hoverBorder: "hover:border-rose-400",   gradient: "from-rose-50/80",   bgStep: "bg-rose-100"   },
  orange: { bgLight: "bg-orange-50/80", bgLighter: "bg-orange-50/30", borderPrimary: "border-orange-500", borderLight: "border-orange-200", bgPrimary: "bg-orange-500", bgPrimaryHover: "hover:bg-orange-600", textPrimary: "text-orange-700", shadowPrimary: "shadow-orange-500/10", shadowBtn: "shadow-orange-500/30", ringPrimary: "focus:ring-orange-500", bgBadge: "bg-orange-100", hoverBorder: "hover:border-orange-400", gradient: "from-orange-50/80", bgStep: "bg-orange-100" },
  violet: { bgLight: "bg-violet-50/80", bgLighter: "bg-violet-50/30", borderPrimary: "border-violet-600", borderLight: "border-violet-200", bgPrimary: "bg-violet-600", bgPrimaryHover: "hover:bg-violet-700", textPrimary: "text-violet-700", shadowPrimary: "shadow-violet-600/10", shadowBtn: "shadow-violet-600/30", ringPrimary: "focus:ring-violet-500", bgBadge: "bg-violet-100", hoverBorder: "hover:border-violet-400", gradient: "from-violet-50/80", bgStep: "bg-violet-100" },
  blue:   { bgLight: "bg-blue-50/80",   bgLighter: "bg-blue-50/30",   borderPrimary: "border-blue-600",   borderLight: "border-blue-200",   bgPrimary: "bg-blue-600",   bgPrimaryHover: "hover:bg-blue-700",   textPrimary: "text-blue-700",   shadowPrimary: "shadow-blue-600/10",   shadowBtn: "shadow-blue-600/30",   ringPrimary: "focus:ring-blue-500",   bgBadge: "bg-blue-100",   hoverBorder: "hover:border-blue-400",   gradient: "from-blue-50/80",   bgStep: "bg-blue-100"   },
};

export function getTheme(themeColor?: string | null): ThemeStyle {
  return THEME_STYLES[(themeColor as ThemeKey) ?? "teal"] ?? THEME_STYLES.teal;
}
