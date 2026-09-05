import React from "react";
import { Store, Scissors, MessageCircle, MapPin, AtSign, Info } from "lucide-react";
import { StoreBadge } from "../store-badge";
import { BookingFlow } from "@/components/customer/booking-flow";
import { PortfolioGallery } from "@/components/customer/portfolio-gallery";
import { Logo } from "@/components/ui/logo";
import type { StorefrontTemplateProps } from "./types";

export function BeautyTemplate({ tenant, services, staffList, portfolios, dictionary }: StorefrontTemplateProps) {
  const themeColor = (tenant as any).theme_color || "rose";
  
  // Base color maps
  const colors = {
    rose: { bg: "bg-rose-50", text: "text-rose-900", accent: "bg-rose-500", light: "bg-rose-100", border: "border-rose-100" },
    teal: { bg: "bg-teal-50", text: "text-teal-900", accent: "bg-teal-500", light: "bg-teal-100", border: "border-teal-100" },
    violet: { bg: "bg-violet-50", text: "text-violet-900", accent: "bg-violet-500", light: "bg-violet-100", border: "border-violet-100" },
    orange: { bg: "bg-orange-50", text: "text-orange-900", accent: "bg-orange-500", light: "bg-orange-100", border: "border-orange-100" },
    blue: { bg: "bg-blue-50", text: "text-blue-900", accent: "bg-blue-500", light: "bg-blue-100", border: "border-blue-100" },
  }[themeColor as keyof typeof colors] || colors.rose;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": tenant.business_name,
    "telephone": tenant.whatsapp_number,
    "url": `https://bukly.id/${tenant.slug}`,
  };

  return (
    <main className={`min-h-screen ${colors.bg} pb-40 md:pb-20 font-sans`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* ── Minimal Centered Header ── */}
      <header className="py-6 px-4 flex flex-col items-center justify-center text-center gap-3">
        <div className={`w-16 h-16 rounded-full ${colors.light} flex items-center justify-center text-${themeColor}-700 shadow-sm overflow-hidden border-2 border-white`}>
          {tenant.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.business_name} className="w-full h-full object-cover" />
          ) : (
            <Scissors className="w-6 h-6" />
          )}
        </div>
        <h1 className={`font-serif text-2xl font-semibold ${colors.text} tracking-tight`}>
          {tenant.business_name}
        </h1>
        <p className="text-sm text-stone-500 max-w-sm">
          {tenant.welcome_message || "Temukan gaya terbaikmu bersama kami."}
        </p>
      </header>

      <div className="max-w-lg mx-auto px-4 mt-2">
        {/* ── Soft Hero Card ── */}
        {tenant.hero_image_url && (
          <section className="relative w-full h-64 md:h-80 rounded-[3rem] overflow-hidden shadow-lg mb-8">
            <img src={tenant.hero_image_url} alt="Hero" className="w-full h-full object-cover" />
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
              <a href={`https://wa.me/${tenant.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" 
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
              <StoreBadge schedule={(tenant as any).weekly_schedule} timezone={tenant.timezone} />
            </div>
          </div>
        )}

        {tenant.cancellation_policy && (
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-5 mb-8 text-center">
            <Info className="w-5 h-5 text-orange-400 mx-auto mb-2" />
            <p className="text-xs text-orange-800 leading-relaxed">{tenant.cancellation_policy}</p>
          </div>
        )}

        <div className="mb-10">

          <PortfolioGallery portfolios={portfolios} />
        </div>

        <div className="bg-white rounded-[3rem] p-6 shadow-sm border border-stone-100">
          <h2 className={`font-serif text-xl font-medium text-center mb-6 ${colors.text}`}>Buat Reservasi</h2>
          <BookingFlow tenant={tenant} services={services} staffList={staffList} dictionary={dictionary} />
        </div>

        <footer className="mt-16 pb-8 text-center pt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Powered by</p>
          <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
            <Logo className="text-2xl" />
          </a>
          <p className="text-[11px] text-stone-400 mt-4 max-w-xs mx-auto leading-relaxed">
            Halaman reservasi otomatis ini dibuat menggunakan <a href="https://bukly.id" className="font-semibold text-teal-600 hover:underline">bukly.id</a>
          </p>
          <div className="mt-8 flex justify-center">
            <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-teal-600 text-white text-xs font-bold px-6 py-3 rounded-full hover:bg-teal-700 transition-all duration-200 shadow-lg shadow-teal-600/20 active:scale-95">
              Mau Web Reservasi Gratis? Yuk Bikin!
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
