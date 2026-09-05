"use server";

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

// Menggunakan Service Role Key agar bisa menembus RLS dan membaca semua data
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

const PLAN_PRICES = {
  free: 0,
  pro: 49000,
  bisnis: 99000,
};

export async function getPlatformStats() {
  const supabase = getAdminClient();

  // Ambil semua tenants
  const { data: tenants, error: tenantsError } = await supabase
    .from("tenants")
    .select("id, is_active");

  if (tenantsError) throw new Error("Gagal mengambil data tenant");

  // Ambil semua langganan aktif
  const { data: subscriptions, error: subError } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("status", "active");

  if (subError) throw new Error("Gagal mengambil data langganan");

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.is_active).length;
  const inactiveTenants = totalTenants - activeTenants;

  let totalMRR = 0;
  subscriptions.forEach(sub => {
    const plan = sub.plan as keyof typeof PLAN_PRICES;
    if (PLAN_PRICES[plan]) {
      totalMRR += PLAN_PRICES[plan];
    }
  });

  return {
    totalTenants,
    activeTenants,
    inactiveTenants,
    totalMRR,
  };
}

export async function getAllTenants() {
  const supabase = getAdminClient();

  const { data: tenants, error } = await supabase
    .from("tenants")
    .select(`
      id,
      slug,
      business_name,
      business_sector,
      whatsapp_number,
      is_active,
      created_at,
      subscriptions (
        plan,
        status,
        current_period_end
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Gagal mengambil daftar tenant");

  return tenants;
}
