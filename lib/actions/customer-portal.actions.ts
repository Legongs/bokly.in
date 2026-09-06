"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { Booking, Tenant, Service, Staff } from "@/types/database.types";
import type { ActionResponse } from "./tenant.actions";

export interface CustomerPortalData {
  booking: Booking & {
    services: Service | null;
    staff: Staff | null;
    testimonials: any[];
  };
  tenant: Tenant;
  history: Array<Booking & {
    services: Service | null;
    staff: Staff | null;
  }>;
}

/**
 * Mengambil data lengkap untuk halaman Customer Portal (/booking/manage/[token])
 * tanpa memerlukan autentikasi login (karena mengandalkan token URL/booking ID yang sulit ditebak).
 */
export async function getCustomerPortalData(
  token: string
): Promise<ActionResponse<CustomerPortalData>> {
  try {
    const supabase = createAdminClient(); // Gunakan admin client untuk bypass RLS, krn keamanan berbasis unguessable UUID

    // 1. Ambil data booking utama beserta relasinya
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*, services(*), staff(*), testimonials(id)")
      .eq("manage_token", token)
      .single();

    if (bookingError || !booking) {
      return { success: false, error: "Data reservasi tidak ditemukan atau URL tidak valid." };
    }

    // Periksa apakah token sudah kedaluwarsa
    if (booking.manage_token_expires_at && new Date(booking.manage_token_expires_at) < new Date()) {
      return { success: false, error: "Tautan portal ini sudah kedaluwarsa. Silakan hubungi admin jika butuh bantuan." };
    }

    // 2. Ambil data tenant untuk tema dan info bisnis
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", booking.tenant_id)
      .single();

    if (tenantError || !tenant) {
      return { success: false, error: "Data toko tidak ditemukan." };
    }

    // 3. Ambil riwayat booking pelanggan (jika ada customer_id)
    let history: CustomerPortalData["history"] = [];
    if (booking.customer_id) {
      const { data: historyData } = await supabase
        .from("bookings")
        .select("*, services(*), staff(*)")
        .eq("tenant_id", booking.tenant_id)
        .eq("customer_id", booking.customer_id)
        .neq("id", booking.id) // Jangan tampilkan booking yang sedang dilihat di daftar riwayat
        .order("booking_date", { ascending: false })
        .order("start_time", { ascending: false })
        .limit(10); // Batasi 10 riwayat terakhir agar ringan

      if (historyData) {
        history = historyData as any;
      }
    }

    return {
      success: true,
      data: {
        booking: booking as any,
        tenant,
        history,
      },
    };
  } catch (error) {
    console.error("Error getCustomerPortalData:", error);
    return { success: false, error: "Terjadi kesalahan server saat memuat data." };
  }
}
