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
  email: z.string().email("Format email-nya kurang pas nih."),
  password: z.string().min(6, "Password minimal 6 karakter ya."),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
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
              <label className="text-sm font-semibold text-stone-700">
                Password
              </label>
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

      {/* Kanan: Visual Benefit (Split Screen) */}
      <div className="hidden lg:flex flex-1 bg-stone-50 items-center justify-center p-12 border-l border-stone-200">
        <div className="max-w-md w-full">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-teal-600 mb-6 shadow-sm border border-stone-100">
            <Coffee className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-stone-900 leading-tight mb-4">
            Selamat datang kembali!
          </h2>
          <p className="text-lg text-stone-600 leading-relaxed mb-8">
            Cek jadwal hari ini, konfirmasi DP, dan siap-siap sambut pelanggan.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-stone-900">Konfirmasi DP Cepat</p>
                <p className="text-sm text-stone-500">Approve booking masuk cuma dengan satu klik.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-stone-900">Manajemen Layanan</p>
                <p className="text-sm text-stone-500">Update harga atau ganti nama layanan kapan saja.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
