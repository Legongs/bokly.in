"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "./tenant.actions";
import type { Testimonial } from "@/types/database.types";
import { z } from "zod";

const submitSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

/**
 * Customer mensubmit testimoni melalui manage_token dari url booking
 */
export async function submitTestimonial(
  bookingId: string,
  manageToken: string,
  rating: number,
  comment?: string
): Promise<ActionResponse<null>> {
  try {
    const parsed = submitSchema.parse({ rating, comment });
    const supabase = createAdminClient();

    // Verifikasi booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("tenant_id, customer_name, payment_status, booking_date")
      .eq("id", bookingId)
      .eq("manage_token", manageToken)
      .single();

    if (bookingError || !booking) {
      return { success: false, error: "Booking tidak valid atau token salah." };
    }

    if (booking.payment_status !== "approved") {
      return { success: false, error: "Hanya booking yang telah selesai/disetujui yang dapat memberikan ulasan." };
    }

    // Pastikan booking date sudah lewat
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize ke jam 00:00 untuk komparasi tanggal
    const bookingDate = new Date(booking.booking_date);
    
    if (bookingDate >= today) {
      return { success: false, error: "Ulasan hanya dapat diberikan setelah tanggal jadwal layanan berlalu." };
    }

    // Cek apakah sudah pernah review
    const { count } = await supabase
      .from("testimonials")
      .select("*", { count: "exact", head: true })
      .eq("booking_id", bookingId);

    if (count && count > 0) {
      return { success: false, error: "Anda sudah memberikan ulasan untuk booking ini." };
    }

    const { error: insertError } = await supabase.from("testimonials").insert({
      tenant_id: booking.tenant_id,
      booking_id: bookingId,
      customer_name: booking.customer_name,
      rating: parsed.rating,
      comment: parsed.comment || null,
      is_published: false,
      is_featured: false,
    });

    if (insertError) throw insertError;

    return { success: true };
  } catch (error: any) {
    console.error("submitTestimonial error:", error);
    return { success: false, error: error.message || "Gagal mengirim ulasan." };
  }
}

/**
 * Tenant mengambil semua testimoni (untuk dashboard)
 */
export async function getAllTestimonials(tenantId: string): Promise<ActionResponse<Testimonial[]>> {
  try {
    const supabase = await createClient();
    
    // Pastikan tenant_id milik auth.uid() lewat RLS
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data as Testimonial[] };
  } catch (error: any) {
    console.error("getAllTestimonials error:", error);
    return { success: false, error: "Gagal memuat daftar testimoni." };
  }
}

/**
 * Publik mengambil testimoni published (untuk storefront)
 */
export async function getTestimonials(tenantId: string): Promise<ActionResponse<Testimonial[]>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_published", true)
      .order("is_featured", { ascending: false }) // featured selalu di atas
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data as Testimonial[] };
  } catch (error: any) {
    console.error("getTestimonials error:", error);
    return { success: false, error: "Gagal memuat ulasan." };
  }
}

/**
 * Publish testimoni
 */
export async function publishTestimonial(id: string): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("testimonials")
      .update({ is_published: true })
      .eq("id", id);
    if (error) throw error;
    
    revalidatePath("/dashboard/testimonials");
    return { success: true };
  } catch (error: any) {
    console.error("publishTestimonial error:", error);
    return { success: false, error: "Gagal mempublikasi testimoni." };
  }
}

/**
 * Unpublish testimoni
 */
export async function unpublishTestimonial(id: string): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("testimonials")
      .update({ is_published: false, is_featured: false })
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/dashboard/testimonials");
    return { success: true };
  } catch (error: any) {
    console.error("unpublishTestimonial error:", error);
    return { success: false, error: "Gagal mencabut publikasi testimoni." };
  }
}

/**
 * Toggle featured testimoni
 */
export async function toggleFeaturedTestimonial(id: string, isFeatured: boolean): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    
    // Bila di-featured, paksa publish juga
    const updates: any = { is_featured: isFeatured };
    if (isFeatured) {
      updates.is_published = true;
    }

    const { error } = await supabase
      .from("testimonials")
      .update(updates)
      .eq("id", id);
    if (error) throw error;

    revalidatePath("/dashboard/testimonials");
    return { success: true };
  } catch (error: any) {
    console.error("toggleFeaturedTestimonial error:", error);
    return { success: false, error: "Gagal menandai testimoni unggulan." };
  }
}
