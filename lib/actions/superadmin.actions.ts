"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  PLAN_PRICES,
  getDynamicPricing,
  getFeatureFlagsConfig,
  DEFAULT_FEATURE_FLAGS,
} from "@/lib/subscription";
import type { FeatureFlagsConfig } from "@/lib/subscription";
import {
  getGlobalFonnteConfig,
  maskApiKey,
  isMaskedApiKey,
} from "@/lib/global-wa";
import type { GlobalFonnteConfig, MaskedGlobalFonnteConfig } from "@/lib/global-wa";
import type { ActionResponse } from "@/lib/actions/tenant.actions";
import type { SubscriptionPlan, BillingCycle, Json } from "@/types/database.types";

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
  const pricesConfig = await getDynamicPricing();
  let totalMRR = 0;
  subscriptions.forEach((sub) => {
    const plan = sub.plan as SubscriptionPlan;
    if (plan === "free") return;
    const prices = pricesConfig[plan as keyof typeof pricesConfig];
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

// ── App Settings (Pricing Config) ──────────────────────────────────────────────
export async function updatePricingConfig(prices: any): Promise<ActionResponse<null>> {
  await verifySuperAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("app_settings")
      .upsert({ id: "pricing_config", value: prices });
      
    if (error) return { success: false, error: "Gagal menyimpan harga." };
    revalidatePath("/superadmin");
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Terjadi gangguan sistem." };
  }
}

// ── App Settings (Midtrans Config) ───────────────────────────────────────────
export async function updateMidtransConfig(config: any): Promise<ActionResponse<null>> {
  await verifySuperAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("app_settings")
      .upsert({ id: "midtrans_config", value: config });
      
    if (error) return { success: false, error: "Gagal menyimpan pengaturan Midtrans." };
    revalidatePath("/superadmin");
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Terjadi gangguan sistem." };
  }
}

// ── Vouchers ──────────────────────────────────────────────────────────────────
export async function getAllVouchers(): Promise<ActionResponse<any[]>> {
  await verifySuperAdmin();
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: "Gagal mengambil data voucher." };
    return { success: true, data: data || [] };
  } catch {
    return { success: false, error: "Terjadi gangguan sistem." };
  }
}

export async function createVoucher(data: {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number | null;
  valid_until: string | null;
}): Promise<ActionResponse<null>> {
  await verifySuperAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("vouchers").insert({
      code: data.code.toUpperCase(),
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      max_uses: data.max_uses,
      valid_until: data.valid_until,
    });

    if (error) {
      if (error.code === "23505") return { success: false, error: "Kode voucher sudah digunakan." };
      return { success: false, error: "Gagal membuat voucher." };
    }
    
    revalidatePath("/superadmin");
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Terjadi gangguan sistem." };
  }
}

export async function toggleVoucherActive(id: string, is_active: boolean): Promise<ActionResponse<null>> {
  await verifySuperAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("vouchers").update({ is_active }).eq("id", id);
    if (error) return { success: false, error: "Gagal mengubah status voucher." };
    revalidatePath("/superadmin");
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Terjadi gangguan sistem." };
  }
}

export async function deleteVoucher(id: string): Promise<ActionResponse<null>> {
  await verifySuperAdmin();
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("vouchers").delete().eq("id", id);
    if (error) return { success: false, error: "Gagal menghapus voucher." };
    revalidatePath("/superadmin");
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Terjadi gangguan sistem." };
  }
}

// ── App Settings (Feature Flags) ──────────────────────────────────────────────

/**
 * Validasi ketat sebelum nulis ke jsonb. Kalau config-nya rusak, SEMUA
 * pengecekan kuota di app ikut rusak — jadi mending tolak simpan daripada
 * nulis bentuk yang aneh ke database.
 *
 * `null` = unlimited (JSON nggak punya Infinity).
 */
const planConfigSchema = z.object({
  maxBookingsPerMonth: z.number().int().min(0).max(1000000).nullable(),
  maxServices: z.number().int().min(0).max(10000).nullable(),
  maxStaff: z.number().int().min(0).max(10000).nullable(),
  maxPromotions: z.number().int().min(0).max(10000).nullable(),
  hasReminders: z.boolean(),
  hasAnalytics: z.boolean(),
  hasLogoUpload: z.boolean(),
  hasRemoveBranding: z.boolean(),
  hasAutoWaReminder: z.boolean(),
  hasAutoWaNewBookingAlert: z.boolean(),
  supportLevel: z.enum(["community", "email", "whatsapp"]),
});

const featureFlagsConfigSchema = z.object({
  free: planConfigSchema,
  pro: planConfigSchema,
  bisnis: planConfigSchema,
});

/**
 * Ambil feature flags buat ditampilkan di form superadmin.
 *
 * Dinamai ...ForAdmin supaya nggak tabrakan dengan getFeatureFlagsConfig()
 * di lib/subscription.ts — yang itu dipakai runtime app (tanpa guard, karena
 * pengecekan fitur jalan buat semua tenant), yang ini khusus panel superadmin
 * dan wajib lewat verifySuperAdmin().
 */
