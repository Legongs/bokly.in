"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getBusySlotsFromGoogle } from "@/lib/google-calendar";
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
  is_walkin: z.boolean().optional(),
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
    const supabase = await createAdminClient();

    // 1. Ambil jumlah total staff
    const { count: staffCount } = await supabase
      .from("staff")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", parsed.data.tenant_id);

    const maxCapacity = Math.max(1, staffCount || 1);

    // Fetch bookings from database
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

    // Fetch Google Calendar busy slots
    try {
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("google_refresh_token")
        .eq("id", parsed.data.tenant_id)
        .single();
        
      if (tenantData?.google_refresh_token) {
        const googleSlots = await getBusySlotsFromGoogle(tenantData.google_refresh_token, parsed.data.booking_date);
        formattedBookings.push(...googleSlots);
      }
    } catch (gcalError) {
      console.error("Failed to append Google Calendar slots", gcalError);
    }

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
  if (!(await checkRateLimit(rateLimitKey, 3, 300_000))) {
    return { success: false, error: "Wow, bookingnya kenceng banget! Tunggu beberapa menit lagi ya sebelum bikin booking baru." };
  }

  try {
    const supabase = await createClient();
    let finalStaffId = parsed.data.staff_id || null;

    // --- 1. Ambil Data Tenant & Service ---
    const { data: tenant, error: tenantErr } = await supabase
      .from("tenants")
      .select("weekly_schedule, minimum_notice_hours, timezone, open_time, close_time")
      .eq("id", parsed.data.tenant_id)
      .single();

    if (tenantErr || !tenant) return { success: false, error: "Toko tidak ditemukan." };

    const { data: service, error: serviceErr } = await supabase
      .from("services")
      .select("id, duration_minutes, buffer_minutes, max_capacity")
      .eq("id", parsed.data.service_id)
      .eq("tenant_id", parsed.data.tenant_id)
      .single();

    if (serviceErr || !service) return { success: false, error: "Akses ditolak: Layanan tidak valid." };

    // --- 2. Validasi Jadwal Mingguan & Jam Operasional ---
    const bookingDateObj = new Date(parsed.data.booking_date);
    const dayNameEn = bookingDateObj.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    
    let dayOpenTime = tenant.open_time;
    let dayCloseTime = tenant.close_time;
    const weeklySchedule: any = tenant.weekly_schedule;
    
    if (weeklySchedule && weeklySchedule[dayNameEn]) {
      if (!weeklySchedule[dayNameEn].isOpen) {
        return { success: false, error: "Maaf, toko libur di hari ini." };
      }
      dayOpenTime = weeklySchedule[dayNameEn].openTime || dayOpenTime;
      dayCloseTime = weeklySchedule[dayNameEn].closeTime || dayCloseTime;
    }

    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + (m || 0);
    };
    
    const startMinutes = parseTime(parsed.data.start_time);
    const endMinutes = parseTime(parsed.data.end_time);
    
    // Validasi apakah pesanan melanggar jam operasional
    if (startMinutes < parseTime(dayOpenTime) || endMinutes > parseTime(dayCloseTime)) {
      return { success: false, error: "Jam yang dipilih di luar jam operasional toko." };
    }

    // --- 3. Validasi Minimum Notice ---
    const tenantTimezone = tenant.timezone || "Asia/Jakarta";
    const now = new Date();
    const todayLocal = new Date(now.toLocaleString("en-US", { timeZone: tenantTimezone }));
    const todayDateString = todayLocal.getFullYear() + "-" + 
                            String(todayLocal.getMonth() + 1).padStart(2, "0") + "-" + 
                            String(todayLocal.getDate()).padStart(2, "0");
                            
    if (!parsed.data.is_walkin) {
      if (parsed.data.booking_date === todayDateString) {
        const currentMinutesLocal = todayLocal.getHours() * 60 + todayLocal.getMinutes();
        const minimumNotice = (tenant.minimum_notice_hours || 0) * 60;
        if (startMinutes < currentMinutesLocal + minimumNotice) {
          return { success: false, error: `Maaf, minimal pemesanan adalah ${tenant.minimum_notice_hours} jam sebelumnya.` };
        }
      } else if (parsed.data.booking_date < todayDateString) {
        return { success: false, error: "Tanggal pemesanan sudah lewat." };
      }
    }

    // --- 4. Validasi Pegawai & Overlap ---
    if (finalStaffId) {
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("id")
        .eq("id", finalStaffId)
        .eq("tenant_id", parsed.data.tenant_id)
        .single();
      if (staffError || !staffData) {
        return { success: false, error: "Akses ditolak: Pegawai tidak valid." };
      }
    }

    // Mengambil semua jadwal pada tanggal tersebut untuk cek overlap
    const { data: existingBookings, error: bookingsErr } = await supabase
      .from("bookings")
      .select("start_time, end_time, staff_id, services(buffer_minutes)")
      .eq("tenant_id", parsed.data.tenant_id)
      .eq("booking_date", parsed.data.booking_date)
      .in("payment_status", ["pending", "approved"]);

    if (bookingsErr) return { success: false, error: "Gagal memverifikasi ketersediaan jadwal." };

    let overlappingCount = 0;
    const busyStaffIds = new Set<string>();

    for (const b of (existingBookings || [])) {
      const bStart = parseTime(b.start_time);
      const bBuffer = b.services?.buffer_minutes || 0;
      const bEnd = parseTime(b.end_time) + bBuffer;

      const requestEnd = endMinutes + (service.buffer_minutes || 0);

      // Cek overlap: A.start < B.end AND A.end > B.start
      if (startMinutes < bEnd && requestEnd > bStart) {
        if (b.staff_id) busyStaffIds.add(b.staff_id);
        overlappingCount++;
      }
    }

    if (finalStaffId && busyStaffIds.has(finalStaffId)) {
      return { success: false, error: "Waduh, pegawai ini sudah ada jadwal di jam tersebut. Pilih jam lain yuk!" };
    }

    // Auto-assign staff jika tidak dipilih spesifik
    if (!finalStaffId) {
      const { data: staffList } = await supabase
        .from("staff")
        .select("id")
        .eq("tenant_id", parsed.data.tenant_id);

      if (staffList && staffList.length > 0) {
        const availableStaff = staffList.filter((s) => !busyStaffIds.has(s.id));
        if (availableStaff.length > 0) {
          finalStaffId = availableStaff[0].id;
        } else {
          return { success: false, error: "Waduh, semua pegawai sedang sibuk di jam ini. Pilih jam atau hari lain yuk!" };
        }
      } else {
        // Tidak ada pegawai yang didaftarkan, cek max_capacity dari service
        const maxCap = service.max_capacity || 1;
        if (overlappingCount >= maxCap) {
          return { success: false, error: "Waduh, slot di jam ini sudah penuh. Pilih jam atau hari lain yuk!" };
        }
      }
    }

    // --- 5. Insert Booking via Secure RPC (Anti Double-Booking) ---
    // Cast supabase client to any to bypass type checking for newly created RPC
    const { data, error } = await (supabase as any).rpc("create_booking_secure", {
      p_tenant_id: parsed.data.tenant_id,
      p_service_id: parsed.data.service_id,
      p_staff_id: finalStaffId,
      p_customer_name: parsed.data.customer_name,
      p_customer_wa: parsed.data.customer_wa,
      p_booking_date: parsed.data.booking_date,
      p_start_time: parsed.data.start_time,
      p_end_time: parsed.data.end_time,
      p_payment_status: parsed.data.is_walkin ? "approved" : "pending",
      p_proof_url: parsed.data.proof_url ?? null,
      p_manage_token_expires_at: new Date(new Date(parsed.data.booking_date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (error) {
      if (error.message.includes("UNIQUE_SLOT_VIOLATION") || error.message.includes("Layanan tidak ditemukan")) {
        return { success: false, error: "Waduh, slot ini baru aja diambil orang lain. Pilih jam yang lain yuk!" };
      }
      return { success: false, error: "Yah, gagal nyimpen jadwal kamu. Coba klik sekali lagi ya." };
    }

    // Invalidasi cache semua halaman [tenant] dan dashboard setelah INSERT berhasil
    revalidatePath("/[tenant]", "page");
    revalidatePath("/dashboard");

    // Kirim notifikasi Telegram ke tenant
    try {
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("telegram_chat_id")
        .eq("id", parsed.data.tenant_id)
        .single();

      if (tenantData?.telegram_chat_id) {
        const message = `Asyik, ada booking baru masuk! 📅 ${parsed.data.booking_date} ⏰ ${parsed.data.start_time.slice(0, 5)} 👤 ${parsed.data.customer_name}. Buruan cek dasbor buat konfirmasi DP-nya!`;
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

// ── handleBookingSuccess ──────────────────────────────────────────────────────
export async function handleBookingSuccess(
  bookingId: string,
  tenantId: string
): Promise<ActionResponse<{ type: "manual" | "api"; url?: string }>> {
  try {
    const supabase = await createClient();

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        services (name, price, dp_amount),
        tenants (slug, business_name, whatsapp_number, wa_method, wa_api_key)
      `)
      .eq("id", bookingId)
      .eq("tenant_id", tenantId)
      .single();

    if (bookingError || !bookingData) {
      return { success: false, error: "Data booking tidak ditemukan." };
    }

    const tenant = bookingData.tenants as any;
    const service = bookingData.services as any;
    const portalUrl = `https://maubooking.in/${tenant.slug}/booking/${bookingData.manage_token}`;

    const messageText = `Halo ${tenant.business_name},\n\nSaya ${bookingData.customer_name} ingin konfirmasi booking:\n\nLayanan: ${service.name}\nTanggal: ${bookingData.booking_date}\nJam: ${bookingData.start_time.slice(0,5)}\n\nCek status: ${portalUrl}\n\nTerima kasih!`;
    const encodedMessage = encodeURIComponent(messageText);

    const waMethod = tenant.wa_method || "manual";

    if (waMethod === "manual") {
      // Hilangkan awalan 0, ganti jadi 62 untuk wa.me
      let waNumber = tenant.whatsapp_number;
      if (waNumber.startsWith("0")) waNumber = "62" + waNumber.slice(1);
      
      const url = `https://wa.me/${waNumber}?text=${encodedMessage}`;
      return { success: true, data: { type: "manual", url } };
    } else if (waMethod === "api") {
      if (!tenant.wa_api_key) {
        return { success: false, error: "API Key Fonnte belum diatur oleh tenant." };
      }

      const customerMessage = `Halo ${bookingData.customer_name},\n\nBooking kamu di ${tenant.business_name} berhasil dicatat!\n\nLayanan: ${service.name}\nTanggal: ${bookingData.booking_date}\nJam: ${bookingData.start_time.slice(0,5)}\n\nCek status dan kelola booking kamu di sini:\n${portalUrl}\n\nTerima kasih!`;

      // Eksekusi POST ke Fonnte
      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          "Authorization": tenant.wa_api_key,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          target: bookingData.customer_wa,
          message: customerMessage,
          countryCode: "62",
        }).toString(),
      });

      const resData = await response.json();
      if (!response.ok || !resData.status) {
        console.error("Fonnte API Error:", resData);
        return { success: false, error: "Gagal mengirim pesan otomatis via Fonnte." };
      }

      return { success: true, data: { type: "api" } };
    }

    return { success: false, error: "Metode WA tidak dikenali." };

  } catch (err) {
    console.error("Error di handleBookingSuccess:", err);
    return { success: false, error: "Terjadi kesalahan internal." };
  }
}

// ── getAvailableSlots ─────────────────────────────────────────────────────────
const getAvailableSlotsSchema = z.object({
  tenantId: z.string().uuid("ID Outlet tidak valid."),
  serviceId: z.string().uuid("ID Layanan tidak valid."),
  staffId: z.string().uuid("ID Pegawai tidak valid."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD."),
});

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export async function getAvailableSlots(
  tenantId: string,
  serviceId: string,
  staffId: string,
  date: string
): Promise<ActionResponse<string[]>> {
  const parsed = getAvailableSlotsSchema.safeParse({ tenantId, serviceId, staffId, date });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const supabase = await createClient();

    // 1. Ambil jam operasional outlet
    const { data: tenant, error: tenantErr } = await supabase
      .from("tenants")
      .select("open_time, close_time, timezone")
      .eq("id", tenantId)
      .single();

    if (tenantErr || !tenant) return { success: false, error: "Data outlet tidak ditemukan." };

    // 2. Ambil durasi & buffer layanan
    const { data: service, error: serviceErr } = await supabase
      .from("services")
      .select("duration_minutes, buffer_minutes")
      .eq("id", serviceId)
      .eq("tenant_id", tenantId)
      .single();
    
    if (serviceErr || !service) return { success: false, error: "Layanan tidak ditemukan." };

    // 3. Ambil jadwal existing (pending/approved) di tanggal yang dipilih
    let staffCount = 1;
    if (!staffId || staffId === "any") {
      const { count } = await supabase
        .from("staff")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId);
      staffCount = count || 1;
    }

    let query = supabase
      .from("bookings")
      .select("start_time, end_time, services(buffer_minutes)")
      .eq("tenant_id", tenantId)
      .eq("booking_date", date)
      .in("payment_status", ["pending", "approved"]);

    if (staffId && staffId !== "any") {
      query = query.eq("staff_id", staffId);
    }
    const { data: existingBookings, error: bookingsErr } = await query;

    if (bookingsErr) return { success: false, error: "Gagal mengambil data jadwal." };

    // Parsing time to minutes
    const openMinutes = parseTime(tenant.open_time);
    const closeMinutes = parseTime(tenant.close_time);
    const duration = service.duration_minutes;
    const buffer = service.buffer_minutes || 0;
    const totalRequiredMinutes = duration + buffer;

    // Mapping existing bookings to ranges (start, end + buffer)
    const existingRanges = (existingBookings || []).map((b: any) => {
      const existingBuffer = b.services?.buffer_minutes || 0;
      return {
        start: parseTime(b.start_time),
        end: parseTime(b.end_time) + existingBuffer,
      };
    });

    // Menentukan waktu saat ini di lokasi outlet
    const tenantTimezone = tenant.timezone || "Asia/Jakarta";
    const now = new Date();
    const todayLocal = new Date(now.toLocaleString("en-US", { timeZone: tenantTimezone }));
    const todayDateString = todayLocal.getFullYear() + "-" + 
                            String(todayLocal.getMonth() + 1).padStart(2, "0") + "-" + 
                            String(todayLocal.getDate()).padStart(2, "0");

    let currentMinutesLocal = -1;
    if (date === todayDateString) {
      currentMinutesLocal = todayLocal.getHours() * 60 + todayLocal.getMinutes();
    }

    const availableSlots: string[] = [];
    const intervalMinutes = 30; // Interval pencarian slot tiap 30 menit

    for (let slotStart = openMinutes; slotStart < closeMinutes; slotStart += intervalMinutes) {
      const slotEnd = slotStart + totalRequiredMinutes;

      // a. Apakah waktu pengerjaan melewati jam tutup?
      if (slotEnd > closeMinutes) continue;

      // b. Apakah slot ini sudah lewat dari jam sekarang (jika hari ini)?
      if (slotStart <= currentMinutesLocal) continue;

      // c. Apakah slot ini beririsan dengan jadwal yang sudah ada?
      // Logika irisan (overlap): A.start < B.end AND A.end > B.start
      const overlaps = existingRanges.filter((range) => {
        return slotStart < range.end && slotEnd > range.start;
      });

      if (overlaps.length < staffCount) {
        availableSlots.push(formatTime(slotStart));
      }
    }

    return { success: true, data: availableSlots };
  } catch (err) {
    console.error("Error di getAvailableSlots:", err);
    return { success: false, error: "Terjadi kesalahan sistem saat mengecek slot." };
  }
}

// ── Reschedule & No-Show Actions ──────────────────────────────────────────────

const rescheduleSchema = z.object({
  bookingId: z.string().uuid(),
  role: z.enum(["tenant", "customer"]),
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  newStartTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  newEndTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
});

export async function proposeReschedule(
  bookingId: string,
  role: "tenant" | "customer",
  newDate: string,
  newStartTime: string,
  newEndTime: string
): Promise<ActionResponse<{ type: "manual" | "api"; url?: string }>> {
  try {
    const supabase = await createClient();
    
    // Jika tenant, verifikasi login terlebih dahulu
    let currentUser = null;
    if (role === "tenant") {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        return { success: false, error: "Akses ditolak: Anda tidak memiliki akses untuk tindakan ini." };
      }
      currentUser = user;
    }
    
    // Cek booking
    const { data: bookingData, error: bookingErr } = await supabase
      .from("bookings")
      .select(`*, tenants (business_name, whatsapp_number, wa_method, wa_api_key, slug), services (name)`)
      .eq("id", bookingId)
      .single();
      
    if (bookingErr || !bookingData) return { success: false, error: "Booking tidak ditemukan." };

    // Jika tenant, verifikasi kepemilikan booking
    if (role === "tenant" && currentUser) {
      if (bookingData.tenant_id !== currentUser.id) {
        return { success: false, error: "Akses ditolak: Booking bukan milik Anda." };
      }
    }

    const tenant = bookingData.tenants as any;
    const service = bookingData.services as any;

    const rescheduleRequest = {
      proposedBy: role,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: "pending"
    };

    const { error: updateErr } = await supabase
      .from("bookings")
      .update({ reschedule_request: rescheduleRequest })
      .eq("id", bookingId);

    if (updateErr) return { success: false, error: "Gagal menyimpan pengajuan reschedule." };

    revalidatePath("/dashboard");
    revalidatePath("/[slug]/booking/[token]", "page");

    // Format pesan WA
    const portalUrl = `https://maubooking.in/${tenant.slug}/booking/${bookingData.manage_token}`;
    let messageText = "";
    let targetWa = "";

    if (role === "tenant") {
      messageText = `Halo ${bookingData.customer_name},\n\nMohon maaf, admin ${tenant.business_name} meminta untuk memindahkan jadwal booking layanan ${service.name} Anda menjadi:\nTanggal: ${newDate}\nJam: ${newStartTime.slice(0,5)}\n\nMohon konfirmasi (Setuju/Tolak) melalui tautan berikut:\n${portalUrl}\n\nTerima kasih!`;
      targetWa = bookingData.customer_wa;
    } else {
      messageText = `Halo admin ${tenant.business_name},\n\nPelanggan atas nama ${bookingData.customer_name} mengajukan perpindahan jadwal untuk layanan ${service.name} menjadi:\nTanggal: ${newDate}\nJam: ${newStartTime.slice(0,5)}\n\nSilakan cek Dasbor Kasir untuk menyetujui atau menolak.`;
      targetWa = tenant.whatsapp_number;
    }

    const waMethod = tenant.wa_method || "manual";

    if (waMethod === "manual" || role === "customer") {
      let phone = targetWa;
      if (phone.startsWith("0")) phone = "62" + phone.slice(1);
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
      return { success: true, data: { type: "manual", url } };
    } else if (waMethod === "api" && role === "tenant") {
      if (!tenant.wa_api_key) return { success: false, error: "Fonnte API Key belum diatur." };
      
      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: { "Authorization": tenant.wa_api_key, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ target: targetWa, message: messageText, countryCode: "62" }).toString(),
      });
      const resData = await response.json();
      if (!response.ok || !resData.status) return { success: false, error: "Gagal mengirim pesan otomatis via Fonnte." };
      return { success: true, data: { type: "api" } };
    }

    return { success: false, error: "Metode WA tidak dikenali." };
  } catch (err) {
    return { success: false, error: "Kesalahan internal." };
  }
}

