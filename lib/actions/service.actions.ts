"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/types/database.types";
import type { ActionResponse } from "./tenant.actions";
import { canPerformAction } from "@/lib/subscription";

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Nama layanannya minimal 3 huruf dong.").max(100, "Kepanjangan, maksimal 100 huruf aja."),
  duration_minutes: z.coerce.number().min(5, "Pengerjaan paling bentar 5 menit ya.").max(1440, "Maksimal 24 jam dong."),
  price: z.coerce.number().min(0, "Harganya nggak boleh minus ya."),
  dp_amount: z.coerce.number().min(0, "DP-nya nggak boleh minus juga.").default(0),
  buffer_minutes: z.coerce.number().min(0, "Waktu jeda nggak boleh minus.").default(0),
  max_capacity: z.coerce.number().min(1, "Kapasitas minimal 1 orang.").default(1),
  category: z.string().max(50, "Maksimal 50 huruf aja.").optional().nullable(),
  // Durasi fleksibel (TASK 4) — sektor space
  is_flexible_duration: z.boolean().default(false),
  min_duration_minutes: z.coerce.number().min(5).max(1440).nullable().optional(),
  max_duration_minutes: z.coerce.number().min(5).max(1440).nullable().optional(),
  duration_step_minutes: z.coerce.number().min(5).max(480).nullable().optional(),
  // Meta fields untuk sektor beauty (semua opsional)
  specialty_tag: z.string().max(60).optional().nullable(),
  is_female_only: z.boolean().default(false).optional(),
  service_category: z.enum(["basic", "premium", "expert"]).optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.is_flexible_duration) {
    if (!data.min_duration_minutes) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["min_duration_minutes"], message: "Durasi minimal wajib diisi untuk layanan fleksibel." });
    }
    if (!data.max_duration_minutes) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["max_duration_minutes"], message: "Durasi maksimal wajib diisi untuk layanan fleksibel." });
    }
    if (data.min_duration_minutes && data.max_duration_minutes && data.min_duration_minutes >= data.max_duration_minutes) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["max_duration_minutes"], message: "Durasi maksimal harus lebih besar dari durasi minimal." });
    }
  }
});

export type ServicePayload = z.infer<typeof serviceSchema>;

// Helper: dapatkan slug tenant untuk invalidasi path
async function getTenantSlug(supabase: any, tenantId: string): Promise<string | null> {
  const { data } = await supabase.from("tenants").select("slug").eq("id", tenantId).single();
  return data?.slug || null;
}

export async function createService(payload: unknown): Promise<ActionResponse<Service>> {
  const parsed = serviceSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ada data yang kurang pas nih." };
  }

  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) {
      return { success: false, error: "Eh, kamu belum login nih." };
    }

    const tenantId = authData.user.id;

    // Cek limit layanan sesuai paket
    const quotaCheck = await canPerformAction(tenantId, "add_service");
    if (!quotaCheck.allowed) {
      return {
        success: false,
        error: quotaCheck.reason ?? "Kuota layanan paket Gratis sudah penuh (maks. 3). Upgrade ke Pro untuk layanan tak terbatas.",
      };
    }

    const { data, error } = await supabase
      .from("services")
      .insert({
        tenant_id: tenantId,
        name: parsed.data.name,
        duration_minutes: parsed.data.duration_minutes,
        price: parsed.data.price,
        dp_amount: parsed.data.dp_amount,
        buffer_minutes: parsed.data.buffer_minutes,
        max_capacity: parsed.data.max_capacity,
        category: parsed.data.category,
        is_flexible_duration: parsed.data.is_flexible_duration,
        min_duration_minutes: parsed.data.is_flexible_duration ? (parsed.data.min_duration_minutes ?? null) : null,
        max_duration_minutes: parsed.data.is_flexible_duration ? (parsed.data.max_duration_minutes ?? null) : null,
        duration_step_minutes: parsed.data.is_flexible_duration ? (parsed.data.duration_step_minutes ?? 30) : null,
        specialty_tag: parsed.data.specialty_tag ?? null,
        is_female_only: parsed.data.is_female_only ?? false,
        service_category: parsed.data.service_category ?? null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: "Yah, gagal nambahin layanan baru. Coba lagi ya." };
    }

    const slug = await getTenantSlug(supabase, tenantId);
    if (slug) revalidatePath(`/${slug}`, "page");
    revalidatePath("/dashboard/services");

    return { success: true, data: data as Service };
  } catch {
    return { success: false, error: "Server kita lagi ngambek nih. Coba klik lagi ya." };
  }
}

export async function updateService(payload: unknown): Promise<ActionResponse<Service>> {
  const parsed = serviceSchema.safeParse(payload);
  if (!parsed.success || !parsed.data.id) {
    return { success: false, error: parsed.error?.issues[0]?.message ?? "Data layanan kurang lengkap nih." };
  }

  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) {
      return { success: false, error: "Eh, kamu belum login nih." };
    }

    const tenantId = authData.user.id;

    // Supabase RLS will also prevent updating others' rows, but we strictly match tenant_id here
    const { data, error } = await supabase
      .from("services")
      .update({
        name: parsed.data.name,
        duration_minutes: parsed.data.duration_minutes,
        price: parsed.data.price,
        dp_amount: parsed.data.dp_amount,
        buffer_minutes: parsed.data.buffer_minutes,
        max_capacity: parsed.data.max_capacity,
        category: parsed.data.category,
        is_flexible_duration: parsed.data.is_flexible_duration,
        min_duration_minutes: parsed.data.is_flexible_duration ? (parsed.data.min_duration_minutes ?? null) : null,
        max_duration_minutes: parsed.data.is_flexible_duration ? (parsed.data.max_duration_minutes ?? null) : null,
        duration_step_minutes: parsed.data.is_flexible_duration ? (parsed.data.duration_step_minutes ?? 30) : null,
        specialty_tag: parsed.data.specialty_tag ?? null,
        is_female_only: parsed.data.is_female_only ?? false,
        service_category: parsed.data.service_category ?? null,
      })
      .eq("id", parsed.data.id)
      .eq("tenant_id", tenantId) // strict ownership verification
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: "Gagal ngubah detail layanan. Coba cek lagi yuk." };
    }

    const slug = await getTenantSlug(supabase, tenantId);
    if (slug) revalidatePath(`/${slug}`, "page");
    revalidatePath("/dashboard/services");

    return { success: true, data: data as Service };
  } catch {
    return { success: false, error: "Server kita lagi ngambek nih. Coba klik lagi ya." };
  }
}

export async function deleteService(serviceId: string): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) {
      return { success: false, error: "Eh, kamu belum login nih." };
    }

    const tenantId = authData.user.id;

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId)
      .eq("tenant_id", tenantId);

    if (error) {
      return { success: false, error: "Gagal ngehapus layanan ini. Coba klik lagi deh." };
    }

    const slug = await getTenantSlug(supabase, tenantId);
    if (slug) revalidatePath(`/${slug}`, "page");
    revalidatePath("/dashboard/services");

    return { success: true, data: null };
  } catch {
    return { success: false, error: "Server kita lagi ngambek nih. Coba klik lagi ya." };
  }
}
