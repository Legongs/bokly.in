"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "./tenant.actions";

export type FacilityType =
  | "wifi"
  | "ac"
  | "parking"
  | "toilet"
  | "kitchen"
  | "reception"
  | "soundproof"
  | "wheelchair_accessible"
  | "cctv"
  | "generator"
  | "water_dispenser";

export interface TenantFacility {
  id: string;
  tenant_id: string;
  facility_type: FacilityType;
  is_available: boolean;
}

/** Ambil semua fasilitas milik tenant yang sedang login. */
export async function getFacilities(): Promise<ActionResponse<TenantFacility[]>> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return { success: false, error: "Belum login." };

    const { data, error } = await supabase
      .from("tenant_facilities")
      .select("*")
      .eq("tenant_id", authData.user.id)
      .eq("is_available", true);

    if (error) return { success: false, error: "Gagal memuat data fasilitas." };
    return { success: true, data: (data ?? []) as TenantFacility[] };
  } catch {
    return { success: false, error: "Server error." };
  }
}

/**
 * Replace semua fasilitas tenant dengan array baru.
 * Strategi: DELETE semua lama → INSERT baru yang dipilih.
 * RLS Supabase memastikan tenant hanya bisa akses baris miliknya.
 */
export async function updateFacilities(
  facilityTypes: FacilityType[]
): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return { success: false, error: "Belum login." };

    const tenantId = authData.user.id;

    // Hapus semua fasilitas lama milik tenant ini
    const { error: deleteError } = await supabase
      .from("tenant_facilities")
      .delete()
      .eq("tenant_id", tenantId);

    if (deleteError) return { success: false, error: "Gagal menghapus fasilitas lama." };

    // Insert fasilitas baru jika ada yang dipilih
    if (facilityTypes.length > 0) {
      const rows = facilityTypes.map((type) => ({
        tenant_id: tenantId,
        facility_type: type,
        is_available: true,
      }));

      const { error: insertError } = await supabase
        .from("tenant_facilities")
        .insert(rows);

      if (insertError) return { success: false, error: "Gagal menyimpan fasilitas baru." };
    }

    revalidatePath("/dashboard/settings");

    // Ambil slug untuk invalidasi storefront
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("slug")
      .eq("id", tenantId)
      .single();
    if (tenantData?.slug) revalidatePath(`/${tenantData.slug}`, "page");

    return { success: true, data: null };
  } catch {
    return { success: false, error: "Server error saat menyimpan fasilitas." };
  }
}
