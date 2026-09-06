-- supabase/migrations/00022_add_business_sector_column.sql
-- Purpose: Officially document business_sector column & enum type
-- yang sebelumnya sudah ada di production tapi tidak tercatat di migration history

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_sector_enum') THEN
    CREATE TYPE public.business_sector_enum AS ENUM ('beauty', 'space', 'auto', 'health');
  END IF;
END $$;

ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS business_sector public.business_sector_enum DEFAULT 'beauty';

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS template_id text NOT NULL DEFAULT 'basic';

COMMENT ON COLUMN public.tenants.business_sector IS 
  'Type usaha: beauty (salon/lash/nail), space (futsal/studio/coworking), auto (bengkel/detailing), health (klinik)';

CREATE INDEX IF NOT EXISTS idx_tenants_business_sector ON public.tenants(business_sector);
