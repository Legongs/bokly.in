import React from "react";
import { Megaphone } from "lucide-react";
import { getActivePromotions } from "@/lib/actions/promotion.actions";

export async function PromoBanner({ tenantId }: { tenantId: string }) {
  const res = await getActivePromotions(tenantId);
  const promotions = res.success && res.data ? res.data : [];

  if (promotions.length === 0) return null;

  // Tampilkan promo pertama (paling terbaru/relevan)
  const promo = promotions[0];
  const discountText = promo.discount_type === "percentage" 
    ? `${promo.discount_value}% OFF` 
    : `Rp ${promo.discount_value.toLocaleString("id-ID")} OFF`;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white relative overflow-hidden shadow-md">
      {/* Animasi latar belakang agar lebih menarik (opsional tapi bagus untuk marketing) */}
      <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay"></div>
      
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center text-center gap-3 relative z-10">
        <div className="bg-white/20 p-1.5 rounded-full flex-shrink-0 animate-bounce">
          <Megaphone className="w-4 h-4 text-white" />
        </div>
        <p className="text-sm font-semibold tracking-wide flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <span>{promo.title}</span>
          <span className="hidden sm:inline">•</span>
          <span className="bg-white text-rose-600 px-2 py-0.5 rounded-md font-black text-xs">
            {discountText}
          </span>
          {promo.description && (
            <span className="hidden md:inline font-medium text-white/90">
              - {promo.description}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
