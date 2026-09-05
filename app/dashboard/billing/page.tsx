import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getAuthTenantId } from "@/lib/auth";
import { getTenantSubscription } from "@/lib/subscription";
import { PricingCards } from "@/components/dashboard/pricing-cards";
import { Crown, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Langganan | bukly.id",
  description: "Kelola paket berlangganan dan upgrade fitur untuk usahamu.",
};

const PLAN_LABEL: Record<string, string> = {
  free: "Gratis",
  pro: "Pro",
  bisnis: "Bisnis",
};

const PLAN_COLOR: Record<string, string> = {
  free: "bg-stone-100 text-stone-600 border-stone-200",
  pro: "bg-indigo-100 text-indigo-700 border-indigo-200",
  bisnis: "bg-amber-100 text-amber-700 border-amber-200",
};

export default async function BillingPage() {
  const tenantId = await getAuthTenantId();
  const subscription = await getTenantSubscription(tenantId);

  const isActive = subscription.status === "active";
  const isPaid = subscription.plan !== "free";
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  // Cek query param feedback dari Midtrans redirect
  return (
    <main className="p-4 sm:p-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-5 h-5 text-indigo-600" />
          <h1 className="text-2xl font-extrabold text-stone-900">Langganan</h1>
        </div>
        <p className="text-sm text-stone-500">Kelola paket dan upgrade fitur untuk usahamu.</p>
      </div>

      {/* Section 1 — Status paket saat ini */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-8">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Paket Aktif</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border ${PLAN_COLOR[subscription.plan]}`}
            >
              <Crown className="w-3.5 h-3.5" />
              {PLAN_LABEL[subscription.plan] ?? subscription.plan}
            </span>
            {isActive ? (
              <span className="flex items-center gap-1 text-xs text-indigo-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> {subscription.status === "expired" ? "Expired" : "Dibatalkan"}
              </span>
            )}
          </div>

          {isPaid && periodEnd && (
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Berlaku hingga <strong className="text-stone-700">{periodEnd}</strong>
              </span>
            </div>
          )}
        </div>

        {subscription.plan === "free" && (
          <p className="mt-4 text-sm text-stone-500">
            Kamu sedang menggunakan paket Gratis. Upgrade untuk fitur reminder WA otomatis, analytics, dan lebih banyak kapasitas.
          </p>
        )}

        {isPaid && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <p className="text-xs text-stone-400">
              Untuk membatalkan atau mengelola metode pembayaran, hubungi{" "}
              <Link href="https://wa.me/6281234567890" className="text-indigo-600 hover:underline font-medium">
                support Bukly.id
              </Link>
              .
            </p>
          </div>
        )}
      </div>

      {/* Section 2 — Pricing cards */}
      <div>
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6">Pilih Paket</p>
        <PricingCards currentSubscription={subscription} />
      </div>

      {/* Catatan kecil */}
      <p className="text-xs text-stone-400 text-center mt-8 leading-relaxed">
        Semua transaksi diproses secara aman melalui Midtrans. Batalkan kapan saja.
        <br />
        Ada pertanyaan?{" "}
        <Link href="https://wa.me/6281234567890" className="text-indigo-600 hover:underline">
          Hubungi kami via WhatsApp
        </Link>
        .
      </p>
    </main>
  );
}
