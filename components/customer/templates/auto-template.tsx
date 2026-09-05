import React from "react";
import { Store, Car, MessageCircle, MapPin, AtSign, Info } from "lucide-react";
import { StoreBadge } from "../store-badge";
import { BookingFlow } from "@/components/customer/booking-flow";
import { PortfolioGallery } from "@/components/customer/portfolio-gallery";
import { Logo } from "@/components/ui/logo";
import type { StorefrontTemplateProps } from "./types";

export function AutoTemplate({ tenant, services, staffList, portfolios, dictionary }: StorefrontTemplateProps) {
  const themeColor = (tenant as any).theme_color || "orange";
  
  // Revised earthy, warm palette instead of neon dark mode
  const colors = {
    orange: { bg: "bg-orange-50", card: "bg-white", text: "text-amber-900", highlight: "text-orange-700", border: "border-orange-200" },
    teal: { bg: "bg-stone-100", card: "bg-white", text: "text-stone-900", highlight: "text-teal-700", border: "border-teal-200" },
    blue: { bg: "bg-blue-50", card: "bg-white", text: "text-slate-900", highlight: "text-blue-700", border: "border-blue-200" },
    rose: { bg: "bg-rose-50", card: "bg-white", text: "text-rose-900", highlight: "text-rose-700", border: "border-rose-200" },
    violet: { bg: "bg-stone-100", card: "bg-white", text: "text-stone-900", highlight: "text-violet-700", border: "border-violet-200" },
  }[themeColor as keyof typeof colors] || colors.orange;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": tenant.business_name,
    "telephone": tenant.whatsapp_number,
    "url": `https://bukly.id/${tenant.slug}`,
  };

  return (
    <main className={`min-h-screen ${colors.bg} text-stone-800 pb-40 md:pb-20 font-sans tracking-wide`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* ── Asymmetric Earthy Header ── */}
      <header className={`border-b-4 ${colors.border} bg-white p-6 md:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8`}>
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className={`w-16 h-16 rounded-2xl ${colors.bg} border-2 ${colors.border} flex items-center justify-center ${colors.highlight} shadow-inner`}>
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.business_name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Car className="w-8 h-8" />
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-stone-800 uppercase tracking-tighter">
              {tenant.business_name}
            </h1>
            <p className={`text-sm ${colors.highlight} font-bold tracking-widest uppercase mt-1`}>
              bukly.id/{tenant.slug}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto justify-start md:justify-end">
          <a href={`https://wa.me/${tenant.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" 
             className={`flex items-center justify-center gap-2 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 border-2 border-stone-200 rounded-xl transition-all duration-200 active:scale-95 shadow-sm font-semibold`}>
            <MessageCircle className="w-5 h-5" />
            <span className="hidden md:inline">Tanya Kami</span>
          </a>
          {tenant.instagram_handle && (
            <a href={`https://instagram.com/${tenant.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
               className={`flex items-center justify-center w-14 h-14 bg-stone-100 hover:bg-stone-200 text-stone-800 border-2 border-stone-200 rounded-xl transition-all duration-200 active:scale-95 shadow-sm`}>
              <AtSign className="w-5 h-5" />
            </a>
          )}
          <StoreBadge schedule={(tenant as any).weekly_schedule} timezone={tenant.timezone} />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Info & Content */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          {tenant.hero_image_url && (
            <div className={`w-full h-48 md:h-64 ${colors.card} border-4 ${colors.border} rounded-2xl overflow-hidden relative shadow-sm`}>
              <img src={tenant.hero_image_url} alt="Hero" className="w-full h-full object-cover" />
            </div>
          )}

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

      <footer className="mt-16 pb-8 text-center pt-8 border-t border-stone-200">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Sistem Antrean Disediakan Oleh</p>
        <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-all duration-200 bg-white px-4 py-2 rounded-xl shadow-sm border border-stone-200">
          <Logo className="text-xl block" />
        </a>
        <div className="mt-8 flex justify-center">
          <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-teal-600 text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-teal-700 transition-all duration-200 shadow-lg shadow-teal-600/20 active:scale-95">
            Mau Web Reservasi Gratis? Yuk Bikin!
          </a>
        </div>
      </footer>
    </main>
  );
}
