import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Subscription, SubscriptionPlan } from "@/types/database.types";

// ── Types: Feature Flags ──────────────────────────────────────────────────────

export type SupportLevel = "community" | "email" | "whatsapp";

/**
 * Batas & fitur untuk SATU paket.
 *
 * KONVENSI PENTING: `null` artinya unlimited.
 * Dulu kode ini pakai `Infinity`, tapi Infinity nggak bisa disimpan di JSON
 * (JSON.stringify(Infinity) hasilnya `null`), sedangkan config-nya sekarang
 * hidup di kolom jsonb. Jadi semua batas angka disimpan sebagai number | null.
 */
export interface PlanConfig {
  maxBookingsPerMonth: number | null;
  maxServices: number | null;
  maxStaff: number | null;
  hasReminders: boolean;
  hasAnalytics: boolean;
  hasLogoUpload: boolean;
  hasRemoveBranding: boolean;
  /** Reminder WA otomatis H-3/H-2/H-1 — pakai kredensial Fonnte GLOBAL milik developer */
  hasAutoWaReminder: boolean;
  /** Notif WA ke tenant tiap ada booking baru — juga pakai kredensial global */
  hasAutoWaNewBookingAlert: boolean;
  /** Batas jumlah promo yang bisa dibuat. null = unlimited */
  maxPromotions: number | null;
  supportLevel: SupportLevel;
}

export interface FeatureFlagsConfig {
  free: PlanConfig;
  pro: PlanConfig;
  bisnis: PlanConfig;
}

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Fallback default kalau row app_settings 'feature_flags_config' belum diisi,
 * korup, atau gagal dibaca. Nilainya sama persis dengan PLAN_LIMITS versi lama,
 * plus dua flag WA otomatis yang baru.
 *
 * Sistem TIDAK BOLEH mati cuma gara-gara config di database kosong — makanya
 * default ini tetap tinggal di kode.
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlagsConfig = {
  free: {
    maxBookingsPerMonth: 30,
    maxServices: 3,
    maxStaff: 1,
    hasReminders: false,
    hasAnalytics: false,
    hasLogoUpload: false,
    hasRemoveBranding: false,
    hasAutoWaReminder: false,
    hasAutoWaNewBookingAlert: false,
    maxPromotions: 1,
    supportLevel: "community",
  },
  pro: {
    maxBookingsPerMonth: null,
    maxServices: null,
    maxStaff: 5,
    hasReminders: true,
    hasAnalytics: true,
    hasLogoUpload: true,
    hasRemoveBranding: false,
    hasAutoWaReminder: true,
    hasAutoWaNewBookingAlert: true,
    maxPromotions: null,
    supportLevel: "email",
  },
  bisnis: {
    maxBookingsPerMonth: null,
    maxServices: null,
    maxStaff: null,
    hasReminders: true,
    hasAnalytics: true,
    hasLogoUpload: true,
    hasRemoveBranding: true,
    hasAutoWaReminder: true,
    hasAutoWaNewBookingAlert: true,
    maxPromotions: null,
    supportLevel: "whatsapp",
  },
};

/**
 * @deprecated Sumber kebenaran sekarang di database — pakai getFeatureFlagsConfig()
 * atau getPlanLimits(tenantId). Alias ini dipertahankan supaya kode/impor lama
 * nggak rusak, isinya identik dengan DEFAULT_FEATURE_FLAGS.
 */
export const PLAN_LIMITS = DEFAULT_FEATURE_FLAGS;

export const PLAN_KEYS = ["free", "pro", "bisnis"] as const;

/** Label paket buat ditampilkan ke tenant (dipakai di pesan error kuota juga). */
export const PLAN_LABELS: Record<string, string> = {
  free: "Gratis",
  pro: "Pro",
  bisnis: "Bisnis",
};

export const PLAN_PRICES = {
  pro: { monthly: 49000, yearly: 470400 },
  bisnis: { monthly: 119000, yearly: 1140000 },
} as const;

export type PlanPricesType = typeof PLAN_PRICES;

/**
 * Ambil konfigurasi harga dari app_settings di database.
 * Jika gagal, fallback ke konstanta PLAN_PRICES.
 */
export async function getDynamicPricing(): Promise<PlanPricesType> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("id", "pricing_config")
      .single();

    if (error || !data) {
      return PLAN_PRICES;
    }

    return data.value as unknown as PlanPricesType;
  } catch (error) {
    console.error("Failed to fetch dynamic pricing:", error);
    return PLAN_PRICES;
  }
}

// ── Feature Flags Dinamis ─────────────────────────────────────────────────────

/**
 * Gabungkan config mentah dari database dengan default.
 *
 * Kenapa perlu di-merge per-field, bukan langsung dipakai: row jsonb bisa
 * ketinggalan jaman (misal disimpan sebelum flag WA otomatis ada). Kalau
 * langsung di-cast, flag baru jadi `undefined` dan pengecekan fitur bakal
 * salah baca sebagai "nggak boleh". Merge bikin field yang hilang otomatis
 * balik ke default.
 */
