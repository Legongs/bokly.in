-- supabase/migrations/00023_add_facilities_table.sql

CREATE TABLE public.tenant_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  facility_type TEXT NOT NULL CHECK (facility_type IN (
    'wifi', 'ac', 'parking', 'toilet', 'kitchen', 'reception', 
    'soundproof', 'wheelchair_accessible', 'cctv', 'generator', 'water_dispenser'
  )),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, facility_type)
);

-- Trigger untuk update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenant_facilities_updated_at
  BEFORE UPDATE ON public.tenant_facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.tenant_facilities ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Tenant bisa see own facilities
CREATE POLICY "tenant_view_own_facilities" ON public.tenant_facilities
  FOR SELECT
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

-- RLS Policy: Tenant bisa manage own facilities
CREATE POLICY "tenant_manage_own_facilities" ON public.tenant_facilities
  FOR ALL
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid()));

-- Index
CREATE INDEX idx_tenant_facilities_tenant_id ON public.tenant_facilities(tenant_id);
