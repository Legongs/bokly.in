"use client";

import React, { useState } from "react";
import { TrendingUp, Contact, Calendar, Clock, ReceiptText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CustomerWithBookings } from "@/lib/actions/customer.actions";

interface CustomerTableProps {
  customers: CustomerWithBookings[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithBookings | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-100">
            <tr>
              <th className="px-6 py-4">Nama Pelanggan</th>
              <th className="px-6 py-4">No. WhatsApp</th>
              <th className="px-6 py-4 text-center">Total Kunjungan</th>
              <th className="px-6 py-4 text-right">Terakhir Booking</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {customers.map((cust) => (
              <tr key={cust.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-stone-800">
                  <button 
                    onClick={() => setSelectedCustomer(cust)}
                    className="hover:text-teal-600 transition-colors underline decoration-stone-300 underline-offset-4 decoration-dashed flex items-center gap-2"
                  >
                    {cust.name}
                  </button>
                </td>
                <td className="px-6 py-4 text-stone-600">
                  {cust.whatsapp_number}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1 rounded-xl text-xs font-bold">
                      <TrendingUp className="w-3 h-3" />
                      {cust.total_bookings}x
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-stone-500">
                  {new Date(cust.updated_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-md p-6 rounded-[2rem]">
          <DialogHeader className="mb-4">
            <DialogTitle className="flex items-center gap-2 text-xl font-extrabold text-stone-900">
              <Contact className="w-5 h-5 text-teal-600" />
              Detail Pelanggan
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Info Pelanggan */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-stone-500 font-medium">Nama</span>
                  <span className="font-bold text-stone-900">{selectedCustomer.name}</span>
                </div>
                <div className="flex flex-col gap-1 mt-3">
                  <span className="text-sm text-stone-500 font-medium">No. WhatsApp</span>
                  <span className="font-bold text-stone-900">{selectedCustomer.whatsapp_number}</span>
                </div>
                <div className="flex flex-col gap-1 mt-3">
                  <span className="text-sm text-stone-500 font-medium">Total Kunjungan</span>
                  <span className="font-bold text-stone-900">{selectedCustomer.total_bookings}x</span>
                </div>
              </div>

              {/* Riwayat Pemesanan */}
              <div>
                <h4 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-1.5">
                  <ReceiptText className="w-4 h-4 text-stone-400" />
                  Riwayat 3 Pemesanan Terakhir
                </h4>
                
                <div className="space-y-2">
                  {selectedCustomer.bookings && selectedCustomer.bookings.length > 0 ? (
                    selectedCustomer.bookings.map((b) => (
                      <div key={b.id} className="bg-white border border-stone-200 rounded-xl p-3 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-stone-800 text-sm">
                            {b.services?.name || "Layanan Dihapus"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            b.payment_status === "approved" ? "bg-teal-50 text-teal-700" :
                            b.payment_status === "rejected" ? "bg-rose-50 text-rose-700" :
                            "bg-orange-50 text-orange-700"
                          }`}>
                            {b.payment_status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-stone-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(b.booking_date).toLocaleDateString("id-ID", {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {b.start_time.slice(0, 5)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                      <span className="text-sm text-stone-400 italic">Belum ada riwayat pemesanan</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
