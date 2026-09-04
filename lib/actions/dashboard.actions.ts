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
  status: z.enum(["approved", "rejected", "completed"]),
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

    const DEMO_TENANT_ID = "d290f1ee-6c54-4b01-90e6-d701748f0851";
    // Verifikasi keamanan ganda (Mencegah Data Bleeding / Bypassing RLS)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (parsed.data !== DEMO_TENANT_ID && (authError || !user || user.id !== parsed.data)) {
      return { success: false, error: "Akses ditolak: Anda tidak memiliki akses ke tenant ini." };
    }

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
        ),
        staff (
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
      staff_name: b.staff?.name ?? null,
    }));

    return { success: true, data: bookings as any };
  } catch {
    return { success: false, error: "Terjadi kesalahan internal pada server" };
  }
}

// ── updateBookingStatus ───────────────────────────────────────────────────────
export async function updateBookingStatus(
  bookingId: string,
  status: "approved" | "rejected" | "completed"
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

    // Verifikasi keamanan ganda (Mencegah Data Bleeding / Bypassing RLS)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Akses ditolak: Anda tidak memiliki akses untuk tindakan ini." };
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({ payment_status: parsed.data.status })
      .eq("id", parsed.data.booking_id)
      .eq("tenant_id", user.id) // WAJIB: Validasi bahwa booking milik user (asumsi user.id == tenant_id)
      .select()
      .single();

    if (error) {
      return { success: false, error: "Gagal memperbarui status booking (Data tidak ditemukan atau akses ditolak)" };
    }

    // Wajib invalidasi cache agar dashboard & halaman publik tersinkronisasi
    revalidatePath("/dashboard");
    revalidatePath("/[tenant]", "page");

    return { success: true, data: data as Booking };
  } catch {
    return { success: false, error: "Terjadi kesalahan internal pada server" };
  }
}

// ── markReminderSent ──────────────────────────────────────────────────────────
export async function markReminderSent(
  bookingId: string
): Promise<ActionResponse<Booking>> {
  const parsed = z.string().uuid().safeParse(bookingId);
  
  if (!parsed.success) {
    return { success: false, error: "ID Booking tidak valid" };
  }

  try {
    const supabase = await createClient();

    // Verifikasi keamanan ganda (Mencegah Data Bleeding / Bypassing RLS)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Akses ditolak" };
    }

    const { data, error } = await supabase
      .from("bookings")
      .update({ is_reminder_sent: true })
      .eq("id", parsed.data)
      .eq("tenant_id", user.id) // WAJIB: Validasi bahwa booking milik user
      .select()
      .single();

    if (error) {
      return { success: false, error: "Gagal mencatat status pengingat" };
    }

    revalidatePath("/dashboard");
    return { success: true, data: data as Booking };
  } catch {
    return { success: false, error: "Terjadi kesalahan internal pada server" };
  }
}


// ── getDashboardOverview ──────────────────────────────────────────────────────────
export async function getDashboardOverview(): Promise<ActionResponse<any>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // For demo purposes or real login
    const DEMO_TENANT_ID = "d290f1ee-6c54-4b01-90e6-d701748f0851";
    const tenantId = user?.id || DEMO_TENANT_ID;

    if (!tenantId) {
      return { success: false, error: "Akses ditolak" };
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, business_name, slug, hero_image_url")
      .eq("id", tenantId)
      .single();

    if (!tenant) {
      return { success: false, error: "Profil Tenant Tidak Ditemukan" };
    }

    const today = new Date().toLocaleString("en-CA", {
      timeZone: "Asia/Jakarta",
    }).split(",")[0];

    const [servicesRes, staffRes, bookingsRes] = await Promise.all([
      supabase.from("services").select("id, name, duration_minutes").eq("tenant_id", tenant.id).order("name"),
      supabase.from("staff").select("id, name").eq("tenant_id", tenant.id).order("name"),
      supabase.from("bookings").select(`
        *,
        services ( name ),
        staff ( name )
      `)
      .eq("tenant_id", tenant.id)
      .or(`payment_status.eq.pending,booking_date.gte.${today}`)
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true })
    ]);

    const bookings = (bookingsRes.data ?? []).map((b: any) => ({
      ...b,
      service_name: b.services?.name ?? "Layanan",
      staff_name: b.staff?.name ?? null,
    }));

    return { 
      success: true, 
      data: {
        tenant,
        services: servicesRes.data || [],
        staff: staffRes.data || [],
        bookings
      }
    };
  } catch {
    return { success: false, error: "Terjadi kesalahan internal pada server" };
  }
}

// ── getPaymentBookings ──────────────────────────────────────────────────────────
export async function getPaymentBookings(): Promise<ActionResponse<any>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    const DEMO_TENANT_ID = "d290f1ee-6c54-4b01-90e6-d701748f0851";
    const tenantId = user?.id || DEMO_TENANT_ID;

    if (!tenantId) {
      return { success: false, error: "Akses ditolak" };
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", tenantId)
      .single();

    if (!tenant) {
      return { success: false, error: "Profil Tenant Tidak Ditemukan" };
    }

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        id,
        customer_name,
        customer_wa,
        booking_date,
        payment_status,
        proof_url,
        services (
          name,
          dp_amount
        )
      `)
      .eq("tenant_id", tenant.id)
      .not("proof_url", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
       return { success: false, error: "Gagal memuat data pembayaran" };
    }

    return { success: true, data: bookings || [] };
  } catch {
    return { success: false, error: "Terjadi kesalahan internal pada server" };
  }
}
