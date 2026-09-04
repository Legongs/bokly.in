"use server";

import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/types/database.types";
import type { ActionResponse } from "./tenant.actions";

export interface CustomerWithBookings extends Customer {
  bookings: {
    id: string;
    booking_date: string;
    start_time: string;
    payment_status: string;
    services: {
      name: string;
      price: number;
    } | null;
  }[];
}

export async function getTenantCustomers(): Promise<ActionResponse<CustomerWithBookings[]>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Akses ditolak. Silakan login." };
    }

    const { data, error } = await supabase
      .from("customers")
      .select(`
        *,
        bookings (
          id,
          booking_date,
          start_time,
          payment_status,
          services (
            name,
            price
          )
        )
      `)
      .eq("tenant_id", user.id)
      .order("updated_at", { ascending: false })
      .order("created_at", { foreignTable: "bookings", ascending: false })
      .limit(3, { foreignTable: "bookings" });

    if (error) {
      console.error("Gagal mengambil data pelanggan:", error);
      return { success: false, error: "Gagal mengambil data pelanggan." };
    }

    return { success: true, data: data as CustomerWithBookings[] };
  } catch (e) {
    console.error("Kesalahan server saat getTenantCustomers:", e);
    return { success: false, error: "Terjadi kesalahan server." };
  }
}
