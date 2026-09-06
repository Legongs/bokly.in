"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Zap, Building2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBillingIntent } from "@/lib/actions/billing.actions";
import { toast } from "sonner";
import type { Subscription } from "@/types/database.types";

import type { PlanPricesType } from "@/lib/subscription";
import type { PlanFeatureMap } from "@/lib/plan-features";

interface PricingCardsProps {
  currentSubscription: Subscription;
  prices: PlanPricesType;
  /**
   * Teks fitur per paket, hasil generate dari feature flags di database
   * (buildAllPlanFeatures()). Sengaja dilempar sebagai prop dari server —
   * begitu developer ubah matrix di superadmin, isi kartu ikut berubah tanpa
   * ada teks yang perlu diedit di file ini.
   */
  features: PlanFeatureMap;
  midtransClientConfig: {
    clientKey: string;
    isProduction: boolean;
  };
}

declare global {
  interface Window {
    snap?: { pay: (token: string, options: object) => void };
  }
}

export function PricingCards({
  currentSubscription,
  prices,
  features,
  midtransClientConfig,
}: PricingCardsProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loadingPlan, setLoadingPlan] = useState<"pro" | "bisnis" | null>(null);
  const [voucherCode, setVoucherCode] = useState("");

  const currentPlan = currentSubscription.plan;

  const handleUpgrade = (plan: "pro" | "bisnis") => {
    setLoadingPlan(plan);
    startTransition(async () => {
      const res = await createBillingIntent(plan, isYearly ? "yearly" : "monthly", voucherCode || undefined);
      if (!res.success || !res.data) {
        toast.error(res.error ?? "Gagal membuat sesi pembayaran.");
        setLoadingPlan(null);
        return;
      }

      const data = res.data;

      // Load Midtrans Snap JS jika belum ada
      if (!window.snap) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = midtransClientConfig.isProduction
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js";
          script.setAttribute("data-client-key", midtransClientConfig.clientKey || "");
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      }

      window.snap?.pay(data.snapToken, {
        onSuccess: () => {
          toast.success("Pembayaran berhasil! Mengalihkan ke halaman status...");
          window.location.href = `/payment/success?order_id=${data.orderId || ""}`;
        },
        onPending: () => {
          toast.info("Pembayaran menunggu verifikasi...");
          window.location.href = `/payment/success?status=pending&order_id=${data.orderId || ""}`;
        },
        onError: () => {
          toast.error("Pembayaran tidak berhasil diselesaikan.");
          window.location.href = `/payment/failed?order_id=${data.orderId || ""}`;
        },
        onClose: () => setLoadingPlan(null),
      });
    });
  };

  const proMonthly = prices.pro.monthly;
  const proYearly = Math.round(prices.pro.yearly / 12);
  const bisnisMonthly = prices.bisnis.monthly;
  const bisnisYearly = Math.round(prices.bisnis.yearly / 12);

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
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isYearly ? "bg-indigo-600" : "bg-stone-300"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isYearly ? "translate-x-6" : "translate-x-1"}`} />
        </button>
        <span className={`text-sm font-semibold ${isYearly ? "text-stone-900" : "text-stone-400"}`}>
          Tahunan{" "}
          {isYearly && (
            <span className="ml-1 text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
              Hemat 2 bulan
            </span>
          )}
        </span>
      </div>

      {/* Voucher Input */}
      <div className="flex flex-col items-center justify-center max-w-sm mx-auto mt-4">
        <label htmlFor="voucher" className="text-xs font-semibold text-stone-500 mb-1.5 self-start">
          Punya kode voucher?
        </label>
        <input
          id="voucher"
          type="text"
          placeholder="Masukkan kode voucher (opsional)"
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
          className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm uppercase placeholder:normal-case placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {voucherCode && (
          <p className="text-[11px] text-stone-500 mt-1.5 text-center">
            Voucher <strong className="text-indigo-600">{voucherCode}</strong> akan divalidasi saat kamu klik tombol Upgrade.
          </p>
        )}
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
            {features.free.map((f) => (
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
        <div className="relative rounded-2xl border-2 border-indigo-500 bg-white p-6 flex flex-col shadow-lg shadow-indigo-500/10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-indigo-600 text-white text-[11px] font-bold px-3 py-1 rounded-full">Paling Populer</span>
          </div>
          <div className="flex items-center gap-2 mb-4 mt-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-indigo-700">Pro</span>
          </div>
          <p className="text-3xl font-extrabold text-stone-900 mb-1">
            {fmt(isYearly ? proYearly : proMonthly)}
            <span className="text-base font-semibold text-stone-400">/bln</span>
          </p>
          <p className="text-xs text-stone-400 mb-6">
            {isYearly ? `Ditagih ${fmt(prices.pro.yearly)}/tahun` : "Ditagih tiap bulan"}
          </p>
          <ul className="space-y-2.5 flex-1 mb-6">
            {features.pro.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                <Check className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            id="billing-pro-btn"
            onClick={() => handleUpgrade("pro")}
            disabled={isPending || currentPlan === "pro" || currentPlan === "bisnis"}
            className="w-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all gap-2"
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
            {isYearly ? `Ditagih ${fmt(prices.bisnis.yearly)}/tahun` : "Ditagih tiap bulan"}
          </p>
          <ul className="space-y-2.5 flex-1 mb-6">
            {features.bisnis.map((f) => (
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
