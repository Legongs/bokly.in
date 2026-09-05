"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Loader2, Store, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/actions/auth.actions";

import { Logo } from "@/components/ui/logo";
const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password-nya kurang panjang, minimal 6 karakter ya."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password barunya nggak sama nih. Coba ketik ulang ya.",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const errors: any = {};
      parsed.error.issues.forEach((issue) => {
        errors[issue.path[0]] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      const res = await resetPassword(parsed.data.password);
      if (!res.success) {
        setErrorMsg(res.error ?? "Gagal mereset password. Sesi mungkin kedaluwarsa.");
        return;
      }
      
      // Jika berhasil, user sudah login (berkat PKCE), langsung arahkan ke Dashboard
      router.push("/dashboard");
    });
  };

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-stone-100">
        
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20">
            <Store className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-stone-900">
            <Logo />
          </span>
        </Link>
        
        <div className="mb-8">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 border border-indigo-100">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Buat Password Baru
          </h1>
          <p className="mt-2 text-stone-500 text-sm">
            Pastikan password barunya aman dan gampang kamu ingat ya.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2 bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium border border-rose-100 animate-in fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-stone-700">Password Baru</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                }}
                placeholder="••••••••"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-stone-900 caret-indigo-600 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  fieldErrors.password ? "border-rose-400 focus:ring-rose-400" : "border-stone-200"
                }`}
                disabled={isPending}
              />
            </div>
            {fieldErrors.password && <p className="text-xs text-rose-500 font-medium">{fieldErrors.password}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-stone-700">Ketik Ulang Password Baru</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: "" });
                }}
                placeholder="••••••••"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-stone-900 caret-indigo-600 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  fieldErrors.confirmPassword ? "border-rose-400 focus:ring-rose-400" : "border-stone-200"
                }`}
                disabled={isPending}
              />
            </div>
            {fieldErrors.confirmPassword && <p className="text-xs text-rose-500 font-medium">{fieldErrors.confirmPassword}</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold mt-6 shadow-md shadow-indigo-600/20"
            disabled={isPending || !password || !confirmPassword}
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan Password Baru"}
          </Button>
        </form>
      </div>
    </main>
  );
}
