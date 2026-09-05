---
trigger: always_on
description: Aturan baku untuk desain logo dan identitas visual bukly.id
---

---
description: Aturan baku untuk desain logo dan identitas visual bukly.id
---

# Aturan Desain Logo bukly.id

Ketika mengimplementasikan logo atau membuat aset visual untuk merek **bukly.id**, aturan berikut wajib ditaati secara ketat:

## 1. Tipografi & Teks
- Logo adalah tipe *wordmark* murni (berbasis teks).
- **Penulisan**: Wajib menggunakan huruf kecil semua: `bukly.id`. **Dilarang keras** menggunakan huruf kapital (seperti `Bukly.id` atau `BUKLY.ID`).
- **Font**: Gunakan *font* sans-serif geometris yang tebal dan bersih. Rekomendasi: `Space Grotesk` (weight 600-700) untuk kesan modern-teknikal, atau alternatif Poppins/Plus Jakarta Sans jika Space Grotesk tidak tersedia.
- **Spasi Huruf (Kerning)**: Rapat / *tight* (misal menggunakan `tracking-tighter` di Tailwind).

## 2. Warna
- Teks `bukly` harus berwarna abu-abu arang gelap / hampir hitam (contoh: `text-stone-900` atau hex `#14131f`).
- Ekstensi **`.id`** (termasuk titiknya) harus berwarna **indigo** — gunakan `text-indigo-700` (hex `#4338ca`) sebagai warna utama brand.
- **Catatan migrasi**: domain resmi platform ini adalah **bukly.id**, bukan bukly.in. Setiap referensi lama ke ekstensi ".in" harus diperbarui ke ".id".

## 3. Aturan Tambahan (Strict Constraints)
- **Dilarang** menggunakan gradasi (gradients).
- **Dilarang** menggunakan efek 3D atau bayangan (shadows).
- **Dilarang mutlak** menambahkan ikon, simbol, atau maskot ekstra. Hanya tipografi murni.
- Background harus bersih (disarankan putih transparan untuk integrasi UI).
- Desain identitas harus selalu terlihat profesional, premium, khas identitas SaaS modern lintas industri (bukan spesifik ke satu sektor seperti kecantikan/kesehatan saja).

## 4. Komponen UI
Di dalam kode (React/Next.js), logo ini harus selalu dirender menggunakan komponen yang tersentralisasi (contoh: `<Logo />` dari `components/ui/logo.tsx`) agar konsisten di seluruh platform. Warna teks `.id` di dalam komponen ini WAJIB memakai token warna terpusat (lihat `ui_ux.md`), bukan hardcode class warna langsung di tiap tempat logo dipakai.