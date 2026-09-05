"use client";

import { useEffect, useState } from "react";
import { isStoreOpen } from "@/lib/business-hours";
import { Clock } from "lucide-react";

type StoreBadgeVariant = "default" | "beauty" | "barber" | "auto" | "health" | "space";

interface StoreBadgeProps {
  schedule: any;
  timezone?: string;
  variant?: StoreBadgeVariant;
}

export function StoreBadge({ schedule, timezone = "Asia/Jakarta", variant = "default" }: StoreBadgeProps) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    setIsOpen(isStoreOpen(schedule, timezone));
  }, [schedule, timezone]);

  if (isOpen === null) return null;

  // Render style per variant to match template's aesthetic
  const getVariantStyles = () => {
    switch (variant) {
      case "beauty":
        return `px-5 py-2.5 rounded-2xl border ${
          isOpen ? "bg-teal-50 border-teal-100 text-teal-700" : "bg-rose-50 border-rose-100 text-rose-700"
        } font-bold text-sm shadow-sm`;
      
      case "barber":
        return `px-6 py-3 rounded-none border transition-all duration-200 font-bold uppercase tracking-wider text-sm ${
          isOpen ? "bg-emerald-900 border-emerald-700 text-emerald-50" : "bg-red-950 border-red-800 text-red-50"
        }`;
      
      case "auto":
        return `px-6 py-3 rounded-none border-l-4 font-bold uppercase tracking-wider text-sm shadow-md ${
          isOpen ? "bg-slate-800 border-emerald-500 text-emerald-400" : "bg-slate-800 border-rose-500 text-rose-400"
        }`;
      
      case "health":
        return `px-5 py-2.5 rounded-xl border ${
          isOpen ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
        } font-bold text-sm shadow-sm`;

      case "space":
        return `px-5 py-2.5 rounded-xl border ${
          isOpen ? "bg-white border-emerald-200 text-emerald-700" : "bg-white border-rose-200 text-rose-700"
        } font-bold text-sm shadow-sm`;

      case "default":
      default:
        // Glassmorphism default
        return `px-4 py-2 rounded-full border backdrop-blur-md shadow-sm text-xs sm:text-sm font-bold ${
          isOpen ? "bg-emerald-500/20 text-emerald-100 border-emerald-500/30" : "bg-rose-500/20 text-rose-100 border-rose-500/30"
        }`;
    }
  };

  const getIconStyles = () => {
    if (variant === 'default') {
      return isOpen ? 'text-emerald-400' : 'text-rose-400';
    }
    if (variant === 'barber' || variant === 'auto') {
      return isOpen ? 'text-emerald-400' : 'text-rose-400';
    }
    // For lighter themes (beauty, health, space)
    return isOpen ? 'text-emerald-600' : 'text-rose-600';
  };

  return (
    <span className={`flex items-center gap-2 ${getVariantStyles()}`}>
      <Clock className={`w-4 h-4 ${getIconStyles()}`} />
      <span>{isOpen ? "Buka Sekarang" : "Sedang Tutup"}</span>
    </span>
  );
}
