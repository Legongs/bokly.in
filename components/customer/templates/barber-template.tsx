import React from "react";
import { Scissors, MessageCircle, MapPin, AtSign, Info } from "lucide-react";
import { StoreBadge } from "../store-badge";
import { BusinessHoursCard } from "@/components/customer/business-hours-card";
import { BookingFlow } from "@/components/customer/booking-flow";
import { PortfolioGallery } from "@/components/customer/portfolio-gallery";
import { SafeImage } from "@/components/ui/safe-image";
import { StorefrontJsonLd } from "./shared/storefront-jsonld";
import { getWhatsAppUrl } from "./shared/whatsapp-link";
import { StorefrontFooter } from "./shared/storefront-footer";
import { TestimonialSection } from "@/components/customer/testimonial-section";
import { PromoBanner } from "@/components/customer/promo-banner";
import { LocationMap } from "@/components/customer/location-map";
import { ShareStorefrontButton } from "@/components/customer/share-storefront-button";
import type { StorefrontTemplateProps } from "./types";

export function BarberTemplate({ tenant, services, staffList, portfolios, dictionary }: StorefrontTemplateProps) {
  const themeColor = tenant.theme_color || "orange";
  
  // Barber template: Gentleman's Club aesthetic (monochrome, earthy brown, vintage gold/orange)
  const themeOptions = {
    orange: { bg: "bg-stone-50", card: "bg-white", text: "text-stone-900", highlight: "text-amber-700", border: "border-stone-200", btn: "bg-amber-700 hover:bg-amber-800" },
    indigo: { bg: "bg-stone-50", card: "bg-white", text: "text-stone-900", highlight: "text-indigo-800", border: "border-stone-200", btn: "bg-indigo-800 hover:bg-indigo-900" },
    teal:   { bg: "bg-stone-50", card: "bg-white", text: "text-stone-900", highlight: "text-indigo-800", border: "border-stone-200", btn: "bg-indigo-800 hover:bg-indigo-900" },
    blue:   { bg: "bg-stone-50", card: "bg-white", text: "text-stone-900", highlight: "text-slate-800",  border: "border-stone-200", btn: "bg-slate-800 hover:bg-slate-900" },
    rose:   { bg: "bg-stone-50", card: "bg-white", text: "text-stone-900", highlight: "text-rose-800",   border: "border-stone-200", btn: "bg-rose-800 hover:bg-rose-900" },
    violet: { bg: "bg-stone-50", card: "bg-white", text: "text-stone-900", highlight: "text-violet-800", border: "border-stone-200", btn: "bg-violet-800 hover:bg-violet-900" },
  };
  
  const colors = themeOptions[themeColor as keyof typeof themeOptions] || themeOptions.orange;

  return (
    <main className={`min-h-screen ${colors.bg} ${colors.text} pb-56 md:pb-24 font-serif`}>
      <StorefrontJsonLd tenant={tenant} schemaType="HealthAndBeautyBusiness" />
      <PromoBanner tenantId={tenant.id} />
      
      {/* ── Vintage Header ── */}
      <header className="relative bg-stone-950 text-stone-100 py-16 md:py-24 overflow-hidden shadow-xl">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-500 via-stone-900 to-black mix-blend-multiply" />
        {tenant.hero_image_url && (
          <SafeImage 
            src={tenant.hero_image_url} 
            alt="Barbershop" 
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay grayscale transition-transform duration-700 hover:scale-105" 
          />
        )}
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 ${colors.border} flex items-center justify-center bg-stone-900 shadow-2xl mb-6 overflow-hidden`}>
            <SafeImage 
              src={tenant.logo_url || undefined} 
              alt={tenant.business_name} 
              className="w-full h-full object-cover"
              fallback={<Scissors className={`w-10 h-10 ${colors.highlight}`} />}
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-widest uppercase mb-4 text-stone-50 drop-shadow-md">
            {tenant.business_name}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-stone-500" />
            <p className={`text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-stone-400`}>
              Est. {new Date(tenant.created_at ?? '').getFullYear()}
            </p>
            <div className="h-[1px] w-12 bg-stone-500" />
          </div>

          {tenant.welcome_message && (
            <p className="text-sm md:text-base text-stone-300 max-w-xl mx-auto italic font-medium leading-relaxed drop-shadow-sm">
              "{tenant.welcome_message}"
            </p>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-sans">
            <a href={getWhatsAppUrl(tenant.whatsapp_number)} target="_blank" rel="noopener noreferrer" 
               className={`flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-50 rounded-none border border-stone-600 transition-all duration-200 font-bold uppercase tracking-wider`}>
              <MessageCircle className="w-4 h-4" /> Tanya Kami
            </a>
            {tenant.instagram_handle && (
              <a href={`https://instagram.com/${tenant.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
                 className={`flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-50 rounded-none border border-stone-600 transition-all duration-200 font-bold uppercase tracking-wider`}>
                <AtSign className="w-4 h-4" /> Instagram
              </a>
            )}
            <StoreBadge schedule={(tenant as any).weekly_schedule} timezone={tenant.timezone} variant="barber" />
            <ShareStorefrontButton tenantSlug={tenant.slug} businessName={tenant.business_name} />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 mt-12 flex flex-col md:flex-row gap-10">
        
        {/* Left Column: Info */}
        <div className="w-full md:w-1/3 flex flex-col gap-6 font-sans">
          {tenant.address && (
            <div className={`p-6 ${colors.card} border ${colors.border} rounded-none shadow-sm`}>
              <div className="flex items-center gap-3 mb-3">
                <MapPin className={`w-5 h-5 ${colors.highlight}`} />
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-500">Lokasi</h3>
              </div>
              <p className="text-sm font-medium text-stone-800 leading-relaxed border-l-2 border-stone-200 pl-3">
                {tenant.address}
              </p>
              <LocationMap address={tenant.address} className="mt-4" />
            </div>
          )}

          {tenant.cancellation_policy && (
            <div className={`p-6 bg-stone-900 text-stone-300 rounded-none shadow-sm`}>
              <div className="flex items-center gap-3 mb-3">
                <Info className="w-5 h-5 text-stone-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Aturan Cukur</h3>
              </div>
              <p className="text-sm leading-relaxed italic border-l-2 border-stone-700 pl-3">
                {tenant.cancellation_policy}
              </p>
            </div>
          )}

          {portfolios.length > 0 && (
            <div className={`p-6 ${colors.card} border ${colors.border} rounded-none shadow-sm hidden md:block`}>
               <PortfolioGallery portfolios={portfolios} />
            </div>
          )}
        </div>

        {/* Right Column: Booking */}
        <div className="w-full md:w-2/3">
          <div className={`p-6 md:p-8 ${colors.card} border ${colors.border} rounded-none shadow-md font-sans`}>
            <h2 className="text-2xl font-black text-stone-900 uppercase tracking-widest text-center mb-8 pb-4 border-b-2 border-stone-100">
              Amankan Kursi Anda
            </h2>
            <BookingFlow tenant={tenant} services={services} staffList={staffList} dictionary={dictionary} />
          </div>
          
          {portfolios.length > 0 && (
            <div className="mt-8 block md:hidden font-sans">
               <PortfolioGallery portfolios={portfolios} />
            </div>
          )}
        </div>
      </div>

      <div className="my-8 max-w-4xl mx-auto px-4">
        <BusinessHoursCard schedule={(tenant as any).weekly_schedule} timezone={tenant.timezone} />
      </div>

      <TestimonialSection tenantId={tenant.id} themeColor={themeColor} />
      <StorefrontFooter variant="barber" />
    </main>
  );
}
