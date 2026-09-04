-- Migration: 00006_add_reminder_sent.sql
-- Description: Add reminder_sent column to bookings table and index for fast querying

-- 1. Add reminder_sent column (default false)
ALTER TABLE public.bookings
ADD COLUMN reminder_sent BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Create index to optimize cron job query that looks for unreminded approved bookings tomorrow
CREATE INDEX idx_bookings_reminder_cron 
ON public.bookings (booking_date, payment_status, reminder_sent);
