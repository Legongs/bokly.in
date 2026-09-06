"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareStorefrontButtonProps {
  tenantSlug: string;
  businessName: string;
  className?: string;
}

/**
 * Tombol share storefront.
 * - Mobile: gunakan Web Share API jika tersedia
 * - Desktop: copy URL ke clipboard + toast notifikasi
 */
export function ShareStorefrontButton({ tenantSlug, businessName, className = "" }: ShareStorefrontButtonProps) {
  const url = `https://bukly.id/${tenantSlug}`;

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Booking online ${businessName}`,
          text: `Booking online di ${businessName} — cepat, aman, tanpa antri!`,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link disalin!");
      } catch {
        toast.error("Gagal menyalin link.");
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Bagikan halaman ini"
      aria-label="Bagikan halaman booking"
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold transition-all duration-200 active:scale-95 ${className}`}
    >
      <Share2 className="w-4 h-4" />
      <span className="hidden sm:inline">Bagikan</span>
    </button>
  );
}
