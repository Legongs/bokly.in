-- 00002_add_rate_limit_table.sql
-- Migration for DB-backed rate limiter

CREATE TABLE IF NOT EXISTS public.rate_limits (
    key text PRIMARY KEY,
    count integer NOT NULL DEFAULT 1,
    expires_at timestamptz NOT NULL
);

-- Enable RLS (Service role can bypass, so no policies needed if we only use Admin Client)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create RPC function to check and update rate limits atomically
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key text, p_limit integer, p_window_ms integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count integer;
BEGIN
    -- Hapus yang kadaluwarsa untuk hemat ruang
    DELETE FROM public.rate_limits WHERE key = p_key AND expires_at < now();

    -- Sisipkan baru atau tambah hitungan
    INSERT INTO public.rate_limits (key, count, expires_at)
    VALUES (p_key, 1, now() + (p_window_ms || ' milliseconds')::interval)
    ON CONFLICT (key) DO UPDATE
    SET count = rate_limits.count + 1
    RETURNING count INTO v_count;

    -- Return true jika masih di dalam batas limit
    IF v_count > p_limit THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;
