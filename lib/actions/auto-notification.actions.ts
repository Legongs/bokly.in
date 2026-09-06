"use server";

import { createClient } from "@/lib/supabase/server";
import { getGlobalFonnteConfig, isGlobalWaReady } from "@/lib/global-wa";
import { canUseAutoWaFeature } from "@/lib/subscription";

/**
 * Mengirim pesan WhatsApp menggunakan kredensial Fonnte GLOBAL milik developer platform.
 * BUKAN menggunakan wa_api_key milik tenant.
 */
async function sendGlobalWa(targetPhone: string, message: string): Promise<boolean> {
  try {
    const config = await getGlobalFonnteConfig();
    
    // Jangan lempar error jika tidak aktif, cukup skip agar tidak memblokir alur utama
    if (!isGlobalWaReady(config)) {
      console.log("Global WA is disabled or API Key is missing. Skipping message to:", targetPhone);
      return false;
    }

    // Normalisasi nomor telepon (dari 0 ke 62)
    let normalizedPhone = targetPhone;
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "62" + normalizedPhone.slice(1);
    }

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": config.apiKey,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        target: normalizedPhone,
        message: message,
        countryCode: "62",
      }).toString(),
    });

    const resData = await response.json();
    if (response.ok && resData.status) {
      return true;
    } else {
      console.error("Fonnte API Error (Global):", resData);
      return false;
    }
  } catch (err) {
    console.error("Error in sendGlobalWa:", err);
    return false;
  }
}

/**
 * Mengirim notifikasi ke tenant saat ada booking baru.
 * Fungsi ini menggunakan WA Global dan ditanggung oleh platform.
 */
export async function notifyTenantNewBooking(bookingId: string): Promise<void> {
  try {
    const supabase = await createClient();

    // 1. Ambil data booking, tenant, dan service
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        tenants (id, business_name, whatsapp_number),
        services (name)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !bookingData) {
      console.error("notifyTenantNewBooking: Booking tidak ditemukan.", bookingError);
      return;
    }

    const tenant = bookingData.tenants as any;
    const service = bookingData.services as any;

    if (!tenant.whatsapp_number) {
      return;
    }

    // 2. Cek fitur berlangganan tenant (hanya Pro/Bisnis yang dapet notif ini)
    const canUse = await canUseAutoWaFeature(tenant.id, "new_booking_alert");
    if (!canUse) {
      return;
    }

    // 3. Susun pesan
    const message = `Booking baru masuk! 🎉

Pelanggan: ${bookingData.customer_name}
Layanan: ${service.name}
Tanggal: ${bookingData.booking_date} jam ${bookingData.start_time.slice(0, 5)}

Cek detail lengkap di dashboard kamu.`;

    // 4. Kirim
    await sendGlobalWa(tenant.whatsapp_number, message);

  } catch (err) {
    console.error("Error in notifyTenantNewBooking:", err);
  }
}