export async function respondToReschedule(
  bookingId: string,
  response: "accepted" | "rejected",
  manageToken?: string
): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    const { data: bookingData } = await supabase.from("bookings").select("*").eq("id", bookingId).single();
    if (!bookingData || !bookingData.reschedule_request) return { success: false, error: "Tidak ada pengajuan reschedule aktif." };
    
    const req = bookingData.reschedule_request as any;
    
    // Jika yang mengajukan reschedule adalah customer, maka yang merespons adalah tenant. Wajib verifikasi otorisasi.
    if (req.proposedBy === "customer") {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user || user.id !== bookingData.tenant_id) {
        return { success: false, error: "Akses ditolak: Anda tidak memiliki akses untuk tindakan ini." };
      }
    } else {
      // Yang merespons adalah customer, verifikasi manageToken
      if (!manageToken || bookingData.manage_token !== manageToken) {
        return { success: false, error: "Akses ditolak: Token tidak valid." };
      }
    }
    
    if (response === "accepted") {
      // Ubah jadwal permanen
      const { error } = await supabase.from("bookings").update({
        booking_date: req.date,
        start_time: req.startTime,
        end_time: req.endTime,
        reschedule_request: null
      }).eq("id", bookingId);
      if (error) return { success: false, error: "Gagal mengubah jadwal." };
    } else {
      // Hapus request
      await supabase.from("bookings").update({ reschedule_request: null }).eq("id", bookingId);
    }
    
    revalidatePath("/dashboard");
    revalidatePath("/[slug]/booking/[token]", "page");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Kesalahan internal." };
  }
}

export async function markNoShow(bookingId: string): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    
    // Verifikasi akses tenant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Akses ditolak." };

    const { error } = await supabase
      .from("bookings")
      .update({ is_no_show: true, payment_status: "rejected" }) // tandai rejected agar slot kosong
      .eq("id", bookingId)
      .eq("tenant_id", user.id);
      
    if (error) return { success: false, error: "Gagal menandai tidak hadir." };
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Kesalahan internal." };
  }
}
