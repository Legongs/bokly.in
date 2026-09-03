"use client";

import React from "react";
import { CheckCircle2, Clock, Calendar, AlertCircle, Store, User, MapPin } from "lucide-react";
import type { CustomerPortalData } from "@/lib/actions/customer-portal.actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BookingManageClient({ initialData }: { initialData: CustomerPortalData }) {
  const { booking, tenant, history } = initialData;

  // ── Theme Mapping ──
  const themeColor = tenant.theme_color || "teal";
  const themeStyles: Record<string, any> = {
    teal: { textPrimary: "text-teal-700", bgPrimary: "bg-teal-600", bgLight: "bg-teal-50", borderLight: "border-teal-100", gradient: "from-teal-500 to-teal-700" },
    rose: { textPrimary: "text-rose-700", bgPrimary: "bg-rose-600", bgLight: "bg-rose-50", borderLight: "border-rose-100", gradient: "from-rose-500 to-rose-700" },
    orange: { textPrimary: "text-orange-700", bgPrimary: "bg-orange-500", bgLight: "bg-orange-50", borderLight: "border-orange-100", gradient: "from-orange-400 to-orange-600" },
    violet: { textPrimary: "text-violet-700", bgPrimary: "bg-violet-600", bgLight: "bg-violet-50", borderLight: "border-violet-100", gradient: "from-violet-500 to-violet-700" },
    blue: { textPrimary: "text-blue-700", bgPrimary: "bg-blue-600", bgLight: "bg-blue-50", borderLight: "border-blue-100", gradient: "from-blue-500 to-blue-700" },
  };
  const t = themeStyles[themeColor] || themeStyles.teal;

  const isApproved = booking.payment_status === "approved";
  const isRejected = booking.payment_status === "rejected";

  function formatIDR(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-stone-50 pb-12">
      {/* Header Tenant */}
      <div className={`pt-12 pb-24 px-6 text-center text-white bg-gradient-to-b ${t.gradient} rounded-b-[3rem] shadow-sm`}>
        <h1 className="text-2xl font-bold tracking-tight mb-1">{tenant.business_name}</h1>
        <p className="text-white/80 text-sm flex items-center justify-center gap-1.5">
          <Store className="w-4 h-4" />
          Portal Pelanggan
        </p>
      </div>

      {/* Main Card (Overlapping header) */}
      <div className="px-5 -mt-16 relative z-10">
        <Card className="border-none shadow-xl shadow-stone-200/50 rounded-3xl overflow-hidden bg-white">
          <CardHeader className={`pb-4 border-b ${t.borderLight} ${t.bgLight} text-center`}>
            {/* Status Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
              {isApproved ? (
                <CheckCircle2 className={`w-8 h-8 ${t.textPrimary}`} />
              ) : isRejected ? (
                <AlertCircle className="w-8 h-8 text-rose-500" />
              ) : (
                <Clock className="w-8 h-8 text-amber-500" />
              )}
            </div>
            <CardTitle className="text-lg text-stone-900">
              {isApproved ? "Booking Telah Dikonfirmasi" : isRejected ? "Booking Dibatalkan" : "Menunggu Konfirmasi"}
            </CardTitle>
            <p className="text-sm text-stone-500 mt-1">
              ID: <span className="font-mono text-xs">{booking.id.split("-")[0]}</span>
            </p>
          </CardHeader>
          <CardContent className="pt-5 pb-6 space-y-4">
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-3">
                <span className="text-stone-500 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Atas Nama
                </span>
                <span className="font-semibold text-stone-800">{booking.customer_name}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-3">
                <span className="text-stone-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Jadwal
                </span>
                <div className="text-right">
                  <div className="font-semibold text-stone-800">{formatDate(booking.booking_date)}</div>
                  <div className={`text-xs font-bold mt-0.5 ${t.textPrimary}`}>{booking.start_time.slice(0,5)} - {booking.end_time.slice(0,5)} WIB</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-3">
                <span className="text-stone-500 flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Layanan
                </span>
                <span className="font-semibold text-stone-800">{booking.services?.name}</span>
              </div>
              {booking.staff && (
                <div className="flex justify-between items-center text-sm border-b border-stone-100 pb-3">
                  <span className="text-stone-500 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Pegawai
                  </span>
                  <span className="font-semibold text-stone-800">{booking.staff.name}</span>
                </div>
              )}
              {booking.services && Number(booking.services.dp_amount) > 0 && (
                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-stone-500">Total DP</span>
                  <span className="font-bold text-stone-900">{formatIDR(Number(booking.services.dp_amount))}</span>
                </div>
              )}
            </div>

            {/* Aksi Tambahan */}
            {!isApproved && !isRejected && (
              <div className="pt-2">
                <a
                  href={`https://wa.me/${tenant.whatsapp_number.replace(/^[0|+62]/, "62")}?text=Halo admin ${tenant.business_name}, saya ${booking.customer_name} ingin konfirmasi booking ID ${booking.id.split("-")[0]}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`block w-full py-3 rounded-xl text-center text-sm font-semibold transition-colors ${t.bgLight} ${t.textPrimary} hover:bg-stone-100`}
                >
                  Hubungi Admin via WA
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Riwayat Kunjungan (Hanya muncul jika ada) */}
      {history.length > 0 && (
        <div className="mt-8 px-5">
          <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-400" />
            Riwayat Kunjungan Anda
          </h3>
          <div className="space-y-3">
            {history.map((hist) => (
              <div key={hist.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm mb-1">{hist.services?.name}</h4>
                  <p className="text-xs text-stone-500 mb-0.5">
                    {new Date(hist.booking_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} • {hist.start_time.slice(0,5)} WIB
                  </p>
                  <p className="text-[11px] font-medium text-stone-400">
                    {hist.staff ? `oleh ${hist.staff.name}` : tenant.business_name}
                  </p>
                </div>
                <div className="text-right flex flex-col justify-between items-end gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    hist.payment_status === "approved" ? "bg-emerald-50 text-emerald-600" :
                    hist.payment_status === "rejected" ? "bg-rose-50 text-rose-600" :
                    "bg-amber-50 text-amber-600"
                  }`}>
                    {hist.payment_status === "approved" ? "Selesai" : hist.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
