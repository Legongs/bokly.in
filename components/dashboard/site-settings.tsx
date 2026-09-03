"use client";

import { useState, useTransition } from "react";
import { Save, Image as ImageIcon, MapPin, AtSign, Info, Check, Palette, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateSiteSettings } from "@/lib/actions/tenant.actions";
import type { Tenant } from "@/types/database.types";

interface SiteSettingsProps {
  tenant: Tenant;
}

const THEME_OPTIONS = [
  { id: "teal", label: "Hijau Sage (Sage)", colorClass: "bg-teal-500" },
  { id: "rose", label: "Terakota (Warm)", colorClass: "bg-rose-500" },
  { id: "orange", label: "Jeruk Hangat", colorClass: "bg-orange-500" },
  { id: "violet", label: "Ungu Lavender", colorClass: "bg-violet-500" },
  { id: "blue", label: "Biru Pastel", colorClass: "bg-blue-500" },
] as const;

export function SiteSettings({ tenant }: SiteSettingsProps) {
  const [siteData, setSiteData] = useState({
    hero_image_url: tenant.hero_image_url || "",
    welcome_message: tenant.welcome_message || "",
    address: tenant.address || "",
    instagram_handle: tenant.instagram_handle || "",
    cancellation_policy: tenant.cancellation_policy || "",
    theme_color: tenant.theme_color || "teal",
  });

  const [siteMessage, setSiteMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPendingSite, startTransitionSite] = useTransition();

  const handleSiteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSiteData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (themeId: string) => {
    setSiteData((prev) => ({ ...prev, theme_color: themeId }));
  };

  const handleSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSiteMessage(null);
    startTransitionSite(async () => {
      const res = await updateSiteSettings({ 
        id: tenant.id, 
        ...siteData,
        theme_color: siteData.theme_color as "teal" | "rose" | "orange" | "violet" | "blue"
      });
      if (res.success) {
        setSiteMessage({ type: "success", text: "Pengaturan situs berhasil diperbarui!" });
        setTimeout(() => setSiteMessage(null), 5000);
      } else {
        setSiteMessage({ type: "error", text: res.error || "Gagal menyimpan pengaturan." });
      }
    });
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="text-xl font-extrabold text-stone-900 mb-1">Pengaturan Tampilan & Situs</h3>
      <p className="text-sm text-stone-500 mb-6">
        Sesuaikan tema warna, banner, dan informasi publik di halaman booking Anda.
      </p>

      {siteMessage && (
        <div className={`p-4 rounded-xl text-sm font-semibold mb-6 flex items-center gap-2 ${siteMessage.type === "success" ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
          {siteMessage.type === "success" && <Check className="w-5 h-5" />}
          {siteMessage.text}
        </div>
      )}

      <form onSubmit={handleSiteSubmit} className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <Palette className="w-4 h-4 text-stone-500" />
            Tema Warna / Template Halaman
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = siteData.theme_color === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeChange(theme.id)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all overflow-hidden ${
                    isSelected
                      ? "border-stone-900 bg-stone-50 ring-4 ring-stone-900/5 shadow-sm"
                      : "border-stone-100 hover:border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full mb-2 shadow-inner ${theme.colorClass}`} />
                  <span className={`text-[11px] font-bold tracking-wide text-center leading-tight ${
                    isSelected ? "text-stone-900" : "text-stone-500"
                  }`}>
                    {theme.label}
                  </span>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-stone-900">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Image */}
        <div>
          <label htmlFor="hero_image_url" className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
            <ImageIcon className="w-4 h-4 text-stone-500" />
            Link Gambar Latar (Banner / Hero Image)
          </label>
          <input
            type="url"
            id="hero_image_url"
            name="hero_image_url"
            value={siteData.hero_image_url}
            onChange={handleSiteChange}
            className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-stone-50 text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner"
            placeholder="https://contoh.com/gambar-banner.jpg"
          />
          <div className="mt-2 text-xs text-stone-500 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
            <strong className="text-stone-700">Tips Google Drive:</strong> Pastikan gambar Anda di-set "Anyone with the link can view". 
            Ubah format link <code className="bg-stone-200 px-1 py-0.5 rounded">https://drive.google.com/file/d/[ID]/view</code> menjadi: <br/>
            <code className="bg-teal-50 text-teal-700 font-semibold px-1 py-0.5 rounded block mt-1">https://drive.google.com/uc?export=view&id=[ID]</code>
          </div>
        </div>

        {/* Welcome Message */}
        <div>
          <label htmlFor="welcome_message" className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
            <Info className="w-4 h-4 text-stone-500" />
            Pesan Sambutan Singkat
          </label>
          <textarea
            id="welcome_message"
            name="welcome_message"
            value={siteData.welcome_message}
            onChange={handleSiteChange}
            rows={2}
            className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-stone-50 text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner resize-none"
            placeholder="Misal: Selamat datang di Salon Siska! Tampil cantik setiap hari tanpa antri."
            maxLength={300}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Address */}
          <div>
            <label htmlFor="address" className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
              <MapPin className="w-4 h-4 text-stone-500" />
              Alamat Lengkap Toko
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={siteData.address}
              onChange={handleSiteChange}
              className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-stone-50 text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner"
              placeholder="Jl. Raya Kuta No. 99, Bali"
            />
          </div>

          {/* Instagram */}
          <div>
            <label htmlFor="instagram_handle" className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
              <AtSign className="w-4 h-4 text-stone-500" />
              Username Instagram
            </label>
            <input
              type="text"
              id="instagram_handle"
              name="instagram_handle"
              value={siteData.instagram_handle}
              onChange={handleSiteChange}
              className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-stone-50 text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner"
              placeholder="@salonsiska"
            />
          </div>
        </div>

        {/* Cancellation Policy */}
        <div>
          <label htmlFor="cancellation_policy" className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
            <Info className="w-4 h-4 text-stone-500" />
            Catatan / Kebijakan Booking
          </label>
          <textarea
            id="cancellation_policy"
            name="cancellation_policy"
            value={siteData.cancellation_policy}
            onChange={handleSiteChange}
            rows={2}
            className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-stone-50 text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner resize-none"
            placeholder="Misal: Keterlambatan lebih dari 15 menit, DP hangus ya Kak."
            maxLength={500}
          />
        </div>

        <div className="pt-5 border-t border-stone-100">
          <Button
            type="submit"
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold mt-4 shadow-md shadow-teal-600/20 transition-all hover:shadow-lg"
            disabled={isPendingSite}
          >
            {isPendingSite ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Simpan Tampilan Situs"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
