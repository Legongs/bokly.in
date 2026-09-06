-- ============================================================
-- Migration 00015: Durasi Fleksibel untuk Layanan (Sektor Space)
-- ============================================================
-- Tujuan: Layanan dengan is_flexible_duration = true memungkinkan
-- customer memilih durasi sendiri (kelipatan duration_step_minutes,
-- antara min dan max). Harga dihitung: price * (durasi / 60).
-- ============================================================

ALTER TABLE public.services
    ADD COLUMN IF NOT EXISTS is_flexible_duration boolean DEFAULT false;

ALTER TABLE public.services
    ADD COLUMN IF NOT EXISTS min_duration_minutes integer;

ALTER TABLE public.services
    ADD COLUMN IF NOT EXISTS max_duration_minutes integer;

-- Kelipatan durasi yang bisa dipilih (default 30 menit)
ALTER TABLE public.services
    ADD COLUMN IF NOT EXISTS duration_step_minutes integer DEFAULT 30;
