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

// ── Dynamic Metadata (SEO per-tenant) ─────────────────────────────────────────
export async function generateMetadata({ params }: TenantPageProps): Promise<Metadata> {
  const { tenant: slug } = await params;
  const res = await getTenantBySlug(slug);

  if (!res.success || !res.data) {
    return {
      title: "Outlet Tidak Ditemukan | bukly.in",
      description: "Halaman reservasi tidak ditemukan.",
    };
  }

  const { business_name } = res.data;
  return {
    title: `Reservasi ${business_name} | bukly.in`,
    description: `Pesan slot reservasi online di ${business_name} dengan mudah, cepat, dan bebas antri melalui bukly.in.`,
    openGraph: {
      title: `Reservasi ${business_name}`,
      description: `Booking online di ${business_name} — cepat, aman, tanpa antri.`,
      siteName: "bukly.in",
    },
  };
}

// ── Page Router ───────────────────────────────────────────────────────────────
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
            Outlet <span className="font-semibold text-stone-700 ">@{tenantSlug}</span> kayaknya lagi tutup atau URL-nya salah ketik nih.
          </p>
        </div>
      </main>
    );
  }

  const tenant = res.data;

  // Intelligent Template Matcher:
  // If business_sector is missing, try to infer it from user's custom typed business_type
  let activeSector = tenant.business_sector as string | null;
  if (!activeSector && tenant.business_type) {
    activeSector = inferTemplateFromType(tenant.business_type);
  }

  // Fetch daftar layanan terpisah sesuai arsitektur modular tenant.actions.ts
  const servicesRes = await getServicesByTenant(tenant.id);
  const services = servicesRes.data ?? [];

  const staffRes = await getStaffByTenant(tenant.id);
  const staff = staffRes.success && staffRes.data ? staffRes.data : [];

  const portfolioRes = await getPortfoliosByTenant(tenant.id);
  const portfolios = portfolioRes.success && portfolioRes.data ? portfolioRes.data : [];

  const dict = getSectorDictionary(activeSector);

  const templateProps = {
    tenant,
    services,
    staffList: staff,
    portfolios,
    dictionary: dict,
  };

  // Route to specific template based on active sector
  switch (activeSector) {
    case "beauty":
      return <BeautyTemplate {...templateProps} />;
    case "barber":
      return <BarberTemplate {...templateProps} />;
    case "auto":
      return <AutoTemplate {...templateProps} />;
    case "health":
      return <HealthTemplate {...templateProps} />;
    case "space":
      return <SpaceTemplate {...templateProps} />;
    default:
      return <DefaultTemplate {...templateProps} />;
  }
}
