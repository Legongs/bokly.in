"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Wifi, Wind, Car, Toilet, ChefHat, ConciergeBell, Volume2,
  Accessibility, Cctv, Zap, Droplets, Check, Save, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFacilities, updateFacilities } from "@/lib/actions/facility.actions";
import type { FacilityType } from "@/lib/actions/facility.actions";
import { toast } from "sonner";

const FACILITY_OPTIONS: { type: FacilityType; label: string; icon: React.ElementType }[] = [
  { type: "wifi",                icon: Wifi,          label: "Wi-Fi" },
  { type: "ac",                  icon: Wind,          label: "AC / Pendingin" },
  { type: "parking",             icon: Car,           label: "Parkir" },
  { type: "toilet",              icon: Toilet,        label: "Toilet" },
  { type: "kitchen",             icon: ChefHat,       label: "Dapur / Pantry" },
  { type: "reception",           icon: ConciergeBell, label: "Resepsionis" },
  { type: "soundproof",          icon: Volume2,       label: "Kedap Suara" },
  { type: "wheelchair_accessible", icon: Accessibility, label: "Akses Kursi Roda" },
  { type: "cctv",                icon: Cctv,          label: "CCTV" },
  { type: "generator",           icon: Zap,           label: "Genset / UPS" },
  { type: "water_dispenser",     icon: Droplets,      label: "Dispenser Air" },
];

export function FacilitiesSettings() {
  const [selected, setSelected] = useState<Set<FacilityType>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Muat data fasilitas yang sudah tersimpan
  useEffect(() => {
    getFacilities().then((res) => {
      if (res.success && res.data) {
        setSelected(new Set(res.data.map((f) => f.facility_type)));
      }
      setIsLoading(false);
    });
  }, []);

  const toggle = (type: FacilityType) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateFacilities(Array.from(selected));
      if (res.success) {
        toast.success("Fasilitas berhasil disimpan!");
      } else {
        toast.error(res.error ?? "Gagal menyimpan fasilitas.");
      }
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-[2rem] shadow-md shadow-stone-200/50 border-none overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="text-xl font-extrabold text-stone-900 mb-1">Fasilitas Tersedia</h3>
      <p className="text-sm text-stone-500 mb-6">
        Pilih fasilitas yang tersedia di lokasi Anda. Akan tampil di halaman booking sebagai informasi untuk pelanggan.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {FACILITY_OPTIONS.map(({ type, label, icon: Icon }) => {
            const isChecked = selected.has(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggle(type)}
                className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 text-center select-none active:scale-95 ${
                  isChecked
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-stone-200 bg-stone-50 text-stone-500 hover:border-stone-300 hover:bg-stone-100"
                }`}
              >
                {isChecked && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
                <Icon className={`w-6 h-6 ${isChecked ? "text-indigo-600" : "text-stone-400"}`} />
                <span className="text-xs font-semibold leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="pt-5 border-t border-stone-100">
        <Button
          onClick={handleSave}
          disabled={isPending || isLoading}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Simpan Fasilitas
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
