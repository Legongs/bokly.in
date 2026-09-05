"use client";

import { useEffect, useState } from "react";
import { isStoreOpen } from "@/lib/business-hours";
import { Clock } from "lucide-react";

export function StoreBadge({ 
  schedule, 
  timezone = "Asia/Jakarta" 
}: { 
  schedule: any; 
  timezone?: string 
}) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    // Jalankan kalkulasi di client-side untuk menghindari hydration mismatch
    // (karena Date() akan berbeda bergantung waktu eksekusi SSR)
    setIsOpen(isStoreOpen(schedule, timezone));
  }, [schedule, timezone]);

  if (isOpen === null) return null;

  return (
    <span className={`flex items-center gap-2 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border ${
      isOpen 
        ? "bg-emerald-500/20 text-emerald-100 border-emerald-500/30" 
        : "bg-rose-500/20 text-rose-100 border-rose-500/30"
    }`}>
      <Clock className={`w-4 h-4 ${isOpen ? 'text-emerald-400' : 'text-rose-400'}`} />
      <span className="text-xs sm:text-sm font-bold">
        {isOpen ? "Buka Sekarang" : "Sedang Tutup"}
      </span>
    </span>
  );
}
