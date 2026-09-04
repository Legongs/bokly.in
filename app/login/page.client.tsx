"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Loader2, Store, Mail, Lock, AlertCircle, Coffee, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/actions/auth.actions";

// Client-side schema mirroring server
const loginSchema = z.object({
  email: z.string().email("Ups, format email-nya kayaknya belum pas nih."),
  password: z.string().min(6, "Password-nya kurang panjang, minimal 6 karakter ya."),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("demo") === "true") {
        setEmail("demo@maubooking.in");
        setPassword("Demo123456!");
        setIsDemoMode(true);
      }
    }
  }, []);
  
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFields, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validateField = (field: keyof LoginFields, value: string) => {
    const res = loginSchema.shape[field].safeParse(value);
    setFieldErrors((prev) => ({
      ...prev,
      [field]: res.success ? undefined : res.error.issues[0].message,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: any = {};
      parsed.error.issues.forEach((issue) => {
        errors[issue.path[0]] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      const res = await login(parsed.data);
      if (!res.success) {
        setServerError(res.error ?? "Gagal login. Coba lagi ya.");
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
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10 text-center sm:text-left">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
                <Store className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-stone-900">
                maubooking<span className="text-teal-600">.in</span>
              </span>
            </Link>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              Masuk ke Dasbor
            </h1>
            <p className="mt-2 text-stone-500">
              Cek daftar pelanggan dan atur jadwal kamu hari ini.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {serverError && (
              <div className="flex items-start gap-2 bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium border border-rose-100">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{serverError}</p>
              </div>
            )}

            {isDemoMode && (
              <div className="flex items-start gap-2 bg-teal-50 text-teal-700 p-3 rounded-xl text-sm font-medium border border-teal-100">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Mode Demo diaktifkan. Kredensial telah diisi otomatis, silakan langsung klik Masuk.</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-stone-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-stone-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                  tabIndex={-1}
                >
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              disabled={isPending || !email || !password}
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Masuk Sekarang"
              )}
            </Button>
          </form>

          <p className="text-sm text-stone-500 text-center mt-8">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-bold text-teal-700 hover:text-teal-800 transition-colors"
            >
              Daftar dulu yuk
            </Link>
          </p>
        </div>
      </div>

      {/* Kanan: Visual Benefit (Bento Grid) */}
      <div className="hidden lg:flex flex-1 bg-stone-50 items-center justify-center p-12 relative overflow-hidden">
        {/* Dekorasi Organik */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-teal-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-orange-50/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        
        <div className="relative z-10 max-w-lg w-full flex flex-col gap-4">
          <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[2rem] p-8 shadow-sm">
            <div className="w-14 h-14 bg-teal-100/50 rounded-2xl flex items-center justify-center text-teal-700 mb-6 border border-teal-100">
              <Coffee className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-extrabold text-stone-900 leading-tight tracking-tight mb-3">
              Selamat datang kembali, Juragan!
            </h2>
            <p className="text-stone-600 leading-relaxed font-medium">
              Cek jadwal hari ini, santai sejenak, dan siap-siap sambut pelanggan yang udah antre.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-teal-600 to-teal-500 text-white rounded-[2rem] p-6 shadow-lg shadow-teal-600/20 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl transition-all duration-500 group-hover:scale-150" />
              <CheckCircle2 className="w-8 h-8 mb-4 text-teal-100" />
              <p className="font-bold text-lg leading-tight mb-1">Terima DP Instan</p>
              <p className="text-teal-50 text-sm font-medium leading-snug">Approve booking masuk cuma dengan satu klik aja.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl border border-stone-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-4 border border-orange-100">
                <Store className="w-6 h-6" />
              </div>
              <p className="font-bold text-stone-900 leading-tight mb-1">Atur Sesukamu</p>
              <p className="text-stone-500 text-sm leading-snug">Ubah harga atau layanan kapan aja dari HP-mu.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
