import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getAuthTenantId } from "@/lib/auth";
import { getBusinessDictionary } from "@/lib/business-dictionary";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { PushNotificationPrompt } from "@/components/pwa/push-notification-prompt";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getAuthTenantId() di-memoize dengan React.cache() — auth call ini
  // akan di-share dengan child pages yang memanggil helper yang sama,
  // sehingga Supabase hanya di-hit sekali per request.
  const tenantId = await getAuthTenantId();

  const supabase = await createClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("business_type, slug")
    .eq("id", tenantId)
    .single();

  const dict = getBusinessDictionary(tenant?.business_type || "lainnya");

  return (
    <DashboardNav serviceLabel={dict.serviceLabel} staffLabel={dict.staffLabel} tenantSlug={tenant?.slug}>
      <PushNotificationPrompt subscriptionType="dashboard" />
      {children}
    </DashboardNav>
  );
}
