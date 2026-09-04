import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getBusinessDictionary } from "@/lib/business-dictionary";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const DEMO_TENANT_ID = "d290f1ee-6c54-4b01-90e6-d701748f0851";
  const tenantId = user?.id || DEMO_TENANT_ID;

  const { data: tenant } = await supabase
    .from("tenants")
    .select("business_type, slug")
    .eq("id", tenantId)
    .single();

  const dict = getBusinessDictionary(tenant?.business_type || "lainnya");

  return (
    <DashboardNav serviceLabel={dict.serviceLabel} staffLabel={dict.staffLabel} tenantSlug={tenant?.slug}>
      {children}
    </DashboardNav>
  );
}
