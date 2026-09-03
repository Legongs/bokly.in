import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStaffByTenant } from "@/lib/actions/staff.actions";
import { StaffList } from "@/components/dashboard/staff-list";

export const metadata = {
  title: "Kelola Tim & Pegawai | maubooking.in",
};

export default async function StaffPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, business_name, business_type")
    .eq("id", user.id)
    .single();

  if (!tenant) {
    redirect("/register");
  }

  const staffRes = await getStaffByTenant(tenant.id);
  const initialStaff = staffRes.success && staffRes.data ? staffRes.data : [];

  return (
    <main className="min-h-screen bg-stone-50 pb-20">
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-xl shadow-inner">
              {tenant.business_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900 leading-tight">
                Tim {tenant.business_name}
              </h1>
              <p className="text-sm text-stone-500 font-medium">
                Atur jadwal tanpa bentrok
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-8">
        <StaffList initialStaff={initialStaff} businessType={tenant.business_type} />
      </div>
    </main>
  );
}
