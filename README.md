# bukly.in
Aplikasi reservasi online gratis untuk Barbershop, Salon, Klinik, Bengkel, dan UMKM Jasa Indonesia. Buat halaman booking dalam 1 menit tanpa coding.

## Features
- **Halaman booking unik per usaha** (misal: bukly.in/salon-siska)
- **Notifikasi otomatis ke WhatsApp** (menggunakan integrasi Fonnte)
- **Dashboard manajemen jadwal** (real-time slot locking)
- **Analytics Dashboard** (pendapatan bulanan, layanan terlaris)
- **Portfolio Gallery**

## Tech Stack
- Next.js 14+ (App Router)
- Tailwind CSS
- Supabase (Database & Auth & Storage)
- Fonnte API (WhatsApp Gateway)

## Local Development

```bash
npm install
npm run dev
```

Pastikan kamu memiliki file `.env.local` yang berisi kredensial Supabase dan Fonnte API.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Fonnte API Key (jika menggunakan central bot)
FONNTE_API_KEY=your_fonnte_api_key
```

## Production Deployment
Proyek ini dikonfigurasi untuk berjalan mulus di Vercel. Pastikan memindahkan environment variables ke project settings di Vercel sebelum deploy.
