// components/customer/step-service-select.tsx
// Step 1: Pilih Layanan — filter kategori + daftar kartu layanan
// Mendukung: pilih satu layanan, tambah layanan (multi-service), durasi fleksibel (space)
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus, X, Clock, Minus } from "lucide-react";
import { formatIDR } from "@/lib/booking-utils";
import type { Service } from "@/types/database.types";
import type { ThemeStyle } from "@/lib/booking-utils";
import type { BusinessDictionary } from "@/lib/dictionaries";

interface StepServiceSelectProps {
  services: Service[];
  selectedService: Service | null;        // layanan utama/pertama (backward compat)
  selectedServices?: Service[];           // semua layanan yang dipilih (multi-service)
  selectedCategory: string;
  activeStep: number;
  t: ThemeStyle;
  dictionary?: BusinessDictionary;
  customDuration?: number | null;         // durasi kustom untuk layanan fleksibel
  onSelectService: (svc: Service) => void;
  onAddService?: (svc: Service) => void;
  onRemoveService?: (svcId: string) => void;
  onChangeStep: (step: number) => void;
  onSelectCategory: (cat: string) => void;
  onSetCustomDuration?: (minutes: number) => void;
}

/** Kartu pemilihan layanan tunggal dengan radio indicator. */
function ServiceCard({
  service, isSelected, isAdded, onSelect, onAdd, onRemove, t, showAdd,
}: {
  service: Service;
  isSelected: boolean;
  isAdded: boolean;
  onSelect: () => void;
  onAdd?: () => void;
  onRemove?: () => void;
  t: ThemeStyle;
  showAdd?: boolean;
}) {
  const isFlexible = !!(service as any).is_flexible_duration;

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
          : isAdded
            ? `border-stone-400 bg-stone-50`
            : `border-stone-200 bg-white ${t.hoverBorder} ${t.bgLighter} active:scale-[0.99]`
      }`}
    >
      {/* Radio indicator */}
      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? `${t.borderPrimary} ${t.bgPrimary}` : "border-stone-300"}`}>
        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-stone-900 leading-snug">{service.name}</h4>
        {/* Specialty tag badge — beauty sector */}
        {(service as any).specialty_tag && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold">
            {(service as any).specialty_tag}
          </span>
        )}
        {(service as any).is_female_only && (
          <span className="inline-flex items-center gap-1 ml-1.5 mt-1 px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 text-[10px] font-semibold border border-pink-200">
            ♀ Wanita
          </span>
        )}
        <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {isFlexible
            ? `${(service as any).min_duration_minutes || 30}–${(service as any).max_duration_minutes || 480} menit (fleksibel)`
            : `${service.duration_minutes} menit`}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <p className={`font-bold text-sm ${t.textPrimary}`}>
            {isFlexible
              ? `${formatIDR(Number(service.price))}/jam`
              : formatIDR(Number(service.price))}
          </p>
          {!isFlexible && Number(service.dp_amount) > 0 && (
            <p className="text-[11px] text-stone-500 mt-0.5">DP {formatIDR(Number(service.dp_amount))}</p>
          )}
        </div>

        {/* Tombol tambah/hapus untuk multi-service (bukan layanan utama) */}
        {showAdd && onAdd && !isSelected && !isAdded && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            className={`w-7 h-7 rounded-full ${t.bgPrimary} text-white flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity`}
            title="Tambah layanan ini"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        {isAdded && onRemove && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="w-7 h-7 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center flex-shrink-0 hover:bg-rose-100 hover:text-rose-600 transition-colors"
            title="Hapus layanan ini"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Komponen slider durasi fleksibel untuk sektor space. */
function FlexibleDurationPicker({
  service,
  customDuration,
  onSetCustomDuration,
  t,
}: {
  service: Service;
  customDuration: number | null;
  onSetCustomDuration: (minutes: number) => void;
  t: ThemeStyle;
}) {
  const min  = (service as any).min_duration_minutes  || 30;
  const max  = (service as any).max_duration_minutes  || 480;
  const step = (service as any).duration_step_minutes || 30;
  const current = customDuration ?? min;

  // Hitung harga dinamis
  const hourlyRate = Number(service.price); // price = harga per jam
  const dynamicPrice = hourlyRate * (current / 60);

  const decrease = () => { if (current - step >= min) onSetCustomDuration(current - step); };
  const increase = () => { if (current + step <= max) onSetCustomDuration(current + step); };

  return (
    <div className={`mt-3 p-4 rounded-2xl ${t.bgLight} border ${t.borderLight}`}>
      <p className={`text-xs font-bold ${t.textPrimary} uppercase tracking-wide mb-3`}>Pilih Durasi Sewa</p>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={decrease}
          disabled={current <= min}
          className={`w-10 h-10 rounded-full border-2 ${t.borderPrimary} flex items-center justify-center ${t.textPrimary} disabled:opacity-30 disabled:cursor-not-allowed hover:${t.bgLight} transition-all`}
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="text-center flex-1">
          <p className="text-2xl font-black text-stone-800">
            {current >= 60
              ? `${Math.floor(current / 60)}${current % 60 > 0 ? ` jam ${current % 60} mnt` : " jam"}`
              : `${current} mnt`}
          </p>
          <p className={`text-sm font-bold ${t.textPrimary} mt-0.5`}>{formatIDR(dynamicPrice)}</p>
          <p className="text-[11px] text-stone-400">({formatIDR(hourlyRate)}/jam)</p>
        </div>

        <button
          type="button"
          onClick={increase}
          disabled={current >= max}
          className={`w-10 h-10 rounded-full border-2 ${t.borderPrimary} flex items-center justify-center ${t.textPrimary} disabled:opacity-30 disabled:cursor-not-allowed hover:${t.bgLight} transition-all`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Range visual */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onSetCustomDuration(Number(e.target.value))}
        className="w-full mt-3 accent-current"
        style={{ accentColor: "currentColor" }}
      />
      <div className="flex justify-between text-[10px] text-stone-400 mt-1">
        <span>{min} mnt</span>
        <span>{max >= 60 ? `${Math.floor(max / 60)} jam` : `${max} mnt`}</span>
      </div>
    </div>
  );
}

export function StepServiceSelect({
  services, selectedService, selectedServices = [], selectedCategory, activeStep, t, dictionary,
  customDuration,
  onSelectService, onAddService, onRemoveService,
  onChangeStep, onSelectCategory, onSetCustomDuration,
}: StepServiceSelectProps) {
  const categories = ["Semua", ...Array.from(new Set(services.map((s) => s.category).filter(Boolean) as string[]))];
  const filteredServices = services.filter((s) => selectedCategory === "Semua" || s.category === selectedCategory);
  const isActive = activeStep === 1;

  const isFlexibleSelected = !!(selectedService as any)?.is_flexible_duration;

  // Set ID-ID layanan yang sudah ditambahkan (bukan layanan utama)
  const addedServiceIds = new Set(
    selectedServices.filter((s) => s.id !== selectedService?.id).map((s) => s.id)
  );

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
              {onAddService && (
                <span className="block text-[11px] text-stone-400 mt-0.5">Ketuk <Plus className="inline w-3 h-3" /> untuk tambah layanan sekaligus</span>
              )}
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
        {/* Filter kategori — horizontal scroll */}
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
            <ServiceCard
              key={svc.id}
              service={svc}
              t={t}
              isSelected={selectedService?.id === svc.id}
              isAdded={addedServiceIds.has(svc.id)}
              onSelect={() => onSelectService(svc)}
              onAdd={onAddService ? () => onAddService(svc) : undefined}
              onRemove={onRemoveService ? () => onRemoveService(svc.id) : undefined}
              showAdd={!!onAddService}
            />
          ))}
          {filteredServices.length === 0 && (
            <p className="text-center text-sm text-stone-400 py-4 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Tidak ada layanan di kategori ini.
            </p>
          )}
        </div>

        {/* Picker durasi fleksibel — muncul jika layanan yang dipilih is_flexible_duration=true */}
        {isFlexibleSelected && selectedService && onSetCustomDuration && (
          <FlexibleDurationPicker
            service={selectedService}
            customDuration={customDuration ?? null}
            onSetCustomDuration={onSetCustomDuration}
            t={t}
          />
        )}

        {/* Ringkasan layanan yang ditambahkan (multi-service) */}
        {selectedServices.length > 1 && (
          <div className={`mt-3 p-3 rounded-2xl ${t.bgLight} border ${t.borderLight}`}>
            <p className={`text-xs font-bold ${t.textPrimary} mb-2`}>
              {selectedServices.length} Layanan Dipilih
            </p>
            <div className="space-y-1">
              {selectedServices.map((svc, i) => (
                <div key={svc.id} className="flex items-center justify-between text-xs text-stone-600">
                  <span className="font-medium">{i + 1}. {svc.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400">{svc.duration_minutes} mnt</span>
                    {i > 0 && onRemoveService && (
                      <button
                        type="button"
                        onClick={() => onRemoveService(svc.id)}
                        className="w-5 h-5 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Ringkasan layanan — collapsed */}
      {activeStep > 1 && selectedService && (
        <CardContent className="pt-4 pb-4">
          <div className="flex justify-between items-center bg-stone-50 p-3 rounded-2xl border border-stone-100">
            <div>
              <p className="text-sm font-bold text-stone-800">
                {selectedServices.length > 1
                  ? `${selectedServices[0].name} +${selectedServices.length - 1} lainnya`
                  : selectedService.name}
              </p>
              <p className="text-xs text-stone-500">
                {isFlexibleSelected && customDuration
                  ? `${customDuration} menit (kustom)`
                  : `${selectedService.duration_minutes} menit`}
              </p>
            </div>
            <p className={`font-bold text-sm ${t.textPrimary}`}>
              {isFlexibleSelected && customDuration
                ? formatIDR(Number(selectedService.price) * (customDuration / 60))
                : formatIDR(selectedServices.reduce((sum, s) => sum + Number(s.price), 0))}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
