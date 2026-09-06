ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
