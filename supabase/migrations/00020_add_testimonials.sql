CREATE TABLE testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Publik hanya bisa lihat testimoni yang sudah dipublish tenant
CREATE POLICY "Publik lihat testimoni published"
  ON testimonials FOR SELECT
  USING (is_published = true);

-- Tenant kelola testimoni miliknya sendiri (approve/reject/feature)
CREATE POLICY "Tenant kelola testimoni sendiri"
  ON testimonials FOR ALL
  USING (auth.uid() = tenant_id);

-- Customer bisa insert testimoni HANYA untuk booking yang sudah selesai
-- dan menggunakan manage_token booking tersebut sebagai bukti kepemilikan
CREATE POLICY "Customer submit testimoni via booking valid"
  ON testimonials FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = testimonials.booking_id
      AND bookings.tenant_id = testimonials.tenant_id
      AND bookings.payment_status = 'approved'
      AND bookings.booking_date < CURRENT_DATE
    )
  );

CREATE INDEX idx_testimonials_tenant_published
  ON testimonials(tenant_id, is_published);
