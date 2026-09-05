-- ============================================================
-- Migration 00009: Sistem Subscription & Billing Intents
-- ============================================================

-- Tabel subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id             uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  plan                  text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'bisnis')),
  status                text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  billing_cycle         text CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  midtrans_order_id     text,
  created_at            timestamptz DEFAULT now() NOT NULL,
  updated_at            timestamptz DEFAULT now() NOT NULL
);

-- Tabel billing_intents
CREATE TABLE IF NOT EXISTS public.billing_intents (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan                text NOT NULL CHECK (plan IN ('pro', 'bisnis')),
  billing_cycle       text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount              integer NOT NULL,
  status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  midtrans_order_id   text UNIQUE,
  midtrans_token      text,
  created_at          timestamptz DEFAULT now() NOT NULL
);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_intents ENABLE ROW LEVEL SECURITY;

-- Policies subscriptions
CREATE POLICY "Tenant bisa lihat subscription sendiri"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = tenant_id);

-- Policies billing_intents
CREATE POLICY "Tenant bisa lihat billing intent sendiri"
  ON public.billing_intents FOR SELECT
  USING (auth.uid() = tenant_id);

CREATE POLICY "Tenant bisa insert billing intent sendiri"
  ON public.billing_intents FOR INSERT
  WITH CHECK (auth.uid() = tenant_id);

-- ── Trigger: auto-insert free subscription saat tenant baru ─
CREATE OR REPLACE FUNCTION public.handle_new_tenant_subscription()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.subscriptions (tenant_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (tenant_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_tenant_created_add_subscription ON public.tenants;
CREATE TRIGGER on_tenant_created_add_subscription
  AFTER INSERT ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_tenant_subscription();

-- ── Backfill: pastikan semua tenant existing punya subscription
INSERT INTO public.subscriptions (tenant_id, plan, status)
SELECT id, 'free', 'active' FROM public.tenants
ON CONFLICT (tenant_id) DO NOTHING;

-- ── Index ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON public.subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_intents_tenant_id ON public.billing_intents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_intents_midtrans_order_id ON public.billing_intents(midtrans_order_id);
