-- Migration to add `manage_token` and `manage_token_expires_at` for secure customer portal access
-- Ensures that existing bookings also get a unique token

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS manage_token UUID DEFAULT gen_random_uuid() NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'bookings_manage_token_key'
    ) THEN
        ALTER TABLE public.bookings
        ADD CONSTRAINT bookings_manage_token_key UNIQUE (manage_token);
    END IF;
END $$;

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS manage_token_expires_at TIMESTAMPTZ;

-- Update existing bookings to have expiration (e.g. booking_date + 30 days)
UPDATE public.bookings 
SET manage_token_expires_at = (booking_date::date + interval '30 days');
