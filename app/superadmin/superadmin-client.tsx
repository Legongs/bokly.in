"use client";

import { useState } from "react";
import { Users, Settings, Tag } from "lucide-react";
import { TenantTable } from "./tenant-table";
import { PricingSettings } from "./pricing-settings";
import { VoucherManager } from "./voucher-manager";
import { MidtransSettings } from "./midtrans-settings";
import { CreditCard } from "lucide-react";

interface SuperadminClientProps {
  tenants: any[];
  prices: any;
  vouchers: any[];
  midtransConfig: any;
}

export function SuperadminClient({ tenants, prices, vouchers, midtransConfig }: SuperadminClientProps) {
  const [activeTab, setActiveTab] = useState<"tenants" | "pricing" | "vouchers" | "payment">("tenants");

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-px">
        <button
          onClick={() => setActiveTab("tenants")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "tenants"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
          }`}
        >
          <Users className="w-4 h-4" />
          Daftar Tenant
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "pricing"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
          }`}
        >
          <Settings className="w-4 h-4" />
          Pengaturan Harga
        </button>
        <button
          onClick={() => setActiveTab("vouchers")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "vouchers"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
          }`}
        >
          <Tag className="w-4 h-4" />
          Voucher Promo
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "payment"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Gateway Payment
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === "tenants" && <TenantTable tenants={tenants} />}
        {activeTab === "pricing" && <PricingSettings initialPrices={prices} />}
        {activeTab === "vouchers" && <VoucherManager initialVouchers={vouchers} />}
        {activeTab === "payment" && <MidtransSettings initialConfig={midtransConfig} />}
      </div>
    </div>
  );
}
