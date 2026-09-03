"use client";

import React, { useTransition } from "react";
import { CheckCircle2, XCircle, Clock, Phone, Loader2, User, Send, Check } from "lucide-react";
import { updateBookingStatus, markReminderSent } from "@/lib/actions/dashboard.actions";
import type { Booking } from "@/types/database.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Tipe kustom karena kueri join menambahkan field service_name
export type BookingWithService = Booking & {
 service_name?: string;
};

interface TimelineViewProps {
 bookings: BookingWithService[];
}

function StatusBadge({ status }: { status: Booking["payment_status"] }) {
 switch (status) {
 case "approved":
 return (
 <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200 border-teal-200">
 Disetujui
 </Badge>
 );
 case "rejected":
 return (
 <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200">
 Ditolak
 </Badge>
 );
 default:
 return (
 <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
 Pending
 </Badge>
 );
 }
}

function BookingCard({ booking }: { booking: BookingWithService }) {
 const [isPending, startTransition] = useTransition();

 const handleAction = (status: "approved" | "rejected") => {
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
 <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-none shadow-md shadow-stone-200/50 rounded-3xl bg-white">
 <CardContent className="p-0">
 <div className="flex flex-col sm:flex-row">
 {/* Bagian Kiri: Jam & Info Layanan */}
 <div className="bg-stone-50/50 p-5 sm:w-1/3 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-stone-100 ">
 <div className="flex items-center gap-2 mb-1.5 text-teal-700 ">
 <Clock className="w-4 h-4" />
 <span className="font-bold text-lg">
 {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
 </span>
 </div>
 <p className="text-sm font-semibold text-stone-900 ">
 {booking.service_name}
 </p>
 </div>

 {/* Bagian Kanan: Data Pelanggan & Aksi */}
 <div className="p-4 sm:w-2/3 flex flex-col justify-between gap-4">
 <div className="flex justify-between items-start gap-4">
 <div className="space-y-1">
 <div className="flex items-center gap-1.5 text-stone-900 ">
 <User className="w-4 h-4 text-stone-400" />
 <span className="font-semibold text-sm">{booking.customer_name}</span>
 </div>
 <div className="flex items-center gap-1.5 text-stone-500">
 <Phone className="w-4 h-4 text-stone-400" />
 <span className="text-xs">{booking.customer_wa}</span>
 </div>
 </div>
 <StatusBadge status={booking.payment_status} />
 </div>

 {booking.payment_status === "pending" && (
 <div className="flex gap-2 justify-end">
 <Button
 size="sm"
 variant="outline"
 className="border-none bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl"
 onClick={() => handleAction("rejected")}
 disabled={isPending}
 >
 {isPending ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 <XCircle className="w-4 h-4 mr-1.5" />
 )}
 Tolak
 </Button>
 <Button
 size="sm"
 className="bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 rounded-xl"
 onClick={() => handleAction("approved")}
 disabled={isPending}
 >
 {isPending ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 <CheckCircle2 className="w-4 h-4 mr-1.5" />
 )}
 {isPending ? "Memproses..." : "Terima"}
 </Button>
 </div>
 )}
  {booking.payment_status === "approved" && (
    <div className="flex justify-end mt-2">
      {booking.is_reminder_sent ? (
        <Badge variant="outline" className="text-stone-500 border-stone-200 bg-stone-50 flex items-center gap-1">
          <Check className="w-3 h-3" />
          Pengingat Terkirim
        </Badge>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-xl transition-all"
          onClick={() => {
            // Teks Template
            const waNumber = booking.customer_wa.replace(/^0/, "62");
            const text = `Halo ${booking.customer_name},\n\nMengingatkan jadwal booking Anda untuk layanan *${booking.service_name}* pada tanggal *${booking.booking_date}* jam *${booking.start_time.slice(0, 5)}*.\n\nMohon hadir tepat waktu ya! Terima kasih.`;
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
            
            // Buka tab WA
            window.open(waUrl, "_blank", "noopener,noreferrer");
            
            // Tandai sudah dikirim
            startTransition(async () => {
              await markReminderSent(booking.id);
            });
          }}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5 mr-1.5" />
          )}
          Kirim Pengingat WA
        </Button>
      )}
    </div>
  )}
  </div>
 </div>
 </CardContent>
 </Card>
 );
}

export function TimelineView({ bookings }: TimelineViewProps) {
 if (!bookings || bookings.length === 0) {
 return (
 <div className="py-12 px-6 rounded-[2rem] border border-stone-100 bg-stone-50/50 text-center shadow-sm mt-4">
 <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-stone-100 -rotate-3 transition-transform hover:rotate-0">
 <CheckCircle2 className="w-8 h-8 text-stone-300" />
 </div>
 <h3 className="text-lg font-bold text-stone-800 mb-1">
 Belum Ada Jadwal
 </h3>
 <p className="text-sm text-stone-500 max-w-xs mx-auto">
 Waktu luang nih! Belum ada pelanggan yang menjadwalkan booking untuk hari ini.
 </p>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 {bookings.map((booking) => (
 <BookingCard key={booking.id} booking={booking} />
 ))}
 </div>
 );
}
