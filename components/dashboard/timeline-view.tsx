"use client";

import React, { useState, useTransition } from "react";
import { CheckCircle2, XCircle, Clock, Phone, Loader2, User, Send, Check, Calendar, AlertCircle } from "lucide-react";
import { updateBookingStatus, markReminderSent } from "@/lib/actions/dashboard.actions";
import { proposeReschedule, markNoShow, respondToReschedule } from "@/lib/actions/booking.actions";
import type { Booking } from "@/types/database.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export type BookingWithService = Booking & {
  service_name?: string;
  staff_name?: string | null;
};

interface TimelineViewProps {
 bookings: BookingWithService[];
 isPendingColumn?: boolean;
}

function StatusBadge({ booking }: { booking: BookingWithService }) {
  if (booking.payment_status === "rejected") {
    return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/50 shadow-none">Ditolak</Badge>;
  }
  if (booking.payment_status === "pending") {
    return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/50 shadow-none">Pending</Badge>;
  }

  // Approved or Completed status -> Calculate time-based status
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = booking.start_time.split(':').map(Number);
  const [endH, endM] = booking.end_time.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const bookingDate = new Date(booking.booking_date);
  const isToday = bookingDate.toDateString() === now.toDateString();
  const isPastDate = bookingDate < new Date(now.setHours(0, 0, 0, 0));

  if (isPastDate || (isToday && currentMinutes > endMinutes)) {
    return (
      <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-none gap-1 px-2.5">
        <CheckCircle2 className="w-3 h-3" /> Selesai
      </Badge>
    );
  }

  if (isToday && currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
    return (
      <Badge className="bg-blue-100 text-blue-700 border border-blue-200 shadow-none gap-1.5 px-2.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Berlangsung
      </Badge>
    );
  }

  return (
    <Badge className="bg-stone-100 text-stone-500 border border-stone-200 shadow-none gap-1 px-2.5">
      <Clock className="w-3 h-3" /> Akan datang
    </Badge>
  );
}

