"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendTelegramNotification } from "@/lib/telegram";
import type { Booking, PaymentStatus } from "@/types/database.types";
import type { ActionResponse } from "./tenant.actions";

// Re-export ActionResponse agar komponen lain bisa import dari satu tempat
export type { ActionResponse };

// ── PostgreSQL error shape (dari @supabase/postgrest-js) ─────────────────────
interface PostgrestError {
  code: string;
  message: string;
  details: string | null;
  hint: string | null;
}

/** Kode PostgreSQL untuk unique constraint violation */
const PG_UNIQUE_VIOLATION = "23505";
/** Nama constraint double-booking yang didefinisikan di DDL */
const UNIQUE_SLOT_CONSTRAINT = "unique_tenant_slot";

// ── Schemas ───────────────────────────────────────────────────────────────────
const getBookedSlotsSchema = z.object({
  tenant_id: z.string().uuid("Wah, ID outlet-nya nggak valid nih."),
  booking_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggalnya kurang pas, pakai YYYY-MM-DD ya."),
  staff_id: z.string().uuid().nullable().optional(),
});

const submitBookingSchema = z.object({
  tenant_id: z.string().uuid("Wah, ID outlet-nya nggak valid nih."),
  service_id: z.string().uuid("Layanan yang dipilih nggak valid nih."),
  staff_id: z.string().uuid().nullable().optional(),
  customer_name: z
    .string()
    .min(2, "Nama kamu kependekan nih, minimal 2 huruf ya.")
    .max(100, "Wah, namanya kepanjangan. Maksimal 100 huruf aja ya.")
    .trim(),
  customer_wa: z
    .string()
    .min(10, "Nomor WA-nya kependekan, minimal 10 angka ya.")
    .max(16, "Nomor WA-nya kepanjangan, maksimal 16 angka ya.")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,11}$/,
      "Format WA-nya kurang pas nih. Boleh cek lagi? (Contoh: 081234567890)"
    ),
  booking_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggalnya kurang pas, pakai YYYY-MM-DD ya."),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Jam mulainya kurang pas nih."),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Jam selesainya kurang pas nih."),
  proof_url: z
    .string()
    .url("URL fotonya nggak valid nih.")
    .nullable()
    .optional(),
});

export type SubmitBookingPayload = z.infer<typeof submitBookingSchema>;

const updatePaymentStatusSchema = z.object({
  booking_id: z.string().uuid("ID Booking tidak valid"),
  payment_status: z.enum(["pending", "approved", "rejected"]),
});

// ── getBookedSlotsForDate ─────────────────────────────────────────────────────
/**
 * Kembalikan array start_time ("HH:mm") dari slot yang berstatus
 * 'pending' atau 'approved' pada tenant + tanggal tertentu.
 * Slot berstatus 'rejected' dianggap bebas dan tidak dikembalikan.
 */
export async function getBookedSlotsForDate(
  tenantId: string,
  date: string,
  staffId?: string | null
): Promise<ActionResponse<{ start_time: string; end_time: string; buffer_minutes: number; staff_id: string | null }[]>> {
  const parsed = getBookedSlotsSchema.safeParse({
    tenant_id: tenantId,
    booking_date: date,
    staff_id: staffId,
  });

  if (!parsed.success) {
    return { success: false, error: "Ups, ada parameter yang kurang pas nih.", data: [] };
  }

  try {
    const supabase = await createClient();

    // 1. Ambil jumlah total staff
    const { count: staffCount } = await supabase
      .from("staff")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", parsed.data.tenant_id);

    const maxCapacity = Math.max(1, staffCount || 1);

    // 2. Ambil semua booking di hari itu beserta buffer layanannya
    const { data: bookingsData, error } = await supabase
      .from("bookings")
      .select("start_time, end_time, staff_id, services(buffer_minutes)")
      .eq("tenant_id", parsed.data.tenant_id)
      .eq("booking_date", parsed.data.booking_date)
      .in("payment_status", ["pending", "approved"]);

    if (error) {
      return { success: false, error: "Duh, gagal muat data jadwal. Coba muat ulang ya.", data: [] };
    }

    const bookings = bookingsData || [];
    const formattedBookings = bookings.map((b: any) => ({
      start_time: b.start_time,
      end_time: b.end_time,
      buffer_minutes: b.services?.buffer_minutes || 0,
      staff_id: b.staff_id,
    }));

    return { success: true, data: formattedBookings };
  } catch {
    return { success: false, error: "Server kita lagi agak ngambek nih. Coba muat ulang ya.", data: [] };
  }
}

