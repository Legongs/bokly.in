"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Loader2, Store, Mail, Lock, AlertCircle, Type, Phone, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { register } from "@/lib/actions/auth.actions";

// Client-side schema mirroring server
const registerSchema = z.object({
  email: z.string().email("Format email-nya kurang pas nih."),
  password: z.string().min(6, "Password minimal 6 karakter biar aman ya."),
  business_name: z
    .string()
    .min(2, "Nama bisnis minimal 2 huruf ya.")
    .max(100, "Kepanjangan nih, maksimal 100 huruf aja ya.")
    .trim(),
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
  whatsapp_number: z
    .string()
    .min(10, "Nomor WA kependekan, minimal 10 angka ya.")
    .max(16, "Nomor WA kepanjangan, maksimal 16 angka ya.")
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,11}$/,
      "Format WA-nya kurang pas. Pakai awalan 08 atau 628 ya."
    ),
  slug: z
    .string()
    .min(3, "URL toko minimal 3 huruf ya.")
    .max(50, "URL toko maksimal 50 huruf ya.")
    .regex(/^[a-z0-9-]+$/, "Cuma boleh pakai huruf kecil, angka, dan strip (-) ya.")
    .trim(),
});

type RegisterFields = z.infer<typeof registerSchema>;

export default function RegisterPageClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<RegisterFields>({
    email: "",
    password: "",
    business_name: "",
    business_type: "salon",
    whatsapp_number: "",
    slug: "",
  });
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFields, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const updateForm = (field: keyof RegisterFields, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateField = (field: keyof RegisterFields, value: string) => {
    const res = registerSchema.shape[field].safeParse(value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: res.success ? undefined : res.error.issues[0].message,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const errors: any = {};
      parsed.error.issues.forEach((issue) => {
        errors[issue.path[0]] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      const res = await register(parsed.data);
      if (!res.success) {
        setServerError(res.error ?? "Gagal daftar akun. Coba lagi ya.");
        return;
      }
      // Redirect ke dashboard
      router.push("/dashboard");
    });
  };

  return (
    <main className="min-h-screen bg-white flex">
      {/* Kiri: Form Area */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-20 xl:px-24 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
                <Store className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-stone-900">
                maubooking<span className="text-teal-600">.in</span>
              </span>
            </Link>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              Mulai Buka Jadwal Booking Kamu
            </h1>
            <p className="mt-2 text-stone-500">
              Isi data di bawah buat dapetin link booking otomatis usahamu.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {serverError && (
              <div className="flex items-start gap-2 bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium border border-rose-100">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{serverError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">
                  Nama Bisnis
                </label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={form.business_name}
                    onChange={(e) => updateForm("business_name", e.target.value)}
                    onBlur={(e) => validateField("business_name", e.target.value)}
                    placeholder="Misal: Salon Siska"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium text-stone-900 placeholder:text-stone-400 caret-teal-600 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                      fieldErrors.business_name
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-stone-200"
                    }`}
                    disabled={isPending}
                  />
                </div>
                {fieldErrors.business_name && (
                  <p className="text-xs text-rose-500 font-medium">{fieldErrors.business_name}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-semibold text-stone-700">
                  Jenis Bisnis Kamu
                </label>
                <div className="relative">
                  <select
                    value={form.business_type}
                    onChange={(e) => updateForm("business_type", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-900 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors appearance-none cursor-pointer"
                    disabled={isPending}
                  >
                    <option value="salon">✂️ Salon & Barbershop</option>
                    <option value="klinik">💅 Klinik Kecantikan & Spa</option>
                    <option value="konsultasi">🩺 Praktek Mandiri / Konsultasi</option>
                    <option value="studio_foto">📸 Studio Foto / Videografi</option>
                    <option value="cuci_kendaraan">🚗 Cuci Mobil & Detailing</option>
                    <option value="olahraga">🏀 Sewa Fasilitas Olahraga</option>
                    <option value="servis">🛠️ Jasa Perbaikan / Servis</option>
                    <option value="lainnya">📦 Lainnya</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500">Bakal dipakai buat nyesuaiin kata-kata di halaman booking kamu nanti.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">
                  URL Toko (Slug)
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => updateForm("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    onBlur={(e) => validateField("slug", e.target.value)}
                    placeholder="salon-siska"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm font-medium text-stone-900 placeholder:text-stone-400 caret-teal-600 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                      fieldErrors.slug
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-stone-200"
                    }`}
                    disabled={isPending}
                  />
                </div>
                {fieldErrors.slug ? (
                  <p className="text-xs text-rose-500 font-medium">{fieldErrors.slug}</p>
                ) : (
                  <p className="text-[11px] text-stone-400">Nanti linknya: maubooking.in/<strong>{form.slug || "url"}</strong></p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-stone-700">
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
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-stone-900 caret-teal-600 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                    fieldErrors.whatsapp_number
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-stone-200"
                  }`}
                  disabled={isPending}
                />
              </div>
              {fieldErrors.whatsapp_number && (
                <p className="text-xs text-rose-500 font-medium">{fieldErrors.whatsapp_number}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-stone-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  onBlur={(e) => validateField("email", e.target.value)}
                  placeholder="admin@tokokamu.com"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-stone-900 caret-teal-600 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                    fieldErrors.email
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-stone-200"
                  }`}
                  disabled={isPending}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-rose-500 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-stone-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  onBlur={(e) => validateField("password", e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-stone-900 caret-teal-600 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                    fieldErrors.password
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-stone-200"
                  }`}
                  disabled={isPending}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-rose-500 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold mt-6 shadow-md shadow-teal-600/20"
              disabled={
                isPending ||
                !form.email ||
                !form.password ||
                !form.business_name ||
                !form.slug ||
                !form.whatsapp_number
              }
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Buat Web Booking Saya"
              )}
            </Button>
          </form>

          <p className="text-sm text-stone-500 text-center mt-8">
            Udah punya akun?{" "}
            <Link
              href="/login"
              className="font-bold text-teal-700 hover:text-teal-800 transition-colors"
            >
              Langsung masuk aja
            </Link>
          </p>
        </div>
      </div>

      {/* Kanan: Visual Benefit (Split Screen) */}
      <div className="hidden lg:flex flex-1 bg-stone-50 items-center justify-center p-12 border-l border-stone-200">
        <div className="max-w-md w-full">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-teal-600 mb-6 shadow-sm border border-stone-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-stone-900 leading-tight mb-4">
            Nggak perlu lagi repot balas chat satu-satu.<br />
            <span className="text-teal-700">Tinggal share link, jadwal langsung keisi.</span>
          </h2>
          <p className="text-lg text-stone-600 leading-relaxed mb-8">
            Lebih dari ribuan usaha jasa telah meninggalkan buku catatan manual dan beralih ke maubooking.in untuk mengunci jadwal tanpa bentrok.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-stone-900">Siap Pakai 1 Menit</p>
                <p className="text-sm text-stone-500">Isi form di samping, web langsung online.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-stone-900">Anti Pelanggan PHP</p>
                <p className="text-sm text-stone-500">Wajibin pelanggan bayar DP pakai QRIS.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
