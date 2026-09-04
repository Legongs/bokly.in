-- 00005_add_bank_details.sql
-- Menambahkan kolom rekening bank untuk pembayaran manual

ALTER TABLE public.tenants ADD COLUMN bank_name TEXT;
ALTER TABLE public.tenants ADD COLUMN bank_account_number TEXT;
ALTER TABLE public.tenants ADD COLUMN bank_account_name TEXT;
