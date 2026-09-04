"use client";

import React from "react";
import useSWR from "swr";
import { getPaymentBookings } from "@/lib/actions/dashboard.actions";
import { PaymentTable } from "@/components/dashboard/payment-table";
import { Loader2 } from "lucide-react";

export default function PaymentsPage() {
  const { data: response, isLoading } = useSWR("payment-bookings", getPaymentBookings);

  if (isLoading || !response) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-4" />
        <p className="text-stone-500 font-medium">Memuat data pembayaran...</p>
      </div>
    );
  }

  if (!response.success) {
    return (
      <div className="text-center py-10">
        <p className="text-rose-500 font-medium">{response.error || "Gagal memuat data pembayaran."}</p>
      </div>
    );
  }

  const bookings = response.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Verifikasi Pembayaran
        </h1>
        <p className="text-stone-500">
          Kelola bukti transfer dan verifikasi pembayaran manual pelanggan.
        </p>
      </div>

      <PaymentTable bookings={bookings} />
    </div>
  );
}
