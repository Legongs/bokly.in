// components/customer/step-service-select.tsx
// Step 1: Pilih Layanan — menampilkan filter kategori + daftar kartu layanan
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { formatIDR } from "@/lib/booking-utils";
import type { Service } from "@/types/database.types";
import type { ThemeStyle } from "@/lib/booking-utils";
import type { BusinessDictionary } from "@/lib/dictionaries";

interface StepServiceSelectProps {
  services: Service[];
  selectedService: Service | null;
  selectedCategory: string;
  activeStep: number;
  t: ThemeStyle;
  dictionary?: BusinessDictionary;
  onSelectService: (svc: Service) => void;
  onChangeStep: (step: number) => void;
  onSelectCategory: (cat: string) => void;
}

/** Kartu pemilihan layanan tunggal dengan radio indicator. */
function ServiceCard({ service, isSelected, onSelect, t }: {
  service: Service;
  isSelected: boolean;
  onSelect: () => void;
  t: ThemeStyle;
}) {
  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none flex items-start justify-between gap-3 ${
        isSelected
          ? `${t.borderPrimary} ${t.bgLight} shadow-sm ${t.shadowPrimary}`
          : `border-stone-200 bg-white ${t.hoverBorder} ${t.bgLighter} active:scale-[0.99]`
      }`}
    >
      {/* Radio indicator */}
      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? `${t.borderPrimary} ${t.bgPrimary}` : "border-stone-300"}`}>
        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-stone-900 leading-snug">{service.name}</h4>
        <p className="text-xs text-stone-500 mt-0.5">{service.duration_minutes} menit</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-sm ${t.textPrimary}`}>{formatIDR(Number(service.price))}</p>
        {Number(service.dp_amount) > 0 && (
          <p className="text-[11px] text-stone-500 mt-0.5">DP {formatIDR(Number(service.dp_amount))}</p>
        )}
      </div>
    </div>
  );
}

export function StepServiceSelect({
  services, selectedService, selectedCategory, activeStep, t, dictionary,
  onSelectService, onChangeStep, onSelectCategory,
}: StepServiceSelectProps) {
  const categories = ["Semua", ...Array.from(new Set(services.map((s) => s.category).filter(Boolean) as string[]))];
  const filteredServices = services.filter((s) => selectedCategory === "Semua" || s.category === selectedCategory);
  const isActive = activeStep === 1;

  return (
    <Card className={`border-none shadow-md shadow-stone-200/50 rounded-3xl overflow-hidden bg-white transition-all ${!isActive ? "opacity-70 grayscale-[0.3]" : ""}`}>
      <CardHeader className="pb-3 border-b border-stone-50 bg-stone-50/30 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2 text-stone-800">
            <span className={`w-6 h-6 rounded-full ${isActive ? t.bgStep : "bg-stone-200"} ${isActive ? t.textPrimary : "text-stone-500"} text-xs font-extrabold flex items-center justify-center flex-shrink-0`}>
              1
            </span>
            {dictionary?.selectServicePrompt || "Mau Perawatan Apa?"}
          </CardTitle>
          {isActive && (
            <CardDescription className="text-stone-500 mt-1">
              Pilih aja {dictionary?.serviceLabel?.toLowerCase() || "layanan"} yang paling pas buat kamu hari ini
            </CardDescription>
          )}
        </div>
        {activeStep > 1 && (
          <Button variant="ghost" size="sm" onClick={() => onChangeStep(1)} className="text-stone-500 hover:text-stone-800 shrink-0 h-8 transition-colors duration-200">
            Ubah
          </Button>
        )}
      </CardHeader>

      {/* Daftar layanan — aktif */}
      <CardContent className={`pt-4 ${isActive ? "block" : "hidden"}`} role="radiogroup" aria-label={`Pilih ${dictionary?.serviceLabel?.toLowerCase() || "layanan"}`}>
        {/* Filter kategori — horizontal scroll sesuai aturan ui_ux.md */}
        {categories.length > 1 && (
          <div className="flex overflow-x-auto gap-2 pb-3 mb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  selectedCategory === cat
                    ? `${t.bgPrimary} text-white shadow-md ${t.shadowBtn}`
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
        <div className="space-y-2.5">
          {filteredServices.map((svc) => (
            <ServiceCard key={svc.id} service={svc} t={t} isSelected={selectedService?.id === svc.id} onSelect={() => onSelectService(svc)} />
          ))}
          {filteredServices.length === 0 && (
            <p className="text-center text-sm text-stone-400 py-4 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Tidak ada layanan di kategori ini.
            </p>
          )}
        </div>
      </CardContent>

      {/* Ringkasan layanan — collapsed */}
      {activeStep > 1 && selectedService && (
        <CardContent className="pt-4 pb-4">
          <div className="flex justify-between items-center bg-stone-50 p-3 rounded-2xl border border-stone-100">
            <div>
              <p className="text-sm font-bold text-stone-800">{selectedService.name}</p>
              <p className="text-xs text-stone-500">{selectedService.duration_minutes} menit</p>
            </div>
            <p className={`font-bold text-sm ${t.textPrimary}`}>{formatIDR(Number(selectedService.price))}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
