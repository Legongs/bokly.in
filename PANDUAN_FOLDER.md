# Peta Folder Proyek Bukly.id

Dokumen ini dibuat agar Anda (dan siapa saja yang melihat kode ini) bisa dengan mudah menemukan di mana letak suatu fitur atau pengaturan tanpa harus pusing dengan istilah teknis. 

Bayangkan proyek ini seperti sebuah restoran. Berikut adalah pembagian ruangannya:

---

### 1. `app/` (Ruang Tamu & Ruang Makan)
Di sinilah semua **halaman web** yang dilihat oleh orang-orang berada. Jika Anda ingin mengubah tampilan suatu halaman, carinya di sini.
- **`app/dashboard/`**: Halaman khusus untuk pemilik toko (tenant) mengelola bisnisnya (melihat transaksi, mengatur layanan, melihat testimoni).
- **`app/[tenant]/`**: Halaman toko (storefront) yang dilihat oleh pelanggan saat mau mem-booking layanan.
- **`app/(marketing)/` atau `app/page.tsx`**: Halaman depan utama Bukly.id untuk menarik calon tenant.

### 2. `components/` (Etalase Dekorasi & Perabotan)
Ini adalah kumpulan **potongan-potongan kecil tampilan** (seperti kepingan Lego). Daripada membuat tombol dari nol setiap kali butuh, kita ambil dari sini.
- **`components/ui/`**: Perabotan dasar (tombol, kotak teks, tabel, modal pop-up).
- **`components/customer/`**: Elemen khusus untuk halaman pelanggan (misal: kalender booking, form ulasan, banner promo).
- **`components/dashboard/`**: Elemen khusus untuk halaman pengelola (misal: grafik pendapatan).

### 3. `lib/` (Dapur & Ruang Mesin)
Di sinilah **semua proses berpikir dan logika** terjadi. Pelanggan tidak melihat folder ini, tapi ini yang membuat web berfungsi.
- **`lib/actions/`**: "Pelayan" yang membawa data dari web ke database (contoh: proses simpan testimoni, proses bayar, proses buat promo).
- **`lib/subscription.ts`**: Aturan paket langganan (Gratis, Pro, Bisnis) dan batas kuotanya.
- **`lib/supabase/`**: Alat koneksi ke database.

### 4. `supabase/` (Gudang Penyimpanan)
Tempat mengatur **struktur database**.
- **`supabase/migrations/`**: Catatan sejarah perubahan bentuk database (misal: hari ini kita tambah tabel Testimoni, besok kita tambah tabel Promo).

### 5. `public/` (Gudang Gambar & Brosur)
Semua aset **file mentah yang terlihat langsung** (seperti gambar logo asli, ikon, font, suara, atau file download). 

### 6. `types/` (Buku Tata Tertib & Kamus)
Berisi aturan baku tentang **bentuk data**. Ini menjaga agar programmer tidak salah ketik (misal: sistem akan protes kalau "nomor handphone" diisi dengan huruf, karena di buku kamus sudah diatur harus angka).

### 7. `hooks/` (Alat Bantu Cepat)
Pintasan (shortcut) logika ringan untuk tampilan. Misalnya, alat untuk mendeteksi apakah layar HP pengguna kecil atau besar, atau alat untuk mendeteksi apakah pengguna sedang menekan tombol tertentu.

### 8. `docs/` & `.agents/` (Catatan & Aturan Kerja)
Buku panduan internal untuk AI dan programmer agar gaya kerjanya konsisten (seperti warna logo yang harus selalu indigo, dsb).

---

**Tips Mencari File:**
- Mau ubah warna tombol di halaman booking? Cek `components/customer/`
- Mau tambah menu baru di dashboard kiri? Cek `app/dashboard/layout.tsx`
- Mau ubah logika cara pembayaran dihitung? Cek `lib/actions/payment.actions.ts` atau `booking.actions.ts`
- Mau nambah kolom baru di database? Cek `supabase/migrations/`
