"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResponse<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

const uuidSchema = z.string().uuid("ID tidak valid");
const urlSchema = z.string().url("URL tidak valid");

// ── submitPaymentProof ────────────────────────────────────────────────────────
export async function submitPaymentProof(
  bookingId: string,
  fileUrl: string,
  manageToken?: string
): Promise<ActionResponse> {
  const parsedId = uuidSchema.safeParse(bookingId);
  const parsedUrl = urlSchema.safeParse(fileUrl);

  if (!parsedId.success || !parsedUrl.success) {
    return { success: false, error: "Data yang dikirim tidak valid." };
  }

  try {
    const supabase = await createClient();

    // Pastikan booking ada
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, tenant_id, manage_token")
      .eq("id", parsedId.data)
      .single();

    if (fetchError || !booking) {
      return { success: false, error: "Booking tidak ditemukan." };
    }

    if (!manageToken || booking.manage_token !== manageToken) {
      return { success: false, error: "Akses ditolak: Token tidak valid." };
    }

    // Update status pembayaran
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "pending_verification",
        proof_url: parsedUrl.data,
      })
      .eq("id", parsedId.data);

    if (updateError) {
      return { success: false, error: "Gagal menyimpan bukti pembayaran." };
    }

    // Ambil slug tenant untuk revalidate (optional, tergantung struktur routing)
    const { data: tenant } = await supabase
      .from("tenants")
      .select("slug")
      .eq("id", booking.tenant_id)
      .single();

    if (tenant) {
      revalidatePath(`/${tenant.slug}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error submitting payment proof:", error);
    return { success: false, error: "Terjadi kesalahan pada server." };
  }
}

// ── approvePayment ────────────────────────────────────────────────────────────
export async function approvePayment(
  bookingId: string
): Promise<ActionResponse> {
  const parsedId = uuidSchema.safeParse(bookingId);
  if (!parsedId.success) {
    return { success: false, error: "ID Booking tidak valid." };
  }

  try {
    const supabase = await createClient();
    
    // Keamanan: Pastikan yang mengubah adalah admin (tenant)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Anda belum login." };
    }

    // Pastikan booking milik tenant ini
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, tenant_id")
      .eq("id", parsedId.data)
      .single();

    if (fetchError || !booking) {
      return { success: false, error: "Booking tidak ditemukan." };
    }

    if (booking.tenant_id !== user.id) {
      return { success: false, error: "Akses ditolak." };
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "approved",
      })
      .eq("id", parsedId.data);

    if (updateError) {
      return { success: false, error: "Gagal menyetujui pembayaran." };
    }

    revalidatePath("/dashboard/payments");
    return { success: true };
  } catch (error) {
    console.error("Error approving payment:", error);
    return { success: false, error: "Terjadi kesalahan pada server." };
  }
}

// ── rejectPayment ─────────────────────────────────────────────────────────────
export async function rejectPayment(
  bookingId: string
): Promise<ActionResponse> {
  const parsedId = uuidSchema.safeParse(bookingId);
  if (!parsedId.success) {
    return { success: false, error: "ID Booking tidak valid." };
  }

  try {
    const supabase = await createClient();
    
    // Keamanan: Pastikan yang mengubah adalah admin (tenant)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Anda belum login." };
    }

    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, tenant_id")
      .eq("id", parsedId.data)
      .single();

    if (fetchError || !booking) {
      return { success: false, error: "Booking tidak ditemukan." };
    }

    if (booking.tenant_id !== user.id) {
      return { success: false, error: "Akses ditolak." };
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "rejected",
        proof_url: null, // Reset proof url agar pelanggan bisa upload ulang
      })
      .eq("id", parsedId.data);

    if (updateError) {
      return { success: false, error: "Gagal menolak pembayaran." };
    }

    revalidatePath("/dashboard/payments");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting payment:", error);
    return { success: false, error: "Terjadi kesalahan pada server." };
  }
}

// ── createMidtransToken ───────────────────────────────────────────────────────
// Fungsi ini masih bersifat stubs / simulasi sebelum integrasi Midtrans yang sebenarnya.
export async function createMidtransToken(
  bookingId: string,
  manageToken?: string
): Promise<ActionResponse<{ token: string }>> {
  const parsedId = uuidSchema.safeParse(bookingId);
  if (!parsedId.success) {
    return { success: false, error: "ID Booking tidak valid." };
  }

  try {
    const supabase = await createClient();
    
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*, services(name, dp_amount), tenants(payment_gateway_server_key)")
      .eq("id", parsedId.data)
      .single();

    if (fetchError || !booking || !booking.services || !booking.tenants) {
      return { success: false, error: "Gagal memuat data booking." };
    }

    if (!manageToken || booking.manage_token !== manageToken) {
      return { success: false, error: "Akses ditolak: Token tidak valid." };
    }

    const serverKey = (booking.tenants as any).payment_gateway_server_key;
    if (!serverKey) {
      return { success: false, error: "Tenant belum mengonfigurasi Payment Gateway." };
    }

    // TODO: Implementasikan pemanggilan ke API Midtrans sungguhan di sini
    // Contoh Payload:
    // const payload = {
    //   transaction_details: {
    //     order_id: booking.id,
    //     gross_amount: booking.services.dp_amount,
    //   },
    //   customer_details: {
    //     first_name: booking.customer_name,
    //     phone: booking.customer_wa,
    //   }
    // };
    // fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", ...)

    // Simulasi respons sukses (Mock Token)
    return { 
      success: true, 
      data: { token: "MOCK_TOKEN_" + Math.random().toString(36).substring(7) } 
    };

  } catch (error) {
    console.error("Error creating Midtrans token:", error);
    return { success: false, error: "Terjadi kesalahan pada server saat membuat token pembayaran." };
  }
}
