"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Zap, Building2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBillingIntent } from "@/lib/actions/billing.actions";
import { toast } from "sonner";
import type { Subscription } from "@/types/database.types";

interface PricingCardsProps {
  currentSubscription: Subscription;
}

const FEATURES = {
  free: [
    "30 booking per bulan",
    "Maks 3 layanan",
    "Maks 1 staf",
    "Notif WA manual ke admin",
    "Halaman booking unik",
  ],
  pro: [
    "Booking tak terbatas",
    "Layanan tak terbatas",
    "Maks 5 staf",
    "Reminder WA H-1 otomatis",
    "Analytics & laporan",
    "Upload logo & foto profil",
    "Support email 2×24 jam",
  ],
  bisnis: [
    "Semua fitur Pro",
    "Staf tak terbatas",
    "Verifikasi pembayaran otomatis",
    "Hapus branding bukly.in",
    "Support priority WhatsApp",
  ],
};

declare global {
  interface Window {
    snap?: { pay: (token: string, options: object) => void };
  }
}

export function PricingCards({ currentSubscription }: PricingCardsProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingPlan, setLoadingPlan] = useState<"pro" | "bisnis" | null>(null);

  const currentPlan = currentSubscription.plan;

  const handleUpgrade = (plan: "pro" | "bisnis") => {
    setLoadingPlan(plan);
    startTransition(async () => {
      const res = await createBillingIntent(plan, isYearly ? "yearly" : "monthly");
      if (!res.success || !res.data) {
        toast.error(res.error ?? "Gagal membuat sesi pembayaran.");
        setLoadingPlan(null);
        return;
      }

      // Load Midtrans Snap JS jika belum ada
      if (!window.snap) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js";
          script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "");
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      }

      window.snap?.pay(res.data.snapToken, {
        onSuccess: () => {
          toast.success("Pembayaran berhasil! Paket kamu sedang diaktifkan 🎉");
          setTimeout(() => window.location.reload(), 2000);
        },
        onPending: () => toast.info("Pembayaran tertunda. Selesaikan pembayaranmu ya."),
        onError: () => toast.error("Pembayaran gagal. Coba lagi."),
        onClose: () => setLoadingPlan(null),
      });
    });
  };

  const proMonthly = 49000;
  const proYearly = Math.round(470400 / 12);
  const bisnisMonthly = 119000;
  const bisnisYearly = Math.round(1140000 / 12);

  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-8">
      {/* Toggle bulanan/tahunan */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-semibold ${!isYearly ? "text-stone-900" : "text-stone-400"}`}>Bulanan</span>
        <button
          id="billing-cycle-toggle"
          onClick={() => setIsYearly((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isYearly ? "bg-teal-600" : "bg-stone-300"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isYearly ? "translate-x-6" : "translate-x-1"}`} />
        </button>
        <span className={`text-sm font-semibold ${isYearly ? "text-stone-900" : "text-stone-400"}`}>
          Tahunan{" "}
          {isYearly && (
            <span className="ml-1 text-[11px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
              Hemat 2 bulan
            </span>
          )}
        </span>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-stone-500" />
            <span className="font-bold text-stone-700">Gratis</span>
          </div>
          <p className="text-3xl font-extrabold text-stone-900 mb-1">Rp 0</p>
          <p className="text-xs text-stone-400 mb-6">Selamanya gratis</p>
          <ul className="space-y-2.5 flex-1 mb-6">
            {FEATURES.free.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                <Check className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            id="billing-free-btn"
            disabled
            variant="outline"
            className="w-full border-stone-300 text-stone-400 cursor-default"
          >
            {currentPlan === "free" ? "Paket Aktif" : "Paket Dasar"}
          </Button>
        </div>

        {/* Pro */}
        <div className="relative rounded-2xl border-2 border-teal-500 bg-white p-6 flex flex-col shadow-lg shadow-teal-500/10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-teal-600 text-white text-[11px] font-bold px-3 py-1 rounded-full">Paling Populer</span>
          </div>
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Zap className="w-5 h-5 text-teal-600" />
            <span className="font-bold text-teal-700">Pro</span>
          </div>
          <p className="text-3xl font-extrabold text-stone-900 mb-1">
            {fmt(isYearly ? proYearly : proMonthly)}
            <span className="text-base font-semibold text-stone-400">/bln</span>
          </p>
          <p className="text-xs text-stone-400 mb-6">
            {isYearly ? `Ditagih ${fmt(470400)}/tahun` : "Ditagih tiap bulan"}
          </p>
          <ul className="space-y-2.5 flex-1 mb-6">
            {FEATURES.pro.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                <Check className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            id="billing-pro-btn"
            onClick={() => handleUpgrade("pro")}
            disabled={isPending || currentPlan === "pro" || currentPlan === "bisnis"}
            className="w-full bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all gap-2"
          >
            {loadingPlan === "pro" && isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
            ) : currentPlan === "pro" ? "Paket Aktif" : currentPlan === "bisnis" ? "Plan Lebih Rendah" : "Upgrade ke Pro"}
          </Button>
        </div>

        {/* Bisnis */}
        <div className="rounded-2xl border border-stone-200 bg-stone-900 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white">Bisnis</span>
          </div>
          <p className="text-3xl font-extrabold text-white mb-1">
            {fmt(isYearly ? bisnisYearly : bisnisMonthly)}
            <span className="text-base font-semibold text-stone-400">/bln</span>
          </p>
          <p className="text-xs text-stone-400 mb-6">
            {isYearly ? `Ditagih ${fmt(1140000)}/tahun` : "Ditagih tiap bulan"}
          </p>
          <ul className="space-y-2.5 flex-1 mb-6">
            {FEATURES.bisnis.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-stone-300">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            id="billing-bisnis-btn"
            onClick={() => handleUpgrade("bisnis")}
            disabled={isPending || currentPlan === "bisnis"}
            className="w-full bg-amber-500 text-stone-900 font-bold hover:bg-amber-400 transition-all gap-2"
          >
            {loadingPlan === "bisnis" && isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
            ) : currentPlan === "bisnis" ? "Paket Aktif" : "Upgrade ke Bisnis"}
          </Button>
        </div>
      </div>
    </div>
  );
}
