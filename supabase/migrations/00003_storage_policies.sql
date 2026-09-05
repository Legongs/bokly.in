-- 00003_storage_policies.sql
-- Migrasi keamanan untuk Supabase Storage
-- Mencegah upload file raksasa (maks 2MB) dan tipe file berbahaya

-- 1. Konfigurasi Bucket 'buklyin-media' (untuk Admin/Tenant)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'buklyin-media', 
  'buklyin-media', 
  true, 
  2097152, -- 2MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  public = true;

-- 2. Konfigurasi Bucket 'payment_proofs' (untuk Pelanggan/Publik)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'payment_proofs', 
  'payment_proofs', 
  true, 
  2097152, -- 2MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  public = true;

-- ==========================================
-- KEBIJAKAN STORAGE RLS: buklyin-media
-- ==========================================
-- Publik bebas melihat/membaca gambar
CREATE POLICY "Public Access Media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'buklyin-media');

-- HANYA pengguna yang sudah login (Tenant) yang bisa mengunggah
CREATE POLICY "Tenant Upload Media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'buklyin-media' AND auth.role() = 'authenticated');

-- HANYA pengguna yang sudah login (Tenant) yang bisa mengubah
CREATE POLICY "Tenant Update Media" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'buklyin-media' AND auth.role() = 'authenticated');

-- HANYA pengguna yang sudah login (Tenant) yang bisa menghapus
CREATE POLICY "Tenant Delete Media" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'buklyin-media' AND auth.role() = 'authenticated');


-- ==========================================
-- KEBIJAKAN STORAGE RLS: payment_proofs
-- ==========================================
-- Publik bebas melihat bukti bayar (dibutuhkan untuk ditampilkan di portal tenant/pelanggan)
CREATE POLICY "Public Access Payment Proofs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment_proofs');

-- Publik/Pelanggan (Anonim) BISA mengunggah bukti bayar
CREATE POLICY "Customer Upload Payment Proofs" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'payment_proofs');

-- Publik/Pelanggan (Anonim) BISA mengubah/menimpa (upsert) bukti bayar milik mereka sebelum diverifikasi
CREATE POLICY "Customer Update Payment Proofs" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'payment_proofs');

-- HANYA Admin/Tenant (Authenticated) yang boleh MENGHAPUS bukti bayar permanen
CREATE POLICY "Tenant Delete Payment Proofs" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'payment_proofs' AND auth.role() = 'authenticated');
