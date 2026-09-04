import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTodayBookings } from "@/lib/actions/dashboard.actions";
import { TimelineView } from "@/components/dashboard/timeline-view";
import { ShareButton } from "@/components/dashboard/share-button";
import { WalkInForm } from "@/components/dashboard/walk-in-form";
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

  const DEMO_TENANT_ID = "d290f1ee-6c54-4b01-90e6-d701748f0851";
  const tenantId = user?.id || DEMO_TENANT_ID;

  // 2. Ambil data tenant
  const { data: tenant, error: tenantError } = await supabase
  .from("tenants")
  .select("id, business_name, slug")
  .eq("id", tenantId)
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

  // 4. Ambil data service dan staf untuk form Walk-in
  const [{ data: services }, { data: staff }] = await Promise.all([
    supabase.from("services").select("id, name, duration_minutes").eq("tenant_id", tenant.id).order("name"),
    supabase.from("staff").select("id, name").eq("tenant_id", tenant.id).order("name"),
  ]);

  const today = new Date().toLocaleString("en-CA", { timeZone: "Asia/Jakarta" }).split(",")[0];
 
 const pendingBookings = bookings.filter((b) => b.payment_status === "pending");
 const todayBookings = bookings.filter((b) => b.booking_date === today);

 const pendingCount = pendingBookings.length;
 const approvedCountToday = todayBookings.filter((b) => b.payment_status === "approved").length;

 return (
  <main className="min-h-screen bg-stone-50 pb-20 overflow-x-hidden">
  {/* ── Header Dashboard ── */}
  <header className="bg-white border-b border-stone-200 px-4 py-5 sticky top-0 z-10 shadow-sm">
  <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
  <div className="flex-1 min-w-0 flex items-center gap-4">
    <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-teal-100 to-teal-50 flex-shrink-0 flex items-center justify-center text-teal-700 font-extrabold text-2xl shadow-inner border border-teal-200/50">
      {tenant.business_name.charAt(0).toUpperCase()}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-3">
        <h1 className="font-extrabold text-2xl text-stone-900 truncate tracking-tight flex-1">
          {tenant.business_name}
        </h1>
        <div className="flex-shrink-0">
          <ShareButton tenantSlug={tenant.slug} />
        </div>
      </div>
      <p className="text-sm text-stone-500 truncate mt-0.5 font-medium">
        maubooking.in/<span className="text-stone-700 font-bold">{tenant.slug}</span>
      </p>
    </div>
  </div>
  </div>
  </header>

  <div className="max-w-5xl mx-auto px-4 pt-6 pb-20">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* ── Kolom Kiri: Metrik & Jadwal Hari Ini (Bento) ── */}
      <div className="lg:col-span-7 space-y-6">
        {/* Metrik */}
        <div className="flex overflow-x-auto lg:grid lg:grid-cols-2 gap-4 scrollbar-hide pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:pb-0">
          <div className="min-w-[200px] flex-shrink-0 lg:min-w-0 bg-white rounded-[2rem] p-6 shadow-sm shadow-stone-200/50 border border-stone-100">
            <div className="flex items-center gap-2 text-stone-500 mb-4">
              <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Total Hari Ini</span>
            </div>
            <p className="text-4xl font-extrabold text-stone-900 flex items-baseline gap-2">
              {todayBookings.length} <span className="text-sm font-semibold text-stone-400">Jadwal</span>
            </p>
          </div>
          
          <div className="min-w-[200px] flex-shrink-0 lg:min-w-0 bg-orange-50/80 rounded-[2rem] p-6 shadow-sm shadow-orange-900/5 border border-orange-200/50 relative overflow-hidden">
            {/* Decorative earthy blob */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-orange-200/40 rounded-full blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center gap-2 text-orange-700 mb-4">
                <div className="w-8 h-8 rounded-full bg-orange-100/50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-orange-600/80">Perlu Dicek</span>
              </div>
              <p className="text-4xl font-extrabold text-orange-900 flex items-baseline gap-2">
                {pendingCount} <span className="text-sm font-semibold text-orange-600/80">Pending</span>
              </p>
            </div>
          </div>
        </div>

        {/* Jadwal Hari Ini */}
        <div className="bg-white rounded-[2rem] p-5 sm:p-6 shadow-sm shadow-stone-200/50 border border-stone-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="font-extrabold text-stone-900 flex flex-wrap items-center gap-2 text-lg">
              Agenda Hari Ini
              <span className="bg-stone-100 text-stone-600 py-1 px-3 rounded-full text-xs font-bold whitespace-nowrap">
                {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long" })}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="text-xs text-stone-500 font-bold bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100 whitespace-nowrap hidden sm:block">
                {approvedCountToday} Selesai/Aktif
              </div>
              <WalkInForm tenantId={tenant.id} services={services || []} staff={staff || []} />
            </div>
          </div>
          
          {todayBookings.length > 0 ? (
            <TimelineView bookings={todayBookings} />
          ) : (
            <div className="text-center py-10 px-4">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-100">
                <CalendarDays className="w-6 h-6 text-stone-300" />
              </div>
              <p className="font-bold text-stone-700 mb-1">Wah, hari ini masih kosong nih!</p>
              <p className="text-sm text-stone-500 mb-6 max-w-xs mx-auto">
                Yuk sebarkan link booking-mu ke pelanggan biar jadwal hari ini penuh.
              </p>
              <ShareButton tenantSlug={tenant.slug} />
            </div>
          )}
        </div>
      </div>

      {/* ── Kolom Kanan: Perlu Tindakan ── */}
      <div className="lg:col-span-5">
        <div className="bg-stone-50 lg:bg-white lg:rounded-[2rem] lg:p-6 lg:shadow-sm lg:border border-stone-100 h-full">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-1 lg:px-0">
            <h2 className="font-extrabold text-stone-900 flex items-center gap-2 text-lg">
              Tunggu Konfirmasi
            </h2>
            {pendingCount > 0 && (
              <span className="bg-orange-100 text-orange-700 py-1 px-3 rounded-full text-xs font-bold animate-pulse whitespace-nowrap">
                {pendingCount} Baru
              </span>
            )}
          </div>

          {pendingBookings.length > 0 ? (
            <div className="-mx-4 px-4 lg:mx-0 lg:px-0">
              <TimelineView bookings={pendingBookings} isPendingColumn={true} />
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] p-8 border border-dashed border-stone-200 text-center lg:border-none lg:bg-transparent lg:p-4">
              <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Store className="w-5 h-5 text-stone-300" />
              </div>
              <p className="text-sm font-bold text-stone-500">Semua aman terkendali</p>
              <p className="text-xs text-stone-400 mt-1">Tidak ada reservasi yang menunggu konfirmasi saat ini.</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  </div>
 </main>
 );
}
