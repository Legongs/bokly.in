"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { z } from "zod";
import { Loader2, Store, Mail, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendPasswordResetEmail } from "@/lib/actions/auth.actions";

import { Logo } from "@/components/ui/logo";
const forgotPasswordSchema = z.object({
  email: z.string().email("Ups, format email-nya kayaknya belum pas nih."),
});

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldError(null);
    setIsSuccess(false);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0].message);
      return;
    }

    startTransition(async () => {
      const res = await sendPasswordResetEmail(parsed.data.email);
      if (!res.success) {
        setErrorMsg(res.error ?? "Gagal mengirim link reset. Coba lagi ya.");
        return;
      }
      setIsSuccess(true);
    });
  };

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 sm:p-10 shadow-sm border border-stone-100">
        
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
            <Store className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-stone-900">
            <Logo />
          </span>
        </Link>
        
        <div className="mb-8">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-4 border border-teal-100">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Lupa Password?
          </h1>
          <p className="mt-2 text-stone-500 text-sm">
            Nggak apa-apa, masukin email akunmu dan kita kirimin link buat bikin password baru.
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-teal-900 mb-2">Link Terkirim!</h3>
            <p className="text-sm text-teal-700/80 mb-6">
              Cek inbox atau folder spam email <span className="font-semibold text-teal-800">{email}</span> ya.
            </p>
            <Link href="/login" className="block w-full py-3 bg-white border border-teal-200 text-teal-700 rounded-xl font-bold hover:bg-teal-50 transition-colors">
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex items-start gap-2 bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-medium border border-rose-100 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-stone-700">Email Akun</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldError) setFieldError(null);
                  }}
                  placeholder="admin@tokokamu.com"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-stone-900 caret-teal-600 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                    fieldError ? "border-rose-400 focus:ring-rose-400" : "border-stone-200"
                  }`}
                  disabled={isPending}
                />
              </div>
              {fieldError && <p className="text-xs text-rose-500 font-medium">{fieldError}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold mt-6 shadow-md shadow-teal-600/20"
              disabled={isPending || !email}
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim Link Reset"}
            </Button>

            <p className="text-sm text-stone-500 text-center mt-6">
              Ingat passwordnya?{" "}
              <Link href="/login" className="font-bold text-teal-700 hover:text-teal-800 transition-colors">
                Kembali login
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
