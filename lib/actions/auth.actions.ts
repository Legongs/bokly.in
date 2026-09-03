"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ActionResponse } from "./tenant.actions";

// ── Schemas (Tone of Voice: Kasual & Ramah) ───────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Format email-nya kurang pas nih."),
  password: z.string().min(6, "Password minimal 6 karakter ya."),
});

const registerSchema = z.object({
  email: z.string().email("Format email-nya kurang pas nih."),
  password: z.string().min(6, "Password minimal 6 karakter biar aman ya."),
  business_name: z
    .string()
    .min(2, "Nama bisnis minimal 2 huruf ya.")
    .max(100, "Kepanjangan nih, maksimal 100 huruf aja ya.")
    .trim(),
  business_type: z.enum([
    "salon",
    "klinik",
    "konsultasi",
    "studio_foto",
    "cuci_kendaraan",
    "olahraga",
    "servis",
    "lainnya",
  ]),
  whatsapp_number: z
    .string()
    .min(10, "Nomor WA kependekan, minimal 10 angka ya.")
    .max(16, "Nomor WA kepanjangan, maksimal 16 angka ya.")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,11}$/,
      "Format WA-nya kurang pas. Pakai awalan 08 atau 628 ya."
    ),
  slug: z
    .string()
    .min(3, "URL toko minimal 3 huruf ya.")
    .max(50, "URL toko maksimal 50 huruf ya.")
    .regex(/^[a-z0-9-]+$/, "Cuma boleh pakai huruf kecil, angka, dan strip (-) ya.")
    .trim(),
});

export type LoginPayload = z.infer<typeof loginSchema>;
export type RegisterPayload = z.infer<typeof registerSchema>;

// ── Actions ───────────────────────────────────────────────────────────────────

export async function login(payload: unknown): Promise<ActionResponse<any>> {
  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data kurang pas nih." };
  }

  // Rate Limiting: Max 5 attempts per 5 minutes per email
  const rateLimitKey = `login_${parsed.data.email}`;
  if (!checkRateLimit(rateLimitKey, 5, 300_000)) {
    return { success: false, error: "Terlalu banyak percobaan login. Tunggu 5 menit lagi ya." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return { success: false, error: "Email atau password-nya salah nih. Cek lagi yuk!" };
      }
      if (error.message.includes("Email not confirmed")) {
        return { success: false, error: "Email kamu belum dikonfirmasi nih. Cek inbox ya!" };
      }
      return { success: false, error: `Gagal login (${error.message}). Coba muat ulang halamannya ya.` };
    }

    return { success: true, data: data.user };
  } catch {
    return { success: false, error: "Server kita lagi ngambek dikit nih. Coba lagi ya." };
  }
}

export async function register(payload: unknown): Promise<ActionResponse<any>> {
  const parsed = registerSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data kurang pas nih." };
  }

  const { email, password, business_name, business_type, whatsapp_number, slug } = parsed.data;

  // Rate Limiting: Max 3 attempts per 10 minutes per email
  const rateLimitKey = `register_${email}`;
  if (!checkRateLimit(rateLimitKey, 3, 600_000)) {
    return { success: false, error: "Tunggu sebentar ya sebelum mencoba daftar lagi." };
  }

  try {
    const supabase = await createClient();

    // 1. Cek apakah slug sudah dipakai (Validasi Slug awal)
    const { data: existingTenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingTenant) {
      return {
        success: false,
        error: "Yah, URL toko ini udah dipakai orang lain. Coba cari nama lain yuk!",
      };
    }

    // 2. Register ke Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      if (authError?.message.includes("already registered")) {
        return { success: false, error: "Email ini udah pernah didaftarin. Langsung login aja yuk!" };
      }
      return { success: false, error: "Gagal bikin akun nih. Coba klik sekali lagi ya." };
    }

    const userId = authData.user.id;

    // 3. Insert ke tabel tenants menggunakan Service Role agar tidak terblokir RLS
    // karena session SSR belum terpasang penuh pada request yang sama.
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: insertError } = await adminSupabase.from("tenants").insert({
      id: userId,
      slug,
      business_name,
      business_type,
      whatsapp_number,
    });

    if (insertError) {
      // Jika terjadi race condition (slug diambil di milidetik yang sama)
      if (insertError.code === "23505") {
        return {
          success: false,
          error: "Waduh, URL toko ini baru aja diambil orang lain. Ganti nama dikit yuk!",
        };
      }
      return { success: false, error: "Gagal nyimpen profil toko kamu. Hubungi admin ya." };
    }

    revalidatePath("/dashboard");
    return { success: true, data: authData.user };
  } catch {
    return { success: false, error: "Server kita lagi ngambek dikit nih. Coba lagi ya." };
  }
}
