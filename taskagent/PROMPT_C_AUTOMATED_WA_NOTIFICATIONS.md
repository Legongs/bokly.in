# PROMPT C — NOTIFIKASI WA OTOMATIS (Reminder H-1/H-2/H-3 & Notif Booking Baru ke Tenant)

Copy-paste seluruh blok di bawah ini ke Antigravity. Kerjakan SETELAH Prompt A dan Prompt B selesai.

---

```
CARA KERJA KAMU DI TASK INI:

1. Task ini BERGANTUNG pada Prompt B yang sudah selesai. Sebelum mulai, verifikasi bahwa
   file lib/global-wa.ts (getGlobalFonnteConfig) dan fungsi canUseAutoWaFeature() di
   lib/subscription.ts sudah ada dan berfungsi. Kalau belum ada, HENTIKAN dan laporkan ke
   saya — jangan membuat versi sendiri yang beda dari Prompt B.
2. Baca lib/actions/booking.actions.ts function handleBookingSuccess() — ini pola pengiriman
   WA yang SUDAH ADA di project ini (pakai fetch ke api.fonnte.com/send). Task ini akan
   membuat fungsi PENGIRIMAN WA YANG TERPISAH dari itu, karena handleBookingSuccess() memakai
   wa_api_key MILIK TENANT, sedangkan task ini memakai API key GLOBAL MILIK DEVELOPER
   (dari getGlobalFonnteConfig()). JANGAN CAMPUR dua kredensial ini.
3. Kerjakan bertahap per TASK.


## TASK 1: Fungsi Pengiriman WA via Kredensial Global

Buat file baru: lib/actions/auto-notification.actions.ts

"use server";

Buat fungsi helper (tidak perlu export, private ke file ini):

async function sendGlobalWa(targetPhone: string, message: string): Promise<boolean> {
  // 1. Ambil config lewat getGlobalFonnteConfig()
  // 2. Kalau isEnabled === false atau apiKey kosong, return false (jangan lempar error,
  //    cukup skip pengiriman diam-diam, log ke console saja)
  // 3. Normalisasi nomor telepon: kalau mulai dengan "0", ganti jadi "62" (ikuti pola
  //    normalisasi yang sudah ada di handleBookingSuccess())
  // 4. POST ke https://api.fonnte.com/send dengan Authorization = apiKey global (BUKAN
  //    apiKey milik tenant), body target=targetPhone, message=message, countryCode=62
  //    (ikuti persis struktur fetch yang sudah ada di handleBookingSuccess() untuk konsistensi)
  // 5. Return true kalau sukses (response.ok && resData.status), false kalau gagal
  // 6. WAJIB try-catch, jangan biarkan error di sini menghentikan proses lain yang memanggil
     fungsi ini
}


## TASK 2: Notifikasi Booking Baru ke Tenant

Masih di file yang sama, buat function:

export async function notifyTenantNewBooking(bookingId: string): Promise<void> {
  // 1. Ambil data booking lengkap + tenant (business_name, whatsapp_number, id) + service
  //    (name) — join seperti pola di handleBookingSuccess()
  // 2. Cek canUseAutoWaFeature(tenantId, "new_booking_alert") dari lib/subscription.ts
  //    (hasil kerjaan Prompt B) — kalau false, langsung return, jangan kirim apapun
  // 3. Kalau true, susun pesan:
  //    "Booking baru masuk! 🎉
  //    
  //    Pelanggan: {nama_customer}
  //    Layanan: {nama_layanan}
  //    Tanggal: {tanggal} jam {jam}
  //    
  //    Cek detail lengkap di dashboard kamu."
  // 4. Panggil sendGlobalWa(tenant.whatsapp_number, pesan)
  // 5. Function ini TIDAK perlu return apa-apa ke pemanggil yang penting, dan TIDAK BOLEH
  //    melempar error yang menggagalkan proses booking utama — bungkus semua dengan try-catch
}

Lalu, di lib/actions/booking.actions.ts function submitBooking(), SETELAH booking berhasil
dibuat (setelah baris yang return { success: true, ... }), panggil:

  notifyTenantNewBooking(newBookingId).catch(() => {}); // fire and forget, jangan di-await
  // supaya tidak memperlambat response ke customer kalau pengiriman WA lambat

PENTING: pastikan pemanggilan ini TIDAK menggunakan `await` (biarkan berjalan di background),
supaya customer tidak harus menunggu proses kirim WA selesai untuk melihat konfirmasi booking.
Next.js Server Actions punya keterbatasan soal ini (proses bisa terputus setelah response
dikirim) — kalau kamu tahu cara yang lebih robust untuk "fire and forget" di lingkungan
Next.js App Router/Vercel (misalnya pakai waitUntil dari @vercel/functions kalau sudah
terpasang, atau pendekatan lain yang lazim), gunakan itu. Jelaskan pilihanmu di summary akhir.


## TASK 3: Migration — Kolom Tracking Reminder

Buat file baru: supabase/migrations/00017_reminder_tracking.sql

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_h3_sent boolean DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_h2_sent boolean DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_h1_sent boolean DEFAULT false;

(Kalau ternyata sudah ada kolom `reminder_sent` atau `is_reminder_sent` dari migration
sebelumnya (00006_add_reminder_sent.sql), JANGAN dihapus — biarkan tetap ada, kolom-kolom
baru ini untuk keperluan reminder bertahap H-3/H-2/H-1 yang lebih detail. Cek dulu isi
migration 00006 sebelum menulis ini supaya tidak duplikat nama kolom.)


## TASK 4: Cron Endpoint Reminder H-1/H-2/H-3

Buat file baru: app/api/cron/send-booking-reminders/route.ts

Method: GET
1. Validasi header Authorization "Bearer {CRON_SECRET}" dari environment variable, kalau
   tidak sesuai return 401 (ikuti pola validasi cron yang mungkin sudah ada di project,
   cek app/api/cron/ kalau ada folder itu sebelumnya)

2. Untuk H-3 (booking_date = hari ini + 3 hari):
   - Query booking dengan payment_status = 'approved', reminder_h3_sent = false,
     booking_date = (tanggal hari ini + 3 hari) di timezone Asia/Jakarta
   - Untuk tiap booking, cek canUseAutoWaFeature(tenant_id, "reminder") — skip kalau false
   - Kirim WA ke customer_wa via sendGlobalWa(), pesan:
     "Halo {nama}! Pengingat booking kamu di {toko}:
     
     📅 {tanggal} (3 hari lagi)
     ⏰ Jam {jam}
     ✂️ {layanan}
     
     Sampai jumpa!"
   - Update reminder_h3_sent = true

3. Ulangi logika yang sama untuk H-2 (booking_date = hari ini + 2 hari, cek reminder_h2_sent,
   pesan sesuaikan jadi "2 hari lagi")

4. Ulangi logika yang sama untuk H-1 (booking_date = hari ini + 1 hari, cek reminder_h1_sent,
   pesan sesuaikan jadi "besok")

5. WAJIB try-catch per booking individual (satu gagal kirim, jangan hentikan proses booking
   lainnya)

6. Return JSON: { h3_sent: jumlah, h2_sent: jumlah, h1_sent: jumlah, errors: jumlah }

7. Gunakan createAdminClient() dari lib/supabase/server.ts (bukan createClient biasa)


## TASK 5: Setup Cron Schedule

Cek file vercel.json di root project. Kalau sudah ada isinya (dari task lain sebelumnya,
misal cron no-show), TAMBAHKAN entry baru ke array crons yang sudah ada, JANGAN menimpa:

{
  "path": "/api/cron/send-booking-reminders",
  "schedule": "0 2 * * *"
}

(Jam 2 pagi UTC = jam 9 pagi WIB, sekali sehari)


## SETELAH SEMUA TASK SELESAI:

1. npm run build
2. Test manual: cara trigger cron endpoint manual pakai curl untuk testing tanpa nunggu
   jadwal, dan cara membuat data booking dummy dengan booking_date H-1/H-2/H-3 dari hari ini
   untuk verifikasi pesan terkirim dengan benar
3. Test juga notifyTenantNewBooking() — buat booking baru dari sisi customer, pastikan
   tenant (kalau plan Pro/Bisnis dan Fonnte global aktif) menerima WA
4. JANGAN push dulu
5. Summary: file yang dibuat/diubah, cara test manual tiap bagian, dan konfirmasi bahwa
   tenant paket Gratis TIDAK menerima WA otomatis apapun (baik reminder maupun notif booking
   baru) — cuma tetap dapat notifikasi di dashboard seperti biasa
```

