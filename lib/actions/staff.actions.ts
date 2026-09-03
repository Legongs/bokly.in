"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Staff } from "@/types/database.types";
import type { ActionResponse } from "./tenant.actions";

// ── Schemas ───────────────────────────────────────────────────────────────────

const staffSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Nama pegawai minimal 2 huruf.").max(100, "Nama kepanjangan, maksimal 100 huruf."),
});

type StaffPayload = z.infer<typeof staffSchema>;

// ── Actions ───────────────────────────────────────────────────────────────────

export async function getStaffByTenant(tenantId: string): Promise<ActionResponse<Staff[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: "Gagal memuat daftar pegawai" };
    }

    return { success: true, data: data as Staff[] };
  } catch {
    return { success: false, error: "Terjadi kesalahan internal pada server" };
  }
}

export async function createStaff(payload: StaffPayload): Promise<ActionResponse<Staff>> {
  const parsed = staffSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { success: false, error: "Tidak memiliki akses (Unauthenticated)" };
    }

    const { data: tenantData } = await supabase
      .from("tenants")
      .select("id")
      .eq("id", authData.user.id)
      .single();

    if (!tenantData) {
      return { success: false, error: "Data outlet tidak ditemukan" };
    }

    const { data, error } = await supabase
      .from("staff")
      .insert({
        tenant_id: tenantData.id,
        name: parsed.data.name,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: "Gagal menyimpan pegawai" };
    }

    revalidatePath("/dashboard/staff");
    revalidatePath("/[tenant]", "page");

    return { success: true, data: data as Staff };
  } catch {
    return { success: false, error: "Terjadi kesalahan internal pada server" };
  }
}

export async function updateStaff(payload: StaffPayload): Promise<ActionResponse<Staff>> {
  const parsed = staffSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  if (!parsed.data.id) {
    return { success: false, error: "ID Pegawai tidak ditemukan" };
  }

  try {
    const supabase = await createClient();
    
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { success: false, error: "Tidak memiliki akses (Unauthenticated)" };
    }

    const { data, error } = await supabase
      .from("staff")
      .update({
        name: parsed.data.name,
      })
      .eq("id", parsed.data.id)
      .eq("tenant_id", authData.user.id) // WAJIB: Validasi kepemilikan data
      .select()
      .single();

    if (error) {
      return { success: false, error: "Gagal memperbarui pegawai (Data tidak ditemukan atau akses ditolak)" };
    }

    revalidatePath("/dashboard/staff");
    revalidatePath("/[tenant]", "page");

    return { success: true, data: data as Staff };
  } catch {
    return { success: false, error: "Terjadi kesalahan internal pada server" };
  }
}

export async function deleteStaff(id: string): Promise<ActionResponse<boolean>> {
  try {
    const supabase = await createClient();
    
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { success: false, error: "Tidak memiliki akses (Unauthenticated)" };
    }

    const { error } = await supabase
      .from("staff")
      .delete()
      .eq("id", id)
      .eq("tenant_id", authData.user.id); // WAJIB: Validasi kepemilikan data

    if (error) {
      return { success: false, error: "Gagal menghapus pegawai (Akses ditolak)" };
    }

    revalidatePath("/dashboard/staff");
    revalidatePath("/[tenant]", "page");

    return { success: true, data: true };
  } catch {
    return { success: false, error: "Terjadi kesalahan internal pada server" };
  }
}
