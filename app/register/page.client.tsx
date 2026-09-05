"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Loader2, Store, Mail, Lock, AlertCircle, Type, Phone, Link as LinkIcon, CheckCircle2, Sparkles, Building2, Car, Stethoscope, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { register, checkSlugAvailability } from "@/lib/actions/auth.actions";

import { Logo } from "@/components/ui/logo";
const registerSchema = z.object({
  email: z.string().email("Ups, format email-nya kayaknya belum pas nih."),
  password: z.string().min(6, "Password-nya kurang panjang, minimal 6 karakter ya."),
  business_name: z
    .string()
    .min(2, "Nama bisnis minimal 2 huruf ya.")
    .max(100, "Kepanjangan nih, maksimal 100 huruf aja ya.")
    .trim(),
  business_sector: z.enum(["beauty", "space", "auto", "health"]),
  business_type: z.string().min(1, "Pilih sub sektor bisnisnya juga ya."),
  custom_business_type: z.string().optional(),
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

  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = 3;

  const [form, setForm] = useState<RegisterFields>({
    email: "",
    password: "",
    business_name: "",
    business_sector: "beauty",
    business_type: "",
    custom_business_type: "",
    whatsapp_number: "",
    slug: "",
  });

  const SUB_SECTORS: Record<string, string[]> = {
    beauty: ["Salon", "Barbershop", "Spa", "Klinik Kecantikan", "Lainnya"],
    space: ["Studio Foto", "Futsal / Lapangan", "Coworking Space", "Vila / Penginapan", "Lainnya"],
    auto: ["Cuci Mobil", "Detailing", "Bengkel", "Lainnya"],
    health: ["Dokter Umum", "Dokter Gigi", "Fisioterapi", "Bidan", "Lainnya"],
  };

  useEffect(() => {
    setForm((prev) => ({ ...prev, business_type: "", custom_business_type: "" }));
  }, [form.business_sector]);
  
  useEffect(() => {
    if (form.business_type !== "Lainnya") {
      setForm((prev) => ({ ...prev, custom_business_type: "" }));
    }
  }, [form.business_type]);
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFields, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  useEffect(() => {
    const slug = form.slug;
    if (!slug) {
      setSlugStatus("idle");
      return;
    }

    if (fieldErrors.slug) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");
    const timer = setTimeout(async () => {
      const isAvailable = await checkSlugAvailability(slug);
      setSlugStatus(isAvailable ? "available" : "taken");
    }, 500);

    return () => clearTimeout(timer);
  }, [form.slug, fieldErrors.slug]);

  const updateForm = (field: keyof RegisterFields, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateField = (field: keyof RegisterFields, value: string) => {
    const res = registerSchema.shape[field].safeParse(value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: res.success ? undefined : res.error.issues[0].message,
    }));
    return res.success;
  };

  const handleNext = () => {
    if (activeStep === 1) {
      const isNameValid = validateField("business_name", form.business_name);
      if (!isNameValid || !form.business_type || (form.business_type === "Lainnya" && !form.custom_business_type?.trim())) return;
    }
    if (activeStep === 2) {
      const isSlugValid = validateField("slug", form.slug);
      const isWaValid = validateField("whatsapp_number", form.whatsapp_number);
      if (!isSlugValid || !isWaValid || slugStatus !== "available") return;
    }
    setActiveStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrev = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const payload = {
        ...form,
        business_type: form.business_type === "Lainnya" ? form.custom_business_type || "Lainnya" : form.business_type,
    };
      
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Partial<Record<keyof RegisterFields, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof RegisterFields;
        errors[fieldName] = issue.message;
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
      router.push("/dashboard");
    });
  };

  return (
    <main className="min-h-screen bg-white flex">
      {/* Kiri: Form Area */}
      <div className="flex-1 flex flex-col px-4 sm:px-12 lg:px-20 xl:px-24 py-8 relative">
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center py-10">
          
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
                <Store className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-stone-900">
                <Logo />
              </span>
            </Link>
            
            {/* Stepper Progress */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${activeStep >= step ? "bg-teal-600" : "bg-stone-100"}`} />
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {activeStep === 1 && "Ceritain Bisnis Kamu"}
              {activeStep === 2 && "Setup Kontak & URL"}
              {activeStep === 3 && "Buat Akun Login"}
            </h1>
            <p className="mt-2 text-stone-500 text-sm sm:text-base">
              {activeStep === 1 && "Langkah pertama untuk bikin booking online otomatis."}
              {activeStep === 2 && "Biar pelanggan gampang nemuin dan hubungin kamu."}
              {activeStep === 3 && "Selangkah lagi web booking kamu siap dipakai!"}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 flex-1">
            {serverError && (
              <div className="flex items-start gap-2 bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium border border-rose-100 mb-6">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{serverError}</p>
              </div>
            )}

            {/* STEP 1: BUSINESS PROFILE */}
            <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 ${activeStep === 1 ? "block" : "hidden"}`}>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">Nama Bisnis</label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={form.business_name}
                    onChange={(e) => updateForm("business_name", e.target.value)}
                    onBlur={(e) => validateField("business_name", e.target.value)}
                    placeholder="Misal: Salon Siska"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm font-medium text-stone-900 placeholder:text-stone-400 caret-teal-600 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${fieldErrors.business_name ? "border-rose-400 focus:ring-rose-400" : "border-stone-200"}`}
                  />
                </div>
                {fieldErrors.business_name && <p className="text-xs text-rose-500 font-medium">{fieldErrors.business_name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">Sektor Bisnis</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "beauty", label: "Kecantikan", icon: <Sparkles className="w-5 h-5" />, desc: "Salon, Barbershop" },
                    { id: "space", label: "Tempat", icon: <Building2 className="w-5 h-5" />, desc: "Studio, Futsal" },
                    { id: "auto", label: "Otomotif", icon: <Car className="w-5 h-5" />, desc: "Cuci Mobil, Bengkel" },
                    { id: "health", label: "Kesehatan", icon: <Stethoscope className="w-5 h-5" />, desc: "Dokter, Terapis" },
                  ].map((sector) => (
                    <div
                      key={sector.id}
                      onClick={() => updateForm("business_sector", sector.id)}
                      className={`cursor-pointer border rounded-xl p-3 flex flex-col items-start gap-1.5 transition-all ${form.business_sector === sector.id ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600 shadow-sm" : "border-stone-200 bg-white hover:border-stone-300"}`}
                    >
                      <div className={`p-2 rounded-lg ${form.business_sector === sector.id ? "bg-teal-100 text-teal-700" : "bg-stone-100 text-stone-600"}`}>
                        {sector.icon}
                      </div>
                      <span className="text-sm font-bold text-stone-900 mt-1">{sector.label}</span>
                      <span className="text-[10px] text-stone-500 leading-tight">{sector.desc}</span>
                    </div>
                  ))}
                </div>
                
                {form.business_sector && (
                  <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[13px] font-semibold text-stone-700">Sub Sektor</label>
                    <div className="flex flex-wrap gap-2">
                      {SUB_SECTORS[form.business_sector]?.map((sub) => (
                        <div
                          key={sub}
                          onClick={() => updateForm("business_type", sub)}
                          className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${form.business_type === sub ? "border-teal-600 bg-teal-600 text-white shadow-sm" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"}`}
                        >
                          {sub}
                        </div>
                      ))}
                    </div>
                    {form.business_type === "Lainnya" && (
                      <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-300">
                        <input
                          type="text"
                          value={form.custom_business_type || ""}
                          onChange={(e) => updateForm("custom_business_type", e.target.value)}
                          placeholder="Ketik spesifik bisnis kamu..."
                          className="w-full h-11 px-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm text-stone-700"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* STEP 2: CONTACT & URL */}
            <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 ${activeStep === 2 ? "block" : "hidden"}`}>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">URL Toko (Slug)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => updateForm("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    onBlur={(e) => validateField("slug", e.target.value)}
                    placeholder="salon-siska"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm font-medium text-stone-900 placeholder:text-stone-400 caret-teal-600 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${fieldErrors.slug ? "border-rose-400 focus:ring-rose-400" : "border-stone-200"}`}
                  />
                </div>
                {fieldErrors.slug ? (
                  <p className="text-xs text-rose-500 font-medium">{fieldErrors.slug}</p>
                ) : slugStatus === "checking" ? (
                  <p className="text-xs text-stone-500 font-medium flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Mengecek URL...
                  </p>
                ) : slugStatus === "taken" ? (
                  <p className="text-xs text-rose-500 font-medium">URL ini sudah dipakai toko lain.</p>
                ) : slugStatus === "available" ? (
                  <p className="text-xs text-teal-600 font-medium">URL tersedia.</p>
                ) : (
                  <div className="mt-2 p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col gap-1">
                    <p className="text-[11px] font-medium text-stone-500">🔗 Toko kamu akan bisa diakses di:</p>
                    <p className="text-sm font-bold text-teal-700 break-all">bukly.in/{form.slug || "url-toko-kamu"}</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">Nomor WhatsApp Admin</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.whatsapp_number}
                    onChange={(e) => updateForm("whatsapp_number", e.target.value)}
                    onBlur={(e) => validateField("whatsapp_number", e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm text-stone-900 caret-teal-600 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${fieldErrors.whatsapp_number ? "border-rose-400 focus:ring-rose-400" : "border-stone-200"}`}
                  />
                </div>
                {fieldErrors.whatsapp_number && <p className="text-xs text-rose-500 font-medium">{fieldErrors.whatsapp_number}</p>}
                <p className="text-[11px] text-stone-400">Pesan booking akan dikirimkan ke nomor ini.</p>
              </div>
            </div>

            {/* STEP 3: ACCOUNT */}
            <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 ${activeStep === 3 ? "block" : "hidden"}`}>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">Email Login</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    onBlur={(e) => validateField("email", e.target.value)}
                    placeholder="admin@tokokamu.com"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm text-stone-900 caret-teal-600 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${fieldErrors.email ? "border-rose-400 focus:ring-rose-400" : "border-stone-200"}`}
                  />
                </div>
                {fieldErrors.email && <p className="text-xs text-rose-500 font-medium">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    onBlur={(e) => validateField("password", e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm text-stone-900 caret-teal-600 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${fieldErrors.password ? "border-rose-400 focus:ring-rose-400" : "border-stone-200"}`}
                  />
                </div>
                {fieldErrors.password && <p className="text-xs text-rose-500 font-medium">{fieldErrors.password}</p>}
              </div>
            </div>
            
            {/* Navigasi Bawah */}
            <div className="pt-4 mt-6 flex gap-3">
              {activeStep > 1 && (
                <Button type="button" variant="outline" onClick={handlePrev} className="h-12 w-14 rounded-xl shrink-0 p-0 flex items-center justify-center border-stone-200">
                  <ChevronLeft className="w-5 h-5 text-stone-500" />
                </Button>
              )}
              {activeStep < totalSteps ? (
                <Button 
                  type="button" 
                  onClick={handleNext} 
                  className="flex-1 h-12 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold shadow-md"
                  disabled={
                    (activeStep === 1 && (!form.business_name || !form.business_type || (form.business_type === "Lainnya" && !form.custom_business_type?.trim()))) ||
                    (activeStep === 2 && (!form.slug || !form.whatsapp_number || slugStatus !== "available"))
                  }
                >
                  Lanjut <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-600/20"
                  disabled={isPending || !form.email || !form.password}
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                  Buat Web Booking Saya
                </Button>
              )}
            </div>
          </form>

          <p className="text-sm text-stone-500 text-center mt-8 pb-8">
            Udah punya akun?{" "}
            <Link href="/login" className="font-bold text-teal-700 hover:text-teal-800 transition-colors">
              Langsung masuk aja
            </Link>
          </p>
        </div>
      </div>

      {/* Kanan: Visual Benefit (Bento Grid) - Hidden on Mobile */}
      <div className="hidden lg:flex flex-1 bg-stone-50 items-center justify-center p-12 relative overflow-hidden border-l border-stone-100">
        <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-teal-50/60 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-orange-50/60 rounded-full blur-3xl translate-y-1/3 translate-x-1/4" />
        
        <div className="relative z-10 max-w-lg w-full flex flex-col gap-4">
          <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[2rem] p-8 shadow-sm">
            <div className="w-14 h-14 bg-teal-100/50 rounded-2xl flex items-center justify-center text-teal-700 mb-6 border border-teal-100">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-extrabold text-stone-900 leading-tight tracking-tight mb-3">
              Nggak usah lagi repot <br/>
              balas chat satu-satu.
            </h2>
            <p className="text-stone-600 leading-relaxed font-medium">
              Ribuan usaha jasa udah pakai bukly.in buat ngunci jadwal tanpa bentrok. Tinggal share link, beres!
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-teal-600 to-teal-500 text-white rounded-[2rem] p-6 shadow-lg shadow-teal-600/20 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl transition-all duration-500 group-hover:scale-150" />
              <Store className="w-8 h-8 mb-4 text-teal-100" />
              <p className="font-bold text-lg leading-tight mb-1">Siap Pakai 1 Menit</p>
              <p className="text-teal-50 text-sm font-medium leading-snug">Isi form di samping, halaman bookingmu langsung online.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl border border-stone-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-4 border border-orange-100">
                <Lock className="w-6 h-6" />
              </div>
              <p className="font-bold text-stone-900 leading-tight mb-1">Anti Pelanggan PHP</p>
              <p className="text-stone-500 text-sm leading-snug">Wajibin pelanggan bayar DP pakai QRIS, biar jadwal aman.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
