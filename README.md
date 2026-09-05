# bukly.id

[bukly.id](https://bukly.id) adalah platform SaaS *multi-tenant* yang memungkinkan UMKM jasa di Indonesia (seperti Barbershop, Salon, Bengkel, dan Klinik) untuk membuat halaman *booking* online otomatis mereka sendiri dalam hitungan menit.

Tidak perlu *coding*, dan tidak perlu instal aplikasi. Pelanggan bisa melakukan reservasi langsung dari *browser* dengan sistem manajemen jadwal *anti-bentrok*.

## Tech Stack
- **Framework:** Next.js 16 (App Router) dengan Turbopack
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 & class-variance-authority (cva)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Auth, Storage)
- **Validation:** Zod
- **Icons:** Lucide React
- **Payments:** Midtrans (Sandbox/Production)
- **Error Tracking:** Sentry (Opsional)

## Persyaratan Sistem
Pastikan kamu telah menginstal:
- [Node.js](https://nodejs.org/en/) (Disarankan versi 20 LTS atau terbaru)
- [npm](https://www.npmjs.com/)
- (Opsional) [Supabase CLI](https://supabase.com/docs/guides/cli) jika kamu ingin menjalankan *database* secara lokal atau melakukan sinkronisasi *migration*.

## Cara Menjalankan Lokal (Development)

1. **Clone Repositori**
   ```bash
   git clone <URL_REPO_INI>
   cd buklyin
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   - Salin file `.env.example` menjadi `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Buka `.env.local` dan isi kredensial Supabase, Midtrans, dan kunci SSO Google milikmu (atau minta akses *linked project* dari tim).
   - Masukkan email pribadimu di `SUPERADMIN_EMAIL` untuk mengakses halaman `/superadmin`.

4. **Jalankan *Development Server***
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000).

## Panduan Arsitektur
Sebelum melakukan kontribusi, sangat disarankan untuk membaca pedoman arsitektur yang kami terapkan secara ketat:
- [Backend & Security (docs/backend.md)](docs/backend.md)
- [Database Schema & Migration (docs/db_schema.md)](docs/db_schema.md)
- [UI/UX & Copywriting (docs/ui_ux.md)](docs/ui_ux.md)

## Lisensi
Hak Cipta (c) bukly.id. Seluruh hak dilindungi.
