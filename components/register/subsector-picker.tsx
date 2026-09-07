"use client";

import React from "react";
import { Sparkles, Building2, Car, Stethoscope } from "lucide-react";

export interface SubsectorPickerProps {
  selectedSector?: string;
  selectedSubsector?: string;
  onSelectSector: (sector: string) => void;
  onSelectSubsector: (subsector: string) => void;
  onSelectOther: (customText: string) => void;
  customOtherText?: string;
}

const SECTORS = [
  { id: "beauty", label: "Kecantikan", icon: <Sparkles className="w-5 h-5" />, desc: "Salon, Barbershop" },
  { id: "space", label: "Tempat", icon: <Building2 className="w-5 h-5" />, desc: "Studio, Futsal" },
  { id: "auto", label: "Otomotif", icon: <Car className="w-5 h-5" />, desc: "Cuci Mobil, Bengkel" },
  { id: "health", label: "Kesehatan", icon: <Stethoscope className="w-5 h-5" />, desc: "Dokter, Terapis" },
];

const SUB_SECTORS: Record<string, { id: string; label: string }[]> = {
  beauty: [
    { id: "salon", label: "Salon Kecantikan Umum" },
    { id: "barber", label: "Barbershop / Pangkas" },
    { id: "eyelash", label: "Eyelash Extension" },
    { id: "nailart", label: "Nail Art & Salon" },
    { id: "spa_pijat", label: "Spa & Pijat" },
    { id: "lainnya", label: "Lainnya" },
  ],
  auto: [
    { id: "bengkel", label: "Bengkel / Servis" },
    { id: "detailing", label: "Cuci Mobil & Detailing" },
    { id: "lainnya", label: "Lainnya" },
  ],
  space: [
    { id: "studio_foto", label: "Studio Foto / Fotografi" },
    { id: "lapangan_futsal", label: "Lapangan Futsal" },
    { id: "lapangan_padel", label: "Lapangan Padel" },
    { id: "coworking", label: "Coworking Space / Office" },
    { id: "lainnya", label: "Lainnya" },
  ],
  health: [
    { id: "klinik", label: "Klinik / Dokter" },
    { id: "konsultasi", label: "Konsultasi / Psikolog" },
    { id: "lainnya", label: "Lainnya" },
  ],
};

export function SubsectorPicker({
  selectedSector,
  selectedSubsector,
  onSelectSector,
  onSelectSubsector,
  onSelectOther,
  customOtherText,
}: SubsectorPickerProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-stone-700">Sektor Bisnis</label>
        <div className="grid grid-cols-2 gap-3">
          {SECTORS.map((sector) => (
            <div
              key={sector.id}
              onClick={() => {
                if (selectedSector !== sector.id) {
                  onSelectSector(sector.id);
                  onSelectSubsector("");
                  onSelectOther("");
                }
              }}
              className={`cursor-pointer border rounded-xl p-3 flex flex-col items-start gap-1.5 transition-all ${
                selectedSector === sector.id
                  ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600 shadow-sm"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  selectedSector === sector.id
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {sector.icon}
              </div>
              <span className="text-sm font-bold text-stone-900 mt-1">{sector.label}</span>
              <span className="text-[10px] text-stone-500 leading-tight">{sector.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedSector && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-[13px] font-semibold text-stone-700">Sub Sektor</label>
          <div className="flex flex-wrap gap-2">
            {SUB_SECTORS[selectedSector]?.map((sub) => (
              <div
                key={sub.id}
                onClick={() => {
                  onSelectSubsector(sub.id);
                  if (sub.id !== "lainnya") {
                    onSelectOther("");
                  }
                }}
                className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  selectedSubsector === sub.id
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                {sub.label}
              </div>
            ))}
          </div>

          {selectedSubsector === "lainnya" && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-300">
              <input
                type="text"
                value={customOtherText || ""}
                onChange={(e) => onSelectOther(e.target.value)}
                placeholder="Ketik spesifik bisnis kamu..."
                className="w-full h-11 px-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-stone-700"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
