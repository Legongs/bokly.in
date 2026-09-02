"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
): Promise<ActionResponse<string[]>> {
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

    // 2. Ambil semua booking di hari itu
    const { data: bookingsData, error } = await supabase
      .from("bookings")
      .select("start_time, staff_id")
      .eq("tenant_id", parsed.data.tenant_id)
      .eq("booking_date", parsed.data.booking_date)
      .in("payment_status", ["pending", "approved"]);

    if (error) {
      return { success: false, error: "Duh, gagal muat data jadwal. Coba muat ulang ya.", data: [] };
    }

    const bookings = bookingsData || [];
    const bookedSlots: string[] = [];

    if (parsed.data.staff_id) {
      // Kasus A: Pelanggan memilih staff spesifik. 
      // Slot tidak tersedia jika staff tersebut sudah ada jadwal, atau jika jadwal tsb tidak ada staff (legacy).
      for (const b of bookings) {
        if (b.staff_id === parsed.data.staff_id || !b.staff_id) {
          bookedSlots.push(b.start_time.slice(0, 5));
        }
      }
    } else {
      // Kasus B: Pelanggan memilih "Bebas" (Siapapun)
      // Hitung frekuensi booking tiap start_time. Jika >= maxCapacity, slot tersebut penuh.
      const timeCounts: Record<string, number> = {};
      for (const b of bookings) {
        const t = b.start_time.slice(0, 5);
        timeCounts[t] = (timeCounts[t] || 0) + 1;
      }
      for (const [time, count] of Object.entries(timeCounts)) {
        if (count >= maxCapacity) {
          bookedSlots.push(time);
        }
      }
    }

    return { success: true, data: Array.from(new Set(bookedSlots)) };
  } catch {
    return { success: false, error: "Server kita lagi agak ngambek nih. Coba muat ulang ya.", data: [] };
  }
}

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

  try {
    const supabase = await createClient();

    let finalStaffId = parsed.data.staff_id || null;

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

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        tenant_id: parsed.data.tenant_id,
        service_id: parsed.data.service_id,
        staff_id: finalStaffId,
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

    const { data, error } = await supabase
      .from("bookings")
      .update({ payment_status: parsed.data.payment_status })
      .eq("id", parsed.data.booking_id)
      .select()
      .single();

    if (error) {
      return { success: false, error: "Gagal memperbarui status pembayaran" };
    }

    revalidatePath("/dashboard");
    return { success: true, data: data as Booking };
  } catch {
    return { success: false, error: "Server kita lagi ngambek dikit nih. Coba klik lagi ya." };
  }
}
