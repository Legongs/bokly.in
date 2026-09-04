// hooks/use-booking-flow.ts
// Custom hook yang mengisolasi semua state & logika bisnis BookingFlow.
// Komponen visual TIDAK boleh memegang state di luar hook ini.
"use client";

import { useState } from "react";
import { z } from "zod";
import { calcEndTime } from "@/lib/booking-utils";
import { submitBooking } from "@/lib/actions/booking.actions";
import type { Tenant, Service, Staff } from "@/types/database.types";

// ── Zod Schema (Client-side mirrors server schema) ───────────────────────────
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

export type BookingFormFields = z.infer<typeof bookingFormSchema>;
export type FieldErrors = Partial<Record<keyof BookingFormFields, string>>;
export type SubmitStatus = "idle" | "loading" | "offline" | "success";

export interface BookingResult {
  bookingId: string;
  service: Service;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
}

const LS_KEY = "maubookingin_pending_booking";

/** useBookingFlow — mengelola seluruh state dan logika alur pemesanan. */
export function useBookingFlow({
  tenant,
  services,
  staffList = [],
}: {
  tenant: Tenant;
  services: Service[];
  staffList?: Staff[];
}) {
  const [selectedService, setSelectedService] = useState<Service | null>(
    services.length > 0 ? services[0] : null
  );
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(
    staffList.length === 1 ? staffList[0] : null
  );
  const [selectedDate, setSelectedDate]   = useState("");
  const [selectedTime, setSelectedTime]   = useState("");
  const [customerName, setCustomerName]   = useState("");
  const [customerWa, setCustomerWa]       = useState("");
  const [fieldErrors, setFieldErrors]     = useState<FieldErrors>({});
  const [serverError, setServerError]     = useState<string | null>(null);
  const [submitStatus, setSubmitStatus]   = useState<SubmitStatus>("idle");
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [activeStep, setActiveStep]       = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  /** Format nomor WA dengan spasi setiap 4 digit */
  const formatWaNumber = (val: string): string => {
    const digits = val.replace(/\D/g, "");
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)} - ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} - ${digits.slice(4, 8)} - ${digits.slice(8, 16)}`;
  };

  /** Validasi field tunggal on-blur */
  const validateField = (field: keyof BookingFormFields, value: string) => {
    const valToValidate = field === "customer_wa" ? value.replace(/\D/g, "") : value;
    const result = bookingFormSchema.shape[field].safeParse(valToValidate);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  };

  /** Callback saat DateSlotPicker memilih slot */
  const handleSlotSelection = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setServerError(null);
    setActiveStep(staffList.length > 1 ? 4 : 3);
  };

  /** Callback saat service dipilih */
  const handleServiceSelect = (svc: Service) => {
    setSelectedService(svc);
    setSelectedDate("");
    setSelectedTime("");
    setActiveStep(staffList.length > 1 ? 2 : 3);
  };

  /** Callback saat staff dipilih */
  const handleStaffSelect = (staff: Staff) => {
    setSelectedStaff(staff);
    setSelectedDate("");
    setSelectedTime("");
    setActiveStep(3);
  };

  /** Reset semua state ke kondisi awal setelah booking sukses */
  const handleReset = () => {
    setBookingResult(null);
    setSubmitStatus("idle");
    setSelectedDate("");
    setSelectedTime("");
    setSelectedStaff(null);
    setCustomerName("");
    setCustomerWa("");
    setFieldErrors({});
    setServerError(null);
    setActiveStep(1);
  };

  /** Submit booking ke Server Action */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!selectedService) {
      setServerError("Pilih layanan yang kamu mau dulu ya.");
      return;
    }
    if (staffList.length > 1 && !selectedStaff) {
      setServerError("Pilih pegawainya dulu ya.");
      return;
    }
    if (!selectedDate || !selectedTime) {
      setServerError("Tentukan tanggal dan jam kunjungannya dulu yuk.");
      return;
    }

    const customerWaClean = customerWa.replace(/\D/g, "");
    const parsed = bookingFormSchema.safeParse({ customer_name: customerName, customer_wa: customerWaClean });
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        errs[issue.path[0] as keyof BookingFormFields] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    const endTime = calcEndTime(selectedTime, selectedService.duration_minutes);
    const payload = {
      tenant_id: tenant.id,
      service_id: selectedService.id,
      staff_id: selectedStaff?.id,
      customer_name: parsed.data.customer_name,
      customer_wa: parsed.data.customer_wa,
      booking_date: selectedDate,
      start_time: selectedTime,
      end_time: endTime,
    };

    // Offline-first: simpan ke localStorage sebelum network call
    try { localStorage.setItem(LS_KEY, JSON.stringify(payload)); } catch { /* noop */ }

    setSubmitStatus("loading");

    try {
      const res = await submitBooking(payload);
      if (res.success && res.data) {
        try { localStorage.removeItem(LS_KEY); } catch { /* noop */ }
        setBookingResult({ bookingId: res.data.id, service: selectedService, date: selectedDate, startTime: selectedTime, endTime, name: parsed.data.customer_name });
        setSubmitStatus("success");
      } else {
        const isDuplicate = res.error?.toLowerCase().includes("unique") || res.error?.toLowerCase().includes("slot");
        setServerError(isDuplicate ? "Waduh, slot ini baru aja diambil orang lain. Pilih jam yang lain yuk!" : res.error ?? "Gagal bikin jadwal nih. Coba klik sekali lagi ya.");
        setSubmitStatus("idle");
      }
    } catch (err: unknown) {
      const isNetworkErr = err instanceof TypeError && (err.message.includes("fetch") || err.message.includes("network") || err.message.includes("Failed"));
      setSubmitStatus(isNetworkErr ? "offline" : "idle");
      if (!isNetworkErr) setServerError("Ups, ada sesuatu yang error. Coba lagi ya.");
    }
  };

  return {
    // State
    selectedService, selectedStaff, selectedDate, selectedTime,
    customerName, customerWa, fieldErrors, serverError, submitStatus,
    bookingResult, activeStep, selectedCategory,
    // Setters
    setActiveStep, setSelectedCategory,
    setCustomerName, setCustomerWa,
    // Handlers
    handleServiceSelect, handleStaffSelect, handleSlotSelection,
    handleSubmit, handleReset, validateField, formatWaNumber,
  };
}
