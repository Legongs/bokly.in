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
  role: z.string().max(50, "Peran/Jabatan kepanjangan.").optional().nullable(),
  description: z.string().max(500, "Deskripsi kepanjangan, maksimal 500 huruf.").optional().nullable(),
  image_url: z.string().url("Wah, link foto-nya nggak valid nih.").nullable().optional().or(z.literal("")),
});

type StaffPayload = z.infer<typeof staffSchema>;

// ── Actions ───────────────────────────────────────────────────────────────────

export async function getStaffByTenant(tenantId: string): Promise<ActionResponse<Staff[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("staff")
      .select("*, staff_services(service_id)")
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

export async function getSuggestedRoles(businessType: string): Promise<ActionResponse<string[]>> {
  try {
    const supabase = await createClient();
    
    // Untuk mendapatkan distinct roles dari staff yang dimiliki oleh tenant dengan business_type sama
    // kita akan mengambil semua role yang tidak null, membatasi hasilnya, dan menghapus duplikasi di sisi memori
    // Supabase RPC adalah cara terbaik untuk distinct, namun untuk kemudahan, kita query terbatas dan map.
    const { data, error } = await supabase
      .from("tenants")
      .select(`
        staff ( role )
      `)
      .eq("business_type", businessType)
      .limit(20);

    if (error || !data) {
      return { success: true, data: [] };
    }

    const rolesSet = new Set<string>();
    data.forEach((tenant: any) => {
      tenant.staff?.forEach((s: any) => {
        if (s.role && s.role.trim() !== "") {
          rolesSet.add(s.role.trim());
        }
      });
    });

    return { success: true, data: Array.from(rolesSet) };
  } catch {
    return { success: true, data: [] }; // silent fail, ini hanya saran
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
        role: parsed.data.role,
        description: parsed.data.description,
        image_url: parsed.data.image_url,
      })
      .select()
      .single();

    if (error) {
      console.error("Kesalahan menyimpan pegawai:", error);
      return { success: false, error: "Gagal menyimpan pegawai: " + error.message };
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
        role: parsed.data.role,
        description: parsed.data.description,
        image_url: parsed.data.image_url,
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

export async function updateStaffServices(staffId: string, serviceIds: string[]): Promise<ActionResponse<boolean>> {
  try {
    const supabase = await createClient();
    
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { success: false, error: "Tidak memiliki akses (Unauthenticated)" };
    }

    // Pertama, hapus semua relasi layanan yang ada untuk pegawai ini
    const { error: deleteError } = await supabase
      .from("staff_services")
      .delete()
      .eq("staff_id", staffId)
      .eq("tenant_id", authData.user.id);

    if (deleteError) {
      return { success: false, error: "Gagal menghapus layanan sebelumnya" };
    }

    // Jika ada layanan baru yang dipilih, tambahkan
    if (serviceIds.length > 0) {
      const inserts = serviceIds.map(serviceId => ({
        staff_id: staffId,
        service_id: serviceId,
        tenant_id: authData.user.id
      }));

      const { error: insertError } = await supabase
        .from("staff_services")
        .insert(inserts);

      if (insertError) {
        return { success: false, error: "Gagal menyimpan layanan baru" };
      }
    }

    revalidatePath("/dashboard/staff");
    revalidatePath("/[tenant]", "page");

    return { success: true, data: true };
  } catch {
    return { success: false, error: "Terjadi kesalahan internal pada server" };
  }
}
