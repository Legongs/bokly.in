# Setup Panduan: WhatsApp Reminder Otomatis H-1 (Cron Job)

Fitur ini menggunakan Supabase Edge Functions dan *pg_cron* untuk mengirimkan notifikasi H-1 secara otomatis kepada pelanggan dan admin tenant setiap pukul 09.00 WIB (02:00 UTC) tanpa campur tangan manusia.

## 1. Pastikan Migration Sudah Ter-Push

Jalankan perintah ini di terminal Anda untuk memastikan kolom `reminder_sent` dan indeks database masuk ke *cloud*:
```bash
npx supabase db push
```

## 2. Atur Environment Secrets di Supabase

Fungsi Edge ini membutuhkan kunci autentikasi khusus agar tidak bisa ditembak sembarangan oleh pihak luar. Setel *secrets* ini ke proyek Supabase cloud Anda:

```bash
npx supabase secrets set CRON_SECRET=your_super_secret_cron_string
npx supabase secrets set FONNTE_TOKEN=your_global_fonnte_api_key_here
```
> [!TIP]
> Jika *tenant* Anda sudah mengisi Fonnte API Key di *Dashboard* (yang tersimpan di tabel `tenants.wa_api_key`), maka fungsi ini akan otomatis memprioritaskan kunci milik *tenant* tersebut. `FONNTE_TOKEN` *global* ini hanya akan digunakan sebagai cadangan/fallback.

## 3. Deploy Edge Function

Gunakan CLI untuk mengunggah dan mengaktifkan Edge Function ke server Supabase:

```bash
npx supabase functions deploy send-booking-reminders --no-verify-jwt
```
*(Flag `--no-verify-jwt` selaras dengan konfigurasi `verify_jwt = false` di `supabase/config.toml`)*.

## 4. Aktifkan Cron Job di Database

Setelah fungsi berjalan, Anda perlu mengatur jadwal agar fungsi dipanggil setiap hari jam 09.00 WIB (Asia/Jakarta, setara dengan jam 02:00 UTC).

Buka **SQL Editor** di Supabase Dashboard, lalu jalankan kueri berikut:

```sql
SELECT cron.schedule(
  'booking-reminder-cron', -- Nama identifier cron job
  '0 2 * * *',             -- Menit 0, Jam 2 UTC (Pukul 09.00 WIB)
  $$
    SELECT net.http_post(
      url:='https://[PROJECT_REF].supabase.co/functions/v1/send-booking-reminders',
      headers:='{"Authorization": "Bearer your_super_secret_cron_string"}'::jsonb,
      body:='{}'::jsonb,
      timeout_milliseconds:=10000
    );
  $$
);
```

> [!WARNING]
> Ganti `[PROJECT_REF]` dengan *Reference ID* proyek Supabase Anda dan pastikan `your_super_secret_cron_string` **benar-benar sama** dengan nilai rahasia `CRON_SECRET` yang Anda atur di langkah ke-2!

## 5. (Opsional) Uji Coba Secara Manual

Jika Anda ingin melihat apakah fungsinya bekerja sebelum Cron Job memicunya, Anda bisa menggunakan `curl` atau aplikasi seperti Postman untuk memanggilnya:

```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/send-booking-reminders \
  -H "Authorization: Bearer your_super_secret_cron_string" \
  -H "Content-Type: application/json"
```

Jika tidak ada jadwal hari esok, _response_-nya akan berupa `{"sent":0,"failed":0,"skipped":0,"message":"No bookings to remind"}`.
