"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Booking, PaymentStatus } from "@/types/database.types";
import type { ActionResponse } from "./tenant.actions";

// ── Schemas ───────────────────────────────────────────────────────────────────
const getTodayBookingsSchema = z.string().uuid("ID Tenant tidak valid");

const updateStatusSchema = z.object({
  booking_id: z.string().uuid("ID Booking tidak valid"),
  status: z.enum(["approved", "rejected"]),
});

// ── getTodayBookings ──────────────────────────────────────────────────────────
export async function getTodayBookings(
  tenantId: string
): Promise<ActionResponse<Booking[]>> {
  const parsed = getTodayBookingsSchema.safeParse(tenantId);
  if (!parsed.success) {
    return { success: false, error: "ID Tenant tidak valid" };
  }

  try {
    const supabase = await createClient();

    // Dapatkan tanggal hari ini dalam format YYYY-MM-DD
    const today = new Date().toLocaleString("en-CA", {
      timeZone: "Asia/Jakarta",
    }).split(",")[0];

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        services (
          name
        )
      `)
      .eq("tenant_id", parsed.data)
      .or(`payment_status.eq.pending,booking_date.gte.${today}`)
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      return { success: false, error: "Gagal memuat data booking hari ini" };
    }

    // Supabase mereturn relasi sebagai object, kita casting agar aman digunakan
    const bookings = (data ?? []).map((b: any) => ({
      ...b,
      // Jika butuh mengakses nama service di komponen, kita letakkan di property baru
      service_name: b.services?.name ?? "Layanan",
    }));

    return { success: true, data: bookings as any };
  } catch {
    return { success: false, error: "Terjadi kesalahan internal pada server" };
  }
}

// ── updateBookingStatus ───────────────────────────────────────────────────────
export async function updateBookingStatus(
  bookingId: string,
  status: "approved" | "rejected"
): Promise<ActionResponse<Booking>> {
  const parsed = updateStatusSchema.safeParse({
    booking_id: bookingId,
    status: status,
  });

  if (!parsed.success) {
    return { success: false, error: "Data status tidak valid" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookings")
      .update({ payment_status: parsed.data.status })
      .eq("id", parsed.data.booking_id)
      .select()
      .single();

    if (error) {
      return { success: false, error: "Gagal memperbarui status booking" };
    }

    // Wajib invalidasi cache agar dashboard & halaman publik tersinkronisasi
    revalidatePath("/dashboard");
    revalidatePath("/[tenant]", "page");

    return { success: true, data: data as Booking };
  } catch {
    return { success: false, error: "Terjadi kesalahan internal pada server" };
  }
}
