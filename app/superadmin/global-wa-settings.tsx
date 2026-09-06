"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, MessageCircle, Save, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateGlobalFonnteConfig } from "@/lib/actions/superadmin.actions";
import type { MaskedGlobalFonnteConfig } from "@/lib/global-wa";

/**
 * Panel kredensial Fonnte GLOBAL (punya developer platform).
 *
 * Token aslinya nggak pernah dikirim ke browser — yang datang cuma versi
 * ter-mask. Input dibiarkan kosong artinya "jangan ganti token", jadi developer
 * bisa geser toggle tanpa takut nimpa token yang udah kesimpan.
 */
export function GlobalWaSettings({ initialConfig }: { initialConfig: MaskedGlobalFonnteConfig }) {
  const [apiKey, setApiKey] = useState("");
  const [isEnabled, setIsEnabled] = useState(initialConfig.isEnabled);
  const [saved, setSaved] = useState(initialConfig);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateGlobalFonnteConfig({ apiKey, isEnabled });
      if (res.success && res.data) {
        // Action balikin versi ter-mask yang baru — dipakai langsung supaya
        // tampilan "Tersimpan: ••••1234" ikut update tanpa reload.
        setSaved(res.data);
        setIsEnabled(res.data.isEnabled);
        setApiKey("");
        toast.success("Pengaturan WA otomatis tersimpan.");
      } else {
        toast.error(res.error || "Gagal menyimpan pengaturan WA otomatis.");
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Konfigurasi WA Otomatis</h2>
          <p className="text-sm text-stone-500">
            Token Fonnte milik platform, dipakai buat reminder & notifikasi booking otomatis.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan
        </Button>
      </div>

      {isEnabled && saved.hasApiKey ? (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3">
          <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-emerald-900">WA otomatis: AKTIF</h3>
            <p className="text-xs text-emerald-700 mt-1">
              Reminder & notif booking dikirim otomatis buat tenant paket yang flag-nya nyala.
              Biaya kirim masuk ke akun Fonnte platform.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-xl flex gap-3">
          <MessageCircle className="w-5 h-5 text-stone-400 shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-stone-800">WA otomatis: NONAKTIF</h3>
            <p className="text-xs text-stone-500 mt-1">
              {saved.hasApiKey
                ? "Token sudah tersimpan, tapi saklarnya masih mati — nggak ada pesan otomatis yang dikirim."
                : "Belum ada token Fonnte platform. Isi dulu di bawah, baru saklarnya bisa dinyalakan."}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between p-4 border border-stone-100 rounded-xl bg-stone-50/50">
          <div>
            <label className="block text-sm font-bold text-stone-900">
              Aktifkan Notifikasi WA Otomatis
            </label>
            <p className="text-xs text-stone-500">
              Saklar utama. Kalau dimatikan, semua reminder & notif otomatis berhenti total.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              aria-label="Aktifkan notifikasi WA otomatis"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
            />
            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div>
          <label htmlFor="global-fonnte-key" className="block text-sm font-bold text-stone-900 mb-1.5">
            API Key Fonnte (Global / Milik Developer)
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="global-fonnte-key"
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                saved.hasApiKey
                  ? `Tersimpan: ${saved.apiKeyMasked} — isi kalau mau ganti`
                  : "Tempel token Fonnte di sini"
              }
              className="w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <p className="text-xs text-stone-500 mt-1.5">
            Dibiarkan kosong = token lama tetap dipakai. Token nggak pernah dikirim utuh ke browser.
          </p>
        </div>

        <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl flex gap-3">
          <Wallet className="w-5 h-5 text-indigo-600 shrink-0" />
          <p className="text-xs text-indigo-900 leading-relaxed">
            Ini akun Fonnte milik developer platform. Biaya pengiriman pesan otomatis (reminder &amp;
            notifikasi booking) ditanggung platform, dipakai untuk tenant paket Pro dan Bisnis.
            Terpisah dari WA API Key milik masing-masing tenant.
          </p>
        </div>
      </div>
    </div>
  );
}
