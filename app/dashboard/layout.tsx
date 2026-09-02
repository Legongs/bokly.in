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

  if (!user) {
    redirect("/login");
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("business_type")
    .eq("id", user.id)
    .single();

  const dict = getBusinessDictionary(tenant?.business_type || "lainnya");

  return (
    <DashboardNav serviceLabel={dict.serviceLabel} staffLabel={dict.staffLabel}>
      {children}
    </DashboardNav>
  );
}
