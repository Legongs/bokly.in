"use client";

import React, { useState, useTransition } from "react";
import { z } from "zod";
import { Loader2, PlusCircle, Edit3, Save, X, DollarSign, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createService, updateService } from "@/lib/actions/service.actions";
import type { Service } from "@/types/database.types";
import type { BusinessDictionary } from "@/lib/business-dictionary";

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Nama layanannya minimal 3 huruf dong.").max(100, "Kepanjangan, maksimal 100 huruf aja."),
  duration_minutes: z.coerce.number().min(5, "Pengerjaan paling bentar 5 menit ya.").max(1440, "Maksimal 24 jam dong."),
  price: z.coerce.number().min(0, "Harganya nggak boleh minus ya."),
  dp_amount: z.coerce.number().min(0, "DP-nya nggak boleh minus juga.").default(0),
  buffer_minutes: z.coerce.number().min(0, "Waktu jeda nggak boleh minus.").default(0),
  max_capacity: z.coerce.number().min(1, "Minimal kapasitas 1 orang.").default(1),
  category: z.string().max(50, "Maksimal 50 huruf.").optional().nullable(),
});

type ServiceFormFields = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
 initialData?: Service | null;
 onSuccess?: () => void;
 onCancel?: () => void;
 dictionary?: BusinessDictionary;
}

