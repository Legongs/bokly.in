"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/types/database.types";
import type { ActionResponse } from "./tenant.actions";

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Nama layanannya minimal 3 huruf dong.").max(100, "Kepanjangan, maksimal 100 huruf aja."),
  duration_minutes: z.coerce.number().min(5, "Pengerjaan paling bentar 5 menit ya.").max(1440, "Maksimal 24 jam dong."),
  price: z.coerce.number().min(0, "Harganya nggak boleh minus ya."),
  dp_amount: z.coerce.number().min(0, "DP-nya nggak boleh minus juga.").default(0),
  buffer_minutes: z.coerce.number().min(0, "Waktu jeda nggak boleh minus.").default(0),
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

    const tenantId = authData.user.id; // tenant_id sama dengan user_id

    const { data, error } = await supabase
      .from("services")
      .insert({
        tenant_id: tenantId,
        name: parsed.data.name,
        duration_minutes: parsed.data.duration_minutes,
        price: parsed.data.price,
        dp_amount: parsed.data.dp_amount,
        buffer_minutes: parsed.data.buffer_minutes,
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
