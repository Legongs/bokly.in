"use client";

import React, { useState, useTransition } from "react";
import { Loader2, Store, Phone, MessageCircle, Link as LinkIcon, CheckCircle2, AlertCircle, Save } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateTenantSettings } from "@/lib/actions/tenant.actions";
import type { Tenant } from "@/types/database.types";
import { z } from "zod";

 const telegram_chat_id = z.string().nullable().optional();

const updateTenantSettingsSchema = z.object({
  id: z.string().uuid("ID Tenant-nya kurang pas nih."),
  business_name: z.string().min(2, "Nama toko minimal 2 huruf dong.").max(100, "Nama toko kepanjangan nih.").trim(),
  whatsapp_number: z
    .string()
    .min(10, "Nomor WA kependekan, minimal 10 angka ya.")
    .max(16, "Nomor WA kepanjangan, maksimal 16 angka ya.")
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Format WA kurang pas. Pakai awalan 08 atau 628 ya."),
  telegram_chat_id: telegram_chat_id,
});

type SettingsFields = z.infer<typeof updateTenantSettingsSchema>;

interface SettingsFormProps {
 tenant: Tenant;
}

export function SettingsForm({ tenant }: SettingsFormProps) {
 const [isPending, startTransition] = useTransition();

 const [form, setForm] = useState<SettingsFields>({
  id: tenant.id,
  business_name: tenant.business_name,
  whatsapp_number: tenant.whatsapp_number,
  telegram_chat_id: tenant.telegram_chat_id ?? "",
 });

 const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SettingsFields, string>>>({});
 const [serverStatus, setServerStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

 const updateForm = (field: keyof SettingsFields, value: string) => {
 setForm((prev) => ({ ...prev, [field]: value }));
 };

 const validateField = (field: keyof SettingsFields, value: string) => {
 const res = updateTenantSettingsSchema.shape[field].safeParse(value);
 setFieldErrors((prev) => ({
 ...prev,
 [field]: res.success ? undefined : res.error.issues[0].message,
 }));
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 setServerStatus(null);

 const parsed = updateTenantSettingsSchema.safeParse(form);
 if (!parsed.success) {
 const errors: any = {};
 parsed.error.issues.forEach((issue) => {
 errors[issue.path[0]] = issue.message;
 });
 setFieldErrors(errors);
 return;
 }

 startTransition(async () => {
 const res = await updateTenantSettings(parsed.data);
 if (!res.success) {
 setServerStatus({ type: "error", message: res.error ?? "Yah, gagal nyimpen. Coba lagi ya." });
 return;
 }
 setServerStatus({ type: "success", message: "Yeay! Profil toko kamu udah berhasil di-update." });
 });
 };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-[2rem] shadow-md shadow-stone-200/50 border-none overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="space-y-1 pb-4">
        <h3 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
          Pengaturan Toko
        </h3>
        <p className="text-sm text-stone-500">
          Ubah nama toko, detail kontak, dan WA admin di sini.
        </p>
      </div>
      
      <div>
 <form onSubmit={handleSubmit} className="space-y-5">
 {serverStatus && (
 <div
 className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
 serverStatus.type === "error"
 ? "bg-rose-50 text-rose-600 "
 : "bg-teal-50 text-teal-700 "
 }`}
 >
 {serverStatus.type === "error" ? (
 <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
 ) : (
 <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
 )}
 <p>{serverStatus.message}</p>
 </div>
 )}

 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-stone-700 ">
 Nama Bisnis
 </label>
 <div className="relative">
 <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
 <input
 type="text"
 value={form.business_name}
 onChange={(e) => updateForm("business_name", e.target.value)}
 onBlur={(e) => validateField("business_name", e.target.value)}
 placeholder="Misal: Salon Siska"
 className={`w-full pl-10 pr-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
 fieldErrors.business_name ? "ring-2 ring-rose-400 bg-rose-50" : ""
 }`}
 disabled={isPending}
 />
 </div>
 {fieldErrors.business_name && (
 <p className="text-xs text-rose-500 font-medium">{fieldErrors.business_name}</p>
 )}
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-stone-700 ">
 Sektor & Jenis Bisnis
 </label>
 <div className="relative">
 <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
 <div className="w-full pl-10 pr-4 py-3 rounded-2xl border-none text-sm font-medium bg-stone-100 text-stone-600 shadow-inner cursor-not-allowed flex items-center">
  <span className="capitalize">{tenant.business_sector || "Lainnya"}</span>
  <span className="mx-2 text-stone-400">•</span>
  <span className="capitalize">{tenant.business_type || "Umum"}</span>
 </div>
 </div>
 <p className="text-[11px] text-stone-500 leading-relaxed">
 Sektor dan jenis bisnis tidak dapat diubah setelah pendaftaran.
 </p>
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-stone-700 ">
 Nomor WhatsApp Admin
 </label>
 <div className="relative">
 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
 <input
 type="text"
 inputMode="numeric"
 value={form.whatsapp_number}
 onChange={(e) => updateForm("whatsapp_number", e.target.value)}
 onBlur={(e) => validateField("whatsapp_number", e.target.value)}
 placeholder="Contoh: 081234567890"
 className={`w-full pl-10 pr-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
 fieldErrors.whatsapp_number ? "ring-2 ring-rose-400 bg-rose-50" : ""
 }`}
 disabled={isPending}
 />
 </div>
 {fieldErrors.whatsapp_number && (
 <p className="text-xs text-rose-500 font-medium">{fieldErrors.whatsapp_number}</p>
 )}
 </div>

 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-stone-700 ">
 Telegram Chat ID (Opsional buat notifikasi)
 </label>
 <div className="relative">
 <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
 <input
 type="text"
 value={form.telegram_chat_id || ""}
 onChange={(e) => updateForm("telegram_chat_id", e.target.value)}
 onBlur={(e) => validateField("telegram_chat_id", e.target.value)}
 placeholder="Misal: 123456789"
 className={`w-full pl-10 pr-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
 fieldErrors.telegram_chat_id ? "ring-2 ring-rose-400 bg-rose-50" : ""
 }`}
 disabled={isPending}
 />
 </div>
 {fieldErrors.telegram_chat_id ? (
 <p className="text-xs text-rose-500 font-medium">{fieldErrors.telegram_chat_id}</p>
 ) : (
 <p className="text-[11px] text-stone-500 leading-relaxed">
 Cari <strong>@userinfobot</strong> di Telegram untuk mengetahui Chat ID kamu.
 </p>
 )}
 </div>

  <Button
  type="submit"
  className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold mt-4 shadow-md shadow-teal-600/20 transition-all hover:shadow-lg"
 disabled={
 isPending ||
 !form.business_name ||
 !form.whatsapp_number ||
 Object.values(fieldErrors).some((err) => !!err)
 }
 >
 {isPending ? (
 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
 ) : (
 <Save className="w-4 h-4 mr-2" />
 )}
 Terapkan Perubahan Toko
 </Button>
 </form>
      </div>
    </div>
  );
}
