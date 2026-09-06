-- supabase/migrations/00024_add_service_meta_fields.sql

ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS specialty_tag TEXT; 
-- e.g., "Lash Extension Specialist", "Gel Nail Expert", "Hair Color Master"

ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS is_female_only BOOLEAN DEFAULT false;
-- Salon khusus wanita

ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS service_category TEXT DEFAULT 'standard';
-- Grouping: 'basic', 'premium', 'expert' (untuk display di storefront)

-- Add comments
COMMENT ON COLUMN public.services.specialty_tag IS 'Keahlian khusus staff/service untuk beauty sector';
COMMENT ON COLUMN public.services.is_female_only IS 'Apakah service ini hanya untuk wanita';
COMMENT ON COLUMN public.services.service_category IS 'Kategori layanan untuk grouping di storefront';

-- Create index untuk faster query
CREATE INDEX IF NOT EXISTS idx_services_is_female_only ON public.services(is_female_only);
CREATE INDEX IF NOT EXISTS idx_services_service_category ON public.services(service_category);
