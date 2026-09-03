import React from "react";
import type { Metadata } from "next";
import { Store, MessageCircle, Star, MapPin, AtSign, Info } from "lucide-react";
import { getTenantBySlug, getServicesByTenant } from "@/lib/actions/tenant.actions";
import { getStaffByTenant } from "@/lib/actions/staff.actions";
import { BookingFlow } from "@/components/customer/booking-flow";
import { getSectorDictionary } from "@/lib/dictionaries";

interface TenantPageProps {
 params: Promise<{ tenant: string }>;
}

// ── Dynamic Metadata (SEO per-tenant) ─────────────────────────────────────────
export async function generateMetadata(
 { params }: TenantPageProps
): Promise<Metadata> {
 const { tenant: slug } = await params;
 const res = await getTenantBySlug(slug);

 if (!res.success || !res.data) {
 return {
 title: "Outlet Tidak Ditemukan | maubooking.in",
 description: "Halaman reservasi tidak ditemukan.",
 };
 }

 const { business_name } = res.data;
 return {
 title: `Reservasi ${business_name} | maubooking.in`,
 description: `Pesan slot reservasi online di ${business_name} dengan mudah, cepat, dan bebas antri melalui maubooking.in.`,
 openGraph: {
 title: `Reservasi ${business_name}`,
 description: `Booking online di ${business_name} — cepat, aman, tanpa antri.`,
 siteName: "maubooking.in",
 },
 };
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function TenantPage({ params }: TenantPageProps) {
 const { tenant: tenantSlug } = await params;
 const res = await getTenantBySlug(tenantSlug);

 // ── Not found / inactive ────────────────────────────────────────────────────
 if (!res.success || !res.data) {
 return (
  <main className="min-h-screen flex items-center justify-center p-4 bg-stone-50 ">
  <div className="max-w-sm w-full bg-white border-none rounded-[2rem] p-8 text-center shadow-md shadow-stone-200/50">
  <div className="w-16 h-16 bg-stone-50 border border-stone-100 rounded-3xl flex items-center justify-center mx-auto mb-5 text-stone-300 rotate-3">
  <Store className="w-8 h-8" />
  </div>
  <h1 className="text-xl font-bold text-stone-800 ">
  Yah, Outlet Nggak Ketemu
  </h1>
  <p className="text-sm text-stone-500 mt-2">
  Outlet{" "}
  <span className="font-semibold text-stone-700 ">
  @{tenantSlug}
  </span>{" "}
  kayaknya lagi tutup atau URL-nya salah ketik nih.
  </p>
  </div>
 </main>
 );
 }

 const tenant = res.data;

 // Fetch daftar layanan terpisah sesuai arsitektur modular tenant.actions.ts
 const servicesRes = await getServicesByTenant(tenant.id);
 const services = servicesRes.data ?? [];

 const staffRes = await getStaffByTenant(tenant.id);
 const staff = staffRes.success && staffRes.data ? staffRes.data : [];

 const dict = getSectorDictionary(tenant.business_sector);

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

 const themeColor = (tenant as any).theme_color || dict.themeColor || "teal";
 const currentTheme = themeStyles[themeColor] || themeStyles["teal"];

 // ── Main page ───────────────────────────────────────────────────────────────

 // Buat JSON-LD untuk SEO
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "LocalBusiness",
 "name": tenant.business_name,
 "telephone": tenant.whatsapp_number,
 "url": `https://maubooking.in/${tenant.slug}`,
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
 <main className="min-h-screen bg-stone-50 pb-20">
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
 />
 
  {/* ── Sticky Tenant Header ── */}
  <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-stone-100 shadow-sm shadow-stone-100/50">
  <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between gap-3">
  <div className="flex items-center gap-3 min-w-0">
  <div className={`w-9 h-9 rounded-2xl ${currentTheme.bgLogo} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
  <Store className="w-4 h-4" />
  </div>
  <span className="font-extrabold text-sm text-stone-800 truncate tracking-tight">
  {tenant.business_name}
  </span>
  </div>
  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-100 shadow-sm flex-shrink-0">
  <span className={`w-2 h-2 rounded-full ${currentTheme.dot} animate-pulse`} />
  <span className="text-[11px] font-bold text-stone-600 ">
  Buka
  </span>
  </div>
  </div>
  </header>

  <div className="max-w-lg mx-auto px-4 pt-6">
  {/* ── Tenant Profile Hero Card ── */}
  <section 
    className={`${currentTheme.bgHero} rounded-[2rem] p-6 mb-6 text-white shadow-lg overflow-hidden relative bg-cover bg-center`}
    style={tenant.hero_image_url ? { backgroundImage: `linear-gradient(to bottom right, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${tenant.hero_image_url})` } : undefined}
  >
  {/* Decorative blobs (Asimetri) - Sembunyikan jika pakai hero image agar tidak bentrok */}
  {!tenant.hero_image_url && (
    <>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" aria-hidden="true" />
      <div className={`absolute -bottom-10 -left-10 w-32 h-32 ${currentTheme.blob} rounded-full blur-xl`} aria-hidden="true" />
    </>
  )}

 <div className="relative">
 <div className="flex items-start justify-between gap-2">
 <div>
 <p className={`${tenant.hero_image_url ? 'text-white/80' : currentTheme.textSub} text-xs font-medium uppercase tracking-widest mb-1`}>
 maubooking.in/{tenantSlug}
 </p>
 <h1 className="text-2xl font-extrabold tracking-tight leading-tight">
 {tenant.business_name}
 </h1>
 {tenant.welcome_message && (
   <p className="mt-2 text-sm text-white/90 leading-relaxed font-medium max-w-sm">
     {tenant.welcome_message}
   </p>
 )}
 </div>
 <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
 <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
 </div>
 </div>

 <div className="mt-5 flex flex-wrap items-center gap-2.5 text-sm">
 <a
 href={`https://wa.me/${tenant.whatsapp_number.replace(/\D/g, "")}`}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors rounded-full px-3 py-1.5"
 >
 <MessageCircle className="w-3.5 h-3.5" />
 <span className="text-xs font-semibold">{tenant.whatsapp_number}</span>
 </a>
 {tenant.instagram_handle && (
   <a
   href={`https://instagram.com/${tenant.instagram_handle.replace('@', '')}`}
   target="_blank"
   rel="noopener noreferrer"
   className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors rounded-full px-3 py-1.5"
   >
   <AtSign className="w-3.5 h-3.5" />
   <span className="text-xs font-semibold">{tenant.instagram_handle}</span>
   </a>
 )}
  <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
  <span className="text-xs font-semibold">
  Ada {services.length} {dict.serviceLabel}
  </span>
  </span>
 </div>
 
 {tenant.address && (
   <div className="mt-4 flex items-start gap-2 pt-4 border-t border-white/10">
     <MapPin className="w-4 h-4 text-white/70 flex-shrink-0 mt-0.5" />
     <p className="text-xs text-white/90 leading-relaxed font-medium">
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

 {/* ── Booking Flow ── */}
 <BookingFlow tenant={tenant} services={services} staffList={staff} dictionary={dict} />
 </div>
 </main>
 );
}
