---
description: Aturan baku untuk desain logo dan identitas visual bukly.id
---

# Aturan Desain Logo bukly.id

Ketika mengimplementasikan logo atau membuat aset visual untuk merek **bukly.id**, aturan berikut wajib ditaati secara ketat:

## 1. Tipografi & Teks
- Logo adalah tipe *wordmark* murni (berbasis teks).
- **Penulisan**: Wajib menggunakan huruf kecil semua: `bukly.id`. **Dilarang keras** menggunakan huruf kapital (seperti `Bukly.id` atau `BUKLY.ID`).
- **Font**: Gunakan *font* sans-serif geometris yang sangat tebal dan bersih (seperti Poppins, Plus Jakarta Sans, atau `font-extrabold` bawaan Tailwind).
- **Spasi Huruf (Kerning)**: Rapat / *tight* (misal menggunakan `tracking-tighter` di Tailwind).

## 2. Warna
- Teks `bukly` harus berwarna abu-abu arang gelap / hampir hitam (contoh: `text-stone-900`).
- Ekstensi `.in` (termasuk titiknya) harus berwarna *vibrant dark teal/tosca green* (contoh: `text-teal-600`).

## 3. Aturan Tambahan (Strict Constraints)
- **Dilarang** menggunakan gradasi (gradients).
- **Dilarang** menggunakan efek 3D atau bayangan (shadows).
- **Dilarang mutlak** menambahkan ikon, simbol, atau maskot ekstra. Hanya tipografi murni.
- Background harus bersih (disarankan putih transparan untuk integrasi UI).
- Desain identitas harus selalu terlihat profesional, premium, khas identitas SaaS modern.

## 4. Komponen UI
Di dalam kode (React/Next.js), logo ini harus selalu dirender menggunakan komponen yang tersentralisasi (contoh: `<Logo />` dari `components/ui/logo.tsx`) agar konsisten di seluruh platform.
