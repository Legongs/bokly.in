import { createClient } from "@/lib/supabase/server";
import type { Subscription, SubscriptionPlan } from "@/types/database.types";

// ── Constants ─────────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  free: {
    maxBookingsPerMonth: 30,
    maxServices: 3,
    maxStaff: 1,
    hasReminders: false,
    hasAnalytics: false,
    hasLogoUpload: false,
    hasRemoveBranding: false,
    supportLevel: "community" as const,
  },
  pro: {
    maxBookingsPerMonth: Infinity,
    maxServices: Infinity,
    maxStaff: 5,
    hasReminders: true,
    hasAnalytics: true,
    hasLogoUpload: true,
    hasRemoveBranding: false,
    supportLevel: "email" as const,
  },
  bisnis: {
    maxBookingsPerMonth: Infinity,
    maxServices: Infinity,
    maxStaff: Infinity,
    hasReminders: true,
    hasAnalytics: true,
    hasLogoUpload: true,
    hasRemoveBranding: true,
    supportLevel: "whatsapp" as const,
  },
} as const;

export const PLAN_PRICES = {
  pro: { monthly: 49000, yearly: 470400 },
  bisnis: { monthly: 119000, yearly: 1140000 },
} as const;

export const FREE_SUBSCRIPTION: Subscription = {
  id: "",
  tenant_id: "",
  plan: "free",
  status: "active",
  billing_cycle: null,
  current_period_start: null,
  current_period_end: null,
  midtrans_order_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Ambil subscription tenant dari DB.
 * Jika tidak ditemukan, fallback ke paket free (safe default).
 */
export async function getTenantSubscription(tenantId: string): Promise<Subscription> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("tenant_id", tenantId)
      .single();

    if (!data) return { ...FREE_SUBSCRIPTION, tenant_id: tenantId };

    // Cek apakah subscription sudah expired
    if (
      data.status === "active" &&
      data.current_period_end &&
      new Date(data.current_period_end) < new Date()
    ) {
      // Auto-downgrade ke free jika sudah expired (best-effort, tidak blocking)
      supabase
        .from("subscriptions")
        .update({ status: "expired", plan: "free" })
        .eq("tenant_id", tenantId)
        .then(() => {});

      return { ...data, plan: "free", status: "expired" };
    }

    return data as Subscription;
  } catch {
    return { ...FREE_SUBSCRIPTION, tenant_id: tenantId };
  }
}

/**
 * Ambil plan limits untuk tenant berdasarkan subscription aktif.
 */
export async function getPlanLimits(tenantId: string) {
  const sub = await getTenantSubscription(tenantId);
  return PLAN_LIMITS[sub.plan as SubscriptionPlan] ?? PLAN_LIMITS.free;
}

// ── canPerformAction ──────────────────────────────────────────────────────────

type ActionType = "add_booking" | "add_service" | "add_staff" | "view_analytics" | "upload_logo";

interface CanPerformResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: SubscriptionPlan;
}

/**
 * Cek apakah tenant boleh melakukan aksi tertentu berdasarkan plan-nya.
 * Untuk add_booking dan add_staff/add_service, query count ke DB dilakukan di sini.
 */
export async function canPerformAction(
  tenantId: string,
  action: ActionType
): Promise<CanPerformResult> {
  try {
    const sub = await getTenantSubscription(tenantId);
    const plan = sub.plan as SubscriptionPlan;
    const limits = PLAN_LIMITS[plan];

    if (action === "view_analytics") {
      if (!limits.hasAnalytics) {
        return {
          allowed: false,
          reason: "Fitur Analisis hanya tersedia di paket Pro dan Bisnis.",
          upgradeRequired: "pro",
        };
      }
      return { allowed: true };
    }

    if (action === "upload_logo") {
      if (!limits.hasLogoUpload) {
        return {
          allowed: false,
          reason: "Upload logo hanya tersedia di paket Pro dan Bisnis.",
          upgradeRequired: "pro",
        };
      }
      return { allowed: true };
    }

    const supabase = await createClient();

    if (action === "add_booking") {
      if (limits.maxBookingsPerMonth === Infinity) return { allowed: true };

      // Hitung booking bulan ini (semua status kecuali rejected)
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .neq("payment_status", "rejected")
        .gte("created_at", firstOfMonth);

      if ((count ?? 0) >= limits.maxBookingsPerMonth) {
        return {
          allowed: false,
          reason: `Kuota booking bulan ini sudah habis (${limits.maxBookingsPerMonth} booking). Upgrade ke paket Pro untuk booking tak terbatas.`,
          upgradeRequired: "pro",
        };
      }
      return { allowed: true };
    }

    if (action === "add_service") {
      if (limits.maxServices === Infinity) return { allowed: true };

      const { count } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId);

      if ((count ?? 0) >= limits.maxServices) {
        return {
          allowed: false,
          reason: `Paket Gratis hanya mendukung ${limits.maxServices} layanan. Upgrade ke Pro untuk layanan tak terbatas.`,
          upgradeRequired: "pro",
        };
      }
      return { allowed: true };
    }

    if (action === "add_staff") {
      if (limits.maxStaff === Infinity) return { allowed: true };

      const { count } = await supabase
        .from("staff")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId);

      if ((count ?? 0) >= limits.maxStaff) {
        const upgradeRequired: SubscriptionPlan = plan === "free" ? "pro" : "bisnis";
        const planName = plan === "free" ? "Gratis" : "Pro";
        const targetPlan = plan === "free" ? "Pro" : "Bisnis";
        return {
          allowed: false,
          reason: `Paket ${planName} hanya mendukung maksimal ${limits.maxStaff} staf. Upgrade ke ${targetPlan} untuk menambah lebih banyak.`,
          upgradeRequired,
        };
      }
      return { allowed: true };
    }

    return { allowed: true };
  } catch {
    // Fail open — jika terjadi error, biarkan aksi dilakukan agar tidak memblok pengguna
    return { allowed: true };
  }
}
