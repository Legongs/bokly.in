import React from "react";
import { getTenantCustomers } from "@/lib/actions/customer.actions";
import { Contact, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Pelanggan | maubooking.in",
};

export default async function CustomersPage() {
  const result = await getTenantCustomers();
  
  if (!result.success) {
    return (
      <div className="p-8 text-center text-stone-500">
        <p>{result.error}</p>
      </div>
    );
  }

  const customers = result.data || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-stone-900 flex items-center gap-2">
          <Contact className="w-6 h-6 text-teal-600" />
          Daftar Pelanggan
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Pantau pelanggan setiamu dan lihat riwayat jumlah pemesanan mereka.
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 text-center">
          <Contact className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-700">Belum ada pelanggan</h3>
          <p className="text-stone-500 text-sm">
            Pelanggan akan otomatis muncul di sini saat mereka melakukan reservasi.
          </p>
        </div>
      ) : (
        <Card className="rounded-[2rem] border-none shadow-md shadow-stone-200/50 bg-white overflow-hidden p-0 sm:p-0">
          <CardContent className="p-0">
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
                        {cust.name}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
