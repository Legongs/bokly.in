"use client";

import React, { useState, useTransition } from "react";
import { z } from "zod";
import { Loader2, PlusCircle, Edit3, Save, X, DollarSign, Clock, ToggleLeft, ToggleRight, Info } from "lucide-react";
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
  // Durasi fleksibel — sektor space/sewa ruang
  is_flexible_duration: z.boolean().default(false),
  min_duration_minutes: z.coerce.number().min(5).max(1440).nullable().optional(),
  max_duration_minutes: z.coerce.number().min(5).max(1440).nullable().optional(),
  duration_step_minutes: z.coerce.number().min(5).max(480).default(30).optional(),
}).superRefine((data, ctx) => {
  if (data.is_flexible_duration) {
    if (!data.min_duration_minutes) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["min_duration_minutes"], message: "Durasi minimal wajib diisi." });
    }
    if (!data.max_duration_minutes) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["max_duration_minutes"], message: "Durasi maksimal wajib diisi." });
    }
    if (data.min_duration_minutes && data.max_duration_minutes && data.min_duration_minutes >= data.max_duration_minutes) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["max_duration_minutes"], message: "Durasi maksimal harus lebih besar dari minimal." });
    }
  }
});

type ServiceFormFields = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
 initialData?: Service | null;
 onSuccess?: () => void;
 onCancel?: () => void;
 dictionary?: BusinessDictionary;
}