import { checkRateLimit } from "@/lib/rate-limit";

// ── submitBooking ─────────────────────────────────────────────────────────────
/**
 * Buat reservasi baru setelah validasi Zod server-side.
 *
 * Penanganan race condition:
 * - PostgreSQL constraint `unique_tenant_slot` (tenant_id, booking_date, start_time)
 *   menjamin atomisitas — jika dua request masuk bersamaan, satu akan menang
 *   dan yang lain mendapat error code 23505.
 * - Error 23505 ditangkap dan dikembalikan sebagai pesan yang ramah pengguna.
 */
export async function submitBooking(
  payload: unknown
): Promise<ActionResponse<Booking>> {
  // Server-side Zod validation — wajib diulang meski client sudah validasi
  const parsed = submitBookingSchema.safeParse(payload);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Ups, ada data yang masih kurang pas nih.";
    return { success: false, error: firstError };
  }

  // --- 0. Rate Limiting ---
  // Batasi 3 booking per nomor WA per tenant dalam 5 menit (300.000 ms)
  const rateLimitKey = `booking_${parsed.data.tenant_id}_${parsed.data.customer_wa}`;
  if (!checkRateLimit(rateLimitKey, 3, 300_000)) {
    return { success: false, error: "Wow, bookingnya kenceng banget! Tunggu beberapa menit lagi ya sebelum bikin booking baru." };
  }
  // -------------------------

  try {
    const supabase = await createClient();

    let finalStaffId = parsed.data.staff_id || null;

    // --- 1. Verifikasi Keamanan Lintas-Tenant (Cross-Tenant Forgery) ---
    const { data: serviceData, error: serviceError } = await supabase
      .from("services")
      .select("id")
      .eq("id", parsed.data.service_id)
      .eq("tenant_id", parsed.data.tenant_id)
      .single();

    if (serviceError || !serviceData) {
      return { success: false, error: "Akses ditolak: Layanan tidak valid atau bukan milik toko ini." };
    }

    if (finalStaffId) {
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("id")
        .eq("id", finalStaffId)
        .eq("tenant_id", parsed.data.tenant_id)
        .single();
      
      if (staffError || !staffData) {
        return { success: false, error: "Akses ditolak: Pegawai tidak valid atau bukan milik toko ini." };
      }
    }
    // -------------------------------------------------------------------

    // Auto-assign staff jika tidak dipilih spesifik
    if (!finalStaffId) {
      const { data: staffList } = await supabase
        .from("staff")
        .select("id")
        .eq("tenant_id", parsed.data.tenant_id);

      if (staffList && staffList.length > 0) {
        // Ambil staff yang sedang bertugas di jam tersebut
        const { data: busyBookings } = await supabase
          .from("bookings")
          .select("staff_id")
          .eq("tenant_id", parsed.data.tenant_id)
          .eq("booking_date", parsed.data.booking_date)
          .eq("start_time", parsed.data.start_time)
          .in("payment_status", ["pending", "approved"]);

        const busyStaffIds = (busyBookings || []).map((b) => b.staff_id).filter(Boolean);
        const availableStaff = staffList.filter((s) => !busyStaffIds.includes(s.id));

        if (availableStaff.length > 0) {
          // Pilih random dari yang tersedia (atau yang pertama)
          finalStaffId = availableStaff[0].id;
        } else {
          return { success: false, error: "Waduh, semua pegawai sedang sibuk di jam ini. Pilih jam lain yuk!" };
        }
      }
    }

    // ── Mulai Logika CRM Pelanggan (Menggunakan Service Role untuk bypass RLS) ──
    let finalCustomerId: string | null = null;
    try {
      const adminSupabase = createAdminClient();

      const { data: existingCustomer } = await adminSupabase
        .from("customers")
        .select("id, total_bookings")
        .eq("tenant_id", parsed.data.tenant_id)
        .eq("whatsapp_number", parsed.data.customer_wa)
        .single();

      if (existingCustomer) {
        const { data: updatedCustomer } = await adminSupabase
          .from("customers")
          .update({ 
            name: parsed.data.customer_name,
            total_bookings: existingCustomer.total_bookings + 1,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingCustomer.id)
          .select("id")
          .single();
        finalCustomerId = updatedCustomer?.id || existingCustomer.id;
      } else {
        const { data: newCustomer } = await adminSupabase
          .from("customers")
          .insert({
            tenant_id: parsed.data.tenant_id,
            name: parsed.data.customer_name,
            whatsapp_number: parsed.data.customer_wa,
            total_bookings: 1
          })
          .select("id")
          .single();
        finalCustomerId = newCustomer?.id || null;
      }
    } catch (e) {
      console.warn("Gagal update data pelanggan (CRM):", e);
      // Lanjutkan tanpa memblokir booking
    }
    // ── Selesai Logika CRM Pelanggan ──

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        tenant_id: parsed.data.tenant_id,
        service_id: parsed.data.service_id,
        staff_id: finalStaffId,
        customer_id: finalCustomerId,
        customer_name: parsed.data.customer_name,
        customer_wa: parsed.data.customer_wa,
        booking_date: parsed.data.booking_date,
        start_time: parsed.data.start_time,
        end_time: parsed.data.end_time,
        payment_status: "pending",
        proof_url: parsed.data.proof_url ?? null,
      })
      .select()
      .single();

    if (error) {
      // Tangkap pelanggaran constraint unique_tenant_slot (race condition)
      const pgError = error as unknown as PostgrestError;
      if (
        pgError.code === PG_UNIQUE_VIOLATION &&
        pgError.message.includes(UNIQUE_SLOT_CONSTRAINT)
      ) {
        return {
          success: false,
          error: "Waduh, slot ini baru aja diambil orang lain. Pilih jam yang lain yuk!",
        };
      }

      return { success: false, error: "Yah, gagal nyimpen jadwal kamu. Coba klik sekali lagi ya." };
    }

    // Invalidasi cache semua halaman [tenant] dan dashboard setelah INSERT berhasil
    revalidatePath("/[tenant]", "page");
    revalidatePath("/dashboard");

    // Kirim notifikasi Telegram ke tenant (tanpa menghentikan flow jika gagal)
    try {
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("telegram_chat_id")
        .eq("id", parsed.data.tenant_id)
        .single();

      if (tenantData?.telegram_chat_id) {
        const message = `Asyik, ada booking baru masuk! 📅 ${parsed.data.booking_date} ⏰ ${parsed.data.start_time.slice(0, 5)} 👤 ${parsed.data.customer_name}. Buruan cek dasbor buat konfirmasi DP-nya!`;
        // Jangan await agar tidak memblokir response ke user, atau await tidak apa-apa karena fetch cepat
        await sendTelegramNotification(tenantData.telegram_chat_id, message);
      }
    } catch (err) {
      console.warn("Gagal mengeksekusi notifikasi telegram:", err);
    }

    return { success: true, data: data as Booking };
  } catch {
    return { success: false, error: "Server kita lagi ngambek dikit nih. Coba klik lagi ya." };
  }
}

// ── updateBookingPaymentStatus ────────────────────────────────────────────────
// Dipertahankan — dipakai oleh timeline-view.tsx di dashboard tenant.
export async function updateBookingPaymentStatus(
  bookingId: string,
  paymentStatus: PaymentStatus
): Promise<ActionResponse<Booking>> {
  const parsed = updatePaymentStatusSchema.safeParse({
    booking_id: bookingId,
    payment_status: paymentStatus,
  });

  if (!parsed.success) {
    return { success: false, error: "Status pembayaran tidak valid" };
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
      .update({ payment_status: parsed.data.payment_status })
      .eq("id", parsed.data.booking_id)
      .eq("tenant_id", user.id) // WAJIB: Validasi bahwa booking milik user yang sedang login
      .select()
      .single();

    if (error) {
      return { success: false, error: "Gagal memperbarui status pembayaran (Data tidak ditemukan atau akses ditolak)" };
    }

    revalidatePath("/dashboard");
    return { success: true, data: data as Booking };
  } catch {
    return { success: false, error: "Server kita lagi ngambek dikit nih. Coba klik lagi ya." };
  }
}
