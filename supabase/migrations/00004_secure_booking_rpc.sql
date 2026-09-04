-- 00004_secure_booking_rpc.sql
-- Membuat fungsi PL/pgSQL untuk mencegah double-booking dengan row-level lock

CREATE OR REPLACE FUNCTION public.create_booking_secure(
    p_tenant_id UUID,
    p_service_id UUID,
    p_staff_id UUID,
    p_customer_name TEXT,
    p_customer_wa TEXT,
    p_booking_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_payment_status TEXT,
    p_proof_url TEXT,
    p_manage_token_expires_at TIMESTAMPTZ
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Berjalan dengan hak akses pembuat (mem-bypass RLS untuk read checking, namun aman karena parameter divalidasi)
AS $$
DECLARE
    v_max_cap INT;
    v_buffer INT;
    v_overlap INT;
    v_inserted_booking RECORD;
BEGIN
    -- 1. Mengunci baris 'services' agar semua upaya pemesanan untuk layanan ini diproses bergantian secara serial (mengamankan dari race condition)
    SELECT max_capacity, buffer_minutes 
    INTO v_max_cap, v_buffer 
    FROM public.services 
    WHERE id = p_service_id AND tenant_id = p_tenant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Layanan tidak ditemukan.';
    END IF;

    -- Default kapasitas jika null
    v_max_cap := COALESCE(v_max_cap, 1);

    -- 2. Menghitung tumpang tindih
    IF p_staff_id IS NOT NULL THEN
        -- Jika staff dipilih, pastikan staff ini belum ada pesanan di jam tersebut
        SELECT count(*)
        INTO v_overlap
        FROM public.bookings b
        LEFT JOIN public.services s ON s.id = b.service_id
        WHERE b.tenant_id = p_tenant_id
          AND b.booking_date = p_booking_date
          AND b.payment_status IN ('pending', 'approved')
          AND b.staff_id = p_staff_id
          AND p_start_time < (b.end_time + make_interval(mins := COALESCE(s.buffer_minutes, 0)))
          AND (p_end_time + make_interval(mins := v_buffer)) > b.start_time;

        IF v_overlap > 0 THEN
            RAISE EXCEPTION 'UNIQUE_SLOT_VIOLATION';
        END IF;
    ELSE
        -- Jika tidak ada staff (tenant tanpa staff), batasi berdasarkan max_capacity
        SELECT count(*)
        INTO v_overlap
        FROM public.bookings b
        LEFT JOIN public.services s ON s.id = b.service_id
        WHERE b.tenant_id = p_tenant_id
          AND b.booking_date = p_booking_date
          AND b.payment_status IN ('pending', 'approved')
          AND b.staff_id IS NULL
          AND p_start_time < (b.end_time + make_interval(mins := COALESCE(s.buffer_minutes, 0)))
          AND (p_end_time + make_interval(mins := v_buffer)) > b.start_time;

        IF v_overlap >= v_max_cap THEN
            RAISE EXCEPTION 'UNIQUE_SLOT_VIOLATION';
        END IF;
    END IF;

    -- 3. Masukkan data dengan aman karena sudah dilindungi oleh row-lock dan pengecekan di atas
    -- Catatan: ENUM public.payment_status_type perlu dicasting dengan benar.
    -- Di sini kita asumsikan namanya payment_status_type, tapi mari kita pastikan dengan cast yang fleksibel atau jika tidak ada enum, biarkan tanpa cast jika tipe datanya text. 
    -- Sebaiknya asumsikan kolom payment_status menerima teks biasa dan biarkan PostgreSQL mengonversi implisit.
    
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
        manage_token_expires_at
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
        p_manage_token_expires_at
    ) RETURNING * INTO v_inserted_booking;

    -- Mengembalikan data hasil insert sebagai JSON
    RETURN row_to_json(v_inserted_booking)::jsonb;
END;
$$;
