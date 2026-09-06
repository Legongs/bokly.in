import { createAdminClient } from "@/lib/supabase/server";

/**
 * Kredensial Fonnte GLOBAL — milik developer platform, bukan tenant.
 *
 * Bedakan dengan `tenants.wa_api_key`: itu token milik tenant sendiri, dipakai
 * buat blast manual mereka. Yang ini token developer, dipakai buat fitur WA
 * otomatis (reminder + notif booking baru) yang biayanya ditanggung platform
 * untuk tenant paket Pro & Bisnis. JANGAN dicampur.
 */
export interface GlobalFonnteConfig {
  apiKey: string;
  /** Saklar utama. Kalau false, semua pengiriman WA otomatis berhenti total. */
  isEnabled: boolean;
}

const DEFAULT_CONFIG: GlobalFonnteConfig = {
  apiKey: "",
  isEnabled: false,
};

/**
 * Baca konfigurasi Fonnte global dari app_settings id='global_fonnte_config'.
 * Pola-nya sama dengan getMidtransConfig() di lib/midtrans.ts.
 *
 * Selalu pakai createAdminClient() — row ini sengaja NGGAK punya policy SELECT
 * publik (lihat migration 00016), jadi cuma service role yang boleh baca.
 * Kalau row-nya belum ada / error, balik ke default yang "mati" supaya nggak
 * ada pesan terkirim pakai token kosong.
 */
export async function getGlobalFonnteConfig(): Promise<GlobalFonnteConfig> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("id", "global_fonnte_config")
      .single();

    if (error || !data?.value) {
      return DEFAULT_CONFIG;
    }

    const raw = data.value as Record<string, unknown>;
    return {
      apiKey: typeof raw.apiKey === "string" ? raw.apiKey : DEFAULT_CONFIG.apiKey,
      isEnabled: typeof raw.isEnabled === "boolean" ? raw.isEnabled : DEFAULT_CONFIG.isEnabled,
    };
  } catch (error) {
    console.error("Failed to fetch global Fonnte config:", error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Helper kecil: config-nya siap dipakai kirim pesan atau belum.
 * Dipakai sebagai gerbang pertama sebelum semua pengiriman WA otomatis.
 */
export function isGlobalWaReady(config: GlobalFonnteConfig): boolean {
  return config.isEnabled && config.apiKey.trim().length > 0;
}

// ── Masking (buat ditampilkan di panel superadmin) ────────────────────────────

/** Bentuk aman yang boleh dikirim ke browser — tanpa token asli. */
export interface MaskedGlobalFonnteConfig {
  /** Contoh: "••••••••abcd". String kosong kalau token belum pernah diisi. */
  apiKeyMasked: string;
  hasApiKey: boolean;
  isEnabled: boolean;
}

const MASK_CHAR = "•";

/**
 * Sisakan 4 karakter terakhir, sisanya diganti bullet.
 * Tujuannya biar developer bisa mastiin "token yang kesimpan itu yang mana",
 * tanpa token utuhnya ikut nongol di tab Network browser.
 */
export function maskApiKey(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (!trimmed) return "";
  if (trimmed.length <= 4) return MASK_CHAR.repeat(trimmed.length);
  return MASK_CHAR.repeat(Math.min(trimmed.length - 4, 12)) + trimmed.slice(-4);
}

/**
 * Deteksi apakah nilai yang dikirim balik dari form itu cuma versi ter-mask
 * (artinya developer nggak ngetik token baru). Penting: tanpa ini, tekan
 * "Simpan" cuma buat ganti toggle bakal MENIMPA token asli dengan bullet.
 */
export function isMaskedApiKey(value: string): boolean {
  return value.includes(MASK_CHAR);
}

