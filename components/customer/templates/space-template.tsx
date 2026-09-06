import React from "react";
import { Building, MessageCircle, MapPin, AtSign, Info } from "lucide-react";
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
import { FacilityBadges } from "@/components/customer/facility-badges";
import { LocationMap } from "@/components/customer/location-map";
import { ShareStorefrontButton } from "@/components/customer/share-storefront-button";
import type { StorefrontTemplateProps } from "./types";

export function SpaceTemplate({ tenant, services, staffList, portfolios, dictionary, facilities = [] }: StorefrontTemplateProps) {
  const themeColor = tenant.theme_color || "blue";
  
  const themeOptions = {
    blue:   { bg: "bg-blue-50",   card: "bg-white", border: "border-blue-100",   text: "text-blue-900",   highlight: "bg-blue-100",   gradientTo: "to-blue-50" },
    indigo: { bg: "bg-indigo-50", card: "bg-white", border: "border-indigo-100", text: "text-indigo-900", highlight: "bg-indigo-100", gradientTo: "to-indigo-50" },
    teal:   { bg: "bg-indigo-50", card: "bg-white", border: "border-indigo-100", text: "text-indigo-900", highlight: "bg-indigo-100", gradientTo: "to-indigo-50" },
    rose:   { bg: "bg-rose-50",   card: "bg-white", border: "border-rose-100",   text: "text-rose-900",   highlight: "bg-rose-100",   gradientTo: "to-rose-50" },
    violet: { bg: "bg-violet-50", card: "bg-white", border: "border-violet-100", text: "text-violet-900", highlight: "bg-violet-100", gradientTo: "to-violet-50" },
    orange: { bg: "bg-orange-50", card: "bg-white", border: "border-orange-100", text: "text-orange-900", highlight: "bg-orange-100", gradientTo: "to-orange-50" },
  };
  const colors = themeOptions[themeColor as keyof typeof themeOptions] || themeOptions.blue;

  return (
    <main className={`min-h-screen ${colors.bg} text-stone-800 font-sans relative pb-56 md:pb-24`}>
      <StorefrontJsonLd tenant={tenant} schemaType="LocalBusiness" services={services} />
      <PromoBanner tenantId={tenant.id} />
      
      {/* ── Premium Deep Space Background ── */}
      <div className="absolute top-0 left-0 right-0 h-[450px] z-0 overflow-hidden bg-blue-950">
        <SafeImage 
          src={tenant.hero_image_url || undefined} 
          alt="Space" 
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          fallback={<div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-transparent" />}
        />
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 ${colors.gradientTo}`} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-12 pb-24">
        <header className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-12 md:mb-16 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`w-24 h-24 rounded-3xl ${colors.card} border-4 ${colors.border} flex items-center justify-center shadow-2xl`}>
              <SafeImage 
                src={tenant.logo_url || undefined} 
                alt={tenant.business_name} 
                className="w-full h-full object-cover rounded-3xl"
                fallback={<Building className="w-10 h-10 text-stone-400" />}
              />
            </div>
            <div>
              <p className={`text-sm font-bold tracking-widest uppercase text-blue-200 mb-2 drop-shadow-sm`}>bukly.id/{tenant.slug}</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-blue-50 mb-4 drop-shadow-md">
                {tenant.business_name}
              </h1>
              {tenant.welcome_message && (
                <p className="text-blue-100 max-w-lg text-lg font-medium leading-relaxed drop-shadow-sm">
                  {tenant.welcome_message}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col gap-3">
            <a href={getWhatsAppUrl(tenant.whatsapp_number)} target="_blank" rel="noopener noreferrer" 
               className={`flex items-center gap-3 px-6 py-3 rounded-2xl ${colors.card} border ${colors.border} hover:bg-stone-50 transition-all duration-200 shadow-sm text-stone-700 font-semibold active:scale-95`}>
              <MessageCircle className="w-5 h-5 text-green-600" />
              <span className="hidden md:inline">Tanya Kami</span>
            </a>
            {tenant.instagram_handle && (
              <a href={`https://instagram.com/${tenant.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
                 className={`flex items-center gap-3 px-6 py-3 rounded-2xl ${colors.card} border ${colors.border} hover:bg-stone-50 transition-all duration-200 shadow-sm text-stone-700 font-semibold active:scale-95`}>
                <AtSign className="w-5 h-5 text-stone-600" />
                <span className="hidden md:inline">Lihat Foto</span>
              </a>
            )}
            <StoreBadge schedule={(tenant as any).weekly_schedule} timezone={tenant.timezone} variant="space" />
            <ShareStorefrontButton tenantSlug={tenant.slug} businessName={tenant.business_name} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Asymmetric Left Layout */}
          <div className="lg:col-span-1 space-y-6">
            {tenant.address && (
              <div className={`${colors.card} border ${colors.border} rounded-3xl p-6 shadow-sm`}>
                <h3 className={`text-xs font-bold uppercase tracking-widest text-stone-400 mb-4`}>Lokasi Properti</h3>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-stone-500 flex-shrink-0 mt-0.5" />
                  <p className="text-stone-700 leading-relaxed font-medium">{tenant.address}</p>
                </div>
                <LocationMap address={tenant.address} className="mt-4" />
                {facilities.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Fasilitas</p>
                    <FacilityBadges facilities={facilities} />
                  </div>
                )}
              </div>
            )}
            
            {tenant.cancellation_policy && (
              <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Kebijakan Sewa
                </h3>
                <p className="text-orange-900 leading-relaxed text-sm">{tenant.cancellation_policy}</p>
              </div>
            )}

            {portfolios.length > 0 && (
              <div className={`${colors.card} border ${colors.border} rounded-3xl p-6 hidden lg:block shadow-sm`}>
                 <PortfolioGallery portfolios={portfolios} />
              </div>
            )}
          </div>

          {/* Main Booking Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] p-5 md:p-10 text-stone-900 shadow-lg border border-stone-100 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-2 ${colors.highlight}`} />
              <h2 className="text-2xl font-bold mb-8 text-stone-800">Cek Ketersediaan &amp; Sewa</h2>
              <BookingFlow tenant={tenant} services={services} staffList={staffList} dictionary={dictionary} />
            </div>
            
            {portfolios.length > 0 && (
              <div className="mt-8 block lg:hidden">
                 <PortfolioGallery portfolios={portfolios} />
              </div>
            )}
          </div>
        </div>

        <div className="my-8">
          <BusinessHoursCard schedule={(tenant as any).weekly_schedule} timezone={tenant.timezone} />
        </div>

        <TestimonialSection tenantId={tenant.id} themeColor={themeColor} />
        <StorefrontFooter variant="default" />
      </div>
    </main>
  );
}
