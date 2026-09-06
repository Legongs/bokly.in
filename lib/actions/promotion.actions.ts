"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthTenantId } from "@/lib/auth";
import { canPerformAction } from "@/lib/subscription";
import type { Promotion } from "@/types/database.types";
import { revalidatePath } from "next/cache";

export async function getPromotions() {
  try {
    const tenantId = await getAuthTenantId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching promotions:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function getActivePromotions(tenantId: string) {
  try {
    const supabase = await createClient();
    // Gunakan admin client atau anon client?
    // Karena ini dipakai di storefront (public), maka policy `Public can view active promotions` akan memfilter.
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      // Tanggal difilter oleh RLS policy `Public can view active promotions`
      // Namun kita bisa menambahkan explicit filter di sini
      .lte("start_date", new Date().toISOString())
      .gte("end_date", new Date().toISOString());

    if (error) {
      console.error("Error fetching active promotions:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function createPromotion(
  title: string,
  description: string | null,
  discountType: "percentage" | "fixed",
  discountValue: number,
  startDate: string,
  endDate: string,
  isActive: boolean = true
) {
  try {
    const tenantId = await getAuthTenantId();
    
    // Cek limit berlangganan
    const check = await canPerformAction(tenantId, "add_promotion");
    if (!check.allowed) {
      return { success: false, error: check.reason };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("promotions")
      .insert({
        tenant_id: tenantId,
        title,
        description,
        discount_type: discountType,
        discount_value: discountValue,
        start_date: startDate,
        end_date: endDate,
        is_active: isActive
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating promotion:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/promotions");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function updatePromotion(
  id: string,
  updates: Partial<Omit<Promotion, "id" | "tenant_id" | "created_at">>
) {
  try {
    const tenantId = await getAuthTenantId();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("promotions")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) {
      console.error("Error updating promotion:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/promotions");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function deletePromotion(id: string) {
  try {
    const tenantId = await getAuthTenantId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("promotions")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) {
      console.error("Error deleting promotion:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/promotions");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function togglePromotionActive(id: string, currentStatus: boolean) {
  return updatePromotion(id, { is_active: !currentStatus });
}
