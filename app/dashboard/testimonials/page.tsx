import { getAuthTenantId } from "@/lib/auth";
import { getAllTestimonials } from "@/lib/actions/testimonial.actions";
import { TestimonialClient } from "./testimonial-client";

export default async function TestimonialsPage() {
  const tenantId = await getAuthTenantId();
  
  const res = await getAllTestimonials(tenantId);
  const testimonials = res.success && res.data ? res.data : [];

  return (
    <div className="p-4 sm:p-8 md:p-12 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Testimoni & Ulasan</h1>
          <p className="text-sm text-stone-500 mt-1">Kelola ulasan dari pelanggan dan tampilkan di storefront Anda.</p>
        </div>
      </div>
      <TestimonialClient initialTestimonials={testimonials} />
    </div>
  );
}
