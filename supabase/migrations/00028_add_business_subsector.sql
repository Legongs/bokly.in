-- Menambahkan tipe ENUM untuk subsektor bisnis
CREATE TYPE public.business_subsector_enum AS ENUM (
  'salon', 'barber', 'eyelash', 'nailart', 'spa_pijat',
  'bengkel', 'detailing',
  'studio_foto', 'lapangan_futsal', 'lapangan_padel', 'coworking',
  'klinik', 'konsultasi',
  'lainnya'
);

-- Menambahkan kolom business_subsector ke tabel tenants
ALTER TABLE public.tenants ADD COLUMN business_subsector business_subsector_enum;

-- Backfill data yang sudah ada (berdasarkan business_type string pencocokan regex/LIKE)
UPDATE public.tenants
SET business_subsector = CASE
    -- Beauty
    WHEN lower(business_type) LIKE '%salon%' THEN 'salon'::business_subsector_enum
    WHEN lower(business_type) LIKE '%barber%' OR lower(business_type) LIKE '%pangkas%' THEN 'barber'::business_subsector_enum
    WHEN lower(business_type) LIKE '%eyelash%' OR lower(business_type) LIKE '%bulu mata%' THEN 'eyelash'::business_subsector_enum
    WHEN lower(business_type) LIKE '%nail%' OR lower(business_type) LIKE '%kuku%' THEN 'nailart'::business_subsector_enum
    WHEN lower(business_type) LIKE '%spa%' OR lower(business_type) LIKE '%pijat%' OR lower(business_type) LIKE '%massage%' THEN 'spa_pijat'::business_subsector_enum
    
    -- Auto
    WHEN lower(business_type) LIKE '%bengkel%' OR lower(business_type) LIKE '%servis%' THEN 'bengkel'::business_subsector_enum
    WHEN lower(business_type) LIKE '%cuci mobil%' OR lower(business_type) LIKE '%detailing%' THEN 'detailing'::business_subsector_enum
    
    -- Space
    WHEN lower(business_type) LIKE '%studio foto%' OR lower(business_type) LIKE '%fotografi%' THEN 'studio_foto'::business_subsector_enum
    WHEN lower(business_type) LIKE '%futsal%' THEN 'lapangan_futsal'::business_subsector_enum
    WHEN lower(business_type) LIKE '%padel%' THEN 'lapangan_padel'::business_subsector_enum
    WHEN lower(business_type) LIKE '%coworking%' THEN 'coworking'::business_subsector_enum
    
    -- Health
    WHEN lower(business_type) LIKE '%klinik%' OR lower(business_type) LIKE '%dokter%' THEN 'klinik'::business_subsector_enum
    WHEN lower(business_type) LIKE '%konsultasi%' OR lower(business_type) LIKE '%psikolog%' OR lower(business_type) LIKE '%terapi%' THEN 'konsultasi'::business_subsector_enum
    
    -- Fallback default
    ELSE 'lainnya'::business_subsector_enum
END;
