"use client";

import React, { useState, useTransition } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Check, X, Eye, FileImage } from "lucide-react";
import { approvePayment, rejectPayment } from "@/lib/actions/payment.actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Booking = {
  id: string;
  customer_name: string;
  customer_wa: string;
  booking_date: string;
  payment_status: string;
  proof_url: string | null;
  services: { name: string; dp_amount: number | null } | null;
};

export function PaymentTable({ bookings }: { bookings: Booking[] }) {
  const [isPending, startTransition] = useTransition();
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleApprove = (bookingId: string) => {
    startTransition(async () => {
      const res = await approvePayment(bookingId);
      if (res.success) {
        toast.success("Pembayaran berhasil disetujui!");
      } else {
        toast.error(res.error || "Gagal menyetujui pembayaran.");
      }
    });
  };

  const handleReject = (bookingId: string) => {
    startTransition(async () => {
      const res = await rejectPayment(bookingId);
      if (res.success) {
        toast.success("Pembayaran ditolak. Bukti dihapus.");
      } else {
        toast.error(res.error || "Gagal menolak pembayaran.");
      }
    });
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-stone-100 shadow-sm">
        <FileImage className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-stone-800">Belum Ada Transaksi Manual</h3>
        <p className="text-stone-500 mt-1">Tidak ada bukti pembayaran yang perlu diverifikasi.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-stone-50 text-stone-500 uppercase font-semibold text-xs border-b border-stone-100">
            <tr>
              <th className="px-6 py-4 rounded-tl-3xl">Pelanggan</th>
              <th className="px-6 py-4">Layanan & Tanggal</th>
              <th className="px-6 py-4">Total DP</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right rounded-tr-3xl">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-stone-800">{b.customer_name}</div>
                  <div className="text-xs text-stone-500 font-mono mt-0.5">{b.customer_wa}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-stone-800">{b.services?.name}</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {format(new Date(b.booking_date), "d MMM yyyy", { locale: id })}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-stone-800">
                  {formatIDR(Number(b.services?.dp_amount || 0))}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    b.payment_status === "approved" ? "bg-emerald-50 text-emerald-600" :
                    b.payment_status === "rejected" ? "bg-rose-50 text-rose-600" :
                    (b.payment_status === "pending_verification" || b.payment_status === "pending") ? "bg-amber-50 text-amber-600" :
                    "bg-stone-100 text-stone-600"
                  }`}>
                    {b.payment_status === "pending_verification" ? "Perlu Verifikasi" : 
                     b.payment_status === "pending" ? "Pending" :
                     b.payment_status === "approved" ? "Disetujui" : 
                     b.payment_status === "rejected" ? "Ditolak" : b.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  {b.proof_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProof(b.proof_url)}
                      className="rounded-full text-teal-600 border-teal-200 hover:bg-teal-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Bukti
                    </Button>
                  )}
                  {b.payment_status === "pending_verification" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleApprove(b.id)}
                        className="rounded-full bg-teal-600 hover:bg-teal-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Setujui
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleReject(b.id)}
                        className="rounded-full bg-rose-500 hover:bg-rose-600"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Tolak
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedProof} onOpenChange={(open) => !open && setSelectedProof(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-6 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-stone-800 text-center">
              Bukti Transfer
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex justify-center bg-stone-50 rounded-2xl p-4">
            {selectedProof && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={selectedProof} 
                alt="Bukti Transfer" 
                className="max-h-[60vh] object-contain rounded-xl"
              />
            )}
          </div>
          <div className="mt-6">
            <Button 
              onClick={() => setSelectedProof(null)} 
              className="w-full rounded-full bg-stone-900 text-white hover:bg-stone-800 h-12 text-base font-semibold"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
