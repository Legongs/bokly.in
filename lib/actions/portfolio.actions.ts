"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Portfolio } from "@/types/database.types";
import type { ActionResponse } from "@/lib/actions/tenant.actions";

const portfolioSchema = z.object({
  image_url: z.string().url("URL gambar tidak valid"),
  title: z.string().max(100, "Judul maksimal 100 karakter").optional().nullable(),
});

type PortfolioPayload = z.infer<typeof portfolioSchema>;

export async function getPortfoliosByTenant(tenantId: string): Promise<ActionResponse<Portfolio[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("portfolios")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Portfolio[] };
  } catch {
    return { success: false, error: "Terjadi kesalahan internal" };
  }
}

export async function createPortfolio(payload: PortfolioPayload): Promise<ActionResponse<Portfolio>> {
  const parsed = portfolioSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Akses ditolak. Anda belum login." };
    }

    // Cek limit 5 foto
    const { count, error: countError } = await supabase
      .from("portfolios")
      .select("*", { count: 'exact', head: true })
      .eq("tenant_id", user.id);

    if (countError) {
      return { success: false, error: countError.message };
    }

    if (count && count >= 5) {
      return { success: false, error: "Batas unggah portofolio (5 foto) telah tercapai." };
    }

    const { data, error } = await supabase
      .from("portfolios")
      .insert({
        tenant_id: user.id,
        image_url: parsed.data.image_url,
        title: parsed.data.title,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/settings");
    revalidatePath(`/${user.id}`); // Idealnya revalidate path slug toko, tapi kita revalidate root aja
    return { success: true, data: data as Portfolio };
  } catch {
    return { success: false, error: "Gagal menyimpan portofolio" };
  }
}

export async function deletePortfolio(id: string): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Akses ditolak. Anda belum login." };
    }

    const { error } = await supabase
      .from("portfolios")
      .delete()
      .eq("id", id)
      .eq("tenant_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/settings");
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Gagal menghapus portofolio" };
  }
}
