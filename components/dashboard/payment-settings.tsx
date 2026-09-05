"use client";

import React, { useState, useTransition } from "react";
import { Loader2, Link as LinkIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { updatePaymentSettings } from "@/lib/actions/tenant.actions";
import type { Tenant } from "@/types/database.types";
import { z } from "zod";

const updatePaymentSettingsSchema = z.object({
  id: z.string().uuid("ID Tenant-nya kurang pas nih."),
  qris_image_url: z.string().url("Wah, link QRIS-nya nggak valid nih.").nullable().optional().or(z.literal("")),
  payment_method_type: z.enum(["manual", "gateway"]).default("manual"),
  payment_gateway_provider: z.enum(["midtrans", "xendit"]).nullable().optional(),
  payment_gateway_server_key: z.string().nullable().optional(),
  payment_gateway_client_key: z.string().nullable().optional(),
  bank_name: z.string().max(50, "Nama bank kepanjangan nih.").nullable().optional().or(z.literal("")),
  bank_account_number: z.string().max(50, "Nomor rekening kepanjangan nih.").nullable().optional().or(z.literal("")),
  bank_account_name: z.string().max(100, "Atas nama rekening kepanjangan nih.").nullable().optional().or(z.literal("")),
});

type SettingsFields = z.infer<typeof updatePaymentSettingsSchema>;

interface PaymentSettingsProps {
  tenant: Tenant;
}

export function PaymentSettings({ tenant }: PaymentSettingsProps) {
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<SettingsFields>({
    id: tenant.id,
    qris_image_url: tenant.qris_image_url ?? "",
    payment_method_type: (tenant as any).payment_method_type || "manual",
    payment_gateway_provider: (tenant as any).payment_gateway_provider || "midtrans",
    payment_gateway_server_key: (tenant as any).payment_gateway_server_key || "",
    payment_gateway_client_key: (tenant as any).payment_gateway_client_key || "",
    bank_name: (tenant as any).bank_name || "",
    bank_account_number: (tenant as any).bank_account_number || "",
    bank_account_name: (tenant as any).bank_account_name || "",
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof SettingsFields, string>>>({});
  const [serverStatus, setServerStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const updateForm = (field: keyof SettingsFields, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateField = (field: keyof SettingsFields, value: string) => {
    const res = updatePaymentSettingsSchema.shape[field].safeParse(value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: res.success ? undefined : res.error.issues[0].message,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerStatus(null);

    const parsed = updatePaymentSettingsSchema.safeParse(form);
    if (!parsed.success) {
      const errors: any = {};
      parsed.error.issues.forEach((issue) => {
        errors[issue.path[0]] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      const res = await updatePaymentSettings(parsed.data);
      if (!res.success) {
        setServerStatus({ type: "error", message: res.error ?? "Yah, gagal nyimpen. Coba lagi ya." });
        return;
      }
      setServerStatus({ type: "success", message: "Yeay! Pengaturan pembayaran udah berhasil di-update." });
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-[2rem] shadow-md shadow-stone-200/50 border-none overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="space-y-1 pb-4">
        <h3 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
          Pengaturan Pembayaran
        </h3>
        <p className="text-sm text-stone-500">
          Ubah metode pembayaran, link QRIS, dan integrasi payment gateway.
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
              Gambar QRIS (Opsional buat DP)
            </label>
            <ImageUploader 
              value={form.qris_image_url || ""}
              onChange={(url) => updateForm("qris_image_url", url)}
              disabled={isPending}
              label="Upload QRIS Kamu"
            />
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

          {form.payment_method_type === "manual" && (
            <div className="p-4 bg-stone-50 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-stone-800">Informasi Rekening Bank (Alternatif QRIS)</h3>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700 ">Nama Bank</label>
                <input
                  type="text"
                  value={form.bank_name || ""}
                  onChange={(e) => updateForm("bank_name", e.target.value)}
                  onBlur={(e) => validateField("bank_name", e.target.value)}
                  placeholder="Misal: BCA, Mandiri, BSI"
                  className={`w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
                    fieldErrors.bank_name ? "ring-2 ring-rose-400 bg-rose-50" : ""
                  }`}
                  disabled={isPending}
                />
                {fieldErrors.bank_name && (
                  <p className="text-xs text-rose-500 font-medium">{fieldErrors.bank_name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700 ">Nomor Rekening</label>
                <input
                  type="text"
                  value={form.bank_account_number || ""}
                  onChange={(e) => updateForm("bank_account_number", e.target.value)}
                  onBlur={(e) => validateField("bank_account_number", e.target.value)}
                  placeholder="Contoh: 1234567890"
                  className={`w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
                    fieldErrors.bank_account_number ? "ring-2 ring-rose-400 bg-rose-50" : ""
                  }`}
                  disabled={isPending}
                />
                {fieldErrors.bank_account_number && (
                  <p className="text-xs text-rose-500 font-medium">{fieldErrors.bank_account_number}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700 ">Atas Nama Rekening</label>
                <input
                  type="text"
                  value={form.bank_account_name || ""}
                  onChange={(e) => updateForm("bank_account_name", e.target.value)}
                  onBlur={(e) => validateField("bank_account_name", e.target.value)}
                  placeholder="Atas nama siapa rekening tersebut?"
                  className={`w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner ${
                    fieldErrors.bank_account_name ? "ring-2 ring-rose-400 bg-rose-50" : ""
                  }`}
                  disabled={isPending}
                />
                {fieldErrors.bank_account_name && (
                  <p className="text-xs text-rose-500 font-medium">{fieldErrors.bank_account_name}</p>
                )}
              </div>
            </div>
          )}

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

          <Button
            type="submit"
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold mt-4 shadow-md shadow-teal-600/20 transition-all hover:shadow-lg"
            disabled={
              isPending ||
              Object.values(fieldErrors).some((err) => !!err)
            }
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Terapkan Aturan Pembayaran"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
