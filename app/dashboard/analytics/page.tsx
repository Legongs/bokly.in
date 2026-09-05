import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getAuthTenantId } from "@/lib/auth";
import { getTenantAnalytics } from "@/lib/actions/analytics.actions";
import { AnalyticsView } from "@/components/dashboard/analytics-view";
import { getBusinessDictionary } from "@/lib/business-dictionary";
import { getTenantSubscription } from "@/lib/subscription";
import { UpsellBanner } from "@/components/dashboard/upsell-banner";

export const metadata = {
  title: "Analisis Usaha | bukly.id",
  description: "Pantau performa bisnis dan cari tahu apa yang paling disukai pelangganmu.",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const tenantId = await getAuthTenantId();

  // Cek subscription — analytics hanya untuk Pro & Bisnis
  const subscription = await getTenantSubscription(tenantId);
  if (subscription.plan === "free") {
    return (
      <main className="p-4 sm:p-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-stone-900">Analisis Usaha</h1>
          <p className="text-sm text-stone-500 mt-1">Pantau performa bisnis dan layanan terlaris.</p>
        </div>
        <UpsellBanner
          feature="Analisis Usaha"
          requiredPlan="pro"
          description="Lihat tren pendapatan 30 hari, layanan paling laris, dan status reservasi — semua dalam satu dashboard."
        />
      </main>
    );
  }

  // Ambil data analitik dan profil tenant
  const analyticsRes = await getTenantAnalytics(tenantId);
  const { data: tenant } = await supabase.from("tenants").select("business_type").eq("id", tenantId).single();
  const dict = getBusinessDictionary(tenant?.business_type);

  if (!analyticsRes.success || !analyticsRes.data) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-stone-900 mb-2">Yah, Gagal Muat Data 🥲</h2>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            {analyticsRes.error || "Ada sedikit masalah waktu narik data kamu. Coba refresh halamannya ya."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 pb-24">
      <AnalyticsView analytics={analyticsRes.data} dictionary={dict} />
    </main>
  );
}
