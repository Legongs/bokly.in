-- supabase/migrations/00022_add_business_sector_column.sql
-- Purpose: Officially add business_sector column to tenants table
-- This column was used in code tapi nggak ada di migration history

ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS business_sector TEXT 
DEFAULT 'beauty' 
CHECK (business_sector IN ('beauty', 'space', 'auto', 'health'));

-- Add comment untuk clarity di database
COMMENT ON COLUMN public.tenants.business_sector IS 
  'Type usaha: beauty (salon/lash/nail), space (futsal/studio/coworking), auto (bengkel/detailing), health (klinik)';

-- Create index untuk faster filtering
CREATE INDEX IF NOT EXISTS idx_tenants_business_sector ON public.tenants(business_sector);
