-- Migration: 00018_push_subscriptions.sql
-- Description: Add table for web push notification subscriptions

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  keys_p256dh text NOT NULL,
  keys_auth text NOT NULL,
  subscription_type text NOT NULL DEFAULT 'dashboard',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Tenants can insert and select their own subscriptions
CREATE POLICY "Tenants can manage their own push subscriptions" ON public.push_subscriptions
  FOR ALL USING (tenant_id = auth.uid());
