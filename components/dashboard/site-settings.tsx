"use client";

import { useState, useTransition } from "react";
import { Save, Image as ImageIcon, MapPin, AtSign, Info, Check, Palette, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { updateSiteSettings } from "@/lib/actions/tenant.actions";
import type { Tenant } from "@/types/database.types";

interface SiteSettingsProps {
  tenant: Tenant;
}



export function SiteSettings({ tenant }: SiteSettingsProps) {
  const [siteData, setSiteData] = useState({
    hero_image_url: tenant.hero_image_url || "",
    logo_url: tenant.logo_url || "",
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
        setSiteMessage({ type: "success", text: "Sip! Tampilan situs kamu udah diperbarui." });
        setTimeout(() => setSiteMessage(null), 5000);
      } else {
        setSiteMessage({ type: "error", text: res.error || "Gagal menyimpan pengaturan." });
      }
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-[2rem] shadow-md shadow-stone-200/50 border-none overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="text-xl font-extrabold text-stone-900 mb-1">Tampilan & Situs Publik</h3>
      <p className="text-sm text-stone-500 mb-6">
        Sesuaikan tema warna, banner, dan informasi publik di halaman booking Anda.
      </p>

      {siteMessage && (
        <div className={`p-4 rounded-xl text-sm font-semibold mb-6 flex items-center gap-2 ${siteMessage.type === "success" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
          {siteMessage.type === "success" && <Check className="w-5 h-5" />}
          {siteMessage.text}
        </div>
      )}

      <form onSubmit={handleSiteSubmit} className="space-y-6">


        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
            <ImageIcon className="w-4 h-4 text-stone-500" />
            Logo Toko / Ikon
          </label>
          <ImageUploader 
            value={siteData.logo_url || ""}
            onChange={(url) => setSiteData((prev) => ({ ...prev, logo_url: url }))}
            disabled={isPendingSite}
            label="Upload Logo Toko"
          />
        </div>

        {/* Hero Image */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
            <ImageIcon className="w-4 h-4 text-stone-500" />
            Gambar Latar (Banner / Hero Image)
          </label>
          <ImageUploader 
            value={siteData.hero_image_url || ""}
            onChange={(url) => setSiteData((prev) => ({ ...prev, hero_image_url: url }))}
            disabled={isPendingSite}
            label="Upload Banner Utama"
          />
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
            className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-stone-50 text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner resize-none"
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
              className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-stone-50 text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
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
              className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-stone-50 text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
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
            className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-stone-50 text-stone-900 placeholder:text-stone-400 caret-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner resize-none"
            placeholder="Misal: Keterlambatan lebih dari 15 menit, DP hangus ya Kak."
            maxLength={500}
          />
        </div>

        <div className="pt-5 border-t border-stone-100">
          <Button
            type="submit"
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold mt-4 shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg"
            disabled={isPendingSite}
          >
            {isPendingSite ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Terapkan Tema Tampilan"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
