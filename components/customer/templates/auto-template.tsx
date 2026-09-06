import React from "react";
import { Car, MessageCircle, MapPin, AtSign, Info } from "lucide-react";
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

export function AutoTemplate({ tenant, services, staffList, portfolios, dictionary }: StorefrontTemplateProps) {
  const themeColor = tenant.theme_color || "orange";
  
  // Revised earthy, warm palette instead of neon dark mode
  const themeOptions = {
    orange: { bg: "bg-orange-50", card: "bg-white", text: "text-amber-900", highlight: "text-orange-700", border: "border-orange-200" },
    teal: { bg: "bg-stone-100", card: "bg-white", text: "text-stone-900", highlight: "text-teal-700", border: "border-teal-200" },
    blue: { bg: "bg-blue-50", card: "bg-white", text: "text-slate-900", highlight: "text-blue-700", border: "border-blue-200" },
    rose: { bg: "bg-rose-50", card: "bg-white", text: "text-rose-900", highlight: "text-rose-700", border: "border-rose-200" },
    violet: { bg: "bg-stone-100", card: "bg-white", text: "text-stone-900", highlight: "text-violet-700", border: "border-violet-200" },
  };
  const colors = themeOptions[themeColor as keyof typeof themeOptions] || themeOptions.orange;

  return (
    <main className={`min-h-screen ${colors.bg} text-stone-800 pb-56 md:pb-24 font-sans tracking-wide`}>
      <StorefrontJsonLd tenant={tenant} schemaType="AutoRepair" />
      <PromoBanner tenantId={tenant.id} />
      
      {/* ── Premium Auto Header ── */}
      <header className={`border-b-4 ${colors.border} bg-slate-900 p-6 md:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 text-slate-50`}>
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className={`w-16 h-16 rounded-2xl ${colors.bg} border-2 ${colors.border} flex items-center justify-center ${colors.highlight} shadow-inner`}>
            <SafeImage 
              src={tenant.logo_url || undefined} 
              alt={tenant.business_name} 
              className="w-full h-full object-cover rounded-2xl"
              fallback={<Car className="w-8 h-8" />}
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-50 uppercase tracking-tighter drop-shadow-sm">
              {tenant.business_name}
            </h1>
            <p className={`text-sm ${colors.highlight} font-bold tracking-widest uppercase mt-1 drop-shadow-sm brightness-125`}>
              bukly.id/{tenant.slug}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto justify-start md:justify-end">
          <a href={getWhatsAppUrl(tenant.whatsapp_number)} target="_blank" rel="noopener noreferrer" 
             className={`flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-50 border border-slate-700 rounded-xl transition-all duration-200 active:scale-95 shadow-md font-semibold`}>
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <span className="hidden md:inline">Tanya Kami</span>
          </a>
          {tenant.instagram_handle && (
            <a href={`https://instagram.com/${tenant.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
               className={`flex items-center justify-center w-14 h-14 bg-slate-800 hover:bg-slate-700 text-slate-50 border border-slate-700 rounded-xl transition-all duration-200 active:scale-95 shadow-md`}>
              <AtSign className="w-5 h-5" />
            </a>
          )}
          <StoreBadge schedule={(tenant as any).weekly_schedule} timezone={tenant.timezone} variant="auto" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Info & Content */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className={`w-full h-48 md:h-64 ${colors.card} border-4 ${colors.border} rounded-2xl overflow-hidden relative shadow-sm`}>
            {tenant.hero_image_url ? (
              <SafeImage src={tenant.hero_image_url} alt="Hero" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-slate-100 flex items-center justify-center overflow-hidden">
                <div className={`absolute top-0 right-0 w-64 h-64 ${colors.bg} rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2`} />
                <div className={`absolute bottom-0 left-0 w-48 h-48 ${colors.border} rounded-full blur-2xl opacity-40 transform -translate-x-1/2 translate-y-1/2`} />
                <Car className={`w-16 h-16 ${colors.highlight} opacity-20`} />
              </div>
            )}
          </div>

          {tenant.welcome_message && (
            <div className={`bg-white border-l-4 ${colors.border} p-6 shadow-sm rounded-r-2xl`}>
              <p className="text-stone-700 font-medium text-base leading-relaxed">{tenant.welcome_message}</p>
            </div>
          )}

          {tenant.address && (
            <div className="flex items-start gap-4 p-6 bg-white shadow-sm rounded-2xl border border-stone-200">
              <MapPin className={`w-6 h-6 ${colors.highlight} flex-shrink-0 mt-0.5`} />
              <div>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Lokasi Bengkel</p>
                <p className="text-sm font-medium text-stone-700 leading-relaxed">{tenant.address}</p>
              </div>
            </div>
          )}

          {tenant.cancellation_policy && (
            <div className="bg-orange-50 border border-orange-200 p-6 rounded-2xl text-orange-900 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-orange-600" />
                <h4 className="font-bold uppercase tracking-wider text-sm">Catatan Penting</h4>
              </div>
              <p className="text-sm leading-relaxed">{tenant.cancellation_policy}</p>
            </div>
          )}
        </div>

        {/* Right Column: Booking & Gallery */}
        <div className="w-full md:w-2/3 flex flex-col gap-8">
          <div className={`bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-md`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-2 h-8 ${colors.highlight} bg-current rounded-full`} />
              <h2 className="text-2xl font-black text-stone-800 tracking-tight">Amankan Jadwal Anda</h2>
            </div>
            <div className="text-stone-900">
              <BookingFlow tenant={tenant} services={services} staffList={staffList} dictionary={dictionary} />
            </div>
          </div>

          {portfolios.length > 0 && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm">

              <PortfolioGallery portfolios={portfolios} />
            </div>
          )}
        </div>

      </div>

      <div className="my-8">


        <BusinessHoursCard schedule={(tenant as any).weekly_schedule} timezone={tenant.timezone} />


      </div>


      <TestimonialSection tenantId={tenant.id} themeColor={themeColor} />
      <StorefrontFooter variant="auto" />
    </main>
  );
}


