"use client";

import { useState } from "react";
import { Users, Settings, Tag, ToggleLeft, MessageCircle } from "lucide-react";
import { TenantTable } from "./tenant-table";
import { PricingSettings } from "./pricing-settings";
import { VoucherManager } from "./voucher-manager";
import { MidtransSettings } from "./midtrans-settings";
import { FeatureFlagsSettings } from "./feature-flags-settings";
import { GlobalWaSettings } from "./global-wa-settings";
import { CreditCard } from "lucide-react";
import type { FeatureFlagsConfig } from "@/lib/subscription";
import type { MaskedGlobalFonnteConfig } from "@/lib/global-wa";

interface SuperadminClientProps {
  tenants: any[];
  prices: any;
  vouchers: any[];
  midtransConfig: any;
  featureFlags: FeatureFlagsConfig;
  globalWaConfig: MaskedGlobalFonnteConfig;
}

type TabKey = "tenants" | "pricing" | "features" | "vouchers" | "payment" | "autowa";

const TABS: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: "tenants", label: "Daftar Tenant", icon: Users },
  { key: "pricing", label: "Pengaturan Harga", icon: Settings },
  { key: "features", label: "Feature Flags", icon: ToggleLeft },
  { key: "vouchers", label: "Voucher Promo", icon: Tag },
  { key: "payment", label: "Gateway Payment", icon: CreditCard },
  { key: "autowa", label: "WA Otomatis", icon: MessageCircle },
];

export function SuperadminClient({
  tenants,
  prices,
  vouchers,
  midtransConfig,
  featureFlags,
  globalWaConfig,
}: SuperadminClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("tenants");

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-px overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "tenants" && <TenantTable tenants={tenants} />}
        {activeTab === "pricing" && <PricingSettings initialPrices={prices} />}
        {activeTab === "features" && <FeatureFlagsSettings initialConfig={featureFlags} />}
        {activeTab === "vouchers" && <VoucherManager initialVouchers={vouchers} />}
        {activeTab === "payment" && <MidtransSettings initialConfig={midtransConfig} />}
        {activeTab === "autowa" && <GlobalWaSettings initialConfig={globalWaConfig} />}
      </div>
    </div>
  );
}