export async function getFeatureFlagsForAdmin(): Promise<FeatureFlagsConfig> {
  await verifySuperAdmin();
  return getFeatureFlagsConfig();
}

export async function updateFeatureFlagsConfig(
  config: FeatureFlagsConfig
): Promise<ActionResponse<null>> {
  await verifySuperAdmin();

  const parsed = featureFlagsConfigSchema.safeParse(config);
  if (!parsed.success) {
    return { success: false, error: "Konfigurasi fitur tidak valid." };
  }

  return persistFeatureFlags(parsed.data);
}

/** Bagian nulis-ke-DB-nya dipisah biar bisa dipakai ulang oleh reset. */
async function persistFeatureFlags(config: FeatureFlagsConfig): Promise<ActionResponse<null>> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("app_settings")
      .upsert({ id: "feature_flags_config", value: config as unknown as Json });

    if (error) return { success: false, error: "Gagal menyimpan konfigurasi fitur." };

    revalidatePath("/superadmin");
    // Kartu harga di dashboard & landing page baca config yang sama —
    // ikut di-revalidate biar teks fiturnya nggak ketinggalan.
    revalidatePath("/dashboard/billing");
    revalidatePath("/");
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Terjadi gangguan sistem." };
  }
}

/**
 * Balikin feature flags ke default hardcode (DEFAULT_FEATURE_FLAGS).
 * Berguna kalau developer salah setel dan pengen mulai dari awal.
 *
 * Config yang baru dikembalikan ke client supaya form-nya bisa langsung
 * nyusul tanpa perlu sinkron lewat useEffect.
 */
export async function resetFeatureFlagsConfig(): Promise<ActionResponse<FeatureFlagsConfig>> {
  await verifySuperAdmin();

  const res = await persistFeatureFlags(DEFAULT_FEATURE_FLAGS);
  if (!res.success) return { success: false, error: res.error };

  return { success: true, data: DEFAULT_FEATURE_FLAGS };
}

// ── App Settings (Global Fonnte / WA Otomatis) ────────────────────────────────

/**
 * Config Fonnte global versi AMAN buat client: token-nya di-mask.
 * Jangan pernah balikin apiKey utuh ke browser — token ini punya developer
 * dan tagihannya juga ke developer.
 */
export async function getGlobalFonnteConfigMasked(): Promise<MaskedGlobalFonnteConfig> {
  await verifySuperAdmin();
  const config = await getGlobalFonnteConfig();
  const apiKey = config.apiKey?.trim() ?? "";

  return {
    apiKeyMasked: maskApiKey(apiKey),
    hasApiKey: apiKey.length > 0,
    isEnabled: config.isEnabled,
  };
}

const globalFonnteSchema = z.object({
  apiKey: z.string().max(500),
  isEnabled: z.boolean(),
});

/**
 * Simpan config Fonnte global.
 *
 * Aturan penting soal apiKey: kalau yang dikirim kosong ATAU masih bentuk
 * ter-mask (mengandung bullet), token lama DIPERTAHANKAN. Tanpa ini, developer
 * yang cuma mau geser toggle "Aktifkan" bakal nggak sengaja nimpa token asli
 * dengan bullet dan semua WA otomatis mati diam-diam.
 */
export async function updateGlobalFonnteConfig(
  config: GlobalFonnteConfig
): Promise<ActionResponse<MaskedGlobalFonnteConfig>> {
  await verifySuperAdmin();

  const parsed = globalFonnteSchema.safeParse(config);
  if (!parsed.success) {
    return { success: false, error: "Konfigurasi WA otomatis tidak valid." };
  }

  try {
    const existing = await getGlobalFonnteConfig();
    const incoming = parsed.data.apiKey.trim();
    const keepExisting = incoming.length === 0 || isMaskedApiKey(incoming);
    const apiKey = keepExisting ? existing.apiKey : incoming;

    if (parsed.data.isEnabled && apiKey.trim().length === 0) {
      return {
        success: false,
        error: "Isi API Key Fonnte dulu sebelum mengaktifkan WA otomatis.",
      };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("app_settings")
      .upsert({ id: "global_fonnte_config", value: { apiKey, isEnabled: parsed.data.isEnabled } });

    if (error) return { success: false, error: "Gagal menyimpan pengaturan WA otomatis." };

    revalidatePath("/superadmin");
    // Balikin bentuk ter-mask supaya form bisa update tampilannya sendiri.
    return {
      success: true,
      data: {
        apiKeyMasked: maskApiKey(apiKey),
        hasApiKey: apiKey.trim().length > 0,
        isEnabled: parsed.data.isEnabled,
      },
    };
  } catch {
    return { success: false, error: "Terjadi gangguan sistem." };
  }
}
