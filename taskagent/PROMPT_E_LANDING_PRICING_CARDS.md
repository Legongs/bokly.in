# PROMPT E — PRICING CARDS DI LANDING PAGE

Copy-paste seluruh blok di bawah ini ke Antigravity. Task ini INDEPENDEN, paling cepat dikerjakan.

---

```
CARA KERJA KAMU DI TASK INI:

1. SEBELUM membuat komponen baru, cari dulu apakah sudah ada komponen pricing card di
   codebase ini — berdasarkan riwayat project, kemungkinan ada file
   components/dashboard/pricing-cards.tsx yang dipakai di halaman billing dashboard
   (app/dashboard/billing/page.tsx). KALAU ADA, JANGAN BUAT DARI NOL. Reuse atau adaptasi
   komponen itu untuk konteks landing page publik (kemungkinan perlu sedikit modifikasi
   props karena di landing page belum ada user yang login, jadi tombolnya beda — bukan
   "Upgrade Sekarang" tapi "Daftar Gratis" / "Pilih Paket").

2. Baca aturan desain logo yang sudah ada di rules project (warna indigo #4338ca untuk
   aksen, stone untuk base, font Space Grotesk untuk display/heading, tidak boleh pakai
   gradient atau shadow berlebihan sesuai catatan brand). Terapkan token warna yang SAMA
   di pricing card ini — JANGAN pakai warna baru yang tidak konsisten dengan sistem yang ada
   (cek juga apakah ada file token warna terpusat, disebut sebagai `ui_ux.md` di rules
   sebelumnya, atau cari di tailwind.config kalau ada custom color token).

3. Baca tone kata-kata (copywriting) yang sudah dipakai di file lain, misalnya pesan error
   di server actions ("nih", "ya", "dong" — bahasa Indonesia kasual ramah) dan landing page
   yang sudah ada. Pricing card harus konsisten dengan tone ini, JANGAN kaku/formal.


## LATAR BELAKANG

Landing page bukly.id sekarang belum menampilkan harga paket secara eksplisit ke pengunjung.
Padahal sistem pricing (Gratis/Pro/Bisnis) sudah matang di backend (ada di lib/subscription.ts,
sudah dipakai di dashboard billing). Ini perlu ditampilkan di landing page publik supaya calon
tenant bisa lihat harga sebelum daftar, mengurangi friction "harus daftar dulu baru tau harga".


## TASK 1: Ambil Data Harga Dinamis

Cari fungsi getDynamicPricing() di lib/subscription.ts (sudah ada, dipakai di billing.actions.ts
dan superadmin.actions.ts). Landing page HARUS menggunakan fungsi yang SAMA ini untuk
menampilkan harga, BUKAN hardcode angka di komponen — supaya kalau developer ubah harga lewat
superadmin (fitur pricing config yang sudah ada), landing page otomatis ikut berubah tanpa
perlu deploy ulang.


## TASK 2: Komponen Pricing Card untuk Landing Page

Buat file baru: components/landing/pricing-section.tsx (atau nama serupa, sesuaikan
konvensi penamaan folder components/landing/ yang sudah ada kalau ada)

Struktur konten (3 kartu berdampingan, responsive jadi tumpuk vertikal di mobile):

1. Kartu "Gratis"
   - Harga: Rp 0
   - Highlight: "Cocok buat coba-coba dulu"
   - List fitur (ambil dari PLAN_LIMITS/feature flags): 30 booking/bulan, 3 layanan, 1 staf
   - Tombol: "Daftar Gratis" → link ke /register

2. Kartu "Pro" (kasih visual sedikit lebih menonjol, misal border indigo lebih tebal atau
   badge kecil "Paling Populer" — TAPI jangan pakai gradient, sesuai aturan brand)
   - Harga bulanan & tahunan (toggle switch bulanan/tahunan kalau memungkinkan, ikuti pola
     yang mungkin sudah ada di pricing-cards.tsx dashboard)
   - List fitur: booking tak terbatas, 5 staf, reminder WA otomatis, analytics
   - Tombol: "Pilih Pro" → link ke /register (karena harus daftar dulu baru bisa pilih paket
     berbayar, cek alur registrasi yang sudah ada — apakah bisa langsung pilih paket saat
     daftar atau harus pilih setelah login, ikuti alur yang sudah ada)

3. Kartu "Bisnis"
   - Harga bulanan & tahunan
   - List fitur: semua fitur Pro + payment otomatis, laporan PDF, hapus branding, domain
     kustom, reminder WA H-3/H-2/H-1 lengkap
   - Tombol: "Pilih Bisnis" → link ke /register

Di bawah 3 kartu, tambahkan baris kecil: "Butuh paket khusus untuk bisnis skala besar?
Hubungi kami" dengan link WA kontak (cek nomor kontak yang sudah ada di halaman contact
yang disebut sebelumnya sudah diperbaiki emailnya).


## TASK 3: Copywriting

Tulis ulang nama fitur dari bentuk teknis (maxBookingsPerMonth, hasAnalytics) menjadi bahasa
manusia yang jelas, contoh:
- "Booking tak terbatas" (bukan "unlimited maxBookingsPerMonth")
- "Reminder WA otomatis ke pelanggan" (bukan "hasAutoWaReminder: true")
- "Laporan bulanan siap kirim" (bukan "hasPDFReports")

Judul section: buat headline yang jelas dan jujur, hindari klise seperti "Harga Terjangkau
untuk Semua!" — coba sesuatu yang lebih spesifik ke masalah nyata target user (usaha jasa
lokal: barbershop, salon, klinik kecil, dst), contoh arah: "Mulai gratis, upgrade kapan aja
kalau usahamu makin rame" (SESUAIKAN dengan tone brand yang sudah ada, ini cuma contoh arah,
bukan harus dipakai persis).


## TASK 4: Pasang di Landing Page

Cari file landing page utama (app/page.tsx berdasarkan struktur project ini) dan sisipkan
komponen PricingSection di posisi yang masuk akal secara alur baca (biasanya setelah section
fitur/benefit, sebelum FAQ atau sebelum CTA penutup — cek struktur section yang sudah ada
sekarang dan tempatkan secara natural, jangan asal taruh di paling bawah kalau ada section
lain sesudahnya yang lebih cocok jadi penutup).


## SETELAH SELESAI:

1. npm run build
2. Cek tampilan responsive (mobile, tablet, desktop)
3. JANGAN push dulu
4. Summary: file yang dibuat/diubah, screenshot atau deskripsi visual hasil akhir, dan
   konfirmasi bahwa harga yang ditampilkan benar-benar dinamis (ambil dari getDynamicPricing(),
   bukan hardcode)
```

