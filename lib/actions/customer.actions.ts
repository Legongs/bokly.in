"use server";

import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/types/database.types";
import type { ActionResponse } from "./tenant.actions";

export async function getTenantCustomers(): Promise<ActionResponse<Customer[]>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Akses ditolak. Silakan login." };
    }

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("tenant_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Gagal mengambil data pelanggan:", error);
      return { success: false, error: "Gagal mengambil data pelanggan." };
    }

    return { success: true, data: data as Customer[] };
  } catch (e) {
    console.error("Kesalahan server saat getTenantCustomers:", e);
    return { success: false, error: "Terjadi kesalahan server." };
  }
}
