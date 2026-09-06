import React from "react";
import { Stethoscope, MessageCircle, MapPin, Info, ShieldCheck } from "lucide-react";
import { StoreBadge } from "../store-badge";
import { BookingFlow } from "@/components/customer/booking-flow";
import { PortfolioGallery } from "@/components/customer/portfolio-gallery";
import { Logo } from "@/components/ui/logo";
import { SafeImage } from "@/components/ui/safe-image";
import { StorefrontJsonLd } from "./shared/storefront-jsonld";
import { getWhatsAppUrl } from "./shared/whatsapp-link";
import { StorefrontFooter } from "./shared/storefront-footer";
import type { StorefrontTemplateProps } from "./types";

export function HealthTemplate({ tenant, services, staffList, portfolios, dictionary }: StorefrontTemplateProps) {
  const themeColor = tenant.theme_color || "teal";
  
  const themeOptions = {
    teal: { text: "text-teal-700", bg: "bg-teal-50", border: "border-teal-100", highlight: "bg-teal-600" },
    blue: { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100", highlight: "bg-blue-600" },
    rose: { text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-100", highlight: "bg-rose-600" },
    orange: { text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100", highlight: "bg-orange-600" },
    violet: { text: "text-violet-700", bg: "bg-violet-50", border: "border-violet-100", highlight: "bg-violet-600" },
  };
  const colors = themeOptions[themeColor as keyof typeof themeOptions] || themeOptions.teal;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-56 md:pb-24 font-sans">
      <StorefrontJsonLd tenant={tenant} schemaType="MedicalClinic" />
      
      {/* ── Premium Medical Header ── */}
      <header className="bg-teal-950 text-teal-50 border-b-4 border-teal-900 relative shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900 via-teal-950 to-black opacity-60 mix-blend-overlay" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
            <div className={`w-20 h-20 rounded-2xl ${colors.bg} ${colors.text} flex flex-shrink-0 items-center justify-center shadow-lg border-2 border-teal-700`}>
              <SafeImage 
                src={tenant.logo_url || undefined} 
                alt={tenant.business_name} 
                className="w-full h-full object-cover rounded-2xl"
                fallback={<Stethoscope className="w-10 h-10" />}
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-teal-50 tracking-tight leading-tight drop-shadow-sm">
                {tenant.business_name}
              </h1>
              <p className="text-sm text-teal-200 font-medium mt-1">Layanan Medis & Profesional</p>
              {tenant.is_verified && (
                <div className="flex items-center justify-center md:justify-start gap-2 mt-3 bg-teal-900/50 py-1.5 px-3 rounded-full border border-teal-800/50 w-fit mx-auto md:mx-0">
                  <ShieldCheck className={`w-4 h-4 text-emerald-400`} />
                  <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Terdaftar di bukly.id</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2 space-y-6">
            <div className="w-full h-48 rounded-2xl overflow-hidden shadow-sm border border-slate-200 relative">
              {tenant.hero_image_url ? (
                <SafeImage src={tenant.hero_image_url} alt="Klinik" className="w-full h-full object-cover" />
              ) : (
                <div className={`absolute inset-0 ${colors.bg} flex items-center justify-center overflow-hidden`}>
                  <div className={`absolute -top-10 -right-10 w-40 h-40 ${colors.highlight} rounded-full blur-3xl opacity-10`} />
                  <div className={`absolute -bottom-10 -left-10 w-32 h-32 ${colors.highlight} rounded-full blur-2xl opacity-10`} />
                  <Stethoscope className={`w-12 h-12 ${colors.text} opacity-20`} />
                </div>
              )}
            </div>
            
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
                <a href={getWhatsAppUrl(tenant.whatsapp_number)} target="_blank" rel="noopener noreferrer" 
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
                <StoreBadge schedule={(tenant as any).weekly_schedule} timezone={tenant.timezone} variant="health" />
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

        <StorefrontFooter variant="default" />
      </div>
    </main>
  );
}
