"use client";

import React, { useState, useTransition } from "react";
import { Loader2, Trash2, PlusCircle, User, Edit3, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createStaff, updateStaff, deleteStaff } from "@/lib/actions/staff.actions";
import type { Staff } from "@/types/database.types";

interface StaffListProps {
  initialStaff: Staff[];
}

export function StaffList({ initialStaff }: StaffListProps) {
  const [isPending, startTransition] = useTransition();
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    startTransition(async () => {
      const res = await createStaff({ name: formData.name });
      if (res.success && res.data) {
        setStaff([...staff, res.data]);
        setIsAdding(false);
        setFormData({ name: "" });
      } else {
        alert(res.error || "Gagal menambah pegawai");
      }
    });
  };

  const handleUpdate = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!formData.name) return;

    startTransition(async () => {
      const res = await updateStaff({ id, name: formData.name });
      if (res.success && res.data) {
        setStaff(staff.map((s) => (s.id === id ? res.data! : s)));
        setEditingId(null);
        setFormData({ name: "" });
      } else {
        alert(res.error || "Gagal memperbarui pegawai");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus pegawai ini?")) return;

    startTransition(async () => {
      const res = await deleteStaff(id);
      if (res.success) {
        setStaff(staff.filter((s) => s.id !== id));
      } else {
        alert(res.error || "Gagal menghapus pegawai");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900">Daftar Pegawai</h2>
          <p className="text-sm text-stone-500">Kelola siapa saja yang bisa melayani pelanggan di tokomu.</p>
        </div>
        {!isAdding && !editingId && (
          <Button
            onClick={() => {
              setIsAdding(true);
              setFormData({ name: "" });
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-md shadow-teal-600/20"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Tambah Pegawai
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-none shadow-md shadow-stone-200/50 rounded-[2rem] bg-white overflow-hidden">
          <CardHeader className="pb-4 border-b border-stone-100">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-stone-900">
              <PlusCircle className="w-5 h-5 text-teal-600" />
              Tambah Pegawai Baru
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">Nama Pegawai</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Misal: Budi"
                  className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner"
                  disabled={isPending}
                  autoFocus
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} disabled={isPending} className="rounded-full px-5">
                  <X className="w-4 h-4 mr-1.5" /> Batal
                </Button>
                <Button type="submit" disabled={isPending || !formData.name} className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6 shadow-md shadow-teal-600/20">
                  {isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Simpan Pegawai
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {staff.length === 0 && !isAdding ? (
          <div className="py-12 px-6 rounded-[2rem] border border-stone-100 bg-white text-center shadow-sm">
            <div className="w-16 h-16 bg-stone-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-stone-100 -rotate-3 transition-transform hover:rotate-0">
              <User className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-1">Belum Ada Pegawai</h3>
            <p className="text-sm text-stone-500 max-w-xs mx-auto mb-4">
              Jika toko kamu dikerjakan lebih dari 1 orang, tambah di sini supaya jadwal nggak bentrok.
            </p>
          </div>
        ) : (
          staff.map((s) => (
            <Card key={s.id} className="border-none shadow-md shadow-stone-200/50 rounded-3xl overflow-hidden bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {editingId === s.id ? (
                  <form onSubmit={(e) => handleUpdate(e, s.id)} className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-stone-700">Nama Pegawai</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ name: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner"
                        disabled={isPending}
                        autoFocus
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="ghost" onClick={() => setEditingId(null)} disabled={isPending} className="rounded-full px-5 h-9 text-sm">
                        Batal
                      </Button>
                      <Button type="submit" disabled={isPending || !formData.name} className="bg-teal-600 text-white rounded-full px-5 h-9 text-sm shadow-md shadow-teal-600/20">
                        {isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : "Simpan"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-lg">{s.name}</h4>
                        <p className="text-xs text-stone-500 font-medium">Terapis / Pegawai</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(s.id);
                          setFormData({ name: s.name });
                        }}
                        disabled={isPending}
                        className="border-stone-200 text-stone-600 hover:text-teal-600 hover:border-teal-200 rounded-xl bg-white"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(s.id)}
                        disabled={isPending}
                        className="border-rose-100 text-rose-500 hover:bg-rose-50 rounded-xl bg-white"
                      >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
