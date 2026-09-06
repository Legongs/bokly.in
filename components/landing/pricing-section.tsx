"use client";

import { useState } from "react";
import { Check, Gift, Zap, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { PlanPricesType } from "@/lib/subscription";
import type { PlanFeatureMap } from "@/lib/plan-features";

interface PricingSectionProps {
  prices: PlanPricesType;
  features: PlanFeatureMap;
}

export function PricingSection({ prices, features }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);

  const proMonthly = prices.pro.monthly;
  const proYearly = Math.round(prices.pro.yearly / 12);
  const bisnisMonthly = prices.bisnis.monthly;
  const bisnisYearly = Math.round(prices.bisnis.yearly / 12);

  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <section className="bg-stone-50 py-16 sm:py-24 border-t border-stone-200 scroll-mt-16" id="harga">
      <div className="max-w-6xl mx-auto px-4">
        <div className="reveal text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900">
            Mulai gratis, upgrade kapan aja kalau usahamu makin rame
          </h2>
          <p className="text-stone-500 mt-4 max-w-xl mx-auto text-sm sm:text-base">
            Tanpa biaya tersembunyi. Fokus ke pelangganmu, urusan jadwal biar sistem yang atur.
          </p>
        </div>

        {/* Toggle bulanan/tahunan */}
        <div className="reveal flex items-center justify-center gap-3 mb-10" style={{ transitionDelay: "100ms" }}>
          <span className={`text-sm font-semibold ${!isYearly ? "text-stone-900" : "text-stone-400"}`}>
            Bulanan
          </span>
          <button
            id="pricing-cycle-toggle"
            onClick={() => setIsYearly((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isYearly ? "bg-indigo-600" : "bg-stone-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                isYearly ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm font-semibold flex items-center gap-2 ${isYearly ? "text-stone-900" : "text-stone-400"}`}>
            Tahunan
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
              Hemat 2 bulan
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Gratis */}
          <div className="reveal rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 flex flex-col hover:shadow-md transition-shadow" style={{ transitionDelay: "200ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-stone-500" />
              <span className="font-bold text-stone-700">Gratis</span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-stone-900 mb-1">Rp 0</p>
            <p className="text-sm text-stone-500 mb-6 font-medium">Cocok buat coba-coba dulu</p>
            <ul className="space-y-3 flex-1 mb-8">
              {features.free.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-stone-600">
                  <Check className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block w-full">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-stone-300 text-stone-600 font-bold hover:bg-stone-100 hover:text-stone-900 transition-colors"
              >
                Daftar Gratis
              </Button>
            </Link>
          </div>

          {/* Pro */}
          <div className="reveal relative rounded-3xl border-2 border-indigo-500 bg-white p-6 sm:p-8 flex flex-col shadow-xl shadow-indigo-500/10 md:-translate-y-4" style={{ transitionDelay: "300ms" }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                Paling Populer
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4 mt-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-indigo-700">Pro</span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-stone-900 mb-1 flex items-end">
              {fmt(isYearly ? proYearly : proMonthly)}
              <span className="text-base font-semibold text-stone-400 mb-1 ml-1">/bln</span>
            </p>
            <p className="text-sm text-stone-500 mb-6 font-medium">
              {isYearly ? `Ditagih ${fmt(prices.pro.yearly)} per tahun` : "Ditagih per bulan"}
            </p>
            <ul className="space-y-3 flex-1 mb-8">
              {features.pro.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-stone-700 font-medium">
                  <Check className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block w-full">
              <Button
                className="w-full h-12 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Pilih Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Bisnis */}
          <div className="reveal rounded-3xl border border-stone-200 bg-stone-900 p-6 sm:p-8 flex flex-col shadow-lg" style={{ transitionDelay: "400ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-white">Bisnis</span>
            </div>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mb-1 flex items-end">
              {fmt(isYearly ? bisnisYearly : bisnisMonthly)}
              <span className="text-base font-semibold text-stone-400 mb-1 ml-1">/bln</span>
            </p>
            <p className="text-sm text-stone-400 mb-6 font-medium">
              {isYearly ? `Ditagih ${fmt(prices.bisnis.yearly)} per tahun` : "Ditagih per bulan"}
            </p>
            <ul className="space-y-3 flex-1 mb-8">
              {features.bisnis.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-stone-300">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block w-full">
              <Button
                className="w-full h-12 rounded-xl bg-amber-500 text-stone-900 font-bold hover:bg-amber-400 hover:shadow-lg transition-all"
              >
                Pilih Bisnis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Bantuan */}
        <div className="reveal mt-12 text-center text-sm font-medium text-stone-500" style={{ transitionDelay: "500ms" }}>
          Butuh paket khusus untuk bisnis skala besar?{" "}
          <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-bold underline underline-offset-4">
            Hubungi kami
          </Link>
        </div>
      </div>
    </section>
  );
}
