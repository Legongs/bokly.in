-- ============================================================================
-- Migration: 00010_rename_bucket_to_buklyid.sql
-- Description: Rename storage bucket "buklyin-media" to "buklyid-media"
--              and update all associated RLS policies.
-- ============================================================================

-- 1. Ubah id dan name dari bucket itu sendiri
UPDATE storage.buckets 
SET id = 'buklyid-media', name = 'buklyid-media' 
WHERE id IN ('buklyin-media', 'maubookingin-media');

-- 2. Ubah bucket_id pada semua file (objects) yang sudah ada di dalamnya
UPDATE storage.objects 
SET bucket_id = 'buklyid-media' 
WHERE bucket_id IN ('buklyin-media', 'maubookingin-media');
