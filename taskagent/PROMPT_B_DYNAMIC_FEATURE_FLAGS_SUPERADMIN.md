# PROMPT B — FEATURE FLAGS DINAMIS & KONFIGURASI FONNTE GLOBAL DI SUPERADMIN

Copy-paste seluruh blok di bawah ini ke Antigravity. Kerjakan SETELAH Prompt A selesai.

---

```
CARA KERJA KAMU DI TASK INI:

1. Baca dulu lib/subscription.ts secara keseluruhan — di situ ada PLAN_LIMITS yang HARDCODE
   di kode (bentuknya object TypeScript). Task ini akan memindahkan sumber kebenaran (source
   of truth) dari hardcode itu ke database, supaya bisa diubah tanpa deploy ulang kode.
2. Baca juga lib/actions/superadmin.actions.ts, khususnya fungsi updatePricingConfig dan
   updateMidtransConfig — ini pola yang HARUS kamu ikuti persis untuk fitur baru di task ini
   (simpan ke tabel app_settings dengan id tertentu, ada fallback ke default kalau belum di-set).
3. JANGAN hapus PLAN_LIMITS yang ada di lib/subscription.ts — jadikan itu FALLBACK DEFAULT
   kalau konfigurasi di database belum di-set sama sekali. Ini penting supaya sistem tidak
   pernah crash gara-gara app_settings kosong.
4. Kerjakan bertahap per TASK, jalankan build di antaranya.


## LATAR BELAKANG

Sekarang, batasan tiap paket (Gratis/Pro/Bisnis) — jumlah booking, jumlah staff, fitur mana
yang aktif — semuanya tertulis hardcode di kode (PLAN_LIMITS). Developer platform (pemilik
bukly.id) ingin bisa MENGUBAH aturan ini kapan saja lewat panel superadmin, TANPA harus minta
tolong programmer untuk edit kode dan deploy ulang. Contoh: kalau developer mau paket Pro
tadinya cuma dapat "analytics" jadi ditambah "reminder WA", itu harus bisa diubah lewat
toggle di superadmin, bukan edit file.

Selain itu, developer ingin menyediakan fitur WA otomatis (reminder, notifikasi booking baru
ke tenant) sebagai fitur berbayar untuk paket Pro & Bisnis, TAPI biaya kirim pesannya
(Fonnte) DITANGGUNG DEVELOPER PLATFORM, bukan tenant. Jadi butuh SATU akun/token Fonnte
milik developer yang dipakai untuk SEMUA tenant Pro/Bisnis, terpisah dari wa_api_key yang
sudah ada di tabel tenants (itu punya masing-masing tenant untuk kebutuhan mereka sendiri,
TIDAK BOLEH DICAMPUR dengan token developer).


## TASK 1: Migration — Tabel Konfigurasi

Buat file baru: supabase/migrations/00016_feature_flags_config.sql

Tidak perlu tabel baru — kita pakai tabel app_settings yang SUDAH ADA (cek strukturnya di
migration sebelumnya atau di kode updatePricingConfig, biasanya kolomnya id + value jsonb).
Cukup pastikan tabel ini bisa menyimpan row dengan id = 'feature_flags_config' dan
id = 'global_fonnte_config'. Kalau app_settings sudah generic (id text, value jsonb), tidak
perlu migration schema baru sama sekali — cukup pastikan RLS-nya benar (hanya superadmin/
service role yang bisa insert/update, tapi tenant biasa perlu bisa SELECT/read untuk keperluan
cek fitur mereka sendiri lewat server action, jadi baca policy yang ada dulu).


## TASK 2: Struktur Data Feature Flags

Definisikan struktur berikut (simpan sebagai TypeScript type, taruh di lib/subscription.ts):

type FeatureFlagsConfig = {
  free: PlanConfig;
  pro: PlanConfig;
  bisnis: PlanConfig;
};

type PlanConfig = {
  maxBookingsPerMonth: number | null; // null artinya unlimited
  maxServices: number | null;
  maxStaff: number | null;
  hasReminders: boolean;
  hasAnalytics: boolean;
  hasLogoUpload: boolean;
  hasRemoveBranding: boolean;
  hasAutoWaReminder: boolean;      // BARU — reminder H-1/H-2/H-3 otomatis
  hasAutoWaNewBookingAlert: boolean; // BARU — notif WA ke tenant saat ada booking baru
  supportLevel: 'community' | 'email' | 'whatsapp';
};

Nilai default (dipakai sebagai fallback kalau app_settings belum diisi) SAMA PERSIS dengan
PLAN_LIMITS yang sudah ada sekarang, ditambah dua field baru (hasAutoWaReminder dan
hasAutoWaNewBookingAlert) yang defaultnya: false untuk free, true untuk pro, true untuk bisnis.


## TASK 3: Fungsi Baca Konfigurasi Dinamis

Di lib/subscription.ts, buat fungsi baru:

async function getFeatureFlagsConfig(): Promise<FeatureFlagsConfig> {
  // Ambil dari app_settings id='feature_flags_config'
  // Kalau tidak ada / error, return DEFAULT_FEATURE_FLAGS (hardcode fallback, isinya
  // sama seperti PLAN_LIMITS yang sudah ada + 2 field baru)
}

Lalu UBAH fungsi getPlanLimits() dan canPerformAction() yang sudah ada supaya mereka
memanggil getFeatureFlagsConfig() ini untuk ambil batasan/fitur, BUKAN lagi langsung
membaca object PLAN_LIMITS yang hardcode. Tapi tetap simpan PLAN_LIMITS sebagai
DEFAULT_FEATURE_FLAGS (rename variabelnya kalau perlu, jangan hapus isinya).

Tambahkan juga fungsi baru:

export async function canUseAutoWaFeature(
  tenantId: string,
  feature: "reminder" | "new_booking_alert"
): Promise<boolean> {
  // Ambil plan tenant (pakai getTenantSubscription yang sudah ada)
  // Ambil feature flags config
  // Return true/false sesuai plan tenant dan feature yang diminta
}


## TASK 4: Fungsi Konfigurasi Fonnte Global (Milik Developer)

Buat file baru: lib/global-wa.ts

export interface GlobalFonnteConfig {
  apiKey: string;
  isEnabled: boolean; // saklar utama, kalau developer mau matikan semua WA otomatis sementara
}

export async function getGlobalFonnteConfig(): Promise<GlobalFonnteConfig> {
  // Ambil dari app_settings id='global_fonnte_config', pola sama seperti getMidtransConfig()
  // di lib/midtrans.ts — CONTOH FILE INI, IKUTI POLANYA PERSIS
  // Default kalau belum diset: { apiKey: "", isEnabled: false }
}


## TASK 5: Server Actions Superadmin Baru

Tambahkan ke lib/actions/superadmin.actions.ts (JANGAN buat file baru, tambahkan ke file
yang sudah ada supaya konsisten dengan pola verifySuperAdmin() yang sudah dipakai semua
fungsi di file itu):

1. getFeatureFlagsConfig() — return config sekarang (untuk ditampilkan di form superadmin)
   Panggil verifySuperAdmin() dulu di awal seperti fungsi lain di file ini.

2. updateFeatureFlagsConfig(config: FeatureFlagsConfig): Promise<ActionResponse<null>>
   — simpan ke app_settings id='feature_flags_config', ikuti pola persis
   updatePricingConfig() yang sudah ada (upsert, revalidatePath("/superadmin"))

3. getGlobalFonnteConfig() — return config Fonnte sekarang (JANGAN kembalikan apiKey penuh
   ke client kalau sudah ada isinya — mask sebagian, contoh tampilkan cuma 4 karakter terakhir,
   supaya tidak ke-expose percuma di Network tab browser. Kalau field kosong/belum diisi,
   kembalikan string kosong)

4. updateGlobalFonnteConfig(config: GlobalFonnteConfig): Promise<ActionResponse<null>>
   — simpan ke app_settings id='global_fonnte_config', ikuti pola updateMidtransConfig()


## TASK 6: UI Superadmin

Cari file UI superadmin yang sudah ada (kemungkinan app/superadmin/pricing-settings.tsx atau
app/superadmin/superadmin-client.tsx berdasarkan struktur project). Tambahkan section/tab baru:

1. Tab "Feature Flags" — tabel/matrix dengan:
   - Baris = tiap fitur (Reminder WA, Analytics, Upload Logo, Hapus Branding, Reminder WA
     Otomatis, Notif Booking Baru Otomatis, dst)
   - Kolom = Gratis / Pro / Bisnis
   - Isi sel = toggle switch (untuk boolean) atau input angka (untuk maxBookingsPerMonth,
     maxServices, maxStaff — kasih opsi checkbox "Unlimited" yang kalau dicentang set value
     jadi null)
   - Tombol "Simpan Perubahan" yang panggil updateFeatureFlagsConfig()
   - Ikuti style Tailwind + komponen yang SUDAH DIPAKAI di superadmin (jangan bikin gaya baru,
     cek dulu komponen button/table/switch apa yang sudah ada di project ini, misal dari
     shadcn/ui kalau memang dipakai)

2. Tab/Section "Konfigurasi WA Otomatis" — form dengan:
   - Input text/password untuk API Key Fonnte (global, milik developer)
   - Toggle "Aktifkan Notifikasi WA Otomatis" (isEnabled)
   - Keterangan kecil di bawah form: "Ini akun Fonnte milik developer platform. Biaya
     pengiriman pesan otomatis (reminder & notifikasi booking) ditanggung platform, dipakai
     untuk tenant paket Pro dan Bisnis. Terpisah dari WA API Key milik masing-masing tenant."
   - Tombol "Simpan" yang panggil updateGlobalFonnteConfig()


## SETELAH SEMUA TASK SELESAI:

1. npm run build, pastikan tidak ada error
2. Test manual: buka superadmin, ubah salah satu toggle fitur (misal matikan analytics untuk
   Pro), lalu cek dari sisi tenant Pro apakah analytics benar-benar tidak bisa diakses lagi
3. JANGAN push dulu
4. Summary: file yang dibuat/diubah, cara test manual tiap bagian, dan konfirmasi bahwa
   PLAN_LIMITS lama masih berfungsi sebagai fallback (coba hapus/kosongkan data app_settings
   feature_flags_config dan pastikan sistem tidak error, otomatis balik ke default)
```

