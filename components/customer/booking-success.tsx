// components/customer/booking-success.tsx
// Tampilan sukses setelah booking dikonfirmasi
"use client";

import React from "react";
import { CheckCircle2, CalendarPlus, MessageCircle, ChevronRight, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR, generateGCalLink } from "@/lib/booking-utils";
import type { Tenant } from "@/types/database.types";
import type { ThemeStyle } from "@/lib/booking-utils";
import type { BookingResult } from "@/hooks/use-booking-flow";
import type { BusinessDictionary } from "@/lib/dictionaries";

interface BookingSuccessProps {
  bookingResult: BookingResult;
  tenant: Tenant;
  t: ThemeStyle;
  dictionary?: BusinessDictionary;
  onReset: () => void;
}

export function BookingSuccess({ bookingResult, tenant, t, dictionary, onReset }: BookingSuccessProps) {
  const { service, date, startTime, endTime, name, bookingId } = bookingResult;

  const gcalUrl = generateGCalLink({
    serviceName: service.name,
    date,
    startTime,
    endTime,
    businessName: tenant.business_name,
  });

  const formattedDate = new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Header sukses — asimetri: ikon kiri, teks kanan */}
      <div className={`px-6 pt-10 pb-6 rounded-3xl bg-gradient-to-b ${t.gradient} to-white shadow-sm shadow-stone-200/60`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={1.75} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">Booking Berhasil!</p>
            <h2 className="text-xl font-bold text-stone-900 leading-snug">
              Jadwal kamu udah<br />aman dikunci!
            </h2>
            <p className="text-sm text-stone-500 mt-1.5">
              Admin bakal chat kamu di WhatsApp buat konfirmasi.
            </p>
          </div>
        </div>
      </div>

      {/* Ringkasan detail booking */}
      <Card className="border-none shadow-sm shadow-stone-200/60 rounded-3xl bg-white overflow-hidden">
        <CardContent className="pt-4 divide-y divide-stone-50">
          {[
            { label: dictionary?.serviceLabel || "Layanan", value: service.name },
            { label: "Tanggal",        value: formattedDate },
            { label: "Jam",            value: `${startTime} – ${endTime} WIB` },
            { label: "Nama Pemesan",   value: name },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-baseline py-3 gap-3">
              <span className="text-sm text-stone-400 flex-shrink-0">{label}</span>
              <span className="text-sm font-semibold text-stone-800 text-right">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* QRIS DP — jika ada */}
      {Number(service.dp_amount) > 0 && (tenant as any).qris_image_url && (tenant as any).payment_method_type === "manual" && (
        <div className="bg-stone-50 rounded-3xl p-5 border border-stone-100 text-center space-y-3">
          <p className="text-sm font-semibold text-stone-800">Scan QRIS untuk DP</p>
          <p className="text-xs text-stone-500">
            Silakan scan QR di bawah untuk membayar DP sebesar {formatIDR(Number(service.dp_amount))}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={(tenant as any).qris_image_url} alt="QRIS DP" className="w-full max-w-[200px] mx-auto rounded-xl border border-stone-200 shadow-sm" />
        </div>
      )}

      {/* Konfirmasi via WA (manual) */}
      {(!(tenant as any).wa_method || (tenant as any).wa_method === "manual") && tenant.whatsapp_number && (
        <a
          href={`https://wa.me/${tenant.whatsapp_number.replace(/\D/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(
            `Halo admin ${tenant.business_name}, saya ${name} mau konfirmasi reservasi ${service.name} untuk tanggal ${new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} jam ${startTime}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-sm transition-all duration-200 shadow-md shadow-[#25D366]/20"
        >
          <MessageCircle className="w-4 h-4 flex-shrink-0" />
          Konfirmasi via WhatsApp
        </a>
      )}

      {/* Simpan ke Google Calendar */}
      <a
        href={gcalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 font-semibold text-sm transition-all duration-200"
        aria-label="Simpan ke Google Calendar"
      >
        <CalendarPlus className="w-4 h-4 flex-shrink-0" />
        Simpan ke Kalender HP (Pengingat)
      </a>

      {/* Lihat status booking */}
      <a
        href={`/${tenant.slug}/booking/${bookingId}`}
        className={`flex justify-center items-center gap-2 w-full px-4 py-3.5 rounded-2xl ${t.bgPrimary} ${t.bgPrimaryHover} text-white font-bold text-sm shadow-xl ${t.shadowBtn} transition-all duration-200`}
      >
        Lihat Status & Riwayat Kunjungan
        <ChevronRight className="w-4 h-4" />
      </a>

      {/* Reset — buat booking lagi */}
      <Button
        variant="outline"
        className="w-full gap-1.5 text-stone-500 border-stone-200 hover:bg-stone-50 transition-all duration-200"
        onClick={onReset}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Bikin Jadwal Lagi
      </Button>
    </div>
  );
}
