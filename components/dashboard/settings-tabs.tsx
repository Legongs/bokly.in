"use client";

import { useState } from "react";
import { Store, CalendarDays, Link as LinkIcon, Palette } from "lucide-react";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { SiteSettings } from "@/components/dashboard/site-settings";
import { WaSettings } from "@/components/dashboard/wa-settings";
import { PaymentSettings } from "@/components/dashboard/payment-settings";
import { CalendarSettings } from "@/components/dashboard/calendar-settings";
import { PortfolioSettings } from "@/components/dashboard/portfolio-settings";
import type { Tenant } from "@/types/database.types";
import { cn } from "@/lib/utils";

interface SettingsTabsProps {
  tenant: Tenant;
}

export function SettingsTabs({ tenant }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<"general" | "operational" | "integrations">("general");

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto scrollbar-hide bg-stone-100/50 p-1.5 rounded-2xl border border-stone-200 w-full mx-auto sm:mx-0">
        <button
          onClick={() => setActiveTab("general")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
            activeTab === "general"
              ? "bg-white text-teal-700 shadow-sm border border-stone-200/50 scale-[1.02]"
              : "text-stone-500 hover:text-stone-700 hover:bg-stone-100 border border-transparent"
          )}
        >
          <Store className="w-4 h-4" />
          <span className="hidden sm:inline">Profil & Tampilan</span>
          <span className="sm:hidden">Profil</span>
        </button>
        <button
          onClick={() => setActiveTab("operational")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
            activeTab === "operational"
              ? "bg-white text-teal-700 shadow-sm border border-stone-200/50 scale-[1.02]"
              : "text-stone-500 hover:text-stone-700 hover:bg-stone-100 border border-transparent"
          )}
        >
          <CalendarDays className="w-4 h-4" />
          <span className="hidden sm:inline">Jadwal Operasional</span>
          <span className="sm:hidden">Jadwal</span>
        </button>
        <button
          onClick={() => setActiveTab("integrations")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
            activeTab === "integrations"
              ? "bg-white text-teal-700 shadow-sm border border-stone-200/50 scale-[1.02]"
              : "text-stone-500 hover:text-stone-700 hover:bg-stone-100 border border-transparent"
          )}
        >
          <LinkIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Pembayaran & Notif</span>
          <span className="sm:hidden">Integrasi</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in zoom-in-95 duration-200">
        {activeTab === "general" && (
          <div className="space-y-8">
            <SettingsForm tenant={tenant} />
            <SiteSettings tenant={tenant} />
            <PortfolioSettings tenant={tenant} />
          </div>
        )}
        
        {activeTab === "operational" && (
          <div className="space-y-8">
            <CalendarSettings tenant={tenant} />
          </div>
        )}
        
        {activeTab === "integrations" && (
          <div className="space-y-8">
            <PaymentSettings tenant={tenant} />
            <WaSettings tenant={tenant} />
          </div>
        )}
      </div>
    </div>
  );
}
