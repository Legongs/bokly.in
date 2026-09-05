import React from "react";
import { getTenantCustomers } from "@/lib/actions/customer.actions";
import { Contact, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerTable } from "@/components/dashboard/customer-table";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Pelanggan | bukly.id",
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
          <Contact className="w-6 h-6 text-indigo-600" />
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
            <CustomerTable customers={customers} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
