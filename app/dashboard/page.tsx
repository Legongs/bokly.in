import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodayBookings } from "@/lib/actions/dashboard.actions";
import { TimelineView } from "@/components/dashboard/timeline-view";
import { Store, CalendarDays, TrendingUp } from "lucide-react";

export const metadata = {
 title: "Dashboard Tenant | maubooking.in",
 description: "Kelola reservasi dan jadwal harian Anda.",
};

export default async function DashboardPage() {
 const supabase = await createClient();

 // 1. Ambil sesi user aktif (Proteksi rute ganda selain middleware)
 const {
 data: { user },
 } = await supabase.auth.getUser();

 if (!user) {
 redirect("/");
 }

 // 2. Ambil data tenant yang terkait dengan user aktif
 // Asumsi: id user Supabase Auth = id tenant
 const { data: tenant, error: tenantError } = await supabase
 .from("tenants")
 .select("id, business_name, slug")
 .eq("id", user.id)
 .single();

 if (tenantError || !tenant) {
 return (
 <main className="min-h-screen bg-stone-50 p-6 flex items-center justify-center">
 <div className="text-center space-y-3">
 <Store className="w-10 h-10 text-stone-400 mx-auto" />
 <h1 className="text-xl font-bold text-stone-900 ">
 Profil Tenant Tidak Ditemukan
 </h1>
 <p className="text-sm text-stone-500">
 Akun Anda belum terhubung dengan profil bisnis apa pun.
 </p>
 </div>
 </main>
 );
 }

 // 3. Ambil booking hari ini & pending
 const bookingsRes = await getTodayBookings(tenant.id);
 const bookings = bookingsRes.data ?? [];

 const today = new Date().toLocaleString("en-CA", { timeZone: "Asia/Jakarta" }).split(",")[0];
 
 const pendingBookings = bookings.filter((b) => b.payment_status === "pending");
 const todayBookings = bookings.filter((b) => b.booking_date === today);

 const pendingCount = pendingBookings.length;
 const approvedCountToday = todayBookings.filter((b) => b.payment_status === "approved").length;

 return (
 <main className="min-h-screen bg-stone-50 pb-20">
 {/* ── Header Dashboard ── */}
 <header className="bg-white border-b border-stone-200 px-4 py-4 sticky top-0 z-10">
 <div className="max-w-3xl mx-auto flex items-center justify-between">
 <div>
 <h1 className="font-bold text-lg text-stone-900 ">
 Dashboard
 </h1>
 <p className="text-xs text-stone-500">
 {tenant.business_name} (maubooking.in/{tenant.slug})
 </p>
 </div>
 <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
 {tenant.business_name.charAt(0).toUpperCase()}
 </div>
 </div>
 </header>

 <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
  {/* ── Metrik Ringkas ── */}
  <div className="grid grid-cols-2 gap-4">
  <div className="bg-white rounded-3xl p-5 shadow-md shadow-stone-200/50 border border-stone-100">
  <div className="flex items-center gap-2 text-stone-500 mb-3">
  <CalendarDays className="w-4 h-4" />
  <span className="text-[11px] font-bold uppercase tracking-widest">
  Total Hari Ini
  </span>
  </div>
  <p className="text-3xl font-extrabold text-stone-900 flex items-baseline gap-1">
  {todayBookings.length} <span className="text-sm font-semibold text-stone-400">Reservasi</span>
  </p>
  </div>
  
  <div className="bg-gradient-to-br from-orange-500 to-orange-400 rounded-3xl p-5 shadow-lg shadow-orange-500/20 text-white relative overflow-hidden">
  {/* Decorative blobs */}
  <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-xl" aria-hidden="true" />
  <div className="relative">
  <div className="flex items-center gap-2 text-orange-50 mb-3">
  <TrendingUp className="w-4 h-4" />
  <span className="text-[11px] font-bold uppercase tracking-widest">
  Perlu Tindakan
  </span>
  </div>
  <p className="text-3xl font-extrabold flex items-baseline gap-1">
  {pendingCount} <span className="text-sm font-semibold text-orange-200">Pending</span>
  </p>
  </div>
  </div>
  </div>

  {/* ── Perlu Tindakan ── */}
  {pendingBookings.length > 0 && (
    <div className="mb-8">
      <h2 className="font-bold text-stone-900 flex items-center gap-2 mb-4">
        Menunggu Konfirmasi
        <span className="bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-xs font-bold">
          {pendingCount} Baru
        </span>
      </h2>
      <TimelineView bookings={pendingBookings} />
    </div>
  )}

 {/* ── Timeline Reservasi Hari Ini ── */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-stone-900 flex items-center gap-2">
 Jadwal Hari Ini
 <span className="bg-stone-100 text-stone-600 py-0.5 px-2 rounded-full text-xs font-medium">
 {new Date().toLocaleDateString("id-ID", {
 weekday: "long",
 day: "numeric",
 month: "long",
 })}
 </span>
 </h2>
 <div className="text-xs text-stone-500 font-medium">
 {approvedCountToday} Disetujui
 </div>
 </div>
 
 <TimelineView bookings={todayBookings} />
 </div>
 </div>
 </main>
 );
}
