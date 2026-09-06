import type { FeatureFlagsConfig, PlanConfig, SupportLevel } from "@/lib/subscription";

/**
 * Satu sumber kebenaran untuk "cara nulis" feature flags jadi teks yang dibaca
 * manusia — dipakai kartu harga di dashboard (billing) DAN di landing page.
 *
 * Kenapa dipisah dari lib/subscription.ts: file ini murni fungsi (nggak nyentuh
 * Supabase sama sekali), jadi aman diimpor dari client component. Efeknya:
 * begitu developer ubah matrix di superadmin, copy di kartu harga ikut berubah
 * tanpa ada teks yang perlu diedit manual.
 */

export type PlanKey = "free" | "pro" | "bisnis";

/** Fitur inti yang didapat SEMUA paket, nggak ada flag-nya karena selalu nyala. */
const CORE_FEATURES = ["Halaman booking unik bukly.id/nama-usahamu"];

const SUPPORT_LABELS: Record<SupportLevel, string> = {
  community: "Bantuan via pusat bantuan",
  email: "Support email 2×24 jam",
  whatsapp: "Support prioritas via WhatsApp",
};

/**
 * Label field buat matrix di superadmin. Ditaruh di sini biar label yang
 * dilihat developer dan teks yang dilihat calon tenant nggak jalan sendiri-sendiri.
 */
export const NUMERIC_FEATURE_FIELDS = [
  { key: "maxBookingsPerMonth", label: "Booking per bulan", unit: "booking", fallback: 30 },
  { key: "maxServices", label: "Jumlah layanan", unit: "layanan", fallback: 3 },
  { key: "maxStaff", label: "Jumlah staf", unit: "staf", fallback: 1 },
] as const satisfies ReadonlyArray<{
  key: keyof PlanConfig;
  label: string;
  unit: string;
  /** Dipakai UI superadmin waktu centang "Unlimited" dilepas. */
  fallback: number;
}>;

export const BOOLEAN_FEATURE_FIELDS = [
  { key: "hasReminders", label: "Fitur reminder", hint: "Payung fitur reminder ke pelanggan" },
  { key: "hasAutoWaReminder", label: "Reminder WA otomatis", hint: "H-3/H-2/H-1, biaya kirim ditanggung platform" },
  {
    key: "hasAutoWaNewBookingAlert",
    label: "Notif WA booking baru",
    hint: "WA ke tenant tiap ada booking masuk, pakai token global",
  },
  { key: "hasAnalytics", label: "Analitik & laporan", hint: "Halaman /dashboard/analytics" },
  { key: "hasLogoUpload", label: "Upload logo", hint: "Logo & foto profil usaha" },
  { key: "hasRemoveBranding", label: "Hapus branding bukly.id", hint: "Badge bukly.id di halaman booking" },
] as const satisfies ReadonlyArray<{
  key: keyof PlanConfig;
  label: string;
  hint: string;
}>;

export const PLAN_TAGLINES: Record<PlanKey, string> = {
  free: "Buat yang baru mulai dan pengen coba dulu",
  pro: "Buat usaha yang bookingnya udah rutin tiap hari",
  bisnis: "Buat yang punya banyak staf atau lebih dari satu cabang",
};

// ── Generator teks ────────────────────────────────────────────────────────────

function quotaLine(value: number | null, unlimited: string, limited: (n: number) => string): string {
  return value === null ? unlimited : limited(value);
}

/**
 * Ubah satu PlanConfig jadi daftar poin fitur.
 *
 * Aturannya: hanya fitur yang benar-benar AKTIF yang ditulis. Kalau developer
 * matiin sebuah flag di superadmin, poinnya hilang dari kartu — bukan berubah
 * jadi poin yang dicoret.
 */
export function buildPlanFeatures(plan: PlanConfig): string[] {
  const items: string[] = [
    quotaLine(plan.maxBookingsPerMonth, "Booking tak terbatas", (n) => `${n} booking per bulan`),
    quotaLine(plan.maxServices, "Layanan tak terbatas", (n) => `Maks ${n} layanan`),
    quotaLine(plan.maxStaff, "Staf tak terbatas", (n) => `Maks ${n} staf`),
    ...CORE_FEATURES,
  ];

  if (plan.hasAutoWaNewBookingAlert) {
    items.push("Notif WA otomatis tiap ada booking baru");
  } else {
    // Fitur manual ini memang ada dan dipakai paket Gratis — bukan janji kosong.
    items.push("Notif booking via WA manual");
  }

  if (plan.hasAutoWaReminder) {
    items.push("Reminder WA otomatis H-3, H-2 & H-1 ke pelanggan");
  } else if (plan.hasReminders) {
    items.push("Reminder WA ke pelanggan");
  }

  if (plan.hasAnalytics) items.push("Analitik & laporan performa usaha");
  if (plan.hasLogoUpload) items.push("Upload logo & foto profil usaha");
  if (plan.hasRemoveBranding) items.push("Tanpa branding bukly.id");

  items.push(SUPPORT_LABELS[plan.supportLevel] ?? SUPPORT_LABELS.community);

  return items;
}

export type PlanFeatureMap = Record<PlanKey, string[]>;

/** Versi praktis: sekali panggil, dapat teks fitur ketiga paket sekaligus. */
export function buildAllPlanFeatures(config: FeatureFlagsConfig): PlanFeatureMap {
  return {
    free: buildPlanFeatures(config.free),
    pro: buildPlanFeatures(config.pro),
    bisnis: buildPlanFeatures(config.bisnis),
  };
}

/** Buat teks batas yang enak dibaca, contoh "Tak terbatas" / "30 booking". */
export function formatLimit(value: number | null, unit: string): string {
  return value === null ? "Tak terbatas" : `${value} ${unit}`;
}
