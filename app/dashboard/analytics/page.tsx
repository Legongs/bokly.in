import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTenantAnalytics } from "@/lib/actions/analytics.actions";
import { AnalyticsView } from "@/components/dashboard/analytics-view";
import { getBusinessDictionary } from "@/lib/business-dictionary";

export const metadata = {
  title: "Analisis Usaha | maubooking.in",
  description: "Pantau performa bisnis dan cari tahu apa yang paling disukai pelangganmu.",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // 1. Ambil sesi user aktif
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // 2. Ambil data analitik dan profil tenant
  const analyticsRes = await getTenantAnalytics(user.id);
  const { data: tenant } = await supabase.from("tenants").select("business_type").eq("id", user.id).single();
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
