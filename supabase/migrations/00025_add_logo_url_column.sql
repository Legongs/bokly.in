-- supabase/migrations/00025_add_logo_url_column.sql
-- Purpose: Officially document logo_url column
-- yang sebelumnya sudah ada di production tapi tidak tercatat di migration history

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;
