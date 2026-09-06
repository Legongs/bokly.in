# PROMPT D — PWA (PROGRESSIVE WEB APP) + PUSH NOTIFICATION UNTUK DASHBOARD & STOREFRONT

Copy-paste seluruh blok di bawah ini ke Antigravity. Task ini INDEPENDEN, bisa dikerjakan kapan saja.

---

```
CARA KERJA KAMU DI TASK INI:

1. Baca dulu struktur folder app/ untuk paham mana bagian yang termasuk "dashboard" (tenant)
   dan mana yang "storefront" (halaman publik per tenant, biasanya app/[tenant]/ atau
   app/[slug]/). Task ini akan membuat KEDUANYA installable sebagai PWA terpisah.
2. Push notification di sini pakai teknologi Web Push standar (GRATIS, tidak butuh WhatsApp/
   Fonnte sama sekali) — ini beda dari task WA otomatis di prompt lain. Tujuannya kasih
   pengalaman "kayak aplikasi native" tanpa biaya tambahan, jadi BISA diberikan ke SEMUA
   tenant termasuk paket Gratis (tidak perlu gating fitur di sini, kecuali saya bilang lain).
3. Kerjakan bertahap per TASK, build di antaranya.


## TASK 1: Generate VAPID Keys

Jalankan (atau instruksikan) untuk generate VAPID keys menggunakan library `web-push`:

npm install web-push --save

Buat script sederhana atau gunakan CLI: npx web-push generate-vapid-keys

Simpan hasilnya (public key dan private key) sebagai instruksi ke saya untuk ditambahkan ke
environment variables:
- NEXT_PUBLIC_VAPID_PUBLIC_KEY (boleh public, dipakai di client)
- VAPID_PRIVATE_KEY (rahasia, server only)
- VAPID_SUBJECT (format "mailto:tuntasapp.id@gmail.com" — pakai email kontak yang sudah
  ada di project, cek dari kode yang sudah ada kalau ada referensi email kontak)

JANGAN hardcode key ini di kode — tampilkan hasilnya di summary akhir supaya saya yang
tambahkan manual ke .env.local dan Vercel dashboard.


## TASK 2: Migration — Tabel Push Subscriptions

Buat file baru: supabase/migrations/00018_push_subscriptions.sql

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE, -- nullable, diisi kalau ini
                                                             -- subscription dari dashboard tenant
  endpoint text NOT NULL UNIQUE,
  keys_p256dh text NOT NULL,
  keys_auth text NOT NULL,
  subscription_type text NOT NULL DEFAULT 'dashboard', -- 'dashboard' atau 'storefront'
  created_at timestamptz DEFAULT now()
);

RLS: tenant hanya bisa insert/select subscription miliknya sendiri (tenant_id = auth.uid()).
Untuk subscription_type = 'storefront' dari customer (tanpa login), gunakan admin client
saat insert (karena customer tidak punya sesi auth).


## TASK 3: Manifest File — Dashboard

Buat file baru: app/manifest-dashboard.webmanifest (atau public/manifest-dashboard.json,
sesuaikan dengan cara Next.js App Router di versi project ini menghandle manifest — cek dulu
apakah ada dynamic manifest.ts route sudah dipakai di Next.js 16, ikuti cara yang didukung)

Isi manifest:
{
  "name": "bukly.id Dashboard",
  "short_name": "bukly Dashboard",
  "description": "Kelola booking dan usaha kamu",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4338ca",
  "icons": [ ... gunakan icon yang sudah ada di project (cek app/icon.tsx yang disebut
    sebelumnya sudah dibuat untuk favicon, generate ukuran 192x192 dan 512x512 dari situ) ]
}

Link manifest ini HANYA di layout dashboard (app/dashboard/layout.tsx), bukan di root layout,
supaya tidak bentrok dengan manifest storefront.


## TASK 4: Manifest File — Storefront

Buat file baru: app/manifest-storefront.webmanifest (pola sama seperti TASK 3)

{
  "name": "bukly.id",
  "short_name": "bukly.id",
  "description": "Booking online untuk usaha favorit kamu",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4338ca",
  "icons": [ sama seperti di atas ]
}

Link manifest ini di layout storefront (kemungkinan app/[tenant]/layout.tsx), BUKAN di
layout dashboard.

CATATAN: karena start_url storefront generic ("/") sementara tiap tenant punya slug beda,
kalau start_url perlu dinamis per-tenant (misal /namatoko), buat manifest ini sebagai
dynamic route (app/[tenant]/manifest.ts yang generate manifest per tenant) alih-alih file
statis. Gunakan pendekatan yang lebih benar secara teknis, jelaskan pilihanmu di summary.


## TASK 5: Service Worker

Buat file baru: public/sw.js

Isi minimal:
1. Event 'install' — cache asset penting (opsional untuk MVP, boleh skip caching offline
   yang kompleks, fokus dulu ke push notification handling)
2. Event 'push' — terima payload push notification, tampilkan lewat self.registration.showNotification()
   dengan title, body, icon dari payload data (format JSON: { title, body, url })
3. Event 'notificationclick' — ketika notifikasi diklik, buka/fokus ke url yang ada di payload
   data (pakai clients.openWindow() atau clients.matchAll() untuk fokus tab yang sudah terbuka)

Buat juga komponen client kecil untuk register service worker, taruh di
components/pwa/register-sw.tsx, dipanggil sekali di root layout (app/layout.tsx) via
useEffect, cek dulu apakah browser support ('serviceWorker' in navigator) sebelum register.


## TASK 6: Client Component — Minta Izin Notifikasi & Subscribe

Buat file baru: components/pwa/push-notification-prompt.tsx

Komponen ini:
1. Cek apakah browser support Notification API dan Push API
2. Kalau user belum pernah ditanya (Notification.permission === 'default'), tampilkan UI
   kecil yang sopan (bukan langsung popup browser tiba-tiba) menjelaskan kenapa perlu izin
   notifikasi, dengan tombol "Aktifkan Notifikasi" — style mengikuti komponen UI yang sudah
   ada di dashboard (cek komponen card/banner yang mirip di project ini)
3. Kalau user klik "Aktifkan", baru panggil Notification.requestPermission(), lalu kalau
   granted, subscribe ke push manager pakai VAPID public key:
   
   const registration = await navigator.serviceWorker.ready;
   const subscription = await registration.pushManager.subscribe({
     userVisibleOnly: true,
     applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
   });

4. Kirim subscription object ke server action baru (buat di langkah TASK 7) untuk disimpan
   ke tabel push_subscriptions

Pasang komponen ini di dashboard layout (subscription_type: 'dashboard') dan juga di halaman
konfirmasi booking customer/storefront (subscription_type: 'storefront') — sesuaikan pesan
teksnya beda untuk masing-masing konteks (dashboard: "Dapatkan notifikasi instan setiap ada
booking baru", storefront: "Dapatkan notifikasi update status booking kamu").


## TASK 7: Server Action Simpan & Kirim Push

Buat file baru: lib/actions/push-notification.actions.ts

"use server";

1. savePushSubscription(subscription, type: 'dashboard' | 'storefront'): Promise<ActionResponse<null>>
   - Kalau type = 'dashboard', ambil tenant_id dari auth session (wajib login)
   - Kalau type = 'storefront', tenant_id = null, pakai admin client untuk insert (customer
     tidak perlu login)
   - Insert ke push_subscriptions (endpoint, keys_p256dh, keys_auth dari subscription object)
   - Kalau endpoint sudah ada (unique constraint), lakukan upsert alih-alih gagal

2. sendPushToTenant(tenantId: string, title: string, body: string, url: string): Promise<void>
   - Ambil semua push_subscriptions milik tenant_id dengan subscription_type = 'dashboard'
   - Untuk tiap subscription, gunakan library web-push untuk kirim notifikasi:
     
     import webpush from 'web-push';
     webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
     await webpush.sendNotification(subscription, JSON.stringify({ title, body, url }));
   
   - WAJIB try-catch per subscription (satu gagal — misal subscription sudah expired —
     jangan hentikan proses ke subscription lain)
   - Kalau error menunjukkan subscription sudah tidak valid (status code 410 Gone), hapus
     row tersebut dari push_subscriptions (self-cleaning)

3. Panggil sendPushToTenant() dari lib/actions/booking.actions.ts submitBooking() SETELAH
   booking berhasil dibuat, SEBAGAI TAMBAHAN (bukan pengganti) dari notifyTenantNewBooking()
   WA yang sudah dibuat di prompt lain. Push notification ini jalan untuk SEMUA tenant
   (termasuk Gratis), sementara WA hanya untuk Pro/Bisnis. Sama seperti WA, panggil ini
   tanpa await (fire and forget) supaya tidak memperlambat response ke customer.


## SETELAH SEMUA TASK SELESAI:

1. npm run build
2. Test manual: cara install PWA di browser desktop (Chrome: ikon install di address bar)
   dan di HP (Android: "Add to Home Screen"), cara test push notification muncul saat ada
   booking baru masuk
3. JANGAN push dulu
4. Summary: file yang dibuat/diubah, VAPID keys yang di-generate (untuk saya tambahkan ke
   env vars), cara test manual tiap bagian
```

