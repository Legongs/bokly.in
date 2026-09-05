-- ============================================================
-- Migration 00011: Tabel App Settings (Harga Dinamis) & Vouchers
-- ============================================================

-- 1. Tabel app_settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id          text PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL
);

-- Default data untuk pricing
INSERT INTO public.app_settings (id, value)
VALUES (
  'pricing_config',
  '{
    "pro": { "monthly": 49000, "yearly": 470400 },
    "bisnis": { "monthly": 119000, "yearly": 1140000 }
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 2. Tabel vouchers
CREATE TABLE IF NOT EXISTS public.vouchers (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code            text NOT NULL UNIQUE,
  discount_type   text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value  integer NOT NULL,
  max_uses        integer, -- null = unlimited
  current_uses    integer DEFAULT 0 NOT NULL,
  valid_from      timestamptz DEFAULT now() NOT NULL,
  valid_until     timestamptz, -- null = never expires
  is_active       boolean DEFAULT true NOT NULL,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

-- Bikin uppercase constraint (lewat trigger atau check, tapi kita handle di app level. Tambah index saja).
CREATE UNIQUE INDEX IF NOT EXISTS idx_vouchers_code_upper ON public.vouchers(upper(code));

-- 3. Tambahkan voucher_id ke billing_intents
ALTER TABLE public.billing_intents 
ADD COLUMN IF NOT EXISTS voucher_id uuid REFERENCES public.vouchers(id) ON DELETE SET NULL;

-- 4. RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- Semua orang (anon/auth) bisa baca app_settings (untuk tau harga)
CREATE POLICY "Public can read app_settings"
  ON public.app_settings FOR SELECT
  USING (true);

-- Hanya Superadmin (service_role atau bypass dari app) yang bisa ubah app_settings
-- (Di supabase kita pakai admin client dari server, jadi RLS bypass jalan otomatis).

-- Semua user (auth) bisa baca voucher aktif untuk di-apply
CREATE POLICY "Authenticated users can read active vouchers"
  ON public.vouchers FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert/Update/Delete voucher akan dilakukan via server admin client (bypassing RLS).
