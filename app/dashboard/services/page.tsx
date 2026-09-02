import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServicesByTenant } from "@/lib/actions/tenant.actions";
import { ServiceList } from "@/components/dashboard/service-list";
import { getBusinessDictionary } from "@/lib/business-dictionary";

export const metadata = {
 title: "Daftar Layanan | Dashboard maubooking.in",
 description: "Kelola harga, durasi pengerjaan, dan detail layanan tokomu.",
};

export default async function ServicesPage() {
 const supabase = await createClient();

 const { data: authData, error: authError } = await supabase.auth.getUser();
 if (authError || !authData.user) {
 redirect("/login");
 }

 const tenantId = authData.user.id;

 const { data: tenant } = await supabase
   .from("tenants")
   .select("business_type")
   .eq("id", tenantId)
   .single();

 const dict = getBusinessDictionary(tenant?.business_type);

 // Mengambil layanan menggunakan action tenant
 const res = await getServicesByTenant(tenantId);
 const services = res.data ?? [];

 return (
 <div className="max-w-4xl mx-auto py-8 px-4">
 <div className="mb-8">
 <h1 className="text-2xl font-extrabold text-stone-900 ">
 Daftar {dict.serviceLabel}
 </h1>
 <p className="text-sm text-stone-500 mt-1">
 Atur harga, durasi, dan nominal DP untuk setiap {dict.serviceLabel.toLowerCase()} yang kamu tawarkan.
 </p>
 </div>

 <ServiceList services={services} dictionary={dict} />
 </div>
 );
}
