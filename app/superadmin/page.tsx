import { getPlatformStats, getAllTenants } from "@/lib/actions/superadmin.actions";
import { Users, Store, TrendingUp, Activity, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function SuperAdminDashboard() {
  const stats = await getPlatformStats();
  const tenants = await getAllTenants();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 text-stone-500 mb-2">
            <Store className="w-5 h-5 text-stone-400" />
            <h3 className="font-semibold text-sm">Total Tenants</h3>
          </div>
          <p className="text-3xl font-extrabold text-stone-900">{stats.totalTenants}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 text-stone-500 mb-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold text-sm">Active Tenants</h3>
          </div>
          <p className="text-3xl font-extrabold text-stone-900">{stats.activeTenants}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 text-stone-500 mb-2">
            <Users className="w-5 h-5 text-rose-400" />
            <h3 className="font-semibold text-sm">Inactive / Churn</h3>
          </div>
          <p className="text-3xl font-extrabold text-stone-900">{stats.inactiveTenants}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm ring-1 ring-indigo-500/20">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Est. MRR</h3>
          </div>
          <p className="text-3xl font-extrabold text-indigo-700">
            Rp {stats.totalMRR.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-stone-900">Daftar Tenant</h2>
          <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
            {tenants.length} terdaftar
          </span>
        </div>
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
              {tenants.map((tenant: any) => {
                const sub = tenant.subscriptions?.[0] || { plan: "free", status: "active" };
                return (
                  <tr key={tenant.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-stone-900">{tenant.business_name || "Tanpa Nama"}</div>
                      <div className="text-xs text-stone-500 mt-0.5">bukly.id/{tenant.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-stone-600">{tenant.business_sector || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                        sub.plan === 'bisnis' ? 'bg-indigo-100 text-indigo-700' :
                        sub.plan === 'pro' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-stone-100 text-stone-600'
                      }`}>
                        {sub.plan.toUpperCase()}
                      </span>
                      {sub.status !== 'active' && (
                        <span className="ml-2 text-xs text-rose-500 font-medium">({sub.status})</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-stone-600 font-mono text-xs">
                      {tenant.whatsapp_number || "-"}
                    </td>
                    <td className="px-6 py-4 text-stone-500 text-xs">
                      {format(new Date(tenant.created_at), "dd MMM yyyy", { locale: id })}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/${tenant.slug}`} 
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Kunjungi <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    Belum ada tenant yang terdaftar.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
