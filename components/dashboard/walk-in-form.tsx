"use client";

import React, { useState, useTransition } from "react";
import { Plus, User, Phone, Clock, Loader2, Store } from "lucide-react";
import { submitBooking } from "@/lib/actions/booking.actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function WalkInForm({
  tenantId,
  services,
  staff
}: {
  tenantId: string;
  services: { id: string; name: string; duration_minutes: number }[];
  staff: { id: string; name: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [serviceId, setServiceId] = useState(services[0]?.id || "");
  const [staffId, setStaffId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerWa, setCustomerWa] = useState("");
  
  // Waktu Walk-in otomatis hari ini, jam sekarang
  const now = new Date();
  const dateStr = now.toLocaleString("en-CA", { timeZone: "Asia/Jakarta" }).split(",")[0];
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const [startTime, setStartTime] = useState(timeStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const selectedService = services.find(s => s.id === serviceId);
    if (!selectedService) return;

    // Kalkulasi endTime berdasarkan duration_minutes
    const [h, m] = startTime.split(":").map(Number);
    const endTotalMins = h * 60 + m + selectedService.duration_minutes;
    const endH = Math.floor(endTotalMins / 60);
    const endM = endTotalMins % 60;
    const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    startTransition(async () => {
      const res = await submitBooking({
        tenant_id: tenantId,
        service_id: serviceId,
        staff_id: staffId || null,
        customer_name: customerName,
        customer_wa: customerWa,
        booking_date: dateStr,
        start_time: startTime,
        end_time: endTime,
        is_walkin: true,
      });
      if (!res.success) {
        setError(res.error || "Terjadi kesalahan yang tidak diketahui.");
      } else {
        setIsOpen(false);
        // Reset form
        setCustomerName("");
        setCustomerWa("");
      }
    });
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-stone-900 text-white hover:bg-stone-800 rounded-full shadow-md font-bold px-4"
      >
        <Plus className="w-4 h-4 mr-1.5" /> Walk-in
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-5 sm:p-6 border border-stone-100 shadow-xl max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold flex items-center gap-2 text-stone-900">
            <Store className="w-5 h-5 text-teal-600" /> Tambah Walk-in
          </DialogTitle>
        </DialogHeader>

        <div className="bg-teal-50 text-teal-800 text-xs p-3 rounded-xl border border-teal-100 font-medium leading-relaxed mt-2 shadow-sm">
          <strong>Ssst, fitur Walk-in ini khusus buat kasir!</strong> Sistem bakal langsung ngunci jadwal tanpa nunggu pelanggan bayar DP, dan batas waktu pesanan juga dilewati. Pas banget buat masukin jadwal tamu yang datang mendadak ke toko.
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-xl font-medium border border-rose-100 mt-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Layanan */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-stone-700">Layanan</label>
            <select
              required
              className="w-full bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 font-medium outline-none transition-all"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
            >
              <option value="" disabled>Pilih layanan...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} mnt)</option>
              ))}
            </select>
          </div>

          {/* Staf (Opsional) */}
          {staff.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-stone-700">Pilih Staf (Opsional)</label>
              <select
                className="w-full bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 font-medium outline-none transition-all"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
              >
                <option value="">Bebas (Siapa Saja)</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Jam Mulai */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-stone-400" /> Jam Mulai
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 font-medium outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Nama Pelanggan */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-stone-400" /> Nama
              </label>
              <input
                type="text"
                required
                placeholder="Cth: Budi"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 font-medium outline-none transition-all"
              />
            </div>

            {/* WA Pelanggan */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-stone-700 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-stone-400" /> No WA
              </label>
              <input
                type="tel"
                required
                placeholder="081xxx"
                value={customerWa}
                onChange={(e) => setCustomerWa(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 text-stone-900 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 font-medium outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isPending || !serviceId}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-11 text-base font-bold shadow-sm"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isPending ? "Menyimpan..." : "Simpan & Konfirmasi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
