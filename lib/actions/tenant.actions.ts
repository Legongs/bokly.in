"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Tenant, Service } from "@/types/database.types";

// ── Shared response type ──────────────────────────────────────────────────────
export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ── Schemas ───────────────────────────────────────────────────────────────────
const slugSchema = z
  .string()
  .min(3, "Slug minimal 3 huruf ya.")
  .max(50, "Slug maksimal 50 huruf ya.")
  .regex(/^[a-z0-9-]+$/, "Slug cuma boleh pakai huruf kecil, angka, sama tanda strip (-).");

const uuidSchema = z.string().uuid("ID Tenant tidak valid");

// ── getTenantBySlug ───────────────────────────────────────────────────────────
/**
 * Ambil satu tenant aktif berdasarkan slug-nya.
 * Hanya mengembalikan tenant dengan is_active = true (sesuai RLS policy).
 */
export async function getTenantBySlug(
  slug: string
): Promise<ActionResponse<Tenant>> {
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return { success: false, error: "Slug tenant tidak valid" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("slug", parsed.data)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return { success: false, error: "Wah, outlet-nya nggak ketemu atau lagi tutup nih." };
    }

    return { success: true, data: data as Tenant };
  } catch {
    return { success: false, error: "Duh, server kita lagi agak ngambek. Coba muat ulang halamannya ya." };
  }
}

// ── getServicesByTenant ───────────────────────────────────────────────────────
/**
 * Ambil semua layanan milik satu tenant, diurutkan dari harga terendah.
 */
export async function getServicesByTenant(
  tenantId: string
): Promise<ActionResponse<Service[]>> {
  const parsed = uuidSchema.safeParse(tenantId);
  if (!parsed.success) {
    return { success: false, error: "ID Tenant tidak valid" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("tenant_id", parsed.data)
      .order("price", { ascending: true });

    if (error) {
      return { success: false, error: "Yah, gagal muat daftar layanan nih." };
    }

    return { success: true, data: (data ?? []) as Service[] };
  } catch {
    return { success: false, error: "Duh, server kita lagi agak ngambek. Coba muat ulang halamannya ya." };
  }
}

// ── updateTenantSettings ───────────────────────────────────────────────────────
// Menangani pembaruan data pengaturan profil toko (bisnis, WA, Telegram, QRIS)

const updateTenantSettingsSchema = z.object({
  id: z.string().uuid("ID Tenant-nya kurang pas nih."),
  business_name: z.string().min(2, "Nama toko minimal 2 huruf dong.").max(100, "Nama toko kepanjangan nih.").trim(),
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
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Format WA kurang pas. Pakai awalan 08 atau 628 ya."),
  telegram_chat_id: z.string().nullable().optional(),
  open_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam buka harus HH:MM (contoh: 09:00)").default("09:00"),
  close_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam tutup harus HH:MM (contoh: 21:00)").default("21:00"),
  timezone: z.string().default("Asia/Jakarta"),
});

type UpdateTenantSettingsInput = z.infer<typeof updateTenantSettingsSchema>;

export async function updateTenantSettings(
  input: UpdateTenantSettingsInput
): Promise<ActionResponse<Tenant>> {
  const parsed = updateTenantSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ada data yang kurang pas nih." };
  }

  try {
    const supabase = await createClient();

    // Verifikasi keamanan ganda (Mencegah Data Bleeding / Bypassing RLS)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== parsed.data.id) {
      return { success: false, error: "Akses ditolak: Anda tidak memiliki akses untuk memperbarui pengaturan tenant ini." };
    }

    const { data, error } = await supabase
      .from("tenants")
      .update({
        business_name: parsed.data.business_name,
        business_type: parsed.data.business_type,
        whatsapp_number: parsed.data.whatsapp_number,
        telegram_chat_id: parsed.data.telegram_chat_id || null,
        open_time: parsed.data.open_time,
        close_time: parsed.data.close_time,
        timezone: parsed.data.timezone,
      })
      .eq("id", parsed.data.id) // Aman karena user.id sudah divalidasi sama dengan parsed.data.id
      .select()
      .single();

    if (error) {
      return { success: false, error: "Yah, gagal nyimpen pengaturan toko. Coba lagi ya." };
    }

    const tenant = data as Tenant;
    revalidatePath(`/${tenant.slug}`, "page");
    revalidatePath("/dashboard", "layout"); // Invalidasi seluruh dashboard

    return { success: true, data: tenant };
  } catch {
    return { success: false, error: "Duh, server kita lagi agak ngambek. Coba muat ulang halamannya ya." };
  }
}

// ── updatePaymentSettings ────────────────────────────────────────────────────────
const updatePaymentSettingsSchema = z.object({
  id: z.string().uuid("ID Tenant-nya kurang pas nih."),
  qris_image_url: z.string().url("Wah, link QRIS-nya nggak valid nih.").nullable().optional().or(z.literal("")),
  payment_method_type: z.enum(["manual", "gateway"]).default("manual"),
  payment_gateway_provider: z.enum(["midtrans", "xendit"]).nullable().optional(),
  payment_gateway_server_key: z.string().nullable().optional(),
  payment_gateway_client_key: z.string().nullable().optional(),
});

type UpdatePaymentSettingsInput = z.infer<typeof updatePaymentSettingsSchema>;

