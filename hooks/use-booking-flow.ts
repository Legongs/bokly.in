// hooks/use-booking-flow.ts
// Custom hook yang mengisolasi semua state & logika bisnis BookingFlow.
// Komponen visual TIDAK boleh memegang state di luar hook ini.
"use client";

import React, { useState, useMemo } from "react";
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
export type FieldErrors = Partial<Record<keyof BookingFormFields | "vehicle_brand" | "vehicle_type" | "vehicle_plate" | "complaint_notes" | "consultation_type", string>>;
export type SubmitStatus = "idle" | "loading" | "offline" | "success";

export interface BookingResult {
  bookingId: string;
  services: Service[];       // array semua layanan (multi-service support)
  service: Service;          // layanan utama/pertama — backward compat
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  totalPrice: number;
  totalDuration: number;
}

const LS_KEY = "buklyid_pending_booking";

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
  const [selectedServices, setSelectedServices] = useState<Service[]>(
    services.length > 0 ? [services[0]] : []
  );
  const [selectedStaff, setSelectedStaff]   = useState<Staff | null>(
    staffList.length === 1 ? staffList[0] : null
  );
  const [selectedDate, setSelectedDate]     = useState("");
  const [selectedTime, setSelectedTime]     = useState("");
  const [customerName, setCustomerName]     = useState("");
  const [customerWa, setCustomerWa]         = useState("");
  const [fieldErrors, setFieldErrors]       = useState<FieldErrors>({});
  const [serverError, setServerError]       = useState<string | null>(null);
  const [submitStatus, setSubmitStatus]     = useState<SubmitStatus>("idle");
  const [bookingResult, setBookingResult]   = useState<BookingResult | null>(null);
  const [activeStep, setActiveStep]         = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // TASK 4: Durasi kustom untuk layanan fleksibel (sektor space)
  const [customDuration, setCustomDuration] = useState<number | null>(null);

  // TASK 3: Field khusus sektor otomotif
  const [vehicleBrand, setVehicleBrand]     = useState("");
  const [vehicleType, setVehicleType]       = useState("");
  const [vehiclePlate, setVehiclePlate]     = useState("");
  const [complaintNotes, setComplaintNotes] = useState("");

  // TASK 3: Field khusus sektor kesehatan
  const [consultationType, setConsultationType] = useState<"baru" | "lanjutan" | "">("");

  // Backward compat: selectedService = layanan pertama yang dipilih
  const selectedService = selectedServices.length > 0 ? selectedServices[0] : null;

  // Apakah layanan pertama yang dipilih menggunakan durasi fleksibel?
  const isFlexibleDuration = !!(selectedService as any)?.is_flexible_duration;

  // Hitung total durasi: semua layanan + buffer layanan terakhir
  const totalDuration = useMemo(() => {
    if (selectedServices.length === 0) return 0;
    if (isFlexibleDuration && customDuration !== null) {
      // Untuk layanan fleksibel, gunakan durasi kustom yang dipilih user
      return customDuration;
    }
    const sum = selectedServices.reduce((acc, svc) => acc + svc.duration_minutes, 0);
    const lastBuffer = selectedServices[selectedServices.length - 1]?.buffer_minutes || 0;
    return sum + lastBuffer;
  }, [selectedServices, isFlexibleDuration, customDuration]);

  // Hitung total harga semua layanan
  const totalPrice = useMemo(() => {
    if (selectedServices.length === 0) return 0;
    if (isFlexibleDuration && selectedService && customDuration !== null) {
      // Harga = price_per_jam × (durasi / 60)
      return Number(selectedService.price) * (customDuration / 60);
    }
    return selectedServices.reduce((acc, svc) => acc + Number(svc.price), 0);
  }, [selectedServices, isFlexibleDuration, selectedService, customDuration]);

  // Hitung total DP (jumlah dp_amount semua layanan)
  const totalDpAmount = useMemo(() => {
    return selectedServices.reduce((acc, svc) => acc + Number(svc.dp_amount || 0), 0);
  }, [selectedServices]);

  const filteredStaffList = useMemo(() => {
    if (selectedServices.length === 0) return staffList;
    // Filter staff yang bisa melakukan layanan UTAMA (pertama)
    const primaryService = selectedServices[0];
    return staffList.filter((staff: any) => {
      if (!staff.staff_services || staff.staff_services.length === 0) return true;
      return staff.staff_services.some((ss: any) => ss.service_id === primaryService.id);
    });
  }, [staffList, selectedServices]);

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
    setActiveStep(filteredStaffList.length > 1 ? 4 : 3);
  };

  /** Callback saat service dipilih (single select — TASK 4 toggle multi nanti) */
  const handleServiceSelect = (svc: Service) => {
    setSelectedServices([svc]);
    setSelectedDate("");
    setSelectedTime("");
    setCustomDuration(null); // reset durasi kustom saat ganti layanan

    // Calculate how many staff can do this service
    const capableStaff = staffList.filter((staff: any) => {
      if (!staff.staff_services || staff.staff_services.length === 0) return true;
      return staff.staff_services.some((ss: any) => ss.service_id === svc.id);
    });

    if (capableStaff.length === 1) {
      setSelectedStaff(capableStaff[0]);
    } else if (capableStaff.length === 0) {
      setSelectedStaff(null);
    } else if (selectedStaff && selectedStaff.id !== "any" && !capableStaff.find(s => s.id === selectedStaff.id)) {
      setSelectedStaff(null);
    }

    setActiveStep(capableStaff.length > 1 ? 2 : 3);
  };

  /** Tambah layanan tambahan ke pilihan (multi-service, TASK 2) */
  const handleAddService = (svc: Service) => {
    setSelectedServices((prev) => {
      if (prev.some((s) => s.id === svc.id)) return prev; // sudah ada
      return [...prev, svc];
    });
    setSelectedDate("");
    setSelectedTime("");
  };

  /** Hapus layanan dari pilihan (kecuali layanan pertama/utama) */
  const handleRemoveService = (svcId: string) => {
    setSelectedServices((prev) => {
      if (prev.length <= 1) return prev; // minimal 1 layanan
      const filtered = prev.filter((s) => s.id !== svcId);
      return filtered;
    });
    setSelectedDate("");
    setSelectedTime("");
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
    setCustomDuration(null);
    setVehicleBrand("");
    setVehicleType("");
    setVehiclePlate("");
    setComplaintNotes("");
    setConsultationType("");
  };

  /** Submit booking ke Server Action */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (selectedServices.length === 0) {
      setServerError("Pilih layanan yang kamu mau dulu ya.");
      return;
    }
    if (filteredStaffList.length > 1 && !selectedStaff) {
      setServerError("Pilih pegawainya dulu ya.");
      return;
    }
    if (!selectedDate || !selectedTime) {
      setServerError("Tentukan tanggal dan jam kunjungannya dulu yuk.");
      return;
    }

    // Validasi field sektor — dilakukan di sini sebelum submit
    const businessSector = tenant.business_sector;
    const newErrors: FieldErrors = {};
    if (businessSector === "auto") {
      if (!vehicleBrand.trim()) newErrors.vehicle_brand = "Merek kendaraan wajib diisi.";
      if (!vehicleType.trim()) newErrors.vehicle_type = "Tipe/model kendaraan wajib diisi.";
      if (!vehiclePlate.trim()) newErrors.vehicle_plate = "Plat nomor wajib diisi.";
      if (!complaintNotes.trim()) newErrors.complaint_notes = "Keluhan/kondisi kendaraan wajib diisi.";
    }
    if (businessSector === "health") {
      if (!consultationType) newErrors.consultation_type = "Jenis konsultasi wajib dipilih.";
    }

    const customerWaClean = customerWa.replace(/\D/g, "");
    const formParsed = bookingFormSchema.safeParse({ customer_name: customerName, customer_wa: customerWaClean });
    if (!formParsed.success) {
      const errs: FieldErrors = { ...newErrors };
      for (const issue of formParsed.error.issues) {
        errs[issue.path[0] as keyof BookingFormFields] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    // Hitung end_time berdasarkan total durasi
    const effectiveDuration = isFlexibleDuration && customDuration !== null
      ? customDuration
      : selectedServices.reduce((acc, svc) => acc + svc.duration_minutes, 0);
    const endTime = calcEndTime(selectedTime, effectiveDuration);

    const serviceIds = selectedServices.map((s) => s.id);
    const primaryServiceId = serviceIds[0];

    const payload = {
      tenant_id:          tenant.id,
      service_id:         primaryServiceId,
      service_ids:        serviceIds,
      staff_id:           selectedStaff?.id === "any" ? null : selectedStaff?.id,
      customer_name:      formParsed.data.customer_name,
      customer_wa:        formParsed.data.customer_wa,
      booking_date:       selectedDate,
      start_time:         selectedTime,
      end_time:           endTime,
      // Field sektor
      business_sector:    businessSector ?? null,
      vehicle_brand:      vehicleBrand || null,
      vehicle_type:       vehicleType || null,
      vehicle_plate:      vehiclePlate || null,
      complaint_notes:    complaintNotes || null,
      consultation_type:  (consultationType || null) as "baru" | "lanjutan" | null,
    };

    // Offline-first: simpan ke localStorage sebelum network call
    try { localStorage.setItem(LS_KEY, JSON.stringify(payload)); } catch { /* noop */ }

    setSubmitStatus("loading");

    try {
      const res = await submitBooking(payload);
      if (res.success && res.data) {
        try { localStorage.removeItem(LS_KEY); } catch { /* noop */ }
        setBookingResult({
          bookingId:     res.data.id,
          services:      selectedServices,
          service:       selectedServices[0],
          date:          selectedDate,
          startTime:     selectedTime,
          endTime,
          name:          formParsed.data.customer_name,
          totalPrice,
          totalDuration: effectiveDuration,
        });
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
    selectedService,        // backward compat — layanan pertama
    selectedServices,       // array semua layanan yang dipilih (multi-service)
    selectedStaff, selectedDate, selectedTime,
    customerName, customerWa, fieldErrors, serverError, submitStatus,
    bookingResult, activeStep, selectedCategory, filteredStaffList,
    // Derived values
    totalDuration, totalPrice, totalDpAmount, isFlexibleDuration,
    customDuration,
    // Field sektor
    vehicleBrand, vehicleType, vehiclePlate, complaintNotes, consultationType,
    // Setters
    setActiveStep, setSelectedCategory,
    setCustomerName, setCustomerWa,
    setCustomDuration,
    setVehicleBrand, setVehicleType, setVehiclePlate, setComplaintNotes, setConsultationType,
    // Handlers
    handleServiceSelect, handleAddService, handleRemoveService,
    handleStaffSelect, handleSlotSelection,
    handleSubmit, handleReset, validateField, formatWaNumber,
  };
}
