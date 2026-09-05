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
import type { DashboardMetrics } from "@/lib/actions/analytics.actions";
import type { BusinessDictionary } from "@/lib/business-dictionary";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface AnalyticsViewProps {
  analytics: DashboardMetrics;
  dictionary: BusinessDictionary;
}

export function AnalyticsView({ analytics, dictionary }: AnalyticsViewProps) {
  const { totalRevenue, totalBookings, topServices, recentTrend, completedBookings, cancelledBookings } = analytics;

  // Cari max value untuk scaling chart
  const maxTrendValue = Math.max(...recentTrend.map(t => t.value), 1);

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-2">
      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-extrabold text-stone-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          Analisis Usaha
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Pantau performa bisnis dan cari tahu apa yang paling disukai pelangganmu.
        </p>
      </div>

      {/* ── Top Metrics ── */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-[2rem] border-none shadow-md shadow-stone-200/50 bg-white overflow-hidden p-0 sm:p-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-stone-500 mb-3">
              <Wallet className="w-4 h-4 text-indigo-600" />
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

        <Card className="rounded-[2rem] border-none shadow-md shadow-stone-200/50 bg-white overflow-hidden p-0 sm:p-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-stone-500 mb-3">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
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

      {/* ── Trend Chart ── */}
      <Card className="rounded-[2rem] border-none shadow-md shadow-stone-200/50 bg-white overflow-hidden p-0 sm:p-0">
        <CardContent className="p-6">
          <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-violet-500" />
            Tren Pendapatan 30 Hari Terakhir
          </h3>
          <div className="h-48 flex items-end gap-1.5 w-full overflow-x-auto scrollbar-hide pb-2">
            {recentTrend.map((t, idx) => {
              const heightPercent = (t.value / maxTrendValue) * 100;
              return (
                <div key={idx} className="relative h-full flex flex-col justify-end items-center flex-1 group" style={{ minWidth: "12px" }}>
                  <div
                    className="w-full bg-indigo-500 rounded-sm transition-all duration-300 hover:bg-indigo-400"
                    style={{ height: `${heightPercent}%`, minHeight: "2px" }}
                  >
                  </div>
                  {/* Tooltip pada hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 bg-stone-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap shadow-xl">
                    <p className="font-bold">{new Date(t.date + "T00:00:00").toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}</p>
                    <p>{formatCurrency(t.value)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
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
                    <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg text-xs font-bold">
                      <TrendingUp className="w-3 h-3" />
                      {service.bookings}x
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Status Metrics */}
        <div className="space-y-4">
          <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-orange-500" />
            Status Reservasi
          </h3>
          <Card className="rounded-[2rem] border-none shadow-sm bg-amber-50/50 p-5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-stone-600">Diselesaikan</span>
              <span className="text-lg font-extrabold text-stone-900">{completedBookings}</span>
            </div>
            <p className="text-xs text-stone-500">Reservasi sukses dikerjakan</p>
          </Card>
          <Card className="rounded-[2rem] border-none shadow-sm bg-rose-50/50 p-5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-stone-600">Dibatalkan</span>
              <span className="text-lg font-extrabold text-stone-900">{cancelledBookings}</span>
            </div>
            <p className="text-xs text-stone-500">Reservasi tidak jadi/batal</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