export function ServiceForm({ initialData, onSuccess, onCancel, dictionary }: ServiceFormProps) {
 const [isPending, startTransition] = useTransition();
 const isEdit = !!initialData;

 const [form, setForm] = useState<ServiceFormFields>({
 id: initialData?.id ?? undefined,
 name: initialData?.name ?? "",
 duration_minutes: initialData?.duration_minutes ?? 30,
 price: initialData?.price ?? 0,
 dp_amount: initialData?.dp_amount ?? 0,
 buffer_minutes: initialData?.buffer_minutes ?? 0,
 max_capacity: initialData?.max_capacity ?? 1,
 category: initialData?.category ?? "",
 });

 const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ServiceFormFields, string>>>({});
 const [serverError, setServerError] = useState<string | null>(null);

 const updateForm = (field: keyof ServiceFormFields, value: string | number) => {
 setForm((prev) => ({ ...prev, [field]: value }));
 };

 const validateField = (field: keyof ServiceFormFields, value: any) => {
 const res = serviceSchema.shape[field].safeParse(value);
 setFieldErrors((prev) => ({
 ...prev,
 [field]: res.success ? undefined : res.error.issues[0].message,
 }));
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 setServerError(null);

 const parsed = serviceSchema.safeParse(form);
 if (!parsed.success) {
 const errors: any = {};
 parsed.error.issues.forEach((issue) => {
 errors[issue.path[0]] = issue.message;
 });
 setFieldErrors(errors);
 return;
 }

 startTransition(async () => {
 const action = isEdit ? updateService : createService;
 const res = await action(parsed.data);
 
 if (!res.success) {
 setServerError(res.error ?? "Gagal menyimpan layanan. Coba lagi ya.");
 return;
 }
 
 if (onSuccess) onSuccess();
 });
 };

 return (
 <Card className="border-none shadow-md shadow-stone-200/50 rounded-[2rem] bg-white overflow-hidden mt-4">
 <CardHeader className="pb-4 border-b border-stone-100 ">
 <CardTitle className="text-lg font-bold flex items-center gap-2 text-stone-900 ">
 {isEdit ? <Edit3 className="w-5 h-5 text-teal-600" /> : <PlusCircle className="w-5 h-5 text-teal-600" />}
 {isEdit ? `Edit ${dictionary?.serviceLabel || "Layanan"} Kamu` : `Tambah ${dictionary?.serviceLabel || "Layanan"} Baru`}
 </CardTitle>
 <CardDescription>
 {isEdit ? "Ubah detail harga atau waktu pengerjaan di sini." : `Lengkapi data ${dictionary?.serviceLabel?.toLowerCase() || "layanan"} biar pelanggan gampang milihnya.`}
 </CardDescription>
 </CardHeader>
 
 <CardContent className="pt-5">
 <form onSubmit={handleSubmit} className="space-y-4">
 {serverError && (
 <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium">
 {serverError}
 </div>
 )}

 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-stone-700 ">
 Nama {dictionary?.serviceLabel || "Layanan / Perawatan"}
 </label>
 <input
 type="text"
 value={form.name}
 onChange={(e) => updateForm("name", e.target.value)}
 onBlur={(e) => validateField("name", e.target.value)}
 placeholder="Misal: Potong Rambut Pria"
 className={`w-full pl-10 pr-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
 fieldErrors.name ? "ring-2 ring-rose-400 bg-rose-50" : ""
 }`}
 disabled={isPending}
 />
 {fieldErrors.name && <p className="text-xs text-rose-500 font-medium">{fieldErrors.name}</p>}
 </div>

          {/* Baris 5: Kategori */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-stone-700">Kategori Layanan (Opsional)</label>
            <input
              type="text"
              value={form.category || ""}
              onChange={(e) => updateForm("category", e.target.value)}
              onBlur={(e) => validateField("category", e.target.value)}
              placeholder="Misal: Perawatan Wajah"
              className={`w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm font-medium bg-stone-50 text-stone-900 caret-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${fieldErrors.category ? "border-rose-300 bg-rose-50 ring-2 ring-rose-500/20" : ""}`}
              disabled={isPending}
            />
            {fieldErrors.category && <p className="text-xs text-rose-500 font-medium">{fieldErrors.category}</p>}
          </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-stone-700 ">
 Berapa lama pengerjaannya?
 </label>
 <div className="relative">
 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
 <input
 type="number"
 min="5"
 value={form.duration_minutes || ""}
 onChange={(e) => updateForm("duration_minutes", Number(e.target.value))}
 onBlur={(e) => validateField("duration_minutes", Number(e.target.value))}
 placeholder="30"
 className={`w-full pl-10 pr-12 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
 fieldErrors.duration_minutes ? "ring-2 ring-rose-400 bg-rose-50" : ""
 }`}
 disabled={isPending}
 />
 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-500 pointer-events-none">Menit</span>
 </div>
 {fieldErrors.duration_minutes && <p className="text-xs text-rose-500 font-medium">{fieldErrors.duration_minutes}</p>}
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-stone-700 ">
 Waktu Jeda (Buffer)
 </label>
 <div className="relative">
 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
 <input
 type="number"
 min="0"
 value={form.buffer_minutes === 0 ? "" : form.buffer_minutes}
 onChange={(e) => updateForm("buffer_minutes", Number(e.target.value))}
 onBlur={(e) => validateField("buffer_minutes", Number(e.target.value))}
 placeholder="0 (opsional)"
 className={`w-full pl-10 pr-12 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
 fieldErrors.buffer_minutes ? "ring-2 ring-rose-400 bg-rose-50" : ""
 }`}
 disabled={isPending}
 />
 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-500 pointer-events-none">Menit</span>
 </div>
 {fieldErrors.buffer_minutes && <p className="text-xs text-rose-500 font-medium">{fieldErrors.buffer_minutes}</p>}
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-stone-700 ">
 Kapasitas Maksimal
 </label>
 <div className="relative">
 <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
 <input
 type="number"
 min="1"
 value={form.max_capacity === 1 ? "" : form.max_capacity}
 onChange={(e) => updateForm("max_capacity", Number(e.target.value) || 1)}
 onBlur={(e) => validateField("max_capacity", Number(e.target.value) || 1)}
 placeholder="1 (Satu sesi = 1 orang)"
 className={`w-full pl-10 pr-12 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
 fieldErrors.max_capacity ? "ring-2 ring-rose-400 bg-rose-50" : ""
 }`}
 disabled={isPending}
 />
 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-500 pointer-events-none">Orang</span>
 </div>
 {fieldErrors.max_capacity && <p className="text-xs text-rose-500 font-medium">{fieldErrors.max_capacity}</p>}
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-stone-700 ">
 Harga Total (Rp)
 </label>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400 pointer-events-none">Rp</span>
 <input
 type="text"
 inputMode="numeric"
 value={form.price ? form.price.toLocaleString("id-ID") : ""}
 onChange={(e) => {
 const rawValue = e.target.value.replace(/\D/g, "");
 updateForm("price", rawValue ? Number(rawValue) : 0);
 }}
 onBlur={(e) => {
 const rawValue = e.target.value.replace(/\D/g, "");
 validateField("price", rawValue ? Number(rawValue) : 0);
 }}
 placeholder="50.000"
 className={`w-full pl-11 pr-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
 fieldErrors.price ? "ring-2 ring-rose-400 bg-rose-50" : ""
 }`}
 disabled={isPending}
 />
 </div>
 {fieldErrors.price && <p className="text-xs text-rose-500 font-medium">{fieldErrors.price}</p>}
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-stone-700 ">
 Wajib bayar DP berapa? (Bisa diisi 0 kok)
 </label>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400 pointer-events-none">Rp</span>
 <input
 type="text"
 inputMode="numeric"
 value={form.dp_amount === 0 && form.price === 0 ? "" : form.dp_amount.toLocaleString("id-ID")}
 onChange={(e) => {
 const rawValue = e.target.value.replace(/\D/g, "");
 updateForm("dp_amount", rawValue ? Number(rawValue) : 0);
 }}
 onBlur={(e) => {
 const rawValue = e.target.value.replace(/\D/g, "");
 validateField("dp_amount", rawValue ? Number(rawValue) : 0);
 }}
 placeholder="20.000"
 className={`w-full pl-11 pr-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
 fieldErrors.dp_amount ? "ring-2 ring-rose-400 bg-rose-50" : ""
 }`}
 disabled={isPending}
 />
 </div>
 {fieldErrors.dp_amount && <p className="text-xs text-rose-500 font-medium">{fieldErrors.dp_amount}</p>}
 </div>

 <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100 ">
 {onCancel && (
 <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending} className="rounded-full px-5 h-10 hover:bg-stone-100">
 <X className="w-4 h-4 mr-1.5" /> Batal Aja
 </Button>
 )}
 <Button type="submit" disabled={isPending || !form.name} className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6 h-10 shadow-md shadow-teal-600/20 hover:shadow-lg transition-all">
 {isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
 {isEdit ? "Simpan Perubahan" : `Tambah ${dictionary?.serviceLabel || "Layanan"}`}
 </Button>
 </div>
 </form>
 </CardContent>
 </Card>
 );
}
