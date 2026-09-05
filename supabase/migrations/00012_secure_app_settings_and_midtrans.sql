-- ============================================================
-- Migration 00012: Memperketat Keamanan app_settings & Midtrans
-- ============================================================

-- 1. Hapus policy lama yang mengizinkan akses publik ke seluruh tabel
DROP POLICY IF EXISTS "Public can read app_settings" ON public.app_settings;

-- 2. Buat policy baru yang hanya mengizinkan akses ke data tertentu (pricing_config)
CREATE POLICY "Public can read pricing_config"
  ON public.app_settings FOR SELECT
  USING (id = 'pricing_config');

-- (Service Role otomatis membypass ini jadi backend superadmin tetap bisa membaca semuanya)

-- 3. Masukkan default konfigurasi Midtrans (rahasia) jika belum ada
INSERT INTO public.app_settings (id, value)
VALUES (
  'midtrans_config',
  '{
    "serverKey": "",
    "clientKey": "",
    "isProduction": false
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
