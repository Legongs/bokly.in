import React from "react";
import type { Metadata } from "next";
import { Store } from "lucide-react";
import { getTenantBySlug, getServicesByTenant } from "@/lib/actions/tenant.actions";
import { getStaffByTenant } from "@/lib/actions/staff.actions";
import { getPortfoliosByTenant } from "@/lib/actions/portfolio.actions";
import { getSectorDictionary } from "@/lib/dictionaries";
import { inferTemplateFromType } from "@/lib/template-matcher";

import { DefaultTemplate } from "@/components/customer/templates/default-template";
import { BeautyTemplate } from "@/components/customer/templates/beauty-template";
import { BarberTemplate } from "@/components/customer/templates/barber-template";
import { AutoTemplate } from "@/components/customer/templates/auto-template";
import { HealthTemplate } from "@/components/customer/templates/health-template";
import { SpaceTemplate } from "@/components/customer/templates/space-template";

interface TenantPageProps {
  params: Promise<{ tenant: string }>;
}

import { getDemoTenant } from "@/lib/demo-data";

// ── Dynamic Metadata (SEO per-tenant) ─────────────────────────────────────────
export async function generateMetadata({ params }: TenantPageProps): Promise<Metadata> {
  const { tenant: slug } = await params;
  
  // Handle demo static routes
  const demoData = getDemoTenant(slug);
  let business_name = "";

  if (demoData) {
    business_name = demoData.tenant.business_name;
  } else {
    const res = await getTenantBySlug(slug);
    if (!res.success || !res.data) {
      return {
        title: "Outlet Tidak Ditemukan | bukly.id",
        description: "Halaman reservasi tidak ditemukan.",
      };
    }
    business_name = res.data.business_name;
  }

  return {
    title: `Booking Online ${business_name}`,
    description: `Pesan slot reservasi online di ${business_name} dengan mudah, cepat, dan bebas antri melalui bukly.id.`,
    openGraph: {
      title: `Reservasi ${business_name}`,
      description: `Booking online di ${business_name} — cepat, aman, tanpa antri.`,
      siteName: "bukly.id",
    },
  };
}

// ── Page Router ───────────────────────────────────────────────────────────────
export default async function TenantPage({ params }: TenantPageProps) {
  const { tenant: tenantSlug } = await params;
  
  let tenantData: any = null;
  let services: any[] = [];
  let staffList: any[] = [];
  let portfolios: any[] = [];

  const demoData = getDemoTenant(tenantSlug);
  
  if (demoData) {
    tenantData = demoData.tenant;
    services = demoData.services;
    staffList = demoData.staff;
    portfolios = demoData.portfolios;
  } else {
    const res = await getTenantBySlug(tenantSlug);
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
            <p className="text-sm text-stone-500 mt-3 leading-relaxed">
              Pastikan link yang kamu klik sudah benar, atau outlet ini mungkin sudah tutup.
            </p>
          </div>
        </main>
      );
    }
    tenantData = res.data;
    const tenantId = tenantData.id;

    // Ambil data pendukung secara paralel
    const [svcsRes, staffRes, portRes] = await Promise.all([
      getServicesByTenant(tenantId),
      getStaffByTenant(tenantId),
      getPortfoliosByTenant(tenantId),
    ]);
    
    services = svcsRes.data || [];
    staffList = staffRes.data || [];
    portfolios = portRes.data || [];
  }

  const dictionary = getSectorDictionary(tenantData.business_type);
  const templateType = inferTemplateFromType(tenantData.business_type);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": tenantData.business_name,
    "image": tenantData.hero_image_url || tenantData.logo_url || "https://bukly.id/icon.png",
    "url": `https://bukly.id/${tenantSlug}`,
    "telephone": tenantData.whatsapp_number ? `+${tenantData.whatsapp_number}` : undefined,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": tenantData.address || "Indonesia",
      "addressCountry": "ID"
    },
    "description": tenantData.welcome_message || `Booking online resmi untuk ${tenantData.business_name}`
  };

  // Render template berdasarkan jenis bisnis
  let TemplateComponent;
  switch (templateType) {
    case "beauty": TemplateComponent = BeautyTemplate; break;
    case "barber": TemplateComponent = BarberTemplate; break;
    case "auto": TemplateComponent = AutoTemplate; break;
    case "health": TemplateComponent = HealthTemplate; break;
    case "space": TemplateComponent = SpaceTemplate; break;
    default: TemplateComponent = DefaultTemplate; break;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TemplateComponent 
        tenant={tenantData} 
        services={services} 
        staffList={staffList} 
        portfolios={portfolios} 
        dictionary={dictionary} 
      />
    </>
  );
}
