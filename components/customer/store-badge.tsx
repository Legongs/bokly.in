"use client";

import { useEffect, useState } from "react";
import { getStoreStatus, type StoreStatus } from "@/lib/business-hours";
import { Clock } from "lucide-react";

type StoreBadgeVariant = "default" | "beauty" | "barber" | "auto" | "health" | "space";

interface StoreBadgeProps {
  schedule: any;
  timezone?: string | null;
  variant?: StoreBadgeVariant;
}

export function StoreBadge({ schedule, timezone, variant = "default" }: StoreBadgeProps) {
  const [status, setStatus] = useState<StoreStatus | null>(null);

  useEffect(() => {
    setStatus(getStoreStatus(schedule, timezone || "Asia/Jakarta"));
  }, [schedule, timezone]);

  if (status === null) return null;

  // Helper untuk warna per status
  const getStatusColorClass = (
    openClass: string,
    soonClass: string,
    closedClass: string
  ) => {
    if (status === "open") return openClass;
    if (status === "closing_soon") return soonClass;
    return closedClass;
  };

  // Render style per variant to match template's aesthetic
  const getVariantStyles = () => {
    switch (variant) {
      case "beauty":
        return `px-5 py-2.5 rounded-2xl border font-bold text-sm shadow-sm ${getStatusColorClass(
          "bg-teal-50 border-teal-100 text-teal-700",
          "bg-amber-50 border-amber-100 text-amber-700",
          "bg-rose-50 border-rose-100 text-rose-700"
        )}`;
      
      case "barber":
        return `px-6 py-3 rounded-none border transition-all duration-200 font-bold uppercase tracking-wider text-sm ${getStatusColorClass(
          "bg-emerald-900 border-emerald-700 text-emerald-50",
          "bg-amber-900 border-amber-700 text-amber-50",
          "bg-red-950 border-red-800 text-red-50"
        )}`;
      
      case "auto":
        return `px-6 py-3 rounded-none border-l-4 font-bold uppercase tracking-wider text-sm shadow-md ${getStatusColorClass(
          "bg-slate-800 border-emerald-500 text-emerald-400",
          "bg-slate-800 border-amber-500 text-amber-400",
          "bg-slate-800 border-rose-500 text-rose-400"
        )}`;
      
      case "health":
        return `px-5 py-2.5 rounded-xl border font-bold text-sm shadow-sm ${getStatusColorClass(
          "bg-emerald-50 border-emerald-100 text-emerald-700",
          "bg-amber-50 border-amber-100 text-amber-700",
          "bg-red-50 border-red-100 text-red-700"
        )}`;

      case "space":
        return `px-5 py-2.5 rounded-xl border font-bold text-sm shadow-sm ${getStatusColorClass(
          "bg-white border-emerald-200 text-emerald-700",
          "bg-white border-amber-200 text-amber-700",
          "bg-white border-rose-200 text-rose-700"
        )}`;

      case "default":
      default:
        // Glassmorphism default
        return `px-4 py-2 rounded-full border backdrop-blur-md shadow-sm text-xs sm:text-sm font-bold ${getStatusColorClass(
          "bg-emerald-500/20 text-emerald-100 border-emerald-500/30",
          "bg-amber-500/20 text-amber-100 border-amber-500/30",
          "bg-rose-500/20 text-rose-100 border-rose-500/30"
        )}`;
    }
  };

  const getIconStyles = () => {
    if (variant === 'default') {
      return getStatusColorClass('text-emerald-400', 'text-amber-400', 'text-rose-400');
    }
    if (variant === 'barber' || variant === 'auto') {
      return getStatusColorClass('text-emerald-400', 'text-amber-400', 'text-rose-400');
    }
    // For lighter themes (beauty, health, space)
    return getStatusColorClass('text-emerald-600', 'text-amber-600', 'text-rose-600');
  };

  const getLabelText = () => {
    if (status === "open") return "Buka Sekarang";
    if (status === "closing_soon") return "Segera Tutup";
    return "Sedang Tutup";
  };

  return (
    <span className={`flex items-center gap-2 ${getVariantStyles()}`}>
      <Clock className={`w-4 h-4 ${getIconStyles()}`} />
      <span>{getLabelText()}</span>
    </span>
  );
}
