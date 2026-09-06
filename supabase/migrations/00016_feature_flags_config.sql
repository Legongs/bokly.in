-- ============================================================
-- Migration 00016: Feature Flags Dinamis & Konfigurasi Fonnte Global
-- ============================================================
-- Tidak ada tabel baru. Tabel app_settings (id text PK, value jsonb) sudah
-- generic, jadi cukup nambah dua row config + benerin RLS-nya.
--
-- Row yang dipakai:
--   'feature_flags_config' -> batas & fitur tiap paket (Gratis/Pro/Bisnis)
--   'global_fonnte_config' -> token Fonnte MILIK DEVELOPER (bukan tenant)
--
-- CATATAN KEAMANAN:
-- global_fonnte_config sengaja TIDAK diberi policy SELECT apa pun. Isinya
-- token berbayar milik developer, jadi cuma service role (createAdminClient)
-- yang boleh baca. Kalau nanti ada yang bikin policy "public read all" di
-- app_settings, token ini bocor — jangan sampai kejadian.

-- ── 1. Feature flags boleh dibaca publik ─────────────────────────────────────
-- Isinya bukan rahasia (batas booking, jumlah staf, fitur mana yang nyala) dan
-- dibutuhkan halaman harga publik + pengecekan fitur dari sisi tenant.
DROP POLICY IF EXISTS "Public can read feature_flags_config" ON public.app_settings;
CREATE POLICY "Public can read feature_flags_config"
  ON public.app_settings FOR SELECT
  USING (id = 'feature_flags_config');

-- ── 2. Seed default feature flags ────────────────────────────────────────────
-- HARUS sama persis dengan DEFAULT_FEATURE_FLAGS di lib/subscription.ts.
-- Konvensi: null = unlimited (JSON nggak punya Infinity).
INSERT INTO public.app_settings (id, value)
VALUES (
  'feature_flags_config',
  '{
    "free": {
      "maxBookingsPerMonth": 30,
      "maxServices": 3,
      "maxStaff": 1,
      "hasReminders": false,
      "hasAnalytics": false,
      "hasLogoUpload": false,
      "hasRemoveBranding": false,
      "hasAutoWaReminder": false,
      "hasAutoWaNewBookingAlert": false,
      "supportLevel": "community"
    },
    "pro": {
      "maxBookingsPerMonth": null,
      "maxServices": null,
      "maxStaff": 5,
      "hasReminders": true,
      "hasAnalytics": true,
      "hasLogoUpload": true,
      "hasRemoveBranding": false,
      "hasAutoWaReminder": true,
      "hasAutoWaNewBookingAlert": true,
      "supportLevel": "email"
    },
    "bisnis": {
      "maxBookingsPerMonth": null,
      "maxServices": null,
      "maxStaff": null,
      "hasReminders": true,
      "hasAnalytics": true,
      "hasLogoUpload": true,
      "hasRemoveBranding": true,
      "hasAutoWaReminder": true,
      "hasAutoWaNewBookingAlert": true,
      "supportLevel": "whatsapp"
    }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ── 3. Seed konfigurasi Fonnte global (kosong) ───────────────────────────────
-- Diisi lewat panel superadmin, bukan di SQL, supaya token nggak nyangkut di
-- riwayat migration/git.
INSERT INTO public.app_settings (id, value)
VALUES (
  'global_fonnte_config',
  '{
    "apiKey": "",
    "isEnabled": false
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
