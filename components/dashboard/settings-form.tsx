"use client";

import React, { useState, useTransition } from "react";
import { Loader2, Store, Phone, MessageCircle, Link as LinkIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateTenantSettings } from "@/lib/actions/tenant.actions";
import type { Tenant } from "@/types/database.types";
import { z } from "zod";

const updateTenantSettingsSchema = z.object({
 id: z.string().uuid("ID Tenant-nya kurang pas nih."),
 business_name: z.string().min(2, "Nama toko minimal 2 huruf dong.").max(100, "Nama toko kepanjangan nih.").trim(),
 whatsapp_number: z
 .string()
 .min(10, "Nomor WA kependekan, minimal 10 angka ya.")
 .max(16, "Nomor WA kepanjangan, maksimal 16 angka ya.")
 .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Format WA kurang pas. Pakai awalan 08 atau 628 ya."),
 telegram_chat_id: z.string().nullable().optional(),
 business_type: z.enum([
   "salon",
   "klinik",
   "konsultasi",
   "studio_foto",
   "cuci_kendaraan",
   "olahraga",
   "servis",
   "lainnya",
 ]),
 qris_image_url: z.string().url("Wah, link QRIS-nya nggak valid nih.").nullable().optional().or(z.literal("")),
 theme_color: z.enum(["teal", "rose", "orange", "violet", "blue"]).default("teal"),
 open_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam buka harus HH:MM (contoh: 09:00)").default("09:00"),
 close_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam tutup harus HH:MM (contoh: 21:00)").default("21:00"),
 payment_method_type: z.enum(["manual", "gateway"]).default("manual"),
 payment_gateway_provider: z.enum(["midtrans", "xendit"]).nullable().optional(),
 payment_gateway_server_key: z.string().nullable().optional(),
 payment_gateway_client_key: z.string().nullable().optional(),
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
 business_type: (tenant as any).business_type || "lainnya",
 telegram_chat_id: tenant.telegram_chat_id ?? "",
 qris_image_url: tenant.qris_image_url ?? "",
 theme_color: (tenant as any).theme_color || "teal",
 open_time: (tenant as any).open_time || "09:00",
 close_time: (tenant as any).close_time || "21:00",
 payment_method_type: (tenant as any).payment_method_type || "manual",
 payment_gateway_provider: (tenant as any).payment_gateway_provider || "midtrans",
 payment_gateway_server_key: (tenant as any).payment_gateway_server_key || "",
 payment_gateway_client_key: (tenant as any).payment_gateway_client_key || "",
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
 <Card className="w-full max-w-xl mx-auto rounded-[2rem] border-none bg-white shadow-md shadow-stone-200/50 mt-6 overflow-hidden">
 <CardHeader className="space-y-1 pb-4">
 <CardTitle className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
 Pengaturan Toko
 </CardTitle>
 <CardDescription className="text-stone-500">
 Ubah nama toko, WA admin, sampai QRIS buat DP di sini ya.
 </CardDescription>
 </CardHeader>
 
 <CardContent>
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
 Jenis Bisnis
 </label>
 <div className="relative">
 <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
 <select
   value={form.business_type}
   onChange={(e) => updateForm("business_type", e.target.value)}
   className={`w-full pl-10 pr-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner appearance-none ${
     fieldErrors.business_type ? "ring-2 ring-rose-400 bg-rose-50" : ""
   }`}
   disabled={isPending}
 >
   <option value="salon">Salon / Barbershop</option>
   <option value="klinik">Klinik / Dokter / Bidan</option>
   <option value="konsultasi">Konsultan / Pengacara / Pakar</option>
   <option value="studio_foto">Studio Foto / Fotografer</option>
   <option value="cuci_kendaraan">Cuci Mobil & Motor / Auto Detailing</option>
   <option value="olahraga">Sewa Lapangan / Studio Olahraga</option>
   <option value="servis">Servis Elektronik / Bengkel</option>
   <option value="lainnya">Lainnya / Umum</option>
 </select>
 </div>
 {fieldErrors.business_type && (
 <p className="text-xs text-rose-500 font-medium">{fieldErrors.business_type}</p>
 )}
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

 <div className="space-y-1.5">
 <label className="text-sm font-semibold text-stone-700 ">
 URL Gambar QRIS (Opsional buat DP)
 </label>
 <div className="relative">
 <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
 <input
 type="url"
 value={form.qris_image_url || ""}
 onChange={(e) => updateForm("qris_image_url", e.target.value)}
 onBlur={(e) => validateField("qris_image_url", e.target.value)}
 placeholder="https://contoh.com/qrisku.jpg"
 className={`w-full pl-10 pr-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
 fieldErrors.qris_image_url ? "ring-2 ring-rose-400 bg-rose-50" : ""
 }`}
 disabled={isPending}
 />
 </div>
 {fieldErrors.qris_image_url && (
 <p className="text-xs text-rose-500 font-medium">{fieldErrors.qris_image_url}</p>
 )}
 </div>

 <div className="space-y-1.5">
  <label className="text-sm font-semibold text-stone-700 ">
  Metode Pembayaran DP
  </label>
  <div className="relative">
  <select
    value={form.payment_method_type}
    onChange={(e) => updateForm("payment_method_type", e.target.value)}
    className={`w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner appearance-none ${
      fieldErrors.payment_method_type ? "ring-2 ring-rose-400 bg-rose-50" : ""
    }`}
    disabled={isPending}
  >
    <option value="manual">Manual (Transfer/QRIS)</option>
    <option value="gateway">Otomatis (Payment Gateway)</option>
  </select>
  </div>
  {fieldErrors.payment_method_type && (
  <p className="text-xs text-rose-500 font-medium">{fieldErrors.payment_method_type}</p>
  )}
  </div>

  {form.payment_method_type === "gateway" && (
    <div className="p-4 bg-stone-50 rounded-2xl space-y-4">
      <h3 className="font-bold text-sm text-stone-800">Pengaturan Payment Gateway</h3>
      
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-stone-700 ">Penyedia (Provider)</label>
        <select
          value={form.payment_gateway_provider || "midtrans"}
          onChange={(e) => updateForm("payment_gateway_provider", e.target.value)}
          className={`w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner appearance-none`}
          disabled={isPending}
        >
          <option value="midtrans">Midtrans</option>
          <option value="xendit">Xendit</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-stone-700 ">Server Key</label>
        <input
          type="password"
          value={form.payment_gateway_server_key || ""}
          onChange={(e) => updateForm("payment_gateway_server_key", e.target.value)}
          placeholder="Masukkan Server Key"
          className={`w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner`}
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-stone-700 ">Client Key / Public Key</label>
        <input
          type="text"
          value={form.payment_gateway_client_key || ""}
          onChange={(e) => updateForm("payment_gateway_client_key", e.target.value)}
          placeholder="Masukkan Client Key"
          className={`w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner`}
          disabled={isPending}
        />
      </div>
    </div>
  )}

  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-stone-700 ">
      Jam Buka
      </label>
      <input
      type="time"
      value={form.open_time}
      onChange={(e) => updateForm("open_time", e.target.value)}
      onBlur={(e) => validateField("open_time", e.target.value)}
      className={`w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
      fieldErrors.open_time ? "ring-2 ring-rose-400 bg-rose-50" : ""
      }`}
      disabled={isPending}
      />
      {fieldErrors.open_time && (
      <p className="text-xs text-rose-500 font-medium">{fieldErrors.open_time}</p>
      )}
    </div>
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-stone-700 ">
      Jam Tutup
      </label>
      <input
      type="time"
      value={form.close_time}
      onChange={(e) => updateForm("close_time", e.target.value)}
      onBlur={(e) => validateField("close_time", e.target.value)}
      className={`w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
      fieldErrors.close_time ? "ring-2 ring-rose-400 bg-rose-50" : ""
      }`}
      disabled={isPending}
      />
      {fieldErrors.close_time && (
      <p className="text-xs text-rose-500 font-medium">{fieldErrors.close_time}</p>
      )}
    </div>
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
 <Loader2 className="w-5 h-5 animate-spin" />
 ) : (
 "Simpan Perubahan Toko"
 )}
 </Button>
 </form>
 </CardContent>
 </Card>
 );
}
