"use client";

import { useState, useTransition, useEffect } from "react";
import { Loader2, Trash2, PlusCircle, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { getPortfoliosByTenant, createPortfolio, deletePortfolio } from "@/lib/actions/portfolio.actions";
import type { Portfolio, Tenant } from "@/types/database.types";

interface PortfolioSettingsProps {
  tenant: Tenant;
}

export function PortfolioSettings({ tenant }: PortfolioSettingsProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form tambah portofolio
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ image_url: "", title: "" });

  useEffect(() => {
    const fetchPortfolios = async () => {
      const res = await getPortfoliosByTenant(tenant.id);
      if (res.success && res.data) {
        setPortfolios(res.data);
      }
      setIsLoading(false);
    };
    fetchPortfolios();
  }, [tenant.id]);

  const validateImageRatio = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const width = img.width;
        const height = img.height;
        
        // Cek Rasio 1:1 atau 16:9 (dengan toleransi sedikit pembulatan)
        const ratio = width / height;
        const isSquare = Math.abs(ratio - 1) < 0.05;
        const is16by9 = Math.abs(ratio - (16/9)) < 0.05;
        const is9by16 = Math.abs(ratio - (9/16)) < 0.05; // toleransi untuk portrait

        if (isSquare || is16by9 || is9by16) {
          resolve(true);
        } else {
          reject(new Error("Rasio gambar harus 1:1 (Persegi) atau 16:9 / 9:16."));
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Gagal membaca file gambar."));
      };
      
      img.src = objectUrl;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) return;

    if (portfolios.length >= 5) {
      setMessage({ type: "error", text: "Batas unggah portofolio (5 foto) telah tercapai." });
      return;
    }

    startTransition(async () => {
      setMessage(null);
      const res = await createPortfolio({ image_url: formData.image_url, title: formData.title });
      
      if (res.success && res.data) {
        setPortfolios([res.data, ...portfolios]);
        setIsAdding(false);
        setFormData({ image_url: "", title: "" });
        setMessage({ type: "success", text: "Keren! Portofolio baru udah ditambahkan." });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: res.error || "Gagal menambah portofolio" });
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus portofolio ini?")) return;

    startTransition(async () => {
      setMessage(null);
      const res = await deletePortfolio(id);
      if (res.success) {
        setPortfolios(portfolios.filter(p => p.id !== id));
        setMessage({ type: "success", text: "Oke, portofolio udah dihapus ya." });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: res.error || "Gagal menghapus portofolio" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto p-10 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-[2rem] shadow-md shadow-stone-200/50 border-none overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-extrabold text-stone-900 mb-1">Galeri Portofolio</h3>
          <p className="text-sm text-stone-500">
            Tampilkan hasil karya atau tempat bisnis Anda (Maksimal 5 foto).
          </p>
        </div>
        <div className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs font-bold shrink-0">
          {portfolios.length} / 5 Foto
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-semibold mb-6 flex items-center gap-2 ${message.type === "success" ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
          {message.type === "success" ? <Check className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Info Panduan */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-blue-900 mb-1">Panduan Foto</h4>
          <p className="text-xs text-blue-800 leading-relaxed">
            Agar toko Anda terlihat rapi dan profesional, harap patuhi aturan berikut:
            <br />• <strong>Ukuran file:</strong> Maksimal 2MB.
            <br />• <strong>Rasio dimensi:</strong> Persegi (1:1), Landscape (16:9), atau Portrait (9:16).
          </p>
        </div>
      </div>

      {/* Form Tambah */}
      {isAdding ? (
        <div className="mb-8 p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
          <h4 className="font-bold text-stone-800 text-sm">Unggah Foto Baru</h4>
          
          <div>
            <ImageUploader 
              value={formData.image_url} 
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              validateFile={validateImageRatio}
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Caption / Judul (Opsional)</label>
            <input 
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-none text-sm font-medium bg-white text-stone-900 placeholder:text-stone-400 caret-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/20 transition-all shadow-inner"
              placeholder="Contoh: Hasil pewarnaan rambut ombre"
              disabled={isPending}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => {
                setIsAdding(false);
                setFormData({ image_url: "", title: "" });
              }}
              disabled={isPending}
              className="rounded-full"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!formData.image_url || isPending}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-md shadow-teal-600/20"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Unggah & Pasang Foto"}
            </Button>
          </div>
        </div>
      ) : (
        portfolios.length < 5 && (
          <Button 
            onClick={() => setIsAdding(true)}
            variant="outline"
            className="w-full border-dashed border-2 border-stone-300 text-stone-500 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50 h-14 rounded-2xl mb-8 font-bold"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> Tambah Foto Portofolio
          </Button>
        )
      )}

      {/* Grid Portofolio */}
      <div className="grid grid-cols-2 gap-4">
        {portfolios.map((item) => (
          <div key={item.id} className="relative group rounded-2xl overflow-hidden aspect-square bg-stone-100 border border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image_url} alt={item.title || "Portfolio"} className="w-full h-full object-cover" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              {item.title && (
                <p className="text-white text-xs font-semibold mb-2 line-clamp-2">{item.title}</p>
              )}
              <Button 
                size="sm"
                variant="destructive"
                className="w-full rounded-xl bg-rose-500 hover:bg-rose-600"
                onClick={() => handleDelete(item.id)}
                disabled={isPending}
              >
                <Trash2 className="w-4 h-4 mr-1.5" /> Hapus
              </Button>
            </div>
          </div>
        ))}
        {portfolios.length === 0 && !isAdding && (
          <div className="col-span-2 text-center py-10 px-4">
            <p className="text-sm text-stone-500 font-medium">Belum ada foto portofolio.</p>
          </div>
        )}
      </div>

    </div>
  );
}
