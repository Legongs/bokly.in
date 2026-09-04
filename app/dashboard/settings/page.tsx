import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsTabs } from "@/components/dashboard/settings-tabs";
import type { Tenant } from "@/types/database.types";

export const metadata = {
  title: "Pengaturan Toko | Dashboard maubooking.in",
  description: "Kelola profil toko, WhatsApp, dan notifikasi Telegram Anda.",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const DEMO_TENANT_ID = "d290f1ee-6c54-4b01-90e6-d701748f0851";
  const { data: authData } = await supabase.auth.getUser();
  const tenantId = authData.user?.id || DEMO_TENANT_ID;

  // Ambil data tenant
  const { data: tenantData, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .single();

  if (tenantError || !tenantData) {
    // Jika tidak ditemukan, ada yang salah dengan konsistensi data
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-stone-500">Gagal memuat profil toko. Hubungi admin.</p>
      </div>
    );
  }

  const tenant = tenantData as Tenant;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-stone-900 ">
          Pengaturan
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Atur profil tokomu biar makin keren.
        </p>
      </div>

      <SettingsTabs tenant={tenant} />
    </div>
  );
}
