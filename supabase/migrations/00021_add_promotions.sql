-- Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Ensure end date is after start date
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_promotions_tenant_id ON public.promotions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON public.promotions(start_date, end_date);

-- Enable RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Policy: Tenants can manage their own promotions
CREATE POLICY "Tenants can manage own promotions" 
  ON public.promotions 
  FOR ALL 
  USING (
    tenant_id = (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
  );

-- Policy: Public can read active promotions
CREATE POLICY "Public can view active promotions"
  ON public.promotions
  FOR SELECT
  USING (
    is_active = true 
    AND start_date <= now() 
    AND end_date >= now()
  );
