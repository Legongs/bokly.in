-- 1. Buat tipe ENUM baru untuk sektor bisnis
CREATE TYPE public.business_sector_enum AS ENUM ('beauty', 'space', 'auto', 'health');

-- 2. Tambahkan kolom business_sector dan template_id ke tabel tenants
ALTER TABLE public.tenants
ADD COLUMN business_sector public.business_sector_enum,
ADD COLUMN template_id text NOT NULL DEFAULT 'basic';
