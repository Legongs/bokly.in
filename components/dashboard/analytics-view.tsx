"use client";

import React from "react";
import { 
  BarChart3, 
  Wallet, 
  CheckCircle2, 
  Trophy, 
  Clock, 
  Lightbulb,
  TrendingUp,
  Activity
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { TenantAnalytics } from "@/lib/actions/analytics.actions";
import type { BusinessDictionary } from "@/lib/business-dictionary";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface AnalyticsViewProps {
  analytics: TenantAnalytics;
  dictionary: BusinessDictionary;
}

export function AnalyticsView({ analytics, dictionary }: AnalyticsViewProps) {
  const { totalRevenue, totalBookings, topServices, peakHours, smartSuggestion } = analytics;

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-2">
      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-extrabold text-stone-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-600" />
          Analisis Usaha
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Pantau performa bisnis dan cari tahu apa yang paling disukai pelangganmu.
        </p>
      </div>

      {/* ── Smart Suggestion Card ── */}
      {smartSuggestion && (
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-3xl p-5 border border-orange-200/60 shadow-sm relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-200/40 rounded-full blur-2xl" aria-hidden="true" />
          
          <div className="flex items-start gap-3 relative">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/20 rotate-3">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-orange-900 mb-1">Saran Pintar Buat Kamu</h3>
              <p className="text-sm text-orange-800 leading-relaxed">
                {smartSuggestion}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Metrics ── */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-3xl border-none shadow-md shadow-stone-200/50 bg-white overflow-hidden p-0 sm:p-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-stone-500 mb-3">
              <Wallet className="w-4 h-4 text-teal-600" />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Pendapatan
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-xs text-stone-400 mt-1 font-medium">Dari booking disetujui</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-md shadow-stone-200/50 bg-white overflow-hidden p-0 sm:p-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-stone-500 mb-3">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                Total Sukses
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              {totalBookings} <span className="text-sm font-semibold text-stone-400">{dictionary.bookingLabel}</span>
            </p>
            <p className="text-xs text-stone-400 mt-1 font-medium">Telah diselesaikan</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Detail Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        
        {/* Top Services */}
        <div>
          <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-yellow-500" />
            {dictionary.serviceLabel} Terlaris
          </h3>
          <div className="bg-white rounded-[2rem] border-none shadow-md shadow-stone-200/50 overflow-hidden">
            {topServices.length === 0 ? (
              <div className="p-6 text-center text-sm text-stone-500">
                Belum ada data {dictionary.serviceLabel.toLowerCase()} terjual nih.
              </div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {topServices.map((service, idx) => (
                  <li key={service.id} className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-stone-800 text-sm">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-2 py-1 rounded-lg text-xs font-bold">
                      <TrendingUp className="w-3 h-3" />
                      {service.count}x
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Peak Hours */}
        <div>
          <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-rose-500" />
            Jam Paling Ramai
          </h3>
          <div className="bg-white rounded-[2rem] border-none shadow-md shadow-stone-200/50 overflow-hidden">
            {peakHours.length === 0 ? (
              <div className="p-6 text-center text-sm text-stone-500">
                Belum ada data jam sibuk nih.
              </div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {peakHours.map((peak, idx) => (
                  <li key={peak.hour} className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </span>
                      <span className="font-bold text-stone-800">{peak.hour} WIB</span>
                    </div>
                    <div className="text-sm font-semibold text-stone-500">
                      {peak.count} Booking
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
