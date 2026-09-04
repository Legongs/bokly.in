# Database Schema & Rules (maubooking.in)

Selalu patuhi aturan skema pangkalan data dan praktik keamanan Supabase di bawah ini saat memodifikasi entitas basis data.

## 1. Schema Utama di Supabase

### Tabel `tenants`
Tabel ini memegang entitas organisasi atau penyedia jasa.
- `id` (uuid, Primary Key)
- `slug` (text, UNIQUE Constraint, NOT NULL) — Digunakan untuk rute URL toko.
- `business_name` (text)
- `business_sector` (enum: 'beauty', 'space', 'auto', 'health') — WAJIB disertakan.
- `whatsapp_number` (text)
- `telegram_chat_id` (text, nullable)
- `qris_image_url` (text, nullable)
- `template_id` (text, default 'basic') — WAJIB disertakan.
- `timezone` (text, default 'Asia/Jakarta') — WAJIB disertakan.
- `is_active` (boolean, default true)
- `created_at` (timestamp)

### Tabel `services`
Tabel ini memuat ragam layanan yang ditawarkan tenant.
- `id` (uuid, Primary Key)
- `tenant_id` (uuid, Foreign Key -> tenants.id)
- `name` (text)
- `duration_minutes` (integer)
- `price` (numeric)
- `dp_amount` (numeric, default 0)
- `buffer_minutes` (integer) — Waktu jeda pasca layanan untuk persiapan jadwal selanjutnya. WAJIB disertakan.
- `max_capacity` (integer) — Kapasitas maksimal pelanggan pada slot waktu yang sama. WAJIB disertakan.

### Tabel `bookings`
Tabel ini mencatat seluruh reservasi yang masuk.
- `id` (uuid, Primary Key)
- `tenant_id` (uuid, Foreign Key -> tenants.id)
- `service_id` (uuid, Foreign Key -> services.id)
- `customer_name` (text)
- `customer_wa` (text)
- `booking_date` (date)
- `start_time` (time)
- `end_time` (time)
- `payment_status` (enum: 'pending', 'approved', 'rejected')
- `proof_url` (text, nullable)
- `created_at` (timestamp)

## 2. Praktik Kueri & Relasi
- Gunakan `@supabase/ssr` SDK dan hindari penyambungan teks kueri (*string concatenation*) secara manual untuk perlindungan dari Injeksi SQL.
- Seluruh relasi antar tabel (Foreign Keys) wajib diawasi oleh Supabase Row Level Security (RLS). 

## 3. Storage Rules
- Pengunggahan berkas bukti (*proof_url* atau *qris_image_url*) ke Storage Bucket Supabase wajib memiliki proteksi RLS dan ukuran berkas maksimal 2MB dengan ekstensi gambar tervalidasi.
- Nama berkas (file name) tidak boleh menggunakan nama asli pengguna, melainkan harus diganti menggunakan format UUID (contoh: `uuidv4() + .jpg`).
