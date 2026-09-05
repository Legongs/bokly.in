"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { PLAN_PRICES } from "@/lib/subscription";
import type { ActionResponse } from "@/lib/actions/tenant.actions";
import type { SubscriptionPlan, BillingCycle } from "@/types/database.types";

// ── Auth Guard ────────────────────────────────────────────────────────────────
async function verifySuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const superAdminEmail = process.env.SUPERADMIN_EMAIL;

  if (!user || !superAdminEmail || user.email !== superAdminEmail) {
    throw new Error("Unauthorized: Superadmin access required.");
  }
}

// ── getPlatformStats ──────────────────────────────────────────────────────────
export async function getPlatformStats() {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { data: tenants, error: tenantsError } = await supabase
    .from("tenants")
    .select("id, is_active");

  if (tenantsError) throw new Error("Gagal mengambil data tenant");

  // Ambil semua langganan aktif beserta billing_cycle untuk MRR akurat
  const { data: subscriptions, error: subError } = await supabase
    .from("subscriptions")
    .select("plan, status, billing_cycle")
    .eq("status", "active");

  if (subError) throw new Error("Gagal mengambil data langganan");

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.is_active).length;
  const inactiveTenants = totalTenants - activeTenants;

  // Hitung MRR berdasarkan plan + billing_cycle (sama seperti PLAN_PRICES di lib/subscription)
  let totalMRR = 0;
  subscriptions.forEach((sub) => {
    const plan = sub.plan as SubscriptionPlan;
    if (plan === "free") return;
    const prices = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
    if (!prices) return;
    // Kalau billing tahunan, normalkan ke per-bulan
    const monthly =
      sub.billing_cycle === "yearly"
        ? Math.round(prices.yearly / 12)
        : prices.monthly;
    totalMRR += monthly;
  });

  return {
    totalTenants,
    activeTenants,
    inactiveTenants,
    totalMRR,
  };
}

// ── getAllTenants ─────────────────────────────────────────────────────────────
export async function getAllTenants() {
  await verifySuperAdmin();
  const supabase = createAdminClient();

  const { data: tenants, error } = await supabase
    .from("tenants")
    .select(
      `
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
        billing_cycle,
        current_period_end
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error("Gagal mengambil daftar tenant");

  return tenants;
}

// ── updateTenantPlan ──────────────────────────────────────────────────────────
/**
 * Upgrade / downgrade plan tenant secara manual dari superadmin.
 * Jika downgrade ke free, hapus period_end dan set billing_cycle null.
 */
const updateTenantPlanSchema = z.object({
  tenantId: z.string().uuid(),
  plan: z.enum(["free", "pro", "bisnis"]),
  billingCycle: z.enum(["monthly", "yearly"]).nullable(),
});

export async function updateTenantPlan(
  tenantId: string,
  plan: SubscriptionPlan,
  billingCycle: BillingCycle | null = "monthly"
): Promise<ActionResponse<null>> {
  await verifySuperAdmin();

  const parsed = updateTenantPlanSchema.safeParse({ tenantId, plan, billingCycle });
  if (!parsed.success) {
    return { success: false, error: "Data tidak valid." };
  }

  try {
    const supabase = createAdminClient();

    const now = new Date();
    let periodEnd: string | null = null;

    if (plan !== "free" && billingCycle) {
      const end = new Date(now);
      if (billingCycle === "yearly") {
        end.setFullYear(end.getFullYear() + 1);
      } else {
        end.setMonth(end.getMonth() + 1);
      }
      periodEnd = end.toISOString();
    }

    const { error } = await supabase
      .from("subscriptions")
      .update({
        plan,
        status: "active",
        billing_cycle: plan === "free" ? null : billingCycle,
        current_period_start: plan === "free" ? null : now.toISOString(),
        current_period_end: periodEnd,
        updated_at: now.toISOString(),
      })
      .eq("tenant_id", parsed.data.tenantId);

    if (error) return { success: false, error: "Gagal memperbarui plan tenant." };

    revalidatePath("/superadmin");
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Terjadi gangguan sistem." };
  }
}

// ── toggleTenantActive ────────────────────────────────────────────────────────
/**
 * Suspend (nonaktifkan) atau aktifkan kembali tenant dari superadmin.
 * Mengubah field is_active di tabel tenants.
 */
const toggleTenantActiveSchema = z.object({
  tenantId: z.string().uuid(),
  isActive: z.boolean(),
});

export async function toggleTenantActive(
  tenantId: string,
  isActive: boolean
): Promise<ActionResponse<null>> {
  await verifySuperAdmin();

  const parsed = toggleTenantActiveSchema.safeParse({ tenantId, isActive });
  if (!parsed.success) {
    return { success: false, error: "Data tidak valid." };
  }

  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("tenants")
      .update({ is_active: parsed.data.isActive })
      .eq("id", parsed.data.tenantId);

    if (error) return { success: false, error: "Gagal mengubah status tenant." };

    revalidatePath("/superadmin");
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Terjadi gangguan sistem." };
  }
}
