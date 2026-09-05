import React from "react";
import { Stethoscope, MessageCircle, MapPin, Info, ShieldCheck } from "lucide-react";
import { StoreBadge } from "../store-badge";
import { BookingFlow } from "@/components/customer/booking-flow";
import { PortfolioGallery } from "@/components/customer/portfolio-gallery";
import { Logo } from "@/components/ui/logo";
import type { StorefrontTemplateProps } from "./types";

export function HealthTemplate({ tenant, services, staffList, portfolios, dictionary }: StorefrontTemplateProps) {
  const themeColor = (tenant as any).theme_color || "teal";
  
  const colors = {
    teal: { text: "text-teal-700", bg: "bg-teal-50", border: "border-teal-100", highlight: "bg-teal-600" },
    blue: { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100", highlight: "bg-blue-600" },
    rose: { text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-100", highlight: "bg-rose-600" },
    orange: { text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100", highlight: "bg-orange-600" },
    violet: { text: "text-violet-700", bg: "bg-violet-50", border: "border-violet-100", highlight: "bg-violet-600" },
  }[themeColor as keyof typeof colors] || colors.teal;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": tenant.business_name,
    "telephone": tenant.whatsapp_number,
    "url": `https://bukly.id/${tenant.slug}`,
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-40 md:pb-20 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* ── Clean Medical Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center`}>
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.business_name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Stethoscope className="w-6 h-6" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                {tenant.business_name}
              </h1>
              <p className="text-xs text-slate-500 font-medium">Layanan Medis & Profesional</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${colors.text}`} />
            <span className="text-sm font-semibold text-slate-600">Terverifikasi</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 space-y-6">
            {tenant.hero_image_url && (
              <div className="w-full h-48 rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <img src={tenant.hero_image_url} alt="Klinik" className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-3">Tentang Kami</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                {tenant.welcome_message || "Selamat datang di klinik kami. Kami siap melayani Anda dengan profesional dan sepenuh hati."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Informasi Kontak</h3>
              
              <div className="space-y-4">
                <a href={`https://wa.me/${tenant.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" 
                   className="flex items-start gap-3 group">
                  <div className={`p-2 rounded-lg ${colors.bg} ${colors.text} group-hover:scale-105 transition-transform`}>
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">WhatsApp</p>
                    <p className="text-sm font-semibold text-slate-700">{tenant.whatsapp_number}</p>
                  </div>
                </a>

                {tenant.address && (
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Alamat</p>
                      <p className="text-sm font-medium text-slate-700 leading-snug">{tenant.address}</p>
                    </div>
                  </div>
                )}
                <StoreBadge schedule={(tenant as any).weekly_schedule} timezone={tenant.timezone} />
              </div>
            </div>

            {tenant.cancellation_policy && (
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Perhatian</h4>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">{tenant.cancellation_policy}</p>
              </div>
            )}
          </div>
        </div>

        {portfolios.length > 0 && (
          <div className="mb-10">

            <PortfolioGallery portfolios={portfolios} />
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className={`${colors.bg} p-6 border-b ${colors.border}`}>
            <h2 className={`text-xl font-bold ${colors.text}`}>Registrasi Antrian / Buat Janji</h2>
            <p className="text-sm text-slate-600 mt-1">Silakan lengkapi form di bawah ini untuk mendapatkan jadwal.</p>
          </div>
          <div className="p-2 sm:p-6">
            <BookingFlow tenant={tenant} services={services} staffList={staffList} dictionary={dictionary} />
          </div>
        </div>

        <footer className="mt-12 text-center pt-8 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-400 mb-2">Sistem Informasi Registrasi disediakan oleh</p>
          <a href="https://bukly.id" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition-opacity">
            <Logo className="text-xl" />
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
