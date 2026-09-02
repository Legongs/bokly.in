"use client";

import React, { useState } from "react";
import { z } from "zod";
import {
 CheckCircle2,
 AlertCircle,
 ShieldCheck,
 Store,
 Phone,
 User,
 ChevronRight,
 ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
 Card,
 CardHeader,
 CardTitle,
 CardDescription,
 CardContent,
} from "@/components/ui/card";
import { DateSlotPicker } from "./date-slot-picker";
import { submitBooking } from "@/lib/actions/booking.actions";
import type { Tenant, Service, Staff } from "@/types/database.types";
import type { BusinessDictionary } from "@/lib/business-dictionary";

// ── Client-side Zod schema (mirrors server schema) ──────────────────────────
const bookingFormSchema = z.object({
 customer_name: z
 .string()
 .min(2, "Nama kamu kependekan nih, minimal 2 huruf ya.")
 .max(100, "Wah, namanya kepanjangan. Maksimal 100 huruf aja ya.")
 .trim(),
 customer_wa: z
 .string()
 .min(10, "Nomor WA-nya kependekan, minimal 10 angka ya.")
 .max(16, "Nomor WA-nya kepanjangan, maksimal 16 angka ya.")
 .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Format WA-nya kurang pas nih. Boleh cek lagi? (Contoh: 081234567890)"),
});

type BookingFormFields = z.infer<typeof bookingFormSchema>;
type FieldErrors = Partial<Record<keyof BookingFormFields, string>>;

interface BookingFlowProps {
 tenant: Tenant;
 services: Service[];
 staffList?: Staff[];
 dictionary?: BusinessDictionary;
}

// ── Utility: format IDR ──────────────────────────────────────────────────────
function formatIDR(amount: number): string {
 return new Intl.NumberFormat("id-ID", {
 style: "currency",
 currency: "IDR",
 minimumFractionDigits: 0,
 }).format(amount);
}

// ── Utility: calculate end time ──────────────────────────────────────────────
function calcEndTime(startTime: string, durationMinutes: number): string {
 const [h, m] = startTime.split(":").map(Number);
 const total = h * 60 + m + durationMinutes;
 const endH = Math.floor(total / 60) % 24;
 const endM = total % 60;
 return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ServiceCard({
  service,
  isSelected,
  onSelect,
  t,
}: {
  service: Service;
  isSelected: boolean;
  onSelect: () => void;
  t: any;
}) {
  return (
  <div
  role="radio"
  aria-checked={isSelected}
  tabIndex={0}
  onClick={onSelect}
  onKeyDown={(e) => e.key === "Enter" && onSelect()}
  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 select-none flex items-start justify-between gap-3 ${
  isSelected
  ? `${t.borderPrimary} ${t.bgLight} shadow-sm ${t.shadowPrimary}`
  : `border-stone-200 bg-white ${t.hoverBorder} ${t.bgLighter} active:scale-[0.99]`
  }`}
  >
  {/* Radio indicator */}
  <div
  className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
  isSelected
  ? `${t.borderPrimary} ${t.bgPrimary}`
  : "border-stone-300 "
  }`}
  >
  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
  </div>

  <div className="flex-1 min-w-0">
  <h4 className="font-semibold text-sm text-stone-900 leading-snug">
  {service.name}
  </h4>
  <p className="text-xs text-stone-500 mt-0.5">{service.duration_minutes} menit</p>
  </div>

  <div className="text-right flex-shrink-0">
  <p className={`font-bold text-sm ${t.textPrimary}`}>
 {formatIDR(Number(service.price))}
 </p>
 {Number(service.dp_amount) > 0 && (
 <p className="text-[11px] text-stone-500 mt-0.5">
 DP {formatIDR(Number(service.dp_amount))}
 </p>
 )}
 </div>
 </div>
 );
}

