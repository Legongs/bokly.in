"use client";

import { useState, useTransition } from "react";
import { Loader2, RotateCcw, Save, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  resetFeatureFlagsConfig,
  updateFeatureFlagsConfig,
} from "@/lib/actions/superadmin.actions";
import {
  BOOLEAN_FEATURE_FIELDS,
  NUMERIC_FEATURE_FIELDS,
  type PlanKey,
} from "@/lib/plan-features";
import type { FeatureFlagsConfig, PlanConfig, SupportLevel } from "@/lib/subscription";

/**
 * Matrix feature flags: baris = fitur, kolom = paket.
 *
 * CATATAN IMPOR: file ini client component, jadi dari "@/lib/subscription" cuma
 * boleh ambil TYPE (import type). Kalau ambil nilai/fungsi, lib/supabase/server
 * ikut kebawa ke bundle browser dan build-nya gagal.
 */

const PLAN_COLUMNS: { key: PlanKey; label: string; accent: string }[] = [
  { key: "free", label: "Gratis", accent: "text-stone-600" },
  { key: "pro", label: "Pro", accent: "text-indigo-700" },
  { key: "bisnis", label: "Bisnis", accent: "text-amber-600" },
];

const SUPPORT_OPTIONS: { value: SupportLevel; label: string }[] = [
  { value: "community", label: "Pusat bantuan" },
  { value: "email", label: "Email 2×24 jam" },
  { value: "whatsapp", label: "WhatsApp prioritas" },
];

type PlanFieldValue = number | null | boolean | SupportLevel;

/**
 * Update satu sel matrix. Cast ke PlanConfig dibutuhkan karena TypeScript nggak
 * bisa nyempitin computed key (`[key]: value`) ke field spesifik — nilai yang
 * masuk sendiri sudah dibatasi tipe pemanggilnya.
 */
function patchPlan(
  prev: FeatureFlagsConfig,
  plan: PlanKey,
  key: keyof PlanConfig,
  value: PlanFieldValue
): FeatureFlagsConfig {
  return { ...prev, [plan]: { ...prev[plan], [key]: value } as PlanConfig };
}

export function FeatureFlagsSettings({ initialConfig }: { initialConfig: FeatureFlagsConfig }) {
  const [config, setConfig] = useState<FeatureFlagsConfig>(initialConfig);
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, startTransition] = useTransition();

  const update = (plan: PlanKey, key: keyof PlanConfig, value: PlanFieldValue) => {
    setConfig((prev) => patchPlan(prev, plan, key, value));
    setIsDirty(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateFeatureFlagsConfig(config);
      if (res.success) {
        setIsDirty(false);
        toast.success("Konfigurasi fitur tersimpan. Perubahan langsung berlaku.");
      } else {
        toast.error(res.error || "Gagal menyimpan konfigurasi fitur.");
      }
    });
  };

  const handleReset = () => {
    if (!confirm("Balikin semua batas & fitur ke setelan default bawaan kode?")) return;
    startTransition(async () => {
      // Action balikin config default-nya, jadi form bisa langsung nyusul
      // tanpa perlu sinkron lewat useEffect.
      const res = await resetFeatureFlagsConfig();
      if (res.success && res.data) {
        setConfig(res.data);
        setIsDirty(false);
        toast.success("Sudah dibalikin ke default.");
      } else {
        toast.error(res.error || "Gagal reset konfigurasi.");
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Feature Flags per Paket</h2>
          <p className="text-sm text-stone-500">
            Atur batas & fitur tiap paket langsung dari sini — nggak perlu deploy ulang. Kosongkan
            centang <strong>Unlimited</strong> kalau mau pakai angka.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleReset}
            disabled={isPending}
            variant="outline"
            className="border-stone-300 text-stone-600 gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Default
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {isDirty && (
        <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2.5 items-start">
          <SlidersHorizontal className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            Ada perubahan yang belum disimpan. Begitu disimpan, batas & fitur ini langsung berlaku
            buat semua tenant.
          </p>
        </div>
      )}

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full min-w-[640px] text-sm border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="text-left font-bold text-stone-500 text-xs uppercase tracking-wide pb-3 w-[38%]">
                Fitur / Batas
              </th>
              {PLAN_COLUMNS.map((col) => (
                <th key={col.key} className={`text-center font-bold pb-3 ${col.accent}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NUMERIC_FEATURE_FIELDS.map((field) => (
              <tr key={field.key} className="border-t border-stone-100">
                <td className="py-3 pr-4 align-top">
                  <span className="font-semibold text-stone-800">{field.label}</span>
                  <span className="block text-xs text-stone-400">
                    Unlimited = tanpa batas ({field.unit})
                  </span>
                </td>
                {PLAN_COLUMNS.map((col) => {
                  const value = config[col.key][field.key];
                  const isUnlimited = value === null;
                  return (
                    <td key={col.key} className="py-3 px-2 align-top">
                      <div className="flex flex-col items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          aria-label={`${field.label} paket ${col.label}`}
                          value={isUnlimited ? "" : value}
                          disabled={isUnlimited}
                          onChange={(e) =>
                            update(
                              col.key,
                              field.key,
                              e.target.value === "" ? 0 : Math.max(0, Number(e.target.value))
                            )
                          }
                          className="w-24 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-center focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-stone-100 disabled:text-stone-400"
                        />
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isUnlimited}
                            onChange={(e) =>
                              update(col.key, field.key, e.target.checked ? null : field.fallback)
                            }
                            className="w-3.5 h-3.5 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          Unlimited
                        </label>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}

            {BOOLEAN_FEATURE_FIELDS.map((field) => (
              <tr key={field.key} className="border-t border-stone-100">
                <td className="py-3 pr-4 align-middle">
                  <span className="font-semibold text-stone-800">{field.label}</span>
                  <span className="block text-xs text-stone-400">{field.hint}</span>
                </td>
                {PLAN_COLUMNS.map((col) => (
                  <td key={col.key} className="py-3 px-2 align-middle">
                    <div className="flex justify-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          aria-label={`${field.label} paket ${col.label}`}
                          checked={config[col.key][field.key]}
                          onChange={(e) => update(col.key, field.key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </td>
                ))}
              </tr>
            ))}

            <tr className="border-t border-stone-100">
              <td className="py-3 pr-4 align-middle">
                <span className="font-semibold text-stone-800">Level support</span>
                <span className="block text-xs text-stone-400">
                  Dipakai sebagai teks di kartu harga
                </span>
              </td>
              {PLAN_COLUMNS.map((col) => (
                <td key={col.key} className="py-3 px-2 align-middle">
                  <select
                    aria-label={`Level support paket ${col.label}`}
                    value={config[col.key].supportLevel}
                    onChange={(e) => update(col.key, "supportLevel", e.target.value as SupportLevel)}
                    className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs font-semibold text-stone-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {SUPPORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-xs text-stone-400 mt-5 leading-relaxed">
        Kalau row <code className="text-stone-500">feature_flags_config</code> di app_settings
        dihapus, sistem otomatis balik ke default bawaan kode — nggak bakal error.
      </p>
    </div>
  );
}
