"use client";

import React, { useState, useTransition } from "react";
import { Loader2, Trash2, PlusCircle, User, Edit3, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { createStaff, updateStaff, deleteStaff, updateStaffServices } from "@/lib/actions/staff.actions";
import type { Staff, Service, StaffWithServices } from "@/types/database.types";

interface StaffListProps {
  initialStaff: StaffWithServices[];
  businessType: string;
  suggestedRoles?: string[];
  services?: Service[];
}

export function StaffList({ initialStaff, businessType, suggestedRoles = [], services = [] }: StaffListProps) {
  const getStaffTerm = (type: string) => {
    switch (type) {
      case "salon": return "Terapis / Kapster";
      case "klinik": return "Dokter / Perawat";
      case "konsultasi": return "Konsultan / Pakar";
      case "studio_foto": return "Fotografer";
      case "cuci_kendaraan": return "Pekerja / Mekanik";
      case "olahraga": return "Instruktur / Pegawai";
      case "servis": return "Mekanik / Teknisi";
      default: return "Terapis / Pegawai";
    }
  };
  const staffTerm = getStaffTerm(businessType);
  const [isPending, startTransition] = useTransition();
  const [staff, setStaff] = useState<StaffWithServices[]>(initialStaff);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", role: "", description: "", image_url: "", serviceIds: [] as string[] });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    startTransition(async () => {
      const res = await createStaff({ name: formData.name, role: formData.role, description: formData.description, image_url: formData.image_url });
      if (res.success && res.data) {
        if (formData.serviceIds.length > 0) {
          await updateStaffServices(res.data.id, formData.serviceIds);
        }
        setStaff([...staff, { ...res.data, staff_services: formData.serviceIds.map(id => ({ service_id: id })) }]);
        setIsAdding(false);
        setFormData({ name: "", role: "", description: "", image_url: "", serviceIds: [] });
      } else {
        alert(res.error || "Gagal menambah pegawai");
      }
    });
  };

  const handleUpdate = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!formData.name) return;

    startTransition(async () => {
      const res = await updateStaff({ id, name: formData.name, role: formData.role, description: formData.description, image_url: formData.image_url });
      if (res.success && res.data) {
        await updateStaffServices(id, formData.serviceIds);
        setStaff(staff.map((s) => (s.id === id ? { ...res.data!, staff_services: formData.serviceIds.map(sid => ({ service_id: sid })) } : s)));
        setEditingId(null);
        setFormData({ name: "", role: "", description: "", image_url: "", serviceIds: [] });
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
              setFormData({ name: "", role: "", description: "", image_url: "", serviceIds: [] });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md shadow-indigo-600/20"
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
              <PlusCircle className="w-5 h-5 text-indigo-600" />
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Budi"
                  className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
                  disabled={isPending}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5 mt-4">
                <label className="text-sm font-semibold text-stone-700">Jabatan / Peran (Opsional)</label>
                <input
                  type="text"
                  list="suggested-roles"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder={`Misal: ${staffTerm.split(" / ")[0]}`}
                  className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
                  disabled={isPending}
                />
                <datalist id="suggested-roles">
                  {suggestedRoles.map((role) => (
                    <option key={role} value={role} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1.5 mt-4">
                <label className="text-sm font-semibold text-stone-700">Detail / Spesialisasi (Opsional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Misal: Spesialis hair coloring dan perm"
                  className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner min-h-[80px]"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5 mt-4">
                <label className="text-sm font-semibold text-stone-700">URL Foto Pegawai (Opsional)</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Misal: https://contoh.com/foto-budi.jpg"
                  className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
                  disabled={isPending}
                />
              </div>

              {services.length > 0 && (
                <div className="space-y-2 mt-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <label className="text-sm font-semibold text-stone-700">Layanan Spesialis (Opsional)</label>
                  <p className="text-xs text-stone-500 mb-2">Jika tidak ada yang dicentang, pegawai ini dianggap bisa melayani semua layanan.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {services.map(service => (
                      <label key={service.id} className="flex items-center gap-2 p-2 bg-white border border-stone-100 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                        <input
                          type="checkbox"
                          className="accent-indigo-600 w-4 h-4"
                          checked={formData.serviceIds.includes(service.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, serviceIds: [...formData.serviceIds, service.id] });
                            } else {
                              setFormData({ ...formData, serviceIds: formData.serviceIds.filter(id => id !== service.id) });
                            }
                          }}
                        />
                        <span className="text-sm text-stone-700 font-medium">{service.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} disabled={isPending} className="rounded-full px-5">
                  <X className="w-4 h-4 mr-1.5" /> Batal
                </Button>
                <Button type="submit" disabled={isPending || !formData.name} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-md shadow-indigo-600/20">
                  {isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Terapkan Perubahan Pegawai
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
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
                        disabled={isPending}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1.5 mt-4">
                      <label className="text-sm font-semibold text-stone-700">Jabatan / Peran (Opsional)</label>
                      <input
                        type="text"
                        list="suggested-roles-edit"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder={`Misal: ${staffTerm.split(" / ")[0]}`}
                        className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
                        disabled={isPending}
                      />
                      <datalist id="suggested-roles-edit">
                        {suggestedRoles.map((role) => (
                          <option key={role} value={role} />
                        ))}
                      </datalist>
                    </div>
                    <div className="space-y-1.5 mt-4">
                      <label className="text-sm font-semibold text-stone-700">Detail / Spesialisasi (Opsional)</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner min-h-[80px]"
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-1.5 mt-4">
                      <label className="text-sm font-semibold text-stone-700">URL Foto Pegawai (Opsional)</label>
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
                        disabled={isPending}
                      />
                    </div>

                    {services.length > 0 && (
                      <div className="space-y-2 mt-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        <label className="text-sm font-semibold text-stone-700">Layanan Spesialis (Opsional)</label>
                        <p className="text-xs text-stone-500 mb-2">Jika tidak ada yang dicentang, pegawai ini dianggap bisa melayani semua layanan.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {services.map(service => (
                            <label key={service.id} className="flex items-center gap-2 p-2 bg-white border border-stone-100 rounded-xl cursor-pointer hover:border-indigo-300 transition-colors">
                              <input
                                type="checkbox"
                                className="accent-indigo-600 w-4 h-4"
                                checked={formData.serviceIds.includes(service.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({ ...formData, serviceIds: [...formData.serviceIds, service.id] });
                                  } else {
                                    setFormData({ ...formData, serviceIds: formData.serviceIds.filter(id => id !== service.id) });
                                  }
                                }}
                              />
                              <span className="text-sm text-stone-700 font-medium">{service.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="ghost" onClick={() => setEditingId(null)} disabled={isPending} className="rounded-full px-5 h-9 text-sm">
                        Batal
                      </Button>
                      <Button type="submit" disabled={isPending || !formData.name} className="bg-indigo-600 text-white rounded-full px-5 h-9 text-sm shadow-md shadow-indigo-600/20">
                        {isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : "Kunci Penugasan Layanan"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      {s.image_url ? (
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-indigo-100 flex-shrink-0 shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.image_url} alt={s.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 flex-shrink-0">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-stone-900 text-lg">{s.name}</h4>
                        <p className="text-xs text-stone-500 font-medium">{s.role || staffTerm}</p>
                        {s.description && (
                          <p className="text-sm text-stone-600 mt-1 line-clamp-2">{s.description}</p>
                        )}
                        {s.staff_services && s.staff_services.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {s.staff_services.map(ss => {
                              const sv = services.find(srv => srv.id === ss.service_id);
                              return sv ? <span key={sv.id} className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md">{sv.name}</span> : null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(s.id);
                          setFormData({ 
                            name: s.name, 
                            role: s.role || "", 
                            description: s.description || "", 
                            image_url: s.image_url || "",
                            serviceIds: s.staff_services?.map(ss => ss.service_id) || []
                          });
                        }}
                        disabled={isPending}
                        className="border-stone-200 text-stone-600 hover:text-indigo-600 hover:border-indigo-200 rounded-xl bg-white"
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
