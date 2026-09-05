"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2, Tag, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createVoucher, toggleVoucherActive, deleteVoucher } from "@/lib/actions/superadmin.actions";

export function VoucherManager({ initialVouchers }: { initialVouchers: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [vouchers, setVouchers] = useState(initialVouchers);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 0,
    max_uses: null as number | null,
    valid_until: "",
  });

  const handleCreate = () => {
    if (!newVoucher.code || newVoucher.discount_value <= 0) {
      toast.error("Kode voucher dan nilai diskon harus diisi.");
      return;
    }

    startTransition(async () => {
      const payload = {
        ...newVoucher,
        valid_until: newVoucher.valid_until ? new Date(newVoucher.valid_until).toISOString() : null,
      };
      
      const res = await createVoucher(payload);
      if (res.success) {
        toast.success("Voucher berhasil dibuat!");
        setIsCreating(false);
        setNewVoucher({
          code: "",
          discount_type: "percentage",
          discount_value: 0,
          max_uses: null,
          valid_until: "",
        });
        // Ideally we would fetch the newly created voucher to update state,
        // but since we revalidatePath in the action, the page will reload the data soon.
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(res.error || "Gagal membuat voucher.");
      }
    });
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleVoucherActive(id, !currentStatus);
      if (res.success) {
        toast.success("Status voucher diperbarui.");
        setVouchers((prev) => prev.map((v) => (v.id === id ? { ...v, is_active: !currentStatus } : v)));
      } else {
        toast.error(res.error || "Gagal memperbarui status.");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus voucher ini?")) return;
    startTransition(async () => {
      const res = await deleteVoucher(id);
      if (res.success) {
        toast.success("Voucher dihapus.");
        setVouchers((prev) => prev.filter((v) => v.id !== id));
      } else {
        toast.error(res.error || "Gagal menghapus voucher.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Form Buat Voucher */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-600" />
              Manajemen Voucher
            </h2>
            <p className="text-sm text-stone-500">Buat dan kelola kode promo diskon untuk tenant.</p>
          </div>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Buat Voucher
            </Button>
          )}
        </div>

        {isCreating && (
          <div className="p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl mb-6 space-y-4">
            <h3 className="font-bold text-indigo-900">Buat Voucher Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">Kode Voucher</label>
                <input
                  type="text"
                  placeholder="PROMO2024"
                  value={newVoucher.code}
                  onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">Tipe Diskon</label>
                <select
                  value={newVoucher.discount_type}
                  onChange={(e) => setNewVoucher({ ...newVoucher, discount_type: e.target.value as any })}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
              </div>
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">Nilai Diskon</label>
                <input
                  type="number"
                  placeholder={newVoucher.discount_type === "percentage" ? "10" : "50000"}
                  value={newVoucher.discount_value || ""}
                  onChange={(e) => setNewVoucher({ ...newVoucher, discount_value: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">Kuota (Opsional)</label>
                <input
                  type="number"
                  placeholder="Tanpa batas"
                  value={newVoucher.max_uses || ""}
                  onChange={(e) => setNewVoucher({ ...newVoucher, max_uses: parseInt(e.target.value) || null })}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">Berlaku Sampai</label>
                <input
                  type="date"
                  value={newVoucher.valid_until}
                  onChange={(e) => setNewVoucher({ ...newVoucher, valid_until: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Batal</Button>
              <Button onClick={handleCreate} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan Voucher
              </Button>
            </div>
          </div>
        )}

        {/* Tabel Daftar Voucher */}
        <div className="overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 text-xs font-bold uppercase text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Diskon</th>
                <th className="px-4 py-3">Kuota Terpakai</th>
                <th className="px-4 py-3">Berlaku Sampai</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-400">Belum ada voucher yang dibuat.</td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-stone-900">{v.code}</td>
                    <td className="px-4 py-3">
                      {v.discount_type === "percentage" ? `${v.discount_value}%` : `Rp ${v.discount_value.toLocaleString("id-ID")}`}
                    </td>
                    <td className="px-4 py-3">
                      {v.current_uses} {v.max_uses ? `/ ${v.max_uses}` : "(Tanpa batas)"}
                    </td>
                    <td className="px-4 py-3">
                      {v.valid_until ? new Date(v.valid_until).toLocaleDateString("id-ID") : "Selamanya"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(v.id, v.is_active)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                          v.is_active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                        }`}
                      >
                        {v.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {v.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={isPending}
                        className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Voucher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
