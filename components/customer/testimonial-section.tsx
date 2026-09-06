import React from "react";
import { Star, MessageSquareQuote } from "lucide-react";
import { getTestimonials } from "@/lib/actions/testimonial.actions";

export async function TestimonialSection({ tenantId, themeColor = "teal" }: { tenantId: string, themeColor?: string }) {
  const res = await getTestimonials(tenantId);
  const testimonials = res.success && res.data ? res.data : [];

  if (testimonials.length === 0) return null;

  // Optional: style colors based on theme if needed, or stick to neutral stone/slate for consistency
  return (
    <section className="w-full my-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6 justify-center text-center">
          <MessageSquareQuote className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl md:text-2xl font-black text-stone-800 tracking-tight">Kata Mereka</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm relative">
              {t.is_featured && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-amber-200">
                  Unggulan
                </div>
              )}
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-4 h-4 ${star <= t.rating ? "text-amber-400 fill-amber-400" : "text-stone-200"}`} />
                ))}
              </div>
              <p className="text-stone-600 text-sm leading-relaxed mb-4 italic">
                "{t.comment || "Pelayanan yang sangat memuaskan, sangat direkomendasikan!"}"
              </p>
              <div className="flex items-center justify-between border-t border-stone-50 pt-3">
                <span className="font-bold text-stone-900 text-sm">{t.customer_name}</span>
                <span className="text-xs text-stone-400">
                  {new Date(t.created_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
