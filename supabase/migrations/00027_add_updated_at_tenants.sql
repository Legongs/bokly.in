-- supabase/migrations/00027_add_updated_at_tenants.sql
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
