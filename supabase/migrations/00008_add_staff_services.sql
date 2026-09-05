-- Create staff_services table
CREATE TABLE IF NOT EXISTS public.staff_services (
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (staff_id, service_id)
);

-- Enable RLS
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Enable read access for all users" ON public.staff_services
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.staff_services
    FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Enable update for authenticated users only" ON public.staff_services
    FOR UPDATE USING (auth.uid() = tenant_id);

CREATE POLICY "Enable delete for authenticated users only" ON public.staff_services
    FOR DELETE USING (auth.uid() = tenant_id);
