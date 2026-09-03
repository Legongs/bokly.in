"use client";

import { useState, useTransition } from "react";
import { updateWaSettings } from "@/lib/actions/tenant.actions";
import { Save, Check, MessageSquare, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tenant } from "@/types/database.types";

interface WaSettingsProps {
  tenant: Tenant;
}

export function WaSettings({ tenant }: WaSettingsProps) {
  const [isPendingWa, startTransitionWa] = useTransition();
  const [waMessage, setWaMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [waMethod, setWaMethod] = useState<"manual" | "api">(tenant.wa_method || "manual");
  const [waApiKey, setWaApiKey] = useState(tenant.wa_api_key || "");

  const handleWaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWaMessage(null);
    startTransitionWa(async () => {
      const res = await updateWaSettings({
        id: tenant.id,
        wa_method: waMethod,
        wa_api_key: waMethod === "api" ? waApiKey : null,
      });
      if (res.success) {
        setWaMessage({ type: "success", text: "Pengaturan WhatsApp berhasil disimpan!" });
        setTimeout(() => setWaMessage(null), 5000);
      } else {
        setWaMessage({ type: "error", text: res.error || "Gagal menyimpan pengaturan." });
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="text-lg font-bold text-stone-900 mb-1">Metode Notifikasi WhatsApp</h3>
      <p className="text-sm text-stone-500 mb-6 leading-relaxed">
        Tentukan bagaimana Anda dan pelanggan menerima informasi pesanan. Pilih opsi <strong>Manual</strong> untuk interaksi personal yang gratis, atau <strong>API Fonnte</strong> untuk mengirim notifikasi otomatis layaknya sistem profesional.
      </p>

      {waMessage && (
        <div className={`p-4 rounded-xl text-sm font-semibold mb-6 flex items-center gap-2 ${waMessage.type === "success" ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
          {waMessage.type === "success" && <Check className="w-5 h-5" />}
          {waMessage.text}
        </div>
      )}

      <form onSubmit={handleWaSubmit} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Manual Option */}
          <label className={`relative flex cursor-pointer rounded-xl border p-5 shadow-sm transition-all focus:outline-none ${waMethod === 'manual' ? 'border-teal-600 ring-1 ring-teal-600 bg-teal-50/20' : 'border-stone-200 hover:bg-stone-50'}`}>
            <input type="radio" name="wa_method" value="manual" className="sr-only" checked={waMethod === 'manual'} onChange={() => setWaMethod('manual')} />
            <span className="flex flex-1">
              <span className="flex flex-col">
                <span className="flex items-center justify-between w-full mb-3">
                  <span className="flex items-center gap-2 text-stone-900 font-bold text-base">
                    <MessageSquare className={`w-5 h-5 ${waMethod === 'manual' ? 'text-teal-600' : 'text-stone-500'}`} />
                    Manual (Tautan wa.me)
                  </span>
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 ${waMethod === 'manual' ? 'border-teal-600' : 'border-stone-300'}`}>
                    {waMethod === 'manual' && <div className="h-2.5 w-2.5 rounded-full bg-teal-600" />}
                  </div>
                </span>
                
                <p className="text-sm text-stone-600 leading-relaxed mb-4">
                  Pelanggan yang selesai memesan akan diarahkan ke tautan WhatsApp (wa.me) dengan draf pesan yang sudah terisi otomatis. Mereka harus menekan tombol "Kirim" secara manual di aplikasi WA mereka.
                </p>

                <div className="space-y-3 mt-auto">
                  <div>
                    <strong className="text-xs text-stone-900 uppercase tracking-wider">Kelebihan:</strong>
                    <ul className="text-sm text-stone-600 mt-1 space-y-1 list-disc pl-4 marker:text-stone-400">
                      <li>100% Gratis selamanya.</li>
                      <li>Tidak perlu registrasi layanan pihak ketiga.</li>
                      <li>Bisa langsung interaksi (chat) dengan pelanggan.</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-xs text-stone-900 uppercase tracking-wider">Syarat:</strong>
                    <p className="text-sm text-stone-600 mt-1">Hanya perlu memastikan nomor WhatsApp Toko di pengaturan Profil sudah benar.</p>
                  </div>
                </div>
              </span>
            </span>
          </label>

          {/* API Option */}
          <label className={`relative flex cursor-pointer rounded-xl border p-5 shadow-sm transition-all focus:outline-none ${waMethod === 'api' ? 'border-teal-600 ring-1 ring-teal-600 bg-teal-50/20' : 'border-stone-200 hover:bg-stone-50'}`}>
            <input type="radio" name="wa_method" value="api" className="sr-only" checked={waMethod === 'api'} onChange={() => setWaMethod('api')} />
            <span className="flex flex-1">
              <span className="flex flex-col">
                <span className="flex items-center justify-between w-full mb-3">
                  <span className="flex items-center gap-2 text-stone-900 font-bold text-base">
                    <Bot className={`w-5 h-5 ${waMethod === 'api' ? 'text-teal-600' : 'text-stone-500'}`} />
                    Otomatis (API Fonnte)
                  </span>
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 ${waMethod === 'api' ? 'border-teal-600' : 'border-stone-300'}`}>
                    {waMethod === 'api' && <div className="h-2.5 w-2.5 rounded-full bg-teal-600" />}
                  </div>
                </span>

                <p className="text-sm text-stone-600 leading-relaxed mb-4">
                  Sistem maubooking.in akan otomatis mengirimkan pesan konfirmasi tagihan ke nomor WhatsApp pelanggan di latar belakang menggunakan layanan Fonnte sesaat setelah booking sukses.
                </p>

                <div className="space-y-3 mt-auto">
                  <div>
                    <strong className="text-xs text-stone-900 uppercase tracking-wider">Kelebihan:</strong>
                    <ul className="text-sm text-stone-600 mt-1 space-y-1 list-disc pl-4 marker:text-stone-400">
                      <li>Terlihat sangat profesional di mata pelanggan.</li>
                      <li>Pelanggan tidak perlu repot menekan tombol kirim.</li>
                      <li>Tingkat <em>drop-off</em> pembayaran jauh lebih rendah.</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-xs text-stone-900 uppercase tracking-wider">Syarat:</strong>
                    <p className="text-sm text-stone-600 mt-1">Wajib berlangganan dan memiliki Token API dari <a href="https://fonnte.com" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">fonnte.com</a>.</p>
                  </div>
                </div>
              </span>
            </span>
          </label>
        </div>

        {/* API Key Input */}
        {waMethod === "api" && (
          <div className="bg-stone-50 p-5 rounded-xl border border-stone-200 animate-in fade-in slide-in-from-top-2">
            <label htmlFor="apiKey" className="block text-sm font-bold text-stone-900 mb-2">
              Fonnte API Key (Token)
            </label>
            <p className="text-sm text-stone-600 mb-4 leading-relaxed">
              Tempelkan <strong>Token</strong> perangkat Anda di sini. Anda bisa mendapatkannya melalui menu <strong>Device</strong> di dashboard akun <a href="https://md.fonnte.com" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline font-semibold">Fonnte</a> Anda. Pastikan status <em>device</em> di Fonnte dalam keadaan terhubung (Connected).
            </p>
            <input
              type="password"
              id="apiKey"
              value={waApiKey}
              onChange={(e) => setWaApiKey(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-shadow text-sm"
              placeholder="Masukkan Token Fonnte (Misal: XyZ123...)"
              required={waMethod === "api"}
            />
          </div>
        )}

        <div className="pt-3 border-t border-stone-100">
          <Button
            type="submit"
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold mt-4 shadow-md shadow-teal-600/20 transition-all hover:shadow-lg"
            disabled={isPendingWa}
          >
            {isPendingWa ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Simpan Pengaturan WA"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
