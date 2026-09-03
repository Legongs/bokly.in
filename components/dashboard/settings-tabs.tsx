"use client";

import { useState } from "react";
import { Store, Palette, Smartphone, CreditCard } from "lucide-react";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { SiteSettings } from "@/components/dashboard/site-settings";
import { WaSettings } from "@/components/dashboard/wa-settings";
import { PaymentSettings } from "@/components/dashboard/payment-settings";
import { CalendarSettings } from "@/components/dashboard/calendar-settings";
import { CalendarDays } from "lucide-react";
import type { Tenant } from "@/types/database.types";
import { cn } from "@/lib/utils";

interface SettingsTabsProps {
  tenant: Tenant;
}

export function SettingsTabs({ tenant }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<"store" | "calendar" | "wa" | "payment" | "site">("store");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex bg-stone-100/50 p-1.5 rounded-2xl border border-stone-200 w-full sm:w-fit mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab("store")}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
            activeTab === "store"
              ? "bg-white text-teal-700 shadow-sm border border-stone-200/50 scale-[1.02]"
              : "text-stone-500 hover:text-stone-700 hover:bg-stone-100 border border-transparent"
          )}
        >
          <Store className="w-4 h-4" />
          <span className="hidden sm:inline">Pengaturan Toko</span>
          <span className="sm:hidden">Toko</span>
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
            activeTab === "calendar"
              ? "bg-white text-teal-700 shadow-sm border border-stone-200/50 scale-[1.02]"
              : "text-stone-500 hover:text-stone-700 hover:bg-stone-100 border border-transparent"
          )}
        >
          <CalendarDays className="w-4 h-4" />
          <span className="hidden sm:inline">Jadwal</span>
          <span className="sm:hidden">Jadwal</span>
        </button>
        <button
          onClick={() => setActiveTab("wa")}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
            activeTab === "wa"
              ? "bg-white text-teal-700 shadow-sm border border-stone-200/50 scale-[1.02]"
              : "text-stone-500 hover:text-stone-700 hover:bg-stone-100 border border-transparent"
          )}
        >
          <span className="hidden sm:inline">Notifikasi WA</span>
          <span className="sm:hidden">WA</span>
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
            activeTab === "payment"
              ? "bg-white text-teal-700 shadow-sm border border-stone-200/50 scale-[1.02]"
              : "text-stone-500 hover:text-stone-700 hover:bg-stone-100 border border-transparent"
          )}
        >
          <CreditCard className="w-4 h-4" />
          <span className="hidden sm:inline">Pembayaran</span>
          <span className="sm:hidden">Bayar</span>
        </button>
        <button
          onClick={() => setActiveTab("site")}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
            activeTab === "site"
              ? "bg-white text-teal-700 shadow-sm border border-stone-200/50 scale-[1.02]"
              : "text-stone-500 hover:text-stone-700 hover:bg-stone-100 border border-transparent"
          )}
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">Tampilan & Publik</span>
          <span className="sm:hidden">Ekstra</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in zoom-in-95 duration-200">
        {activeTab === "store" && <SettingsForm tenant={tenant} />}
        {activeTab === "calendar" && <CalendarSettings tenant={tenant} />}
        {activeTab === "wa" && <WaSettings tenant={tenant} />}
        {activeTab === "payment" && <PaymentSettings tenant={tenant} />}
        {activeTab === "site" && <SiteSettings tenant={tenant} />}
      </div>
    </div>
  );
}
