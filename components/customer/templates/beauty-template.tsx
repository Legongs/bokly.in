import React from "react";
import { Scissors, MessageCircle, MapPin, AtSign, Info } from "lucide-react";
import { StoreBadge } from "../store-badge";
import { BusinessHoursCard } from "@/components/customer/business-hours-card";
import { BookingFlow } from "@/components/customer/booking-flow";
import { PortfolioGallery } from "@/components/customer/portfolio-gallery";
import { Logo } from "@/components/ui/logo";
import { SafeImage } from "@/components/ui/safe-image";
import { StorefrontJsonLd } from "./shared/storefront-jsonld";
import { getWhatsAppUrl } from "./shared/whatsapp-link";
import { StorefrontFooter } from "./shared/storefront-footer";
import { TestimonialSection } from "@/components/customer/testimonial-section";
import { PromoBanner } from "@/components/customer/promo-banner";
import type { StorefrontTemplateProps } from "./types";

export function BeautyTemplate({ tenant, services, staffList, portfolios, dictionary }: StorefrontTemplateProps) {
  const themeColor = tenant.theme_color || "rose";
  
  // Base color maps
  const themeOptions = {
    rose: { bg: "bg-rose-50", text: "text-rose-900", accent: "bg-rose-500", light: "bg-rose-100", border: "border-rose-100", textDark: "text-rose-700" },
    teal: { bg: "bg-teal-50", text: "text-teal-900", accent: "bg-teal-500", light: "bg-teal-100", border: "border-teal-100", textDark: "text-teal-700" },
    violet: { bg: "bg-violet-50", text: "text-violet-900", accent: "bg-violet-500", light: "bg-violet-100", border: "border-violet-100", textDark: "text-violet-700" },
    orange: { bg: "bg-orange-50", text: "text-orange-900", accent: "bg-orange-500", light: "bg-orange-100", border: "border-orange-100", textDark: "text-orange-700" },
    blue: { bg: "bg-blue-50", text: "text-blue-900", accent: "bg-blue-500", light: "bg-blue-100", border: "border-blue-100", textDark: "text-blue-700" },
  };
  const colors = themeOptions[themeColor as keyof typeof themeOptions] || themeOptions.rose;

  return (
    <main className={`min-h-screen ${colors.bg} pb-56 md:pb-24 font-sans`}>
      <StorefrontJsonLd tenant={tenant} schemaType="BeautySalon" />
      <PromoBanner tenantId={tenant.id} />
      
      {/* ── Premium Beauty Header ── */}
      <header className="bg-rose-950 py-10 px-4 flex flex-col items-center justify-center text-center gap-4 rounded-b-[3rem] shadow-md mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900 via-rose-950 to-black opacity-60 mix-blend-overlay" />
        
        <div className={`relative z-10 w-20 h-20 rounded-full ${colors.light} flex items-center justify-center ${colors.textDark} shadow-lg overflow-hidden border-4 border-rose-900/50`}>
          <SafeImage 
            src={tenant.logo_url || undefined} 
            alt={tenant.business_name} 
            className="w-full h-full object-cover"
            fallback={<Scissors className="w-8 h-8" />}
          />
        </div>
        <h1 className={`relative z-10 font-serif text-3xl font-semibold text-rose-50 tracking-wide drop-shadow-sm`}>
          {tenant.business_name}
        </h1>
        <p className="relative z-10 text-sm text-rose-50/90 max-w-sm italic">
          {tenant.welcome_message || "Temukan gaya terbaikmu bersama kami."}
        </p>
      </header>

      <div className="max-w-lg mx-auto px-4 mt-2">
        {/* ── Soft Hero Card ── */}
        {tenant.hero_image_url && (
          <section className="relative w-full h-64 md:h-80 rounded-[3rem] overflow-hidden shadow-lg mb-8">
            <SafeImage src={tenant.hero_image_url} alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </section>
        )}

        {(tenant.address || tenant.whatsapp_number) && (
          <div className="bg-white/60 backdrop-blur-sm border border-white rounded-3xl p-5 mb-8 text-center shadow-sm">
            {tenant.address && (
              <>
                <MapPin className={`w-5 h-5 mx-auto mb-2 ${colors.text} opacity-70`} />
                <p className="text-sm text-stone-600 leading-relaxed">
                  {tenant.address}
                </p>
              </>
            )}
            
            <div className="flex flex-wrap items-center justify-center gap-3 mt-5 pt-5 border-t border-stone-200/50">
              <span className="font-bold text-stone-800 text-sm mr-2">{tenant.whatsapp_number}</span>
              <a href={getWhatsAppUrl(tenant.whatsapp_number)} target="_blank" rel="noopener noreferrer" 
                 className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white ${colors.text} shadow-sm border ${colors.border} hover:shadow-md transition-shadow`}>
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Chat Kami</span>
              </a>
              {tenant.instagram_handle && (
                <a href={`https://instagram.com/${tenant.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
                   className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white ${colors.text} shadow-sm border ${colors.border} hover:shadow-md transition-shadow`}>
                  <AtSign className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Instagram</span>
                </a>
              )}
              <StoreBadge schedule={(tenant as any).weekly_schedule} timezone={tenant.timezone} variant="beauty" />
            </div>
          </div>
        )}

        {tenant.cancellation_policy && (
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-5 mb-8 text-center">
            <Info className="w-5 h-5 text-orange-400 mx-auto mb-2" />
            <p className="text-xs text-orange-800 leading-relaxed">{tenant.cancellation_policy}</p>
          </div>
        )}

        {portfolios.length > 0 && (
          <div className="mb-10">
            <PortfolioGallery portfolios={portfolios} />
          </div>
        )}

        <div className="bg-white rounded-[3rem] p-6 shadow-sm border border-stone-100">
          <h2 className={`font-serif text-xl font-medium text-center mb-6 ${colors.text}`}>Buat Reservasi</h2>
          <BookingFlow tenant={tenant} services={services} staffList={staffList} dictionary={dictionary} />
        </div>

        <div className="my-8">


          <BusinessHoursCard schedule={(tenant as any).weekly_schedule} timezone={tenant.timezone} />


        </div>


        <TestimonialSection tenantId={tenant.id} themeColor={themeColor} />
      <StorefrontFooter variant="beauty" />
      </div>
    </main>
  );
}


