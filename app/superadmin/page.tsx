import { getPlatformStats, getAllTenants } from "@/lib/actions/superadmin.actions";
import { Users, Store, TrendingUp, Activity } from "lucide-react";
import { TenantTable } from "./tenant-table";

export default async function SuperAdminDashboard() {
  const stats = await getPlatformStats();
  const tenants = await getAllTenants();

  return (
    <div className="space-y-6">
      {/* ── Kartu Statistik ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 text-stone-500 mb-2">
            <Store className="w-5 h-5 text-stone-400" />
            <h3 className="font-semibold text-sm">Total Tenant</h3>
          </div>
          <p className="text-3xl font-extrabold text-stone-900">{stats.totalTenants}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 text-stone-500 mb-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-sm">Tenant Aktif</h3>
          </div>
          <p className="text-3xl font-extrabold text-stone-900">{stats.activeTenants}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 text-stone-500 mb-2">
            <Users className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-sm">Nonaktif / Churn</h3>
          </div>
          <p className="text-3xl font-extrabold text-stone-900">{stats.inactiveTenants}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm ring-1 ring-indigo-500/20">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Est. Pendapatan / Bulan</h3>
          </div>
          <p className="text-3xl font-extrabold text-indigo-700">
            Rp {stats.totalMRR.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* ── Tabel Tenant (Client Component) ── */}
      <TenantTable tenants={tenants as any} />
    </div>
  );
}
