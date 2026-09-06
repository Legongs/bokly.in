-- ============================================================
-- Migration 00014: Tabel booking_items (Multi-Layanan per Booking)
-- ============================================================
-- Tujuan: Satu booking bisa terdiri dari beberapa layanan.
-- bookings.service_id tetap dipertahankan sebagai "layanan utama/pertama"
-- untuk kompatibilitas dengan kode yang sudah ada (analytics, dashboard, dll).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.booking_items (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id       uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    service_id       uuid NOT NULL REFERENCES public.services(id),
    price            numeric NOT NULL,
    duration_minutes integer NOT NULL,
    created_at       timestamptz DEFAULT now()
);

-- Index untuk mempercepat query booking_items berdasarkan booking_id
CREATE INDEX IF NOT EXISTS idx_booking_items_booking_id
    ON public.booking_items(booking_id);

-- ============================================================
-- RLS untuk booking_items
-- Tenant dapat mengakses booking_items yang booking_id-nya milik mereka
-- (via JOIN ke bookings.tenant_id = auth.uid())
-- ============================================================
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;

-- Tenant boleh membaca booking_items dari booking miliknya
CREATE POLICY "Tenants can view their booking_items" ON public.booking_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = booking_id
              AND b.tenant_id = auth.uid()
        )
    );

-- Izinkan INSERT tanpa autentikasi (karena booking dibuat oleh publik via RPC)
-- RPC create_booking_secure() berjalan dengan SECURITY DEFINER,
-- sehingga bypass RLS untuk INSERT ini.
-- Namun kita tambahkan policy ini untuk keamanan jika ada insert langsung.
CREATE POLICY "Public can insert booking_items via booking flow" ON public.booking_items
    FOR INSERT WITH CHECK (true);

-- Tenant boleh mengelola (update/delete) booking_items miliknya
CREATE POLICY "Tenants can manage their booking_items" ON public.booking_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = booking_id
              AND b.tenant_id = auth.uid()
        )
    );
