"use client";

import React, { useState, useTransition } from "react";
import type { Promotion } from "@/types/database.types";
import { createPromotion, togglePromotionActive, deletePromotion } from "@/lib/actions/promotion.actions";
import { Megaphone, Plus, Trash2, Calendar, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PromotionClient({ initialPromotions }: { initialPromotions: Promotion[] }) {
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !discountValue || !startDate || !endDate) {
      toast.error("Mohon lengkapi form wajib (Judul, Nilai Diskon, Tanggal Mulai, Tanggal Berakhir).");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("Tanggal Berakhir harus lebih besar dari Tanggal Mulai.");
      return;
    }

    startTransition(async () => {
      const res = await createPromotion(
        title,
        description || null,
        discountType,
        Number(discountValue),
        new Date(startDate).toISOString(),
        new Date(endDate).toISOString()
      );

      if (res.success && res.data) {
        setPromotions([res.data, ...promotions]);
        toast.success("Promo berhasil dibuat!");
        // Reset form
        setTitle("");
        setDescription("");
        setDiscountType("percentage");
        setDiscountValue("");
        setStartDate("");
        setEndDate("");
      } else {
        toast.error(res.error || "Gagal membuat promo.");
      }
    });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await togglePromotionActive(id, currentStatus);
      if (res.success && res.data) {
        setPromotions((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: res.data!.is_active } : p)));
        toast.success(`Promo berhasil di${res.data!.is_active ? "aktifkan" : "nonaktifkan"}.`);
      } else {
        toast.error("Gagal merubah status promo.");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus promo ini secara permanen?")) return;
    
    startTransition(async () => {
      const res = await deletePromotion(id);
      if (res.success) {
        setPromotions((prev) => prev.filter((p) => p.id !== id));
        toast.success("Promo berhasil dihapus.");
      } else {
        toast.error("Gagal menghapus promo.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Buat Promo Baru */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-stone-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="bg-indigo-600 p-6 text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-xl">
              <Plus className="w-5 h-5 text-indigo-50" />
            </div>
            <h2 className="text-lg font-bold">Buat Promo Baru</h2>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">Judul Promo *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Diskon Akhir Tahun"
                  className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">Tipe Diskon *</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                  className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal Rupiah (Rp)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">Nilai Diskon *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={discountType === "percentage" ? 100 : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value ? Number(e.target.value) : "")}
                  placeholder={discountType === "percentage" ? "Misal: 20" : "Misal: 50000"}
                  className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-stone-700">Mulai *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-stone-700">Berakhir *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">Deskripsi Singkat (Opsional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi promo ini untuk pelanggan"
                  className="w-full rounded-xl border border-stone-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-20"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm"
              >
                {isPending ? "Menyimpan..." : "Buat Promo"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Promo */}
      <div className="lg:col-span-2 space-y-4">
        {promotions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
            <Megaphone className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-stone-800">Belum ada promo</h3>
            <p className="text-stone-500 mt-2 text-sm max-w-sm mx-auto">
              Tarik lebih banyak pelanggan dengan mengadakan promo. Promo akan muncul otomatis di halaman web bisnis Anda.
            </p>
          </div>
        ) : (
          promotions.map((p) => {
            const isPast = new Date(p.end_date) < new Date();
            const isActiveAndValid = p.is_active && !isPast;
            const startLabel = format(new Date(p.start_date), "dd MMM yyyy", { locale: localeId });
            const endLabel = format(new Date(p.end_date), "dd MMM yyyy", { locale: localeId });
            
            return (
              <Card key={p.id} className={`border-stone-200 shadow-sm rounded-2xl overflow-hidden transition-all ${!p.is_active || isPast ? 'opacity-70 bg-stone-50' : 'bg-white hover:border-indigo-200'}`}>
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  
                  {/* Badge & Info Utama */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${isActiveAndValid ? 'bg-emerald-100 text-emerald-700' : isPast ? 'bg-stone-200 text-stone-600' : 'bg-amber-100 text-amber-700'}`}>
                        {isPast ? 'Kedaluwarsa' : p.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {startLabel} - {endLabel}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-stone-900 truncate">{p.title}</h3>
                    
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-extrabold text-indigo-600">
                        {p.discount_type === "percentage" ? `${p.discount_value}% OFF` : `Rp ${p.discount_value.toLocaleString("id-ID")} OFF`}
                      </span>
                      {p.description && (
                        <span className="text-sm text-stone-500 truncate">- {p.description}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-stone-100 mt-2 sm:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(p.id, p.is_active)}
                      disabled={isPending}
                      className={`flex-1 sm:flex-none rounded-xl font-semibold border-stone-200 ${p.is_active ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'}`}
                    >
                      {p.is_active ? (
                         <><EyeOff className="w-4 h-4 mr-1.5" /> Sembunyikan</>
                      ) : (
                         <><Eye className="w-4 h-4 mr-1.5" /> Aktifkan</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(p.id)}
                      disabled={isPending}
                      className="rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-stone-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
