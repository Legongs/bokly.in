# Server Logic & Security Guidelines (bukly.id)

## 1. RSC-First Approach
- Utamakan penggunaan **React Server Components (RSC)** dan **Server Actions**.
- Pemanggilan data (*Data Fetching*) ke Supabase harus dilakukan secara aman dari lapisan komponen server.
- Penggunaan direktif `'use client'` hanya diizinkan secara selektif dan ketat pada komponen pinggiran (*leaf components*) yang mengurus interaktivitas UI langsung, seperti formulir input, animasi, state, atau perantara event.

## 2. Aturan Mutlak Kalkulasi Slot & Mencegah Race Condition
- **Atomic Database-Level Logic**: Memastikan ketersediaan slot jam dan menyimpannya WAJIB dilakukan melalui satu kesatuan transaksi atomik di level basis data. (Gunakan PostgreSQL Function/RPC via Supabase).
- Dilarang keras melakukan pengecekan `SELECT count(*)` lalu mengeksekusi `INSERT` di lapisan aplikasi Node.js/Next.js secara terpisah. Praktik ini rawan eksploitasi *double-booking* (*race condition*) apabila banyak klien menekan tombol booking di milidetik yang sama.

## 3. Aturan Mutlak Zona Waktu (Timezone Validation)
- Seluruh pembacaan waktu, validasi ketersediaan tanggal, dan batas kedaluwarsa **WAJIB** merujuk pada referensi zona waktu milik tenant (`tenant.timezone`), bukan waktu server *hosting* (UTC) maupun waktu lokal peramban peranti klien.
- Gunakan pustaka pengelolaan tanggal pendukung jika diperlukan (seperti `date-fns-tz` atau `dayjs` dengan *timezone plugin*) saat melakukan parsing waktu di *Server Action*.

## 4. Penanganan Galat Backend yang Aman (Backend Error Handling)
- **Zero Exposed Stack Trace**: Segala *exception*, pesan galat bawaan PostgreSQL, atau informasi tumpukan fungsi (*stack traces*) yang terjadi di sisi peladen TIDAK BOLEH dibocorkan kembali ke klien. 
- Harus selalu dibungkus menggunakan blok `try-catch`. Berikan balikan (UI Error) berupa pesan generik yang aman (contoh: "Terjadi gangguan sistem saat mengamankan slot, silakan coba lagi beberapa saat.") 
- **Zod Enforcement**: Semua data payload di Server Action yang berasal dari form atau antarmuka *client* wajib terlebih dulu dievaluasi keabsahannya via Zod sebelum masuk ke logika fungsi.
- **Sanitasi XSS Defensif**: Data teks opsional seperti `notes` dari klien wajib dibersihkan (*sanitized*) dari tag skrip berbahaya untuk perlindungan *Cross-Site Scripting* (XSS) sebelum disimpan.
