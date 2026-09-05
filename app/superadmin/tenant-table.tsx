"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  ExternalLink,
  Search,
  ChevronDown,
  Loader2,
  ShieldOff,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { updateTenantPlan, toggleTenantActive } from "@/lib/actions/superadmin.actions";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
type SubscriptionRow = {
  plan: string;
  status: string;
  billing_cycle: string | null;
  current_period_end: string | null;
};

type TenantRow = {
  id: string;
  slug: string;
  business_name: string | null;
  business_sector: string | null;
  whatsapp_number: string | null;
  is_active: boolean;
  created_at: string;
  subscriptions: SubscriptionRow[];
};

// ── Static maps (semua class Tailwind wajib statis sesuai ui_ux.md bagian 5) ─
const PLAN_BADGE_STYLES: Record<string, string> = {
  bisnis: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  pro: "bg-indigo-50 text-indigo-600 border border-indigo-200",
  free: "bg-stone-100 text-stone-600 border border-stone-200",
};

const SECTOR_LABELS: Record<string, string> = {
  beauty: "Kecantikan",
  space: "Tempat",
  auto: "Otomotif",
  health: "Kesehatan",
};

const PLAN_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "bisnis", label: "Bisnis" },
] as const;

const CYCLE_OPTIONS = [
  { value: "monthly", label: "Bulanan" },
  { value: "yearly", label: "Tahunan" },
] as const;

// ── TenantRow Component ───────────────────────────────────────────────────────
function TenantTableRow({ tenant }: { tenant: TenantRow }) {
  const [isPending, startTransition] = useTransition();
  const sub: SubscriptionRow = tenant.subscriptions?.[0] ?? {
    plan: "free",
    status: "active",
    billing_cycle: null,
    current_period_end: null,
  };

  const [selectedPlan, setSelectedPlan] = useState<string>(sub.plan);
  const [selectedCycle, setSelectedCycle] = useState<string>(
    sub.billing_cycle ?? "monthly"
  );
  const [planChanged, setPlanChanged] = useState(false);

  const handlePlanChange = (val: string) => {
    setSelectedPlan(val);
    setPlanChanged(val !== sub.plan || selectedCycle !== (sub.billing_cycle ?? "monthly"));
  };

  const handleCycleChange = (val: string) => {
    setSelectedCycle(val);
    setPlanChanged(selectedPlan !== sub.plan || val !== (sub.billing_cycle ?? "monthly"));
  };

  const handleSavePlan = () => {
    startTransition(async () => {
      const cycle = selectedPlan === "free" ? null : (selectedCycle as "monthly" | "yearly");
      const res = await updateTenantPlan(
        tenant.id,
        selectedPlan as "free" | "pro" | "bisnis",
        cycle
      );
      if (res.success) {
        toast.success(`Plan ${tenant.business_name} diperbarui ke ${selectedPlan.toUpperCase()}.`);
        setPlanChanged(false);
      } else {
        toast.error(res.error ?? "Gagal memperbarui plan.");
      }
    });
  };

  const handleToggleActive = () => {
    const newState = !tenant.is_active;
    const label = newState ? "diaktifkan" : "disuspend";
    startTransition(async () => {
      const res = await toggleTenantActive(tenant.id, newState);
      if (res.success) {
        toast.success(`${tenant.business_name} berhasil ${label}.`);
      } else {
        toast.error(res.error ?? "Gagal mengubah status tenant.");
      }
    });
  };

  return (
    <tr className={`hover:bg-stone-50/50 transition-colors ${!tenant.is_active ? "opacity-60" : ""}`}>
      {/* Nama & Slug */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              tenant.is_active ? "bg-emerald-500" : "bg-stone-300"
            }`}
            title={tenant.is_active ? "Aktif" : "Nonaktif"}
          />
          <div>
            <div className="font-bold text-stone-900">
              {tenant.business_name || "Tanpa Nama"}
            </div>
            <div className="text-xs text-stone-500 mt-0.5 font-mono">
              bukly.id/{tenant.slug}
            </div>
          </div>
        </div>
      </td>

      {/* Sektor */}
      <td className="px-6 py-4">
        {tenant.business_sector ? (
          <span className="capitalize text-stone-700 text-sm font-medium">
            {SECTOR_LABELS[tenant.business_sector] ?? tenant.business_sector}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Belum diisi
          </span>
        )}
      </td>

      {/* Plan — dropdown edit langsung */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              value={selectedPlan}
              onChange={(e) => handlePlanChange(e.target.value)}
              disabled={isPending}
              className="appearance-none pl-2 pr-6 py-1 rounded-md border border-stone-200 text-xs font-bold bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
            >
              {PLAN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
          </div>

          {selectedPlan !== "free" && (
            <div className="relative">
              <select
                value={selectedCycle}
                onChange={(e) => handleCycleChange(e.target.value)}
                disabled={isPending}
                className="appearance-none pl-2 pr-6 py-1 rounded-md border border-stone-200 text-xs font-medium bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
              >
                {CYCLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
            </div>
          )}

          {planChanged && (
            <button
              onClick={handleSavePlan}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              Simpan
            </button>
          )}

          {sub.status !== "active" && (
            <span className="text-xs text-rose-500 font-medium">
              ({sub.status})
            </span>
          )}
        </div>
      </td>

      {/* WhatsApp */}
      <td className="px-6 py-4 text-stone-600 font-mono text-xs whitespace-nowrap">
        {tenant.whatsapp_number || "-"}
      </td>

      {/* Bergabung */}
      <td className="px-6 py-4 text-stone-500 text-xs whitespace-nowrap">
        {format(new Date(tenant.created_at), "dd MMM yyyy", { locale: idLocale })}
      </td>

      {/* Aksi */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/${tenant.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            Buka <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={handleToggleActive}
            disabled={isPending}
            title={tenant.is_active ? "Suspend tenant ini" : "Aktifkan kembali tenant ini"}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
              tenant.is_active
                ? "text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100"
                : "text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            }`}
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : tenant.is_active ? (
              <ShieldOff className="w-3 h-3" />
            ) : (
              <ShieldCheck className="w-3 h-3" />
            )}
            {tenant.is_active ? "Suspend" : "Aktifkan"}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── TenantTable (main export) ─────────────────────────────────────────────────
interface TenantTableProps {
  tenants: TenantRow[];
}

export function TenantTable({ tenants }: TenantTableProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return tenants;
    return tenants.filter(
      (t) =>
        (t.business_name ?? "").toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        (t.business_sector ?? "").toLowerCase().includes(q)
    );
  }, [tenants, query]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-stone-900">Daftar Tenant</h2>
          <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
            {tenants.length} terdaftar
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            id="superadmin-tenant-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama bisnis atau slug..."
            className="pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
            <tr>
              <th className="px-6 py-3">Nama Usaha</th>
              <th className="px-6 py-3">Sektor</th>
              <th className="px-6 py-3">Plan</th>
              <th className="px-6 py-3">WhatsApp</th>
              <th className="px-6 py-3">Bergabung</th>
              <th className="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((tenant) => (
              <TenantTableRow key={tenant.id} tenant={tenant} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                  {query
                    ? `Tidak ada tenant yang cocok dengan "${query}".`
                    : "Belum ada tenant yang terdaftar."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
