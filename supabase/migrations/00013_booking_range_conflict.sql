-- ============================================================
-- Migration 00013: Anti-Bentrok Berbasis Rentang Waktu (tsrange)
-- ============================================================
-- Tujuan: Pindahkan logika anti-bentrok ke level database menggunakan
-- PostgreSQL exclusion constraint dengan GiST index.
-- Ini adalah jaring pengaman mutlak — database sendiri yang menolak
-- insert/update yang menyebabkan booking overlap.
-- ============================================================

-- 1. Aktifkan extension btree_gist (diperlukan untuk exclusion constraint
--    yang menggabungkan tipe non-range (uuid =) dengan tipe range (tsrange &&))
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================
-- 2. Tabel RESOURCES
-- Merepresentasikan "hal yang dibooking" selain staf manusia.
-- Contoh: ruang meeting, meja coworking, bay servis.
-- Generalisasi agar sistem booking bisa dipakai sektor Space/Sewa Ruang
-- tanpa memaksakan konsep "staff" untuk sesuatu yang bukan orang.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.resources (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name          text NOT NULL,
    resource_type text NOT NULL DEFAULT 'room', -- 'room', 'desk', 'bay', dll — bebas text
    capacity      integer DEFAULT 1,
    price_per_hour numeric,
    is_active     boolean DEFAULT true,
    created_at    timestamptz DEFAULT now()
);

-- RLS untuk resources: pola sama persis dengan tabel staff
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Publik boleh membaca resource yang aktif (untuk keperluan storefront)
CREATE POLICY "Public can view active resources" ON public.resources
    FOR SELECT USING (is_active = true);

-- Pemilik toko memiliki akses penuh terhadap resource miliknya
CREATE POLICY "Tenants can manage their resources" ON public.resources
    FOR ALL USING (auth.uid() = tenant_id);

-- ============================================================
-- 3. Kolom baru di tabel bookings
-- ============================================================

-- resource_id: nullable — dipakai kalau booking untuk resource, bukan staff
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS resource_id uuid REFERENCES public.resources(id);

-- Field khusus sektor Otomotif (auto)
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS vehicle_brand text;

ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS vehicle_type text;

ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS vehicle_plate text;

ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS complaint_notes text;

-- Field khusus sektor Kesehatan (health)
-- Nilai yang valid: 'baru' atau 'lanjutan'
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS consultation_type text;

-- ============================================================
-- 4. Generated columns untuk exclusion constraint
-- ============================================================

-- slot_owner_id: siapa yang "menguasai" slot ini?
-- Prioritas: staff > resource > tenant (fallback)
-- Digunakan sebagai kunci equality dalam exclusion constraint.
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS slot_owner_id uuid
        GENERATED ALWAYS AS (COALESCE(staff_id, resource_id, tenant_id)) STORED;

-- slot_range: rentang waktu aktual booking sebagai tsrange
-- PostgreSQL mendukung date + time = timestamp secara langsung.
-- '[)' = lower inclusive, upper exclusive (standar half-open interval)
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS slot_range tsrange
        GENERATED ALWAYS AS (
            tsrange(
                (booking_date + start_time)::timestamp,
                (booking_date + end_time)::timestamp,
                '[)'
            )
        ) STORED;

-- ============================================================
-- 5. GiST Index untuk performa query range
-- (exclusion constraint otomatis membuat index, tapi explicit index
--  berguna untuk query SELECT yang mencari overlap)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_bookings_slot_gist
    ON public.bookings USING gist (slot_owner_id, slot_range)
    WHERE payment_status NOT IN ('rejected') AND is_no_show IS NOT TRUE;

-- ============================================================
-- 6. Exclusion Constraint Anti-Bentrok
-- INI YANG PALING PENTING — jaring pengaman terakhir di level database.
-- PostgreSQL akan MENOLAK insert/update apapun yang menyebabkan 2 baris
-- punya slot_owner_id sama DAN slot_range yang overlap (&& = overlaps).
-- Pengecualian: booking yang sudah ditolak (rejected) atau no-show.
-- ============================================================
ALTER TABLE public.bookings
    ADD CONSTRAINT bookings_no_overlap
        EXCLUDE USING gist (
            slot_owner_id WITH =,
            slot_range WITH &&
        )
        WHERE (payment_status NOT IN ('rejected') AND is_no_show IS NOT TRUE);