export async function updatePaymentSettings(
  input: UpdatePaymentSettingsInput
): Promise<ActionResponse<Tenant>> {
  const parsed = updatePaymentSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ada data yang kurang pas nih." };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== parsed.data.id) {
      return { success: false, error: "Akses ditolak: Anda tidak memiliki akses untuk memperbarui pengaturan tenant ini." };
    }

    const finalQris = parsed.data.qris_image_url === "" ? null : parsed.data.qris_image_url;

    const { data, error } = await supabase
      .from("tenants")
      .update({
        qris_image_url: finalQris,
        payment_method_type: parsed.data.payment_method_type,
        payment_gateway_provider: parsed.data.payment_gateway_provider || null,
        payment_gateway_server_key: parsed.data.payment_gateway_server_key || null,
        payment_gateway_client_key: parsed.data.payment_gateway_client_key || null,
      })
      .eq("id", parsed.data.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: "Yah, gagal nyimpen pengaturan pembayaran. Coba lagi ya." };
    }

    const tenant = data as Tenant;
    revalidatePath(`/${tenant.slug}`, "page");
    revalidatePath("/dashboard", "layout");

    return { success: true, data: tenant };
  } catch {
    return { success: false, error: "Duh, server kita lagi agak ngambek. Coba muat ulang halamannya ya." };
  }
}

// ── updateWaSettings ───────────────────────────────────────────────────────────
const updateWaSettingsSchema = z.object({
  id: z.string().uuid("ID Tenant-nya kurang pas nih."),
  wa_method: z.enum(["manual", "api"]),
  wa_api_key: z.string().nullable().optional(),
});

type UpdateWaSettingsInput = z.infer<typeof updateWaSettingsSchema>;

export async function updateWaSettings(
  input: UpdateWaSettingsInput
): Promise<ActionResponse<Tenant>> {
  const parsed = updateWaSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ada data yang kurang pas nih." };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== parsed.data.id) {
      return { success: false, error: "Akses ditolak: Anda tidak memiliki akses untuk memperbarui pengaturan tenant ini." };
    }

    const { data, error } = await supabase
      .from("tenants")
      .update({
        wa_method: parsed.data.wa_method,
        wa_api_key: parsed.data.wa_method === "api" ? (parsed.data.wa_api_key || null) : null,
      })
      .eq("id", parsed.data.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: "Yah, gagal nyimpen pengaturan WhatsApp. Coba lagi ya." };
    }

    const tenant = data as Tenant;
    revalidatePath(`/${tenant.slug}`, "page");
    revalidatePath("/dashboard", "layout");

    return { success: true, data: tenant };
  } catch {
    return { success: false, error: "Duh, server kita lagi agak ngambek. Coba muat ulang halamannya ya." };
  }
}
// ── updateSiteSettings ─────────────────────────────────────────────────────────
const updateSiteSettingsSchema = z.object({
  id: z.string().uuid("ID Tenant-nya kurang pas nih."),
  hero_image_url: z.string().url("Link gambarnya nggak valid nih. Pastikan pakai http/https.").nullable().optional().or(z.literal("")),
  welcome_message: z.string().max(300, "Pesan sambutannya kepanjangan, maksimal 300 huruf aja ya.").nullable().optional(),
  address: z.string().max(250, "Alamat kepanjangan nih.").nullable().optional(),
  instagram_handle: z.string().max(50, "Username IG kepanjangan.").nullable().optional(),
  cancellation_policy: z.string().max(500, "Kebijakan pembatalan kepanjangan.").nullable().optional(),
  theme_color: z.enum(["teal", "rose", "orange", "violet", "blue"]).default("teal"),
});

type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;

export async function updateSiteSettings(
  input: UpdateSiteSettingsInput
): Promise<ActionResponse<Tenant>> {
  const parsed = updateSiteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ada data yang kurang pas nih." };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== parsed.data.id) {
      return { success: false, error: "Akses ditolak: Anda tidak memiliki akses." };
    }

    // Format fields
    const finalHero = parsed.data.hero_image_url === "" ? null : parsed.data.hero_image_url;
    let finalIg = parsed.data.instagram_handle?.trim() || null;
    if (finalIg && !finalIg.startsWith('@') && !finalIg.includes('instagram.com')) {
      finalIg = '@' + finalIg;
    } else if (finalIg && finalIg.includes('instagram.com/')) {
      finalIg = '@' + finalIg.split('instagram.com/')[1].replace('/', '');
    }

    const { data, error } = await supabase
      .from("tenants")
      .update({
        hero_image_url: finalHero,
        welcome_message: parsed.data.welcome_message?.trim() || null,
        address: parsed.data.address?.trim() || null,
        instagram_handle: finalIg,
        cancellation_policy: parsed.data.cancellation_policy?.trim() || null,
        theme_color: parsed.data.theme_color,
      })
      .eq("id", parsed.data.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: "Yah, gagal nyimpen pengaturan situs. Coba lagi ya." };
    }

    const tenant = data as Tenant;
    revalidatePath(`/${tenant.slug}`, "page");
    revalidatePath("/dashboard", "layout");

    return { success: true, data: tenant };
  } catch {
    return { success: false, error: "Duh, server kita lagi agak ngambek. Coba muat ulang halamannya ya." };
  }
}
