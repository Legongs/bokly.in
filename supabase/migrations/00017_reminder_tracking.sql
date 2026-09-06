-- Migration: 00017_reminder_tracking.sql
-- Description: Add granular tracking columns for H-3, H-2, H-1 automated reminders

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS reminder_h3_sent boolean DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS reminder_h2_sent boolean DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS reminder_h1_sent boolean DEFAULT false;