function FormField({
 id,
 label,
 error,
 children,
}: {
 id: string;
 label: string;
 error?: string;
 children: React.ReactNode;
}) {
 return (
 <div className="space-y-1.5">
 <label
 htmlFor={id}
 className="block text-xs font-semibold text-stone-700 "
 >
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

// ── Main Component ────────────────────────────────────────────────────────────
export function BookingFlow({ tenant, services, staffList = [], dictionary }: BookingFlowProps) {
 const [selectedService, setSelectedService] = useState<Service | null>(
 services.length > 0 ? services[0] : null
 );
 const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
 const [selectedDate, setSelectedDate] = useState<string>("");
 const [selectedTime, setSelectedTime] = useState<string>("");
 const [customerName, setCustomerName] = useState("");
 const [customerWa, setCustomerWa] = useState("");
 const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
 const [serverError, setServerError] = useState<string | null>(null);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [successData, setSuccessData] = useState<{
 bookingId: string;
 service: Service;
 date: string;
 time: string;
 name: string;
 } | null>(null);

  // ── Theme Mapping ──
  const themeColor = dictionary?.themeColor || (tenant as any).theme_color || "teal";
  const themeStyles: Record<string, any> = {
    teal: { bgLight: "bg-teal-50/80", bgLighter: "bg-teal-50/30", borderPrimary: "border-teal-600", borderLight: "border-teal-200", bgPrimary: "bg-teal-600", bgPrimaryHover: "hover:bg-teal-700", textPrimary: "text-teal-700", shadowPrimary: "shadow-teal-600/10", shadowBtn: "shadow-teal-600/30", ringPrimary: "focus:ring-teal-500", bgBadge: "bg-teal-100", hoverBorder: "hover:border-teal-400", gradient: "from-teal-50/80", bgStep: "bg-teal-100" },
    rose: { bgLight: "bg-rose-50/80", bgLighter: "bg-rose-50/30", borderPrimary: "border-rose-600", borderLight: "border-rose-200", bgPrimary: "bg-rose-600", bgPrimaryHover: "hover:bg-rose-700", textPrimary: "text-rose-700", shadowPrimary: "shadow-rose-600/10", shadowBtn: "shadow-rose-600/30", ringPrimary: "focus:ring-rose-500", bgBadge: "bg-rose-100", hoverBorder: "hover:border-rose-400", gradient: "from-rose-50/80", bgStep: "bg-rose-100" },
    orange: { bgLight: "bg-orange-50/80", bgLighter: "bg-orange-50/30", borderPrimary: "border-orange-500", borderLight: "border-orange-200", bgPrimary: "bg-orange-500", bgPrimaryHover: "hover:bg-orange-600", textPrimary: "text-orange-700", shadowPrimary: "shadow-orange-500/10", shadowBtn: "shadow-orange-500/30", ringPrimary: "focus:ring-orange-500", bgBadge: "bg-orange-100", hoverBorder: "hover:border-orange-400", gradient: "from-orange-50/80", bgStep: "bg-orange-100" },
    violet: { bgLight: "bg-violet-50/80", bgLighter: "bg-violet-50/30", borderPrimary: "border-violet-600", borderLight: "border-violet-200", bgPrimary: "bg-violet-600", bgPrimaryHover: "hover:bg-violet-700", textPrimary: "text-violet-700", shadowPrimary: "shadow-violet-600/10", shadowBtn: "shadow-violet-600/30", ringPrimary: "focus:ring-violet-500", bgBadge: "bg-violet-100", hoverBorder: "hover:border-violet-400", gradient: "from-violet-50/80", bgStep: "bg-violet-100" },
    blue: { bgLight: "bg-blue-50/80", bgLighter: "bg-blue-50/30", borderPrimary: "border-blue-600", borderLight: "border-blue-200", bgPrimary: "bg-blue-600", bgPrimaryHover: "hover:bg-blue-700", textPrimary: "text-blue-700", shadowPrimary: "shadow-blue-600/10", shadowBtn: "shadow-blue-600/30", ringPrimary: "focus:ring-blue-500", bgBadge: "bg-blue-100", hoverBorder: "hover:border-blue-400", gradient: "from-blue-50/80", bgStep: "bg-blue-100" },
  };
  const t = themeStyles[themeColor] || themeStyles.teal;

 // ── Live validation on blur ──────────────────────────────────────────────
 const validateField = (field: keyof BookingFormFields, value: string) => {
 const result = bookingFormSchema.shape[field].safeParse(value);
 setFieldErrors((prev) => ({
 ...prev,
 [field]: result.success ? undefined : result.error.issues[0]?.message,
 }));
 };

 // ── Slot selection ───────────────────────────────────────────────────────
 const handleSlotSelection = (date: string, time: string) => {
 setSelectedDate(date);
 setSelectedTime(time);
 setServerError(null);
 };

 // ── Submit ───────────────────────────────────────────────────────────────
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setServerError(null);

 // Guard: service
 if (!selectedService) {
 setServerError("Pilih layanan yang kamu mau dulu ya.");
 return;
 }

 // Guard: staff (if required)
 if (staffList.length > 1 && !selectedStaff) {
 setServerError(`Pilih ${dictionary?.staffLabel?.toLowerCase() || "pegawai"} dulu ya.`);
 return;
 }

 // Guard: slot
 if (!selectedDate || !selectedTime) {
 setServerError("Tentukan tanggal dan jam kunjungannya dulu yuk.");
 return;
 }

 // Client-side Zod validation
 const parsed = bookingFormSchema.safeParse({ customer_name: customerName, customer_wa: customerWa });
 if (!parsed.success) {
 const errs: FieldErrors = {};
 for (const issue of parsed.error.issues) {
 const field = issue.path[0] as keyof BookingFormFields;
 errs[field] = issue.message;
 }
 setFieldErrors(errs);
 return;
 }

 setIsSubmitting(true);

 const endTime = calcEndTime(selectedTime, selectedService.duration_minutes);
 const res = await submitBooking({
 tenant_id: tenant.id,
 service_id: selectedService.id,
 staff_id: selectedStaff?.id,
 customer_name: parsed.data.customer_name,
 customer_wa: parsed.data.customer_wa,
 booking_date: selectedDate,
 start_time: selectedTime,
 end_time: endTime,
 });

 setIsSubmitting(false);

 if (res.success && res.data) {
 setSuccessData({
 bookingId: res.data.id,
 service: selectedService,
 date: selectedDate,
 time: selectedTime,
 name: parsed.data.customer_name,
 });
 } else {
 // Handle unique constraint violation (double-booking race)
 const isDuplicate =
 res.error?.toLowerCase().includes("unique") ||
 res.error?.toLowerCase().includes("slot");
 setServerError(
 isDuplicate
 ? "Slot ini baru saja dipesan oleh pelanggan lain. Silakan pilih jam lain."
 : res.error ?? "Gagal bikin jadwal nih. Coba klik sekali lagi ya."
 );
 }
 };

 // ── Success State ────────────────────────────────────────────────────────
 if (successData) {
 const { service, date, time, name } = successData;
 return (
 <Card className={`text-center py-10 px-6 border-stone-100 bg-gradient-to-b ${t.gradient} to-white `}>
 <div className={`w-16 h-16 ${t.bgStep} rounded-full flex items-center justify-center mx-auto mb-4`}>
 <CheckCircle2 className={`w-9 h-9 ${t.textPrimary}`} />
 </div>
 <CardTitle className="text-xl font-bold text-stone-900 ">
 Yay! Jadwal Kamu Udah Dikunci 🔒
 </CardTitle>
 <p className="text-stone-500 mb-8 max-w-sm mx-auto">
 Tunggu sebentar ya, admin outlet bakal chat kamu di WhatsApp buat konfirmasi.
 </p>

 <div className="mt-5 p-4 rounded-2xl bg-white border border-stone-200 max-w-sm mx-auto text-left text-sm divide-y divide-stone-100 ">
 {[
 { label: dictionary?.serviceLabel || "Layanan", value: service.name },
 { label: "Tanggal", value: new Date(date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) },
 { label: "Jam Mulai", value: `${time} WIB` },
 { label: "Durasi", value: `${service.duration_minutes} menit` },
 { label: "Nama Pemesan", value: name },
 ].map(({ label, value }) => (
 <div key={label} className="flex justify-between items-center py-2.5 gap-2">
 <span className="text-stone-400 flex-shrink-0">{label}</span>
 <span className="font-semibold text-right text-stone-800 ">{value}</span>
 </div>
 ))}
 </div>

 <Button
 className="mt-6 gap-1"
 variant="outline"
 onClick={() => {
 setSuccessData(null);
 setSelectedDate("");
 setSelectedTime("");
 setSelectedStaff(null);
 setCustomerName("");
 setCustomerWa("");
 setFieldErrors({});
 }}
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 Bikin Jadwal Lagi
 </Button>
 </Card>
 );
 }

  if (services.length === 0) {
    return (
      <div className="py-12 px-6 rounded-[2rem] border border-stone-100 bg-stone-50/50 text-center shadow-sm">
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-stone-100 rotate-3 transition-transform hover:rotate-0">
          <Store className="w-8 h-8 text-stone-300" />
        </div>
        <h3 className="text-lg font-bold text-stone-800 mb-1">{tenant.business_name} Belum Buka</h3>
        <p className="text-sm text-stone-500 max-w-xs mx-auto">
          Yah, belum ada {dictionary?.serviceLabel?.toLowerCase() || "layanan"} yang buka di outlet ini. Coba cek lagi nanti ya!
        </p>
      </div>
    );
  }

 // ── Main Form ────────────────────────────────────────────────────────────
 return (
 <form id="booking-form" onSubmit={handleSubmit} noValidate className="space-y-5">
  {/* Step 1: Pilih Layanan */}
  <Card className="border-none shadow-md shadow-stone-200/50 rounded-3xl overflow-hidden bg-white">
  <CardHeader className="pb-3 border-b border-stone-50 bg-stone-50/30">
  <CardTitle className="text-base flex items-center gap-2 text-stone-800">
  <span className={`w-6 h-6 rounded-full ${t.bgStep} ${t.textPrimary} text-xs font-extrabold flex items-center justify-center flex-shrink-0`}>
  1
  </span>
  {dictionary?.selectServicePrompt || "Mau Perawatan Apa?"}
  </CardTitle>
  <CardDescription className="text-stone-500">Pilih aja {dictionary?.serviceLabel?.toLowerCase() || "layanan"} yang paling pas buat kamu hari ini</CardDescription>
  </CardHeader>
  <CardContent className="space-y-2.5 pt-4" role="radiogroup" aria-label={`Pilih ${dictionary?.serviceLabel?.toLowerCase() || "layanan"}`}>
 {services.map((svc) => (
 <ServiceCard
 key={svc.id}
 service={svc}
 t={t}
 isSelected={selectedService?.id === svc.id}
 onSelect={() => {
 setSelectedService(svc);
 setSelectedDate("");
 setSelectedTime("");
 }}
 />
 ))}
 </CardContent>
 </Card>

  {/* Step Optional: Pilih Staff */}
  {staffList.length > 1 && (
    <Card className="border-none shadow-md shadow-stone-200/50 rounded-3xl overflow-hidden bg-white mt-5">
      <CardHeader className="pb-3 border-b border-stone-50 bg-stone-50/30">
        <CardTitle className="text-base flex items-center gap-2 text-stone-800">
          <span className={`w-6 h-6 rounded-full ${t.bgStep} ${t.textPrimary} text-xs font-extrabold flex items-center justify-center flex-shrink-0`}>
            2
          </span>
          Pilih {dictionary?.staffLabel || "Pegawai"}
        </CardTitle>
        <CardDescription className="text-stone-500">
          Kamu mau dilayani oleh siapa?
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 grid grid-cols-2 gap-3">
        {staffList.map((staff) => {
          const isSelected = selectedStaff?.id === staff.id;
          return (
            <div
              key={staff.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                setSelectedStaff(staff);
                setSelectedDate(""); // Reset slot
                setSelectedTime("");
              }}
              className={`p-3 rounded-2xl border-2 cursor-pointer transition-all text-center select-none ${
                isSelected
                  ? `${t.borderPrimary} ${t.bgLight} shadow-sm ${t.shadowPrimary}`
                  : `border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 active:scale-[0.98]`
              }`}
            >
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${isSelected ? t.bgPrimary : "bg-stone-100"}`}>
                <User className={`w-5 h-5 ${isSelected ? "text-white" : "text-stone-400"}`} />
              </div>
              <h4 className={`font-semibold text-sm ${isSelected ? t.textPrimary : "text-stone-700"}`}>
                {staff.name}
              </h4>
            </div>
          );
        })}
      </CardContent>
    </Card>
  )}

  {/* Step 3/2: Pilih Jadwal */}
  <Card className="border-none shadow-md shadow-stone-200/50 rounded-3xl overflow-hidden bg-white mt-5">
  <CardHeader className="pb-3 border-b border-stone-50 bg-stone-50/30">
  <CardTitle className="text-base flex items-center gap-2 text-stone-800">
  <span className={`w-6 h-6 rounded-full ${t.bgStep} ${t.textPrimary} text-xs font-extrabold flex items-center justify-center flex-shrink-0`}>
  {staffList.length > 1 ? "3" : "2"}
  </span>
  Kapan Mau Datang?
  </CardTitle>
  {selectedService && (
  <CardDescription className="text-stone-500">
  Durasi {dictionary?.serviceLabel?.toLowerCase() || "layanan"}:{" "}
  <strong className="text-stone-700">
  {selectedService.duration_minutes} menit
  </strong>
  . Slot tidak tersedia jika sudah dipesan atau durasi melebihi jam operasional.
  </CardDescription>
  )}
  </CardHeader>
  <CardContent className="pt-4">
 {selectedService && (staffList.length <= 1 || selectedStaff) ? (
 <DateSlotPicker
 tenantId={tenant.id}
 serviceDurationMinutes={selectedService.duration_minutes}
 openTime={(tenant as any).open_time || "09:00"}
 closeTime={(tenant as any).close_time || "21:00"}
 staffId={selectedStaff?.id} // pass staffId down
 onSelectSlot={handleSlotSelection}
 selectedDate={selectedDate}
 selectedTime={selectedTime}
 />
 ) : (
 <p className="text-sm text-stone-400 text-center py-4">
 {staffList.length > 1 && !selectedStaff
  ? `Pilih ${dictionary?.staffLabel?.toLowerCase() || "pegawai"}nya dulu ya biar jamnya muncul.`
  : `Pilih ${dictionary?.serviceLabel?.toLowerCase() || "layanan"}nya dulu ya biar jamnya muncul.`}
 </p>
 )}
 </CardContent>
 </Card>

  {/* Step 4/3: Data Pemesan */}
  <Card className="border-none shadow-md shadow-stone-200/50 rounded-3xl overflow-hidden bg-white mt-5">
  <CardHeader className="pb-3 border-b border-stone-50 bg-stone-50/30">
  <CardTitle className="text-base flex items-center gap-2 text-stone-800">
  <span className={`w-6 h-6 rounded-full ${t.bgStep} ${t.textPrimary} text-xs font-extrabold flex items-center justify-center flex-shrink-0`}>
  {staffList.length > 1 ? "4" : "3"}
  </span>
  Isi Data Kamu Yuk
  </CardTitle>
  <p className="text-sm text-stone-500 mt-1">
  Kita bakal kirim detail jadwalnya langsung ke WA kamu
  </p>
  </CardHeader>
  <CardContent className="space-y-4 pt-4">
 <FormField id="customer-name" label="Nama Panggilan / Lengkap" error={fieldErrors.customer_name}>
 <div className="relative">
 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
 <input
 id="customer-name"
 type="text"
 autoComplete="name"
 value={customerName}
 onChange={(e) => setCustomerName(e.target.value)}
 onBlur={(e) => validateField("customer_name", e.target.value)}
 placeholder="Misal: Siska Amelia"
 className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${t.ringPrimary} transition-colors ${
 fieldErrors.customer_name
 ? "border-rose-400 focus:ring-rose-400"
 : "border-stone-300 "
 }`}
 />
 </div>
 </FormField>

 <FormField id="customer-wa" label="Nomor WhatsApp" error={fieldErrors.customer_wa}>
 <div className="relative">
 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
 <input
 id="customer-wa"
 type="tel"
 autoComplete="tel"
 inputMode="numeric"
 value={customerWa}
 onChange={(e) => setCustomerWa(e.target.value)}
 onBlur={(e) => validateField("customer_wa", e.target.value)}
 placeholder="Contoh: 081234567890"
 className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${t.ringPrimary} transition-colors ${
 fieldErrors.customer_wa
 ? "border-rose-400 focus:ring-rose-400"
 : "border-stone-300 "
 }`}
 />
 </div>
 </FormField>
 </CardContent>
 </Card>

 {/* Order Summary (shown only when slot selected) */}
 {selectedService && selectedDate && selectedTime && (
 <div className={`p-4 rounded-2xl ${t.bgLight} border ${t.borderLight} text-sm`}>
 <p className={`text-xs font-semibold ${t.textPrimary} uppercase tracking-wide mb-2`}>
 Ringkasan {dictionary?.bookingLabel || "Reservasi"}
 </p>
 <div className="space-y-1 text-stone-700 ">
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
 <span className={`font-bold ${t.textPrimary}`}>
 {formatIDR(Number(selectedService.dp_amount))}
 </span>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Server Error */}
 {serverError && (
 <div
 role="alert"
 className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2"
 >
 <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
 <span>{serverError}</span>
 </div>
 )}

 {/* Submit */}
 <div className="sticky bottom-3 z-10 pt-1">
 <Button
 type="submit"
 form="booking-form"
 size="lg"
 className={`w-full ${t.bgPrimary} ${t.bgPrimaryHover} text-white font-bold shadow-xl ${t.shadowBtn} gap-2`}
 isLoading={isSubmitting}
 disabled={!selectedService || (staffList.length > 1 && !selectedStaff) || !selectedDate || !selectedTime}
 >
 {!isSubmitting && <ChevronRight className="w-4 h-4" />}
 Kunci Slot Sekarang
 </Button>
 <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-stone-400 font-medium pb-4">
 <CheckCircle2 className="w-3.5 h-3.5" />
 <span>Anti double-booking • Langsung dikunci otomatis</span>
 </div>
 </div>
 </form>
 );
}
