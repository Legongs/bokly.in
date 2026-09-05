"use client";

import Link from "next/link";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpsellBannerProps {
  feature: string;
  requiredPlan: "pro" | "bisnis";
  description: string;
}

const PLAN_LABEL: Record<"pro" | "bisnis", string> = {
  pro: "Pro",
  bisnis: "Bisnis",
};

const PLAN_PRICE: Record<"pro" | "bisnis", string> = {
  pro: "Rp 49.000/bulan",
  bisnis: "Rp 119.000/bulan",
};

export function UpsellBanner({ feature, requiredPlan, description }: UpsellBannerProps) {
  return (
    <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
      {/* Ikon */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center">
        <Lock className="w-5 h-5 text-teal-700" />
      </div>

      {/* Teks */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            Fitur Paket {PLAN_LABEL[requiredPlan]}
          </span>
        </div>
        <h3 className="text-base font-extrabold text-stone-900 mb-1">
          {feature} tersedia di Paket {PLAN_LABEL[requiredPlan]}
        </h3>
        <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
        <p className="text-xs text-teal-600 font-semibold mt-2">
          Mulai dari {PLAN_PRICE[requiredPlan]} · Batalkan kapan saja
        </p>
      </div>

      {/* CTA */}
      <div className="flex-shrink-0 w-full sm:w-auto">
        <Link href="/dashboard/billing">
          <Button
            id={`upsell-${feature.toLowerCase().replace(/\s+/g, "-")}`}
            className="w-full sm:w-auto bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md shadow-teal-600/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 gap-2"
          >
            Upgrade Sekarang
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
