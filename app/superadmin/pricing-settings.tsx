"use client";

import { useState, useTransition } from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updatePricingConfig } from "@/lib/actions/superadmin.actions";

export function PricingSettings({ initialPrices }: { initialPrices: any }) {
  const [isPending, startTransition] = useTransition();
  const [prices, setPrices] = useState(initialPrices);

  const handleSave = () => {
    startTransition(async () => {
      const res = await updatePricingConfig(prices);
      if (res.success) {
        toast.success("Harga berhasil diperbarui!");
      } else {
        toast.error(res.error || "Gagal menyimpan harga.");
      }
    });
  };

  const handleChange = (plan: "pro" | "bisnis", cycle: "monthly" | "yearly", value: string) => {
    const num = parseInt(value.replace(/\D/g, ""), 10) || 0;
    setPrices((prev: any) => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        [cycle]: num,
      },
    }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Pengaturan Harga Paket</h2>
          <p className="text-sm text-stone-500">Ubah harga paket Pro dan Bisnis secara dinamis.</p>
        </div>
        <Button onClick={handleSave} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Perubahan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Paket Pro */}
        <div className="space-y-4 p-4 border border-stone-100 rounded-xl bg-stone-50/50">
          <h3 className="font-bold text-indigo-700">Paket Pro</h3>
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5">Harga Bulanan (Rp)</label>
            <input
              type="text"
              value={prices.pro?.monthly?.toLocaleString("id-ID") || 0}
              onChange={(e) => handleChange("pro", "monthly", e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5">Harga Tahunan (Rp)</label>
            <input
              type="text"
              value={prices.pro?.yearly?.toLocaleString("id-ID") || 0}
              onChange={(e) => handleChange("pro", "yearly", e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Paket Bisnis */}
        <div className="space-y-4 p-4 border border-stone-100 rounded-xl bg-stone-50/50">
          <h3 className="font-bold text-amber-600">Paket Bisnis</h3>
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5">Harga Bulanan (Rp)</label>
            <input
              type="text"
              value={prices.bisnis?.monthly?.toLocaleString("id-ID") || 0}
              onChange={(e) => handleChange("bisnis", "monthly", e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5">Harga Tahunan (Rp)</label>
            <input
              type="text"
              value={prices.bisnis?.yearly?.toLocaleString("id-ID") || 0}
              onChange={(e) => handleChange("bisnis", "yearly", e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
