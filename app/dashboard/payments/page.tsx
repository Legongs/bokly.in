import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PaymentTable } from "@/components/dashboard/payment-table";

export const metadata = {
  title: "Kelola Pembayaran | Admin Dasbor",
};

export default async function PaymentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Ambil data tenant
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!tenant) {
    redirect("/onboarding");
  }

  // Ambil semua pesanan yang butuh verifikasi (atau semua pesanan dengan bukti)
  // Di sini kita ambil semua pesanan dengan bukti transfer (tidak null)
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      customer_name,
      customer_wa,
      booking_date,
      payment_status,
      proof_url,
      services (
        name,
        dp_amount
      )
    `)
    .eq("tenant_id", tenant.id)
    .not("proof_url", "is", null)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Verifikasi Pembayaran
        </h1>
        <p className="text-stone-500">
          Kelola bukti transfer dan verifikasi pembayaran manual pelanggan.
        </p>
      </div>

      <PaymentTable bookings={bookings || []} />
    </div>
  );
}
