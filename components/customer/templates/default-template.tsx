import React from "react";
import { Store, Scissors, Building, Car, Stethoscope, MessageCircle, MapPin, AtSign, Info } from "lucide-react";
import { BookingFlow } from "@/components/customer/booking-flow";
import { PortfolioGallery } from "@/components/customer/portfolio-gallery";
import { Logo } from "@/components/ui/logo";
import type { StorefrontTemplateProps } from "./types";

export function DefaultTemplate({ tenant, services, staffList, portfolios, dictionary }: StorefrontTemplateProps) {
  // ── Theme Mapping ───────────────────────────────────────────────────────────
  const themeStyles: Record<string, any> = {
    teal: {
      bgLogo: "bg-teal-600 shadow-teal-600/30",
      bgHero: "bg-gradient-to-br from-teal-700 to-teal-500 shadow-teal-700/20",
      textSub: "text-teal-100",
      blob: "bg-teal-900/20",
      dot: "bg-teal-500",
    },
    rose: {
      bgLogo: "bg-rose-600 shadow-rose-600/30",
      bgHero: "bg-gradient-to-br from-rose-700 to-rose-500 shadow-rose-700/20",
      textSub: "text-rose-100",
      blob: "bg-rose-900/20",
      dot: "bg-rose-500",
    },
    orange: {
      bgLogo: "bg-orange-500 shadow-orange-500/30",
      bgHero: "bg-gradient-to-br from-orange-600 to-orange-400 shadow-orange-600/20",
      textSub: "text-orange-100",
      blob: "bg-orange-900/20",
      dot: "bg-orange-500",
    },
    violet: {
      bgLogo: "bg-violet-600 shadow-violet-600/30",
      bgHero: "bg-gradient-to-br from-violet-700 to-violet-500 shadow-violet-700/20",
      textSub: "text-violet-100",
      blob: "bg-violet-900/20",
      dot: "bg-violet-500",
    },
    blue: {
      bgLogo: "bg-blue-600 shadow-blue-600/30",
      bgHero: "bg-gradient-to-br from-blue-700 to-blue-500 shadow-blue-700/20",
      textSub: "text-blue-100",
      blob: "bg-blue-900/20",
      dot: "bg-blue-500",
    },
  };

  const themeColor = (tenant as any).theme_color || dictionary.themeColor || "teal";
  const currentTheme = themeStyles[themeColor] || themeStyles["teal"];

  const IconComponent = {
    Scissors,
    Building,
    Car,
    Stethoscope,
    Store
  }[dictionary.iconName] || Store;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": tenant.business_name,
    "telephone": tenant.whatsapp_number,
    "url": `https://bukly.id/${tenant.slug}`,
    "makesOffer": services.map((s) => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": s.name,
      },
      "price": s.price,
      "priceCurrency": "IDR",
    })),
  };

  return (
    <main className="min-h-screen bg-stone-50 pb-40 md:pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* ── Sticky Tenant Header ── */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-stone-100 shadow-sm shadow-stone-100/50">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-2xl ${currentTheme.bgLogo} flex items-center justify-center text-white flex-shrink-0 shadow-sm overflow-hidden`}>
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.business_name} className="w-full h-full object-cover" />
              ) : (
                <IconComponent className="w-4 h-4" />
              )}
            </div>
            <span className="font-extrabold text-sm text-stone-800 truncate tracking-tight">
              {tenant.business_name}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* ── Tenant Profile Hero Card ── */}
        <section 
          className={`${currentTheme.bgHero} rounded-[2rem] p-6 md:p-8 mb-8 text-white shadow-xl overflow-hidden relative flex flex-col justify-end min-h-[380px] group`}
        >
          {/* Background Image Layer */}
          {tenant.hero_image_url && (
            <div 
              className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url(${tenant.hero_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}

          {/* Gradient Overlay for Text Readability */}
          <div 
            className={`absolute inset-0 z-10 ${tenant.hero_image_url ? 'bg-gradient-to-t from-black/90 via-black/40 to-black/10' : ''}`}
            aria-hidden="true" 
          />
          
          {/* Decorative blobs for fallback (No image) */}
          {!tenant.hero_image_url && (
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className={`absolute -bottom-10 -left-10 w-32 h-32 ${currentTheme.blob} rounded-full blur-xl`} />
            </div>
          )}

          {/* Content Layer */}
          <div className="relative z-20 mt-auto pt-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={`${tenant.hero_image_url ? 'text-white/80' : currentTheme.textSub} text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-2 sm:mb-3 drop-shadow-sm`}>
                  bukly.id/{tenant.slug}
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-3 sm:mb-4 drop-shadow-md text-white">
                  {tenant.business_name}
                </h1>
                {tenant.welcome_message && (
                  <p className="text-sm sm:text-base text-white/90 leading-relaxed font-medium max-w-md drop-shadow-sm">
                    {tenant.welcome_message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
              <a
                href={`https://wa.me/${tenant.whatsapp_number.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all duration-300 rounded-full px-4 py-2 border border-white/20 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-bold">{tenant.whatsapp_number}</span>
              </a>
              {tenant.instagram_handle && (
                <a
                  href={`https://instagram.com/${tenant.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all duration-300 rounded-full px-4 py-2 border border-white/20 shadow-sm"
                >
                  <AtSign className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-bold">{tenant.instagram_handle}</span>
                </a>
              )}
              <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-sm">
                <span className="text-xs sm:text-sm font-bold text-white/95">
                  {services.length} {dictionary.serviceLabel}
                </span>
              </span>
            </div>
            
            {tenant.address && (
              <div className="mt-6 flex items-start gap-3 pt-5 border-t border-white/20">
                <MapPin className="w-4 h-4 text-white/70 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
                  {tenant.address}
                </p>
              </div>
            )}
          </div>
        </section>

        {tenant.cancellation_policy && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-orange-900 mb-1">Catatan Penting</h4>
              <p className="text-xs text-orange-800 leading-relaxed">{tenant.cancellation_policy}</p>
            </div>
          </div>
        )}

        {/* ── Portfolio Gallery ── */}
        <PortfolioGallery portfolios={portfolios} />

        {/* ── Booking Flow ── */}
        <BookingFlow tenant={tenant} services={services} staffList={staffList} dictionary={dictionary} />

        {/* ── Footer Watermark ── */}
        <footer className="mt-16 pb-8 text-center border-t border-stone-200 pt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Powered by</p>
          <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
            <Logo className="text-2xl" />
          </a>
          <p className="text-[11px] text-stone-400 mt-4 max-w-xs mx-auto leading-relaxed">
            Halaman reservasi otomatis ini dibuat menggunakan <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-600 hover:underline">bukly.id</a>. Buat milik Anda sekarang, gratis!
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
