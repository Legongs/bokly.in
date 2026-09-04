// components/customer/step-customer-form.tsx
// Step terakhir: Isi data pemesan + Order Summary + FAB submit
"use client";

import React from "react";
import { User, Phone, AlertCircle, CheckCircle2, WifiOff, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR, calcEndTime } from "@/lib/booking-utils";
import type { Service, Staff } from "@/types/database.types";
import type { ThemeStyle } from "@/lib/booking-utils";
import type { BusinessDictionary } from "@/lib/dictionaries";
import type { FieldErrors, SubmitStatus } from "@/hooks/use-booking-flow";

interface StepCustomerFormProps {
  selectedService: Service | null;
  selectedStaff: Staff | null;
  selectedDate: string;
  selectedTime: string;
  customerName: string;
  customerWa: string;
  fieldErrors: FieldErrors;
  serverError: string | null;
  submitStatus: SubmitStatus;
  staffList: Staff[];
  activeStep: number;
  t: ThemeStyle;
  dictionary?: BusinessDictionary;
  onChangeName: (val: string) => void;
  onChangeWa: (val: string) => void;
  onBlurField: (field: "customer_name" | "customer_wa", val: string) => void;
}

/** Wrapper label + error message untuk form field. */
function FormField({ id, label, error, children }: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-stone-700">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export function StepCustomerForm({
  selectedService, selectedStaff, selectedDate, selectedTime,
  customerName, customerWa, fieldErrors, serverError, submitStatus,
  staffList, activeStep, t, dictionary,
  onChangeName, onChangeWa, onBlurField,
}: StepCustomerFormProps) {
  const stepNumber = staffList.length > 1 ? 4 : 3;
  const isActive   = activeStep === stepNumber;

  return (
    <>
      {/* Kartu Data Pemesan */}
      <Card className={`border-none shadow-md shadow-stone-200/50 rounded-3xl overflow-hidden bg-white mt-5 transition-all ${!isActive ? "opacity-70 grayscale-[0.3]" : ""}`}>
        <CardHeader className="pb-3 border-b border-stone-50 bg-stone-50/30">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2 text-stone-800">
                <span className={`w-6 h-6 rounded-full ${isActive ? t.bgStep : "bg-stone-200"} ${isActive ? t.textPrimary : "text-stone-500"} text-xs font-extrabold flex items-center justify-center flex-shrink-0`}>
                  {stepNumber}
                </span>
                Isi Data Kamu Yuk
              </h3>
              {isActive && (
                <p className="text-sm text-stone-500 mt-1">
                  Kita bakal kirim detail jadwalnya langsung ke WA kamu
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className={`space-y-4 pt-4 ${isActive ? "block" : "hidden"}`}>
          {/* Input Nama */}
          <FormField id="customer-name" label="Nama Panggilan / Lengkap" error={fieldErrors.customer_name}>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="customer-name"
                type="text"
                autoComplete="name"
                value={customerName}
                onChange={(e) => onChangeName(e.target.value)}
                onBlur={(e) => onBlurField("customer_name", e.target.value)}
                placeholder="Misal: Siska Amelia"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${t.ringPrimary} transition-all duration-200 ${
                  fieldErrors.customer_name ? "border-rose-400 focus:ring-rose-400" : "border-stone-300 hover:border-stone-400"
                }`}
              />
            </div>
          </FormField>

          {/* Input WA */}
          <FormField id="customer-wa" label="Nomor WhatsApp" error={fieldErrors.customer_wa}>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="customer-wa"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                value={customerWa}
                onChange={(e) => onChangeWa(e.target.value)}
                onBlur={(e) => onBlurField("customer_wa", e.target.value)}
                placeholder="Contoh: 0812 - 3456 - 7890"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${t.ringPrimary} transition-all duration-200 ${
                  fieldErrors.customer_wa ? "border-rose-400 focus:ring-rose-400" : "border-stone-300 hover:border-stone-400"
                }`}
              />
            </div>
          </FormField>
        </CardContent>
      </Card>

      {/* Order Summary — muncul saat slot sudah dipilih */}
      {selectedService && selectedDate && selectedTime && (
        <div className={`p-4 rounded-2xl ${t.bgLight} border ${t.borderLight} text-sm mt-5`}>
          <p className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wide mb-2`}>
            Ringkasan {dictionary?.bookingLabel || "Reservasi"}
          </p>
          <div className="space-y-1 text-stone-700">
            <div className="flex justify-between">
              <span>{dictionary?.serviceLabel || "Layanan"}</span>
              <span className="font-semibold">{selectedService.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal</span>
              <span className="font-semibold">
                {new Date(selectedDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            {selectedStaff && (
              <div className="flex justify-between">
                <span>{dictionary?.staffLabel || "Pegawai"}</span>
                <span className="font-semibold">{selectedStaff.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Waktu</span>
              <span className="font-semibold">
                {selectedTime} – {calcEndTime(selectedTime, selectedService.duration_minutes)} WIB
              </span>
            </div>
            {Number(selectedService.dp_amount) > 0 && (
              <div className={`flex justify-between border-t ${t.borderLight} pt-1.5 mt-1.5`}>
                <span className={`font-semibold ${t.textPrimary}`}>DP yang harus dibayar</span>
                <span className={`font-bold ${t.textPrimary}`}>{formatIDR(Number(selectedService.dp_amount))}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Syarat & Ketentuan / No-Show Warning */}
      <div className="mt-4 p-4 rounded-2xl border border-stone-200 bg-stone-50/80 text-xs text-stone-600 leading-relaxed">
        <p className="font-semibold text-stone-800 mb-2 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-stone-500" />
          Penting untuk Dibaca
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Pastikan datang tepat waktu. Jika terlambat lebih dari 15 menit tanpa konfirmasi (No-Show), maka slot dapat diberikan ke Walk-In dan DP hangus.</li>
          <li>Reschedule bisa diajukan via link di WhatsApp, namun harus disetujui admin.</li>
        </ul>
      </div>

      {/* Server Error */}
      {serverError && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2 mt-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* FAB — Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 rounded-t-3xl sm:static sm:bg-transparent sm:border-none sm:shadow-none sm:p-0 sm:mt-6">
        <div className="max-w-md mx-auto">
          {/* Offline warning */}
          {submitStatus === "offline" && (
            <div role="alert" className="mb-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
              <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Koneksi kamu lagi putus nih. Data booking sudah disimpan, tinggal klik lagi setelah online ya.</span>
            </div>
          )}

          {/* Ringkasan harga di FAB (mobile only) */}
          <div className="flex items-center justify-between mb-3 sm:hidden">
            <div>
              <p className="text-xs text-stone-500 font-medium">Total Harga</p>
              <p className={`font-bold text-lg ${t.textPrimary}`}>
                {selectedService ? formatIDR(Number(selectedService.price)) : "Rp 0"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-500 font-medium">Durasi</p>
              <p className="font-bold text-stone-800">
                {selectedService ? `${selectedService.duration_minutes} mnt` : "-"}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            form="booking-form"
            size="lg"
            className={`w-full h-12 rounded-2xl ${
              submitStatus === "offline"
                ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
                : `${t.bgPrimary} ${t.bgPrimaryHover} ${t.shadowBtn}`
            } text-white font-bold shadow-xl gap-2 transition-all duration-200`}
            isLoading={submitStatus === "loading"}
            disabled={
              !selectedService ||
              (staffList.length > 1 && !selectedStaff) ||
              !selectedDate ||
              !selectedTime ||
              submitStatus === "loading"
            }
          >
            {submitStatus === "offline" ? (
              <>
                <WifiOff className="w-4 h-4" />
                Koneksi Terputus — Ketuk untuk Coba Lagi
              </>
            ) : (
              <>
                {submitStatus !== "loading" && <ChevronRight className="w-4 h-4" />}
                Amankan Slot Sekarang
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-stone-400 font-medium pb-4">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Anti double-booking • Langsung dikunci otomatis</span>
          </div>
        </div>
      </div>
    </>
  );
}
