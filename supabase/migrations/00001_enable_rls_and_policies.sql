-- 00001_enable_rls_and_policies.sql
-- Konfigurasi lengkap Row Level Security (RLS) untuk bukly.id

-- 1. Enable RLS pada semua tabel
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- KEBIJAKAN UNTUK TABEL: tenants
-- ==========================================
-- Publik (anon) boleh membaca data toko yang aktif
CREATE POLICY "Public can view active tenants" ON public.tenants
    FOR SELECT USING (is_active = true);

-- Pemilik toko boleh melihat dan mengubah datanya sendiri
CREATE POLICY "Tenants can view own profile" ON public.tenants
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Tenants can update own profile" ON public.tenants
    FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- KEBIJAKAN UNTUK TABEL: services
-- ==========================================
-- Publik boleh membaca daftar layanan
CREATE POLICY "Public can view services" ON public.services
    FOR SELECT USING (true);

-- Pemilik toko memiliki akses penuh terhadap layanannya
CREATE POLICY "Tenants can manage their services" ON public.services
    FOR ALL USING (auth.uid() = tenant_id);

-- ==========================================
-- KEBIJAKAN UNTUK TABEL: staff
-- ==========================================
-- Publik boleh membaca daftar pegawai
CREATE POLICY "Public can view staff" ON public.staff
    FOR SELECT USING (true);

-- Pemilik toko memiliki akses penuh terhadap pegawainya
CREATE POLICY "Tenants can manage their staff" ON public.staff
    FOR ALL USING (auth.uid() = tenant_id);

-- ==========================================
-- KEBIJAKAN UNTUK TABEL: portfolios
-- ==========================================
-- Publik boleh membaca daftar portofolio
CREATE POLICY "Public can view portfolios" ON public.portfolios
    FOR SELECT USING (true);

-- Pemilik toko memiliki akses penuh terhadap portofolionya
CREATE POLICY "Tenants can manage their portfolios" ON public.portfolios
    FOR ALL USING (auth.uid() = tenant_id);

-- ==========================================
-- KEBIJAKAN UNTUK TABEL: customers
-- ==========================================
-- Hanya pemilik toko yang dapat membaca dan mengelola daftar pelanggan mereka
CREATE POLICY "Tenants can manage their customers" ON public.customers
    FOR ALL USING (auth.uid() = tenant_id);

-- ==========================================
-- KEBIJAKAN UNTUK TABEL: bookings
-- ==========================================
-- Publik boleh membuat (INSERT) reservasi baru ke toko manapun
CREATE POLICY "Public can insert bookings" ON public.bookings
    FOR INSERT WITH CHECK (true);

-- HANYA pemilik toko yang dapat MENGAKSES (SELECT, UPDATE, DELETE) reservasi mereka
-- Publik TIDAK BISA membaca data reservasi (mencegah eksploitasi data / pencurian nomor WA pelanggan)
CREATE POLICY "Tenants can view their bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can update their bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can delete their bookings" ON public.bookings
    FOR DELETE USING (auth.uid() = tenant_id);