function BookingCard({ booking, isPendingColumn }: { booking: BookingWithService, isPendingColumn?: boolean }) {
 const [isPending, startTransition] = useTransition();
 const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
 const [rescheduleDate, setRescheduleDate] = useState("");
 const [rescheduleStartTime, setRescheduleStartTime] = useState("");
 const [rescheduleEndTime, setRescheduleEndTime] = useState("");

 const handleAction = (status: "approved" | "rejected" | "completed") => {
 startTransition(async () => {
 const res = await updateBookingStatus(booking.id, status);
 if (!res.success) {
 // Tampilkan error ke publik jika gagal (misal via toast di aplikasi nyata)
 console.error(res.error);
 alert(res.error);
 }
 });
 };

 return (
  <Card className="overflow-hidden transition-all duration-200 active:scale-[0.99] border border-stone-100 shadow-sm shadow-stone-200/50 rounded-2xl bg-white">
  <CardContent className="p-0">
    {/* Header: Jam & Layanan */}
    <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-stone-100">
      <div className="flex items-center gap-2 text-indigo-700">
        <Clock className="w-4 h-4 flex-shrink-0" />
        <span className="font-bold text-base leading-none">
          {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
        </span>
      </div>
      <StatusBadge booking={booking} />
    </div>

    {/* Body: Info Pelanggan */}
    <div className="px-4 py-3 space-y-1.5">
      <p className="text-xs font-bold text-stone-500 uppercase tracking-wider truncate">{booking.service_name}</p>
      <div className="flex items-center gap-2 text-stone-800">
        <User className="w-4 h-4 text-stone-400 flex-shrink-0" />
        <span className="font-semibold text-sm truncate">{booking.customer_name}</span>
      </div>
      <div className="flex items-center gap-2 text-stone-500">
        <Phone className="w-4 h-4 text-stone-400 flex-shrink-0" />
        <span className="text-sm">{booking.customer_wa}</span>
      </div>
      {booking.staff_name && (
        <div className="flex items-center gap-2 text-stone-500 pt-1 border-t border-stone-50 mt-1">
          <span className="text-xs font-medium text-stone-400 w-12 flex-shrink-0">STAF</span>
          <span className="text-sm font-semibold text-stone-700 truncate">{booking.staff_name}</span>
        </div>
      )}
    </div>

    {/* Reschedule Notification */}
    {booking.reschedule_request && (booking.reschedule_request as any).proposedBy === "customer" && (
      <div className="px-4 pb-2">
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
          <div className="flex items-start gap-2 text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs mb-1">Permintaan Reschedule</h4>
              <p className="text-[11px] text-amber-700 leading-relaxed mb-2">
                Pelanggan meminta pindah jadwal menjadi: <span className="font-semibold">{new Date((booking.reschedule_request as any).date).toLocaleDateString("id-ID")}</span> jam <span className="font-semibold">{(booking.reschedule_request as any).startTime.slice(0,5)}</span>.
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg h-7 text-[10px] px-3"
                  onClick={async () => {
                    const res = await respondToReschedule(booking.id, "accepted");
                    if (res.success) toast.success("Jadwal diubah!");
                    else toast.error(res.error || "Gagal menyetujui.");
                  }}
                >Setuju</Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-amber-300 text-amber-800 hover:bg-amber-100 rounded-lg h-7 text-[10px] px-3"
                  onClick={async () => {
                    const res = await respondToReschedule(booking.id, "rejected");
                    if (res.success) toast.success("Perubahan ditolak.");
                    else toast.error(res.error || "Gagal menolak.");
                  }}
                >Tolak</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Footer: Aksi — SELALU tampil (penting untuk touch device) */}
    {booking.payment_status === "pending" && (
      <div className="px-4 pb-4 pt-1 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-none bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl h-10 text-sm font-bold"
          onClick={() => handleAction("rejected")}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1.5" />}
          Tolak
        </Button>
        <Button
          size="sm"
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 rounded-xl h-10 text-sm font-bold"
          onClick={() => handleAction("approved")}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
          {isPending ? "Memproses..." : "Terima DP"}
        </Button>
      </div>
    )}

    {booking.payment_status === "approved" && (
      <div className="px-4 pb-4 pt-1 flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 rounded-xl text-xs font-bold border-stone-200 text-stone-700 hover:bg-stone-50"
            onClick={() => setIsRescheduleOpen(true)}
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
            Ubah Jadwal
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-9 rounded-xl text-xs font-bold border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
            onClick={() => {
              if (confirm("Tandai pelanggan tidak hadir? Slot ini akan dikosongkan.")) {
                startTransition(async () => {
                  const res = await markNoShow(booking.id);
                  if (res.success) toast.success("Ditandai Tidak Hadir");
                  else toast.error(res.error || "Gagal mengubah");
                });
              }
            }}
            disabled={isPending}
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Tidak Hadir
          </Button>
        </div>
        {booking.is_reminder_sent ? (
          <div className="flex items-center justify-center gap-1.5 h-10 bg-stone-50 rounded-xl border border-stone-100">
            <Check className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-bold text-stone-500">Pengingat Terkirim</span>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full h-10 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-xl text-sm font-bold"
            onClick={() => {
              const waNumber = booking.customer_wa.replace(/^0/, "62");
              const text = `Halo ${booking.customer_name},\n\nMengingatkan jadwal booking Anda untuk layanan *${booking.service_name}* pada tanggal *${booking.booking_date}* jam *${booking.start_time.slice(0, 5)}*.\n\nMohon hadir tepat waktu ya! Terima kasih.`;
              const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
              window.open(waUrl, "_blank", "noopener,noreferrer");
              startTransition(async () => {
                await markReminderSent(booking.id);
              });
            }}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
            Kirim Pengingat WA
          </Button>
        )}
        
        <Button
          size="sm"
          className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 rounded-xl text-sm font-bold"
          onClick={() => handleAction("completed")}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
          Lunas & Selesai
        </Button>
      </div>
    )}

    <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajukan Perubahan Jadwal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4 text-sm">
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-700">Tanggal Baru</label>
            <input 
              type="date" 
              className="w-full border border-stone-200 rounded-lg p-2"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="font-semibold text-stone-700">Jam Mulai</label>
              <input 
                type="time" 
                className="w-full border border-stone-200 rounded-lg p-2"
                value={rescheduleStartTime}
                onChange={(e) => setRescheduleStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="font-semibold text-stone-700">Jam Selesai</label>
              <input 
                type="time" 
                className="w-full border border-stone-200 rounded-lg p-2"
                value={rescheduleEndTime}
                onChange={(e) => setRescheduleEndTime(e.target.value)}
              />
            </div>
          </div>
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 mt-2"
            disabled={!rescheduleDate || !rescheduleStartTime || !rescheduleEndTime || isPending}
            onClick={() => {
              startTransition(async () => {
                const res = await proposeReschedule(
                  booking.id, 
                  "tenant", 
                  rescheduleDate, 
                  rescheduleStartTime.length === 5 ? rescheduleStartTime + ":00" : rescheduleStartTime, 
                  rescheduleEndTime.length === 5 ? rescheduleEndTime + ":00" : rescheduleEndTime
                );
                if (res.success) {
                  toast.success("Mantap, pengajuan reschedule udah dikirim ke pelanggan.");
                  setIsRescheduleOpen(false);
                  if (res.data?.type === "manual" && res.data.url) {
                    window.open(res.data.url, "_blank");
                  }
                } else {
                  toast.error(res.error || "Gagal mengajukan.");
                }
              });
            }}
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ajukan Jadwal Baru & Kirim Pesan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </CardContent>
  </Card>
 );
}

export function TimelineView({ bookings, isPendingColumn }: TimelineViewProps) {
 if (!bookings || bookings.length === 0) {
 return null;
 }

 return (
 <div className="space-y-4">
 {bookings.map((booking) => (
 <BookingCard key={booking.id} booking={booking} isPendingColumn={isPendingColumn} />
 ))}
 </div>
 );
}
