import React from "react";
import { Store, Building, MessageCircle, MapPin, AtSign, Info } from "lucide-react";
import { StoreBadge } from "../store-badge";
import { BookingFlow } from "@/components/customer/booking-flow";
import { PortfolioGallery } from "@/components/customer/portfolio-gallery";
import { Logo } from "@/components/ui/logo";
import type { StorefrontTemplateProps } from "./types";

export function SpaceTemplate({ tenant, services, staffList, portfolios, dictionary }: StorefrontTemplateProps) {
  const themeColor = (tenant as any).theme_color || "blue";
  
  // Revised earthy, bright, airy palette instead of dark mode
  const colors = {
    blue: { bg: "bg-blue-50", card: "bg-white", border: "border-blue-100", text: "text-blue-900", highlight: "bg-blue-100", gradientTo: "to-blue-50" },
    teal: { bg: "bg-teal-50", card: "bg-white", border: "border-teal-100", text: "text-teal-900", highlight: "bg-teal-100", gradientTo: "to-teal-50" },
    rose: { bg: "bg-rose-50", card: "bg-white", border: "border-rose-100", text: "text-rose-900", highlight: "bg-rose-100", gradientTo: "to-rose-50" },
    violet: { bg: "bg-violet-50", card: "bg-white", border: "border-violet-100", text: "text-violet-900", highlight: "bg-violet-100", gradientTo: "to-violet-50" },
    orange: { bg: "bg-orange-50", card: "bg-white", border: "border-orange-100", text: "text-orange-900", highlight: "bg-orange-100", gradientTo: "to-orange-50" },
  }[themeColor as keyof typeof colors] || colors.blue;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": tenant.business_name,
    "telephone": tenant.whatsapp_number,
    "url": `https://bukly.id/${tenant.slug}`,
  };

  return (
    <main className={`min-h-screen ${colors.bg} text-stone-800 font-sans relative pb-40 md:pb-20`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* ── Airy Light Background ── */}
      <div className="absolute top-0 left-0 right-0 h-96 z-0 overflow-hidden">
        {tenant.hero_image_url ? (
          <>
            <img src={tenant.hero_image_url} alt="Space" className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${colors.gradientTo}`} />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-stone-200/50 to-transparent" />
        )}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-12 pb-24">
        <header className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-12 md:mb-16 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`w-24 h-24 rounded-3xl ${colors.card} border ${colors.border} flex items-center justify-center shadow-lg`}>
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.business_name} className="w-full h-full object-cover rounded-3xl" />
              ) : (
                <Building className="w-10 h-10 text-stone-400" />
              )}
            </div>
            <div>
              <p className={`text-sm font-bold tracking-widest uppercase text-stone-500 mb-2`}>bukly.id/{tenant.slug}</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-stone-800 mb-4">
                {tenant.business_name}
              </h1>
              {tenant.welcome_message && (
                <p className="text-stone-600 max-w-lg text-lg font-medium leading-relaxed">
                  {tenant.welcome_message}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col gap-3">
            <a href={`https://wa.me/${tenant.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" 
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

            <div className={`${colors.card} border ${colors.border} rounded-3xl p-6 hidden lg:block shadow-sm`}>

               <PortfolioGallery portfolios={portfolios} />
            </div>
          </div>

          {/* Main Booking Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] p-5 md:p-10 text-stone-900 shadow-lg border border-stone-100 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-2 ${colors.highlight}`} />
              <h2 className="text-2xl font-bold mb-8 text-stone-800">Cek Ketersediaan & Sewa</h2>
              <BookingFlow tenant={tenant} services={services} staffList={staffList} dictionary={dictionary} />
            </div>
            
            <div className="mt-8 block lg:hidden">

               <PortfolioGallery portfolios={portfolios} />
            </div>
          </div>
        </div>

        <footer className="mt-24 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Sistem Reservasi Otomatis Oleh</p>
          <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-all duration-200 bg-white px-5 py-2.5 rounded-xl shadow-sm border border-stone-200">
            <Logo className="text-xl block" />
          </a>
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
