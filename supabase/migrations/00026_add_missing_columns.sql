-- supabase/migrations/00026_add_missing_columns.sql
-- Purpose: Add missing columns that are used in the codebase but missing in production

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS dp_amount NUMERIC;
