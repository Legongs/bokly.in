"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateMidtransConfig } from "@/lib/actions/superadmin.actions";

export function MidtransSettings({ initialConfig }: { initialConfig: any }) {
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState(initialConfig);

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateMidtransConfig(config);
      if (res.success) {
        toast.success("Konfigurasi Midtrans berhasil diperbarui!");
      } else {
        toast.error(res.error || "Gagal menyimpan konfigurasi Midtrans.");
      }
    });
  };

  const isProduction = config.isProduction;

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Pengaturan Midtrans</h2>
          <p className="text-sm text-stone-500">Ubah kunci API Midtrans (Server Key & Client Key) tanpa hardcode di .env.</p>
        </div>
        <Button onClick={handleSave} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Perubahan
        </Button>
      </div>

      {isProduction ? (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-rose-900">Environment: Production</h3>
            <p className="text-xs text-rose-700 mt-1">
              Sistem sedang terhubung ke live payment Midtrans. Hati-hati dalam mengubah konfigurasi ini!
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-emerald-900">Environment: Sandbox (Testing)</h3>
            <p className="text-xs text-emerald-700 mt-1">
              Sistem menggunakan mode Sandbox. Transaksi tidak akan memotong saldo asli.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between p-4 border border-stone-100 rounded-xl bg-stone-50/50">
          <div>
            <label className="block text-sm font-bold text-stone-900">Mode Production</label>
            <p className="text-xs text-stone-500">Aktifkan untuk beralih dari mode Sandbox ke live Production.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={config.isProduction}
              onChange={(e) => setConfig({ ...config, isProduction: e.target.checked })}
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-900 mb-1.5">Server Key (Rahasia)</label>
          <input
            type="password"
            value={config.serverKey}
            onChange={(e) => setConfig({ ...config, serverKey: e.target.value })}
            placeholder="SB-Mid-server-..."
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="text-xs text-stone-500 mt-1.5">
            Key ini akan tersimpan aman di database dan tidak akan diekspos ke publik/browser.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-900 mb-1.5">Client Key (Publik)</label>
          <input
            type="text"
            value={config.clientKey}
            onChange={(e) => setConfig({ ...config, clientKey: e.target.value })}
            placeholder="SB-Mid-client-..."
            className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="text-xs text-stone-500 mt-1.5">
            Key ini dibutuhkan frontend untuk memuat pop-up Snap Midtrans.
          </p>
        </div>
      </div>
    </div>
  );
}
