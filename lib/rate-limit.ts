import { createAdminClient } from "@/lib/supabase/server";

/**
 * Database-backed Rate Limiter
 * Menggunakan Supabase RPC untuk menghitung dan mengecek limit secara tersentralisasi.
 * Cocok untuk lingkungan Serverless (Vercel) yang tersebar di banyak edge/lambda.
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await (supabase as any).rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs
    });

    if (error) {
      console.error("Rate limit check failed:", error);
      // Jika terjadi error pada DB, lebih baik allow saja (fail-open) agar tidak memblokir pengguna sah
      return true;
    }

    return data; // returns true jika allowed, false jika terkena limit
  } catch (err) {
    console.error("Rate limit check exception:", err);
    return true; // fail-open
  }
}