/** Helper: label + optional help text + error */
function FieldWrap({ label, help, error, children }: {
  label: React.ReactNode;
  help?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-stone-700">{label}</label>
      {help && <p className="text-xs text-stone-500 leading-relaxed">{help}</p>}
      {children}
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
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
  is_flexible_duration: (initialData as any)?.is_flexible_duration ?? false,
  min_duration_minutes: (initialData as any)?.min_duration_minutes ?? null,
  max_duration_minutes: (initialData as any)?.max_duration_minutes ?? null,
  duration_step_minutes: (initialData as any)?.duration_step_minutes ?? 30,
 });

 const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ServiceFormFields, string>>>({});
 const [serverError, setServerError] = useState<string | null>(null);

 const updateForm = (field: keyof ServiceFormFields, value: any) => {
  setForm((prev) => ({ ...prev, [field]: value }));
 };

 const validateField = (field: keyof ServiceFormFields, value: any) => {
  const schema = (serviceSchema as any)._def?.schema ?? serviceSchema;
  const shape = (schema as any).shape ?? (serviceSchema as any).shape;
  if (!shape?.[field]) return;
  const res = shape[field].safeParse(value);
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

 const isFlexible = form.is_flexible_duration;

 return (
  <Card className="border-none shadow-md shadow-stone-200/50 rounded-[2rem] bg-white overflow-hidden mt-4">
  <CardHeader className="pb-4 border-b border-stone-100 ">
  <CardTitle className="text-lg font-bold flex items-center gap-2 text-stone-900 ">
  {isEdit ? <Edit3 className="w-5 h-5 text-indigo-600" /> : <PlusCircle className="w-5 h-5 text-indigo-600" />}
  {isEdit ? `Edit ${dictionary?.serviceLabel || "Layanan"} Kamu` : `Tambah ${dictionary?.serviceLabel || "Layanan"} Baru`}
  </CardTitle>
  <CardDescription>
  {isEdit ? "Ubah detail harga atau waktu pengerjaan di sini." : `Lengkapi data ${dictionary?.serviceLabel?.toLowerCase() || "layanan"} biar pelanggan gampang milihnya.`}
  </CardDescription>
  </CardHeader>
  
  <CardContent className="pt-5">
  <form id="service-form" onSubmit={handleSubmit} className="space-y-4">
  {serverError && (
  <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium">
  {serverError}
  </div>
  )}

  {/* Nama Layanan */}
  <FieldWrap label={`Nama ${dictionary?.serviceLabel || "Layanan / Perawatan"}`} error={fieldErrors.name}>
   <input
    type="text"
    value={form.name}
    onChange={(e) => updateForm("name", e.target.value)}
    onBlur={(e) => validateField("name", e.target.value)}
    placeholder="Misal: Potong Rambut Pria"
    className={`w-full pl-10 pr-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner ${
    fieldErrors.name ? "ring-2 ring-rose-400 bg-rose-50" : ""
    }`}
    disabled={isPending}
   />
  </FieldWrap>

  {/* Kategori */}
  <FieldWrap label="Kategori Layanan (Opsional)" error={fieldErrors.category}>
   <input
    type="text"
    value={form.category || ""}
    onChange={(e) => updateForm("category", e.target.value)}
    onBlur={(e) => validateField("category", e.target.value)}
    placeholder="Misal: Perawatan Wajah"
    className={`w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm font-medium bg-stone-50 text-stone-900 caret-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${fieldErrors.category ? "border-rose-300 bg-rose-50 ring-2 ring-rose-500/20" : ""}`}
    disabled={isPending}
   />
  </FieldWrap>

  {/* ── Toggle Durasi Fleksibel ───────────────────────────────────── */}
  <div className={`p-4 rounded-2xl border-2 transition-all ${isFlexible ? "border-indigo-200 bg-indigo-50" : "border-stone-200 bg-stone-50"}`}>
   <button
    type="button"
    onClick={() => updateForm("is_flexible_duration", !isFlexible)}
    className="w-full flex items-center justify-between"
   >
    <div className="flex items-start gap-3 text-left">
     <Clock className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isFlexible ? "text-indigo-600" : "text-stone-400"}`} />
     <div>
      <p className={`text-sm font-bold ${isFlexible ? "text-indigo-700" : "text-stone-700"}`}>
       Durasi Fleksibel (Sewa per Jam)
      </p>
      <p className={`text-xs mt-0.5 ${isFlexible ? "text-indigo-600" : "text-stone-500"}`}>
       Aktifkan jika customer bisa pilih durasi sendiri (misal: coworking, studio, ruang rapat)
      </p>
     </div>
    </div>
    {isFlexible
     ? <ToggleRight className="w-8 h-8 text-indigo-600 flex-shrink-0" />
     : <ToggleLeft className="w-8 h-8 text-stone-300 flex-shrink-0" />
    }
   </button>

   {/* Field tambahan saat fleksibel aktif */}
   {isFlexible && (
    <div className="mt-4 space-y-3 pt-3 border-t border-indigo-100">
     {/* Banner penjelasan harga per jam */}
     <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
      <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-amber-800 font-medium leading-relaxed">
       <strong>Penting soal harga:</strong> Untuk layanan fleksibel, kolom "Harga" di bawah dibaca sebagai{" "}
       <strong className="text-amber-900">Harga per Jam (Rp/jam)</strong>. Sistem akan otomatis hitung total = harga × (durasi yang dipilih / 60 menit).
       Contoh: input Rp 50.000 → booking 2 jam = Rp 100.000.
      </p>
     </div>

     <div className="grid grid-cols-2 gap-3">
      <FieldWrap label="Durasi Minimal" error={fieldErrors.min_duration_minutes}>
       <div className="relative">
        <input
         type="number" min="5" step="5"
         value={form.min_duration_minutes || ""}
         onChange={(e) => updateForm("min_duration_minutes", Number(e.target.value))}
         placeholder="30"
         className="w-full pl-3 pr-12 py-2.5 rounded-xl border border-indigo-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">mnt</span>
       </div>
      </FieldWrap>

      <FieldWrap label="Durasi Maksimal" error={fieldErrors.max_duration_minutes}>
       <div className="relative">
        <input
         type="number" min="5" step="5"
         value={form.max_duration_minutes || ""}
         onChange={(e) => updateForm("max_duration_minutes", Number(e.target.value))}
         placeholder="480"
         className="w-full pl-3 pr-12 py-2.5 rounded-xl border border-indigo-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">mnt</span>
       </div>
      </FieldWrap>
     </div>

     <FieldWrap
      label="Kelipatan Durasi"
      help="Customer pilih durasi dalam kelipatan ini. Misal: 30 mnt → pilihan tersedia: 30, 60, 90, 120, dst."
      error={fieldErrors.duration_step_minutes}
     >
      <div className="relative">
       <input
        type="number" min="5" step="5"
        value={form.duration_step_minutes || 30}
        onChange={(e) => updateForm("duration_step_minutes", Number(e.target.value))}
        placeholder="30"
        className="w-full pl-3 pr-12 py-2.5 rounded-xl border border-indigo-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
       />
       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 pointer-events-none">mnt</span>
      </div>
     </FieldWrap>
    </div>
   )}
  </div>

  {/* Durasi & Buffer (non-fleksibel) */}
  {!isFlexible && (
   <div className="grid grid-cols-2 gap-4">
    <FieldWrap label="Berapa lama pengerjaannya?" error={fieldErrors.duration_minutes}>
     <div className="relative">
      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
      <input
       type="number" min="5"
       value={form.duration_minutes || ""}
       onChange={(e) => updateForm("duration_minutes", Number(e.target.value))}
       onBlur={(e) => validateField("duration_minutes", Number(e.target.value))}
       placeholder="30"
       className={`w-full pl-10 pr-12 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner ${
       fieldErrors.duration_minutes ? "ring-2 ring-rose-400 bg-rose-50" : ""
       }`}
       disabled={isPending}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-500 pointer-events-none">Menit</span>
     </div>
    </FieldWrap>

    <FieldWrap label="Waktu Jeda (Buffer)" error={fieldErrors.buffer_minutes}>
     <div className="relative">
      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
      <input
       type="number" min="0"
       value={form.buffer_minutes === 0 ? "" : form.buffer_minutes}
       onChange={(e) => updateForm("buffer_minutes", Number(e.target.value))}
       onBlur={(e) => validateField("buffer_minutes", Number(e.target.value))}
       placeholder="0 (opsional)"
       className={`w-full pl-10 pr-12 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner ${
       fieldErrors.buffer_minutes ? "ring-2 ring-rose-400 bg-rose-50" : ""
       }`}
       disabled={isPending}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-500 pointer-events-none">Menit</span>
     </div>
    </FieldWrap>

    <FieldWrap label="Kapasitas Maksimal" error={fieldErrors.max_capacity}>
     <div className="relative">
      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
      <input
       type="number" min="1"
       value={form.max_capacity === 1 ? "" : form.max_capacity}
       onChange={(e) => updateForm("max_capacity", Number(e.target.value) || 1)}
       onBlur={(e) => validateField("max_capacity", Number(e.target.value) || 1)}
       placeholder="1 (Satu sesi = 1 orang)"
       className={`w-full pl-10 pr-12 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner ${
       fieldErrors.max_capacity ? "ring-2 ring-rose-400 bg-rose-50" : ""
       }`}
       disabled={isPending}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-500 pointer-events-none">Orang</span>
     </div>
    </FieldWrap>
   </div>
  )}

  {/* Harga — label berbeda tergantung mode */}
  <FieldWrap
   label={
    isFlexible
     ? <span>Harga per Jam <span className="ml-1.5 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[11px] font-bold">Rp/jam</span></span>
     : "Harga Total (Rp)"
   }
   help={isFlexible
    ? "Masukkan harga untuk 1 jam. Sistem otomatis hitung total sesuai durasi yang dipilih customer."
    : undefined
   }
   error={fieldErrors.price}
  >
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
     placeholder={isFlexible ? "50.000 (per jam)" : "50.000"}
     className={`w-full pl-11 pr-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner ${
     fieldErrors.price ? "ring-2 ring-rose-400 bg-rose-50" : ""
     }`}
     disabled={isPending}
    />
   </div>
  </FieldWrap>

  <FieldWrap label="Wajib bayar DP berapa? (Bisa diisi 0 kok)" error={fieldErrors.dp_amount}>
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
     className={`w-full pl-11 pr-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner ${
     fieldErrors.dp_amount ? "ring-2 ring-rose-400 bg-rose-50" : ""
     }`}
     disabled={isPending}
    />
   </div>
  </FieldWrap>

  <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100 ">
  {onCancel && (
  <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending} className="rounded-full px-5 h-10 hover:bg-stone-100">
  <X className="w-4 h-4 mr-1.5" /> Batal Aja
  </Button>
  )}
  <Button type="submit" disabled={isPending || !form.name} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 h-10 shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all">
  {isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
  {isEdit ? "Terapkan Perubahan Layanan" : `Tambah ${dictionary?.serviceLabel || "Layanan"}`}
  </Button>
  </div>
  </form>
  </CardContent>
  </Card>
 );
}
