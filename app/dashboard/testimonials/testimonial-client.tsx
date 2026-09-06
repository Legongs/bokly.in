"use client";

import { useState } from "react";
import type { Testimonial } from "@/types/database.types";
import { publishTestimonial, unpublishTestimonial, toggleFeaturedTestimonial } from "@/lib/actions/testimonial.actions";
import { Star, MessageCircle, MoreVertical, Eye, EyeOff, Award } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function TestimonialClient({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((acc, curr) => acc + curr.rating, 0) / testimonials.length).toFixed(1) 
    : "0.0";

  const handleTogglePublish = async (t: Testimonial) => {
    setIsUpdating(t.id);
    const res = t.is_published ? await unpublishTestimonial(t.id) : await publishTestimonial(t.id);
    if (res.success) {
      toast.success(t.is_published ? "Testimoni disembunyikan" : "Testimoni dipublikasi");
      setTestimonials(prev => prev.map(item => {
        if (item.id === t.id) {
          // Kalau unpublish, is_featured juga akan false dari server action, kita update local state
          return { ...item, is_published: !t.is_published, is_featured: t.is_published ? false : item.is_featured };
        }
        return item;
      }));
    } else {
      toast.error(res.error || "Gagal mengupdate");
    }
    setIsUpdating(null);
  };

  const handleToggleFeatured = async (t: Testimonial) => {
    setIsUpdating(t.id);
    const nextFeatured = !t.is_featured;
    const res = await toggleFeaturedTestimonial(t.id, nextFeatured);
    if (res.success) {
      toast.success(nextFeatured ? "Ditandai sebagai unggulan" : "Batal unggulan");
      setTestimonials(prev => prev.map(item => {
        if (item.id === t.id) {
          return { ...item, is_featured: nextFeatured, is_published: nextFeatured ? true : item.is_published };
        }
        return item;
      }));
    } else {
      toast.error(res.error || "Gagal mengupdate");
    }
    setIsUpdating(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
          <p className="text-sm font-semibold text-stone-500 uppercase tracking-widest mb-1">Rata-rata Rating</p>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black text-stone-900">{averageRating}</span>
            <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
          <p className="text-sm font-semibold text-stone-500 uppercase tracking-widest mb-1">Total Ulasan</p>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black text-stone-900">{testimonials.length}</span>
            <MessageCircle className="w-8 h-8 text-stone-300" />
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
          <p className="text-sm font-semibold text-stone-500 uppercase tracking-widest mb-1">Ulasan Dipublikasi</p>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-black text-stone-900">{testimonials.filter(t => t.is_published).length}</span>
            <Eye className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        {testimonials.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            Belum ada ulasan dari pelanggan. Ulasan akan muncul setelah pelanggan menyelesaikan reservasi dan mengisi form testimoni.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {testimonials.map(t => (
              <div key={t.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-stone-900">{t.customer_name}</span>
                    <span className="text-xs text-stone-400">{format(new Date(t.created_at), "dd MMM yyyy", { locale: id })}</span>
                    {t.is_featured && (
                      <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <Award className="w-3 h-3" /> Unggulan
                      </span>
                    )}
                    {!t.is_published && (
                      <span className="bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Disembunyikan
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= t.rating ? "text-amber-400 fill-amber-400" : "text-stone-200"}`} />
                    ))}
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed">{t.comment || <span className="italic text-stone-400">Tidak ada pesan tertulis</span>}</p>
                </div>
                
                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => handleTogglePublish(t)} 
                    disabled={isUpdating === t.id}
                    className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      t.is_published ? "bg-stone-100 text-stone-600 hover:bg-stone-200" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    } disabled:opacity-50`}
                  >
                    {t.is_published ? <><EyeOff className="w-4 h-4" /> Sembunyikan</> : <><Eye className="w-4 h-4" /> Publikasikan</>}
                  </button>
                  <button 
                    onClick={() => handleToggleFeatured(t)} 
                    disabled={isUpdating === t.id}
                    className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      t.is_featured ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "border border-stone-200 text-stone-600 hover:bg-stone-50"
                    } disabled:opacity-50`}
                  >
                    <Award className="w-4 h-4" /> {t.is_featured ? "Batal Unggulan" : "Jadikan Unggulan"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