-- ============================================================
-- 7. Update RPC create_booking_secure() untuk menangkap error 23P01
-- (exclusion constraint violation) dan memberikan pesan yang ramah.
-- Juga update parameter untuk mendukung resource_id dan field baru.
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_booking_secure(
    p_tenant_id           UUID,
    p_service_id          UUID,
    p_staff_id            UUID,
    p_customer_name       TEXT,
    p_customer_wa         TEXT,
    p_booking_date        DATE,
    p_start_time          TIME,
    p_end_time            TIME,
    p_payment_status      TEXT,
    p_proof_url           TEXT,
    p_manage_token_expires_at TIMESTAMPTZ,
    -- Parameter baru (semua nullable / optional dengan default NULL)
    p_resource_id         UUID    DEFAULT NULL,
    p_vehicle_brand       TEXT    DEFAULT NULL,
    p_vehicle_type        TEXT    DEFAULT NULL,
    p_vehicle_plate       TEXT    DEFAULT NULL,
    p_complaint_notes     TEXT    DEFAULT NULL,
    p_consultation_type   TEXT    DEFAULT NULL,
    -- TASK 2: Array layanan untuk booking_items — format: [{"service_id": "uuid", "price": 0, "duration_minutes": 0}]
    -- Wajib diisi agar insert booking_items bisa transaksional (atomik bersama insert bookings)
    p_service_items       JSONB   DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_max_cap         INT;
    v_buffer          INT;
    v_overlap         INT;
    v_inserted_booking RECORD;
    v_item            JSONB;
BEGIN
    -- 1. Kunci baris 'services' agar semua upaya pemesanan untuk layanan ini
    --    diproses bergantian secara serial (mencegah race condition)
    SELECT max_capacity, buffer_minutes
    INTO v_max_cap, v_buffer
    FROM public.services
    WHERE id = p_service_id AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Layanan tidak ditemukan.';
    END IF;

    v_max_cap := COALESCE(v_max_cap, 1);

    -- 2. Cek overlap secara manual (early check, sebelum exclusion constraint)
    IF p_staff_id IS NOT NULL THEN
        SELECT count(*)
        INTO v_overlap
        FROM public.bookings b
        LEFT JOIN public.services s ON s.id = b.service_id
        WHERE b.tenant_id = p_tenant_id
          AND b.booking_date = p_booking_date
          AND b.payment_status NOT IN ('rejected')
          AND b.is_no_show IS NOT TRUE
          AND b.staff_id = p_staff_id
          AND p_start_time < (b.end_time + make_interval(mins := COALESCE(s.buffer_minutes, 0)))
          AND (p_end_time + make_interval(mins := v_buffer)) > b.start_time;

        IF v_overlap > 0 THEN
            RAISE EXCEPTION 'UNIQUE_SLOT_VIOLATION';
        END IF;
    ELSIF p_resource_id IS NOT NULL THEN
        SELECT count(*)
        INTO v_overlap
        FROM public.bookings b
        LEFT JOIN public.services s ON s.id = b.service_id
        WHERE b.tenant_id = p_tenant_id
          AND b.booking_date = p_booking_date
          AND b.payment_status NOT IN ('rejected')
          AND b.is_no_show IS NOT TRUE
          AND b.resource_id = p_resource_id
          AND p_start_time < (b.end_time + make_interval(mins := COALESCE(s.buffer_minutes, 0)))
          AND (p_end_time + make_interval(mins := v_buffer)) > b.start_time;

        IF v_overlap > 0 THEN
            RAISE EXCEPTION 'UNIQUE_SLOT_VIOLATION';
        END IF;
    ELSE
        SELECT count(*)
        INTO v_overlap
        FROM public.bookings b
        LEFT JOIN public.services s ON s.id = b.service_id
        WHERE b.tenant_id = p_tenant_id
          AND b.booking_date = p_booking_date
          AND b.payment_status NOT IN ('rejected')
          AND b.is_no_show IS NOT TRUE
          AND b.staff_id IS NULL
          AND b.resource_id IS NULL
          AND p_start_time < (b.end_time + make_interval(mins := COALESCE(s.buffer_minutes, 0)))
          AND (p_end_time + make_interval(mins := v_buffer)) > b.start_time;

        IF v_overlap >= v_max_cap THEN
            RAISE EXCEPTION 'UNIQUE_SLOT_VIOLATION';
        END IF;
    END IF;

    -- 3. Insert data booking
    INSERT INTO public.bookings (
        tenant_id,
        service_id,
        staff_id,
        customer_name,
        customer_wa,
        booking_date,
        start_time,
        end_time,
        payment_status,
        proof_url,
        manage_token_expires_at,
        resource_id,
        vehicle_brand,
        vehicle_type,
        vehicle_plate,
        complaint_notes,
        consultation_type
    ) VALUES (
        p_tenant_id,
        p_service_id,
        p_staff_id,
        p_customer_name,
        p_customer_wa,
        p_booking_date,
        p_start_time,
        p_end_time,
        p_payment_status,
        p_proof_url,
        p_manage_token_expires_at,
        p_resource_id,
        p_vehicle_brand,
        p_vehicle_type,
        p_vehicle_plate,
        p_complaint_notes,
        p_consultation_type
    ) RETURNING * INTO v_inserted_booking;

    -- 4. Insert booking_items secara ATOMIK dalam transaksi yang sama.
    --    Jika p_service_items NULL atau kosong, fallback ke satu item dari p_service_id.
    --    Karena ini berada dalam PLPGSQL SECURITY DEFINER, tidak ada RLS bypass risk.
    IF p_service_items IS NOT NULL AND jsonb_array_length(p_service_items) > 0 THEN
        -- Insert dari array yang dikirim — multi-service
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_service_items)
        LOOP
            INSERT INTO public.booking_items (booking_id, service_id, price, duration_minutes)
            VALUES (
                v_inserted_booking.id,
                (v_item->>'service_id')::UUID,
                (v_item->>'price')::NUMERIC,
                (v_item->>'duration_minutes')::INTEGER
            );
        END LOOP;
    ELSE
        -- Fallback: single service — ambil harga dan durasi dari tabel services
        INSERT INTO public.booking_items (booking_id, service_id, price, duration_minutes)
        SELECT
            v_inserted_booking.id,
            p_service_id,
            price,
            duration_minutes
        FROM public.services
        WHERE id = p_service_id;
    END IF;

    RETURN row_to_json(v_inserted_booking)::jsonb;

EXCEPTION
    -- Error 23P01 = exclusion constraint violation
    WHEN exclusion_violation THEN
        RAISE EXCEPTION 'UNIQUE_SLOT_VIOLATION';
    WHEN OTHERS THEN
        -- Re-raise error lain agar tetap dapat dideteksi
        RAISE;
END;
$$;