function normalizePlanConfig(raw: unknown, fallback: PlanConfig): PlanConfig {
  if (!raw || typeof raw !== "object") return fallback;
  const src = raw as Record<string, unknown>;

  // null = unlimited (valid), undefined/bukan angka = pakai default
  const num = (key: keyof PlanConfig, def: number | null): number | null => {
    if (!(key in src)) return def;
    const v = src[key];
    if (v === null) return null;
    return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : def;
  };

  const bool = (key: keyof PlanConfig, def: boolean): boolean =>
    typeof src[key] === "boolean" ? (src[key] as boolean) : def;

  const support = (): SupportLevel => {
    const v = src.supportLevel;
    return v === "community" || v === "email" || v === "whatsapp" ? v : fallback.supportLevel;
  };

  return {
    maxBookingsPerMonth: num("maxBookingsPerMonth", fallback.maxBookingsPerMonth),
    maxServices: num("maxServices", fallback.maxServices),
    maxStaff: num("maxStaff", fallback.maxStaff),
    hasReminders: bool("hasReminders", fallback.hasReminders),
    hasAnalytics: bool("hasAnalytics", fallback.hasAnalytics),
    hasLogoUpload: bool("hasLogoUpload", fallback.hasLogoUpload),
    hasRemoveBranding: bool("hasRemoveBranding", fallback.hasRemoveBranding),
    hasAutoWaReminder: bool("hasAutoWaReminder", fallback.hasAutoWaReminder),
    hasAutoWaNewBookingAlert: bool("hasAutoWaNewBookingAlert", fallback.hasAutoWaNewBookingAlert),
    maxPromotions: num("maxPromotions", fallback.maxPromotions),
    supportLevel: support(),
  };
}

/**
 * Ambil konfigurasi feature flags dari app_settings id='feature_flags_config'.
 * Kalau belum di-set / error / bentuknya aneh, balik ke DEFAULT_FEATURE_FLAGS.
 *
 * Pakai createAdminClient (bukan client user) karena fungsi ini jadi dasar
 * pengecekan kuota & fitur — nggak boleh gagal cuma karena sesi user atau
 * policy RLS berubah. Row-nya sendiri juga dibuka untuk dibaca publik di
 * migration 00016 supaya halaman harga bisa ikut baca.
 */
export async function getFeatureFlagsConfig(): Promise<FeatureFlagsConfig> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("id", "feature_flags_config")
      .single();

    if (error || !data?.value) return DEFAULT_FEATURE_FLAGS;

    const raw = data.value as Record<string, unknown>;
    return {
      free: normalizePlanConfig(raw.free, DEFAULT_FEATURE_FLAGS.free),
      pro: normalizePlanConfig(raw.pro, DEFAULT_FEATURE_FLAGS.pro),
      bisnis: normalizePlanConfig(raw.bisnis, DEFAULT_FEATURE_FLAGS.bisnis),
    };
  } catch (error) {
    console.error("Failed to fetch feature flags config:", error);
    return DEFAULT_FEATURE_FLAGS;
  }
}

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
 * Sumbernya sekarang database (feature flags dinamis), bukan konstanta.
 */
export async function getPlanLimits(tenantId: string): Promise<PlanConfig> {
  const [sub, config] = await Promise.all([
    getTenantSubscription(tenantId),
    getFeatureFlagsConfig(),
  ]);
  return config[sub.plan as SubscriptionPlan] ?? config.free;
}

/**
 * Cek apakah tenant berhak dapat fitur WA otomatis (yang biayanya ditanggung
 * developer platform, pakai kredensial Fonnte global).
 *
 * Dipakai oleh cron reminder & notif booking baru. Sengaja fail-CLOSED: kalau
 * ada error, jawabannya false — mending pesan nggak terkirim daripada developer
 * kena tagihan kirim WA buat tenant paket Gratis.
 */
export async function canUseAutoWaFeature(
  tenantId: string,
  feature: "reminder" | "new_booking_alert"
): Promise<boolean> {
  try {
    const limits = await getPlanLimits(tenantId);
    return feature === "reminder" ? limits.hasAutoWaReminder : limits.hasAutoWaNewBookingAlert;
  } catch (error) {
    console.error("canUseAutoWaFeature failed:", error);
    return false;
  }
}

// ── canPerformAction ──────────────────────────────────────────────────────────

type ActionType = "add_booking" | "add_service" | "add_staff" | "view_analytics" | "upload_logo" | "add_promotion";

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
    const config = await getFeatureFlagsConfig();
    const limits = config[plan] ?? config.free;

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

    if (action === "add_promotion") {
      if (limits.maxPromotions === null) return { allowed: true };

      const supabase = await createClient();
      const { count } = await supabase
        .from("promotions")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId);

      if ((count ?? 0) >= limits.maxPromotions) {
        const upgradeRequired: SubscriptionPlan = plan === "free" ? "pro" : "bisnis";
        const planName = plan === "free" ? "Gratis" : "Pro";
        const targetPlan = plan === "free" ? "Pro" : "Bisnis";
        return {
          allowed: false,
          reason: `Paket ${planName} hanya mendukung maksimal ${limits.maxPromotions} promo. Upgrade ke ${targetPlan} untuk membuat promo tak terbatas.`,
          upgradeRequired,
        };
      }
      return { allowed: true };
    }

    const supabase = await createClient();

    if (action === "add_booking") {
      if (limits.maxBookingsPerMonth === null) return { allowed: true };

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
      if (limits.maxServices === null) return { allowed: true };

      const { count } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId);

      if ((count ?? 0) >= limits.maxServices) {
        return {
          allowed: false,
          reason: `Paket ${PLAN_LABELS[plan] ?? plan} cuma bisa ${limits.maxServices} layanan. Upgrade ke Pro buat layanan tak terbatas.`,
          upgradeRequired: "pro",
        };
      }
      return { allowed: true };
    }

    if (action === "add_staff") {
      if (limits.maxStaff === null) return { allowed: true };

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
