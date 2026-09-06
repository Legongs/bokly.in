// components/customer/booking-flow.tsx
// Orchestrator: menyusun semua sub-komponen dan menghubungkan ke useBookingFlow hook.
// File ini TIDAK boleh mengandung state, logika bisnis, atau utility function.
"use client";

import React from "react";
import { Store } from "lucide-react";
import { useBookingFlow } from "@/hooks/use-booking-flow";
import { getTheme } from "@/lib/booking-utils";
import { BookingSuccess }      from "./booking-success";
import { BookingStepper }      from "./booking-stepper";
import { BookingContextBar }   from "./booking-context-bar";
import { StepServiceSelect }   from "./step-service-select";
import { StepStaffSelect }     from "./step-staff-select";
import { StepDateTime }        from "./step-date-time";
import { StepCustomerForm }    from "./step-customer-form";
import type { Tenant, Service, Staff } from "@/types/database.types";
import type { BusinessDictionary } from "@/lib/dictionaries";

interface BookingFlowProps {
  tenant: Tenant;
  services: Service[];
  staffList?: Staff[];
  dictionary?: BusinessDictionary;
}

export function BookingFlow({ tenant, services, staffList = [], dictionary }: BookingFlowProps) {
  const flow = useBookingFlow({ tenant, services, staffList });
  const t    = getTheme(dictionary?.themeColor || (tenant as any).theme_color);

  // ── Tampilan kosong jika tidak ada layanan ───────────────────────────────
  if (services.length === 0) {
    return (
      <div className="py-12 px-6 rounded-[2rem] border border-stone-100 bg-stone-50/50 text-center shadow-sm">
        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-stone-100 rotate-3 transition-transform hover:rotate-0 duration-300">
          <Store className="w-8 h-8 text-stone-300" />
        </div>
        <h3 className="text-lg font-bold text-stone-800 mb-1">{tenant.business_name} Belum Buka</h3>
        <p className="text-sm text-stone-500 max-w-xs mx-auto">
          Yah, belum ada {dictionary?.serviceLabel?.toLowerCase() || "layanan"} yang buka di outlet ini.
          Coba cek lagi nanti ya!
        </p>
      </div>
    );
  }

  // ── Tampilan sukses setelah booking ─────────────────────────────────────
  if (flow.submitStatus === "success" && flow.bookingResult) {
    return (
      <BookingSuccess
        bookingResult={flow.bookingResult}
        tenant={tenant}
        t={t}
        dictionary={dictionary}
        onReset={flow.handleReset}
      />
    );
  }

  // ── Susun steps dinamis berdasarkan jumlah staff ────────────────────────
  const steps = [
    { label: dictionary?.serviceLabel || "Layanan" },
    ...(flow.filteredStaffList.length > 1 ? [{ label: dictionary?.staffLabel || "Pegawai" }] : []),
    { label: "Jadwal" },
    { label: "Data" },
  ];

  const augmentedStaffList = flow.filteredStaffList.length > 1 
    ? [{ id: "any", name: "Siapa saja (Bebas)", tenant_id: tenant.id, is_active: true } as unknown as Staff, ...flow.filteredStaffList]
    : flow.filteredStaffList;

  // ── Form utama multi-step ────────────────────────────────────────────────
  return (
    <form id="booking-form" onSubmit={flow.handleSubmit} noValidate className="space-y-5">

      {/* ── Sticky Progress & Context ── */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-stone-200 shadow-sm -mx-4 px-4 pt-4 pb-3 mb-6">
        <BookingStepper steps={steps} activeStep={flow.activeStep} t={t} />
        
        <BookingContextBar
          selectedService={flow.selectedService}
          selectedDate={flow.selectedDate}
          selectedTime={flow.selectedTime}
          t={t}
          showFromStep={2}
          activeStep={flow.activeStep}
        />
      </div>

      {/* Step 1: Pilih Layanan — dengan multi-service support & flexible duration */}
      <StepServiceSelect
        services={services}
        selectedService={flow.selectedService}
        selectedServices={flow.selectedServices}
        selectedCategory={flow.selectedCategory}
        activeStep={flow.activeStep}
        t={t}
        dictionary={dictionary}
        customDuration={flow.customDuration}
        onSelectService={flow.handleServiceSelect}
        onAddService={flow.handleAddService}
        onRemoveService={flow.handleRemoveService}
        onChangeStep={flow.setActiveStep}
        onSelectCategory={flow.setSelectedCategory}
        onSetCustomDuration={flow.setCustomDuration}
      />

      {/* Step 2 (Opsional): Pilih Staff */}
      {flow.filteredStaffList.length > 1 && (
        <StepStaffSelect
          staffList={augmentedStaffList}
          selectedStaff={flow.selectedStaff}
          activeStep={flow.activeStep}
          t={t}
          dictionary={dictionary}
          onSelectStaff={flow.handleStaffSelect}
          onChangeStep={flow.setActiveStep}
        />
      )}

      {/* Step 3: Pilih Tanggal & Jam */}
      <StepDateTime
        tenant={tenant}
        selectedService={flow.selectedService}
        selectedStaff={flow.selectedStaff}
        selectedDate={flow.selectedDate}
        selectedTime={flow.selectedTime}
        staffList={flow.filteredStaffList}
        activeStep={flow.activeStep}
        t={t}
        dictionary={dictionary}
        totalDuration={flow.totalDuration}
        onSelectSlot={flow.handleSlotSelection}
        onChangeStep={flow.setActiveStep}
      />

      {/* Step 4/3: Data Pemesan + Field Sektor + FAB */}
      <StepCustomerForm
        selectedService={flow.selectedService}
        selectedServices={flow.selectedServices}
        selectedStaff={flow.selectedStaff}
        selectedDate={flow.selectedDate}
        selectedTime={flow.selectedTime}
        customerName={flow.customerName}
        customerWa={flow.customerWa}
        fieldErrors={flow.fieldErrors}
        serverError={flow.serverError}
        submitStatus={flow.submitStatus}
        staffList={staffList}
        activeStep={flow.activeStep}
        t={t}
        dictionary={dictionary}
        // Derived totals
        totalPrice={flow.totalPrice}
        totalDuration={flow.totalDuration}
        totalDpAmount={flow.totalDpAmount}
        // Business sector & sector-specific fields
        businessSector={tenant.business_sector}
        vehicleBrand={flow.vehicleBrand}
        vehicleType={flow.vehicleType}
        vehiclePlate={flow.vehiclePlate}
        complaintNotes={flow.complaintNotes}
        consultationType={flow.consultationType}
        onChangeName={flow.setCustomerName}
        onChangeWa={(val) => flow.setCustomerWa(flow.formatWaNumber(val))}
        onBlurField={flow.validateField}
        onChangeVehicleBrand={flow.setVehicleBrand}
        onChangeVehicleType={flow.setVehicleType}
        onChangeVehiclePlate={flow.setVehiclePlate}
        onChangeComplaintNotes={flow.setComplaintNotes}
        onChangeConsultationType={flow.setConsultationType}
      />
    </form>
  );
}
