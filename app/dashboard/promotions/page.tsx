import { getAuthTenantId } from "@/lib/auth";
import { getPromotions } from "@/lib/actions/promotion.actions";
import { PromotionClient } from "./promotion-client";

export const metadata = {
  title: "Promo & Diskon | bukly.id",
};

export default async function PromotionsPage() {
  const tenantId = await getAuthTenantId();
  
  const res = await getPromotions();
  const promotions = res.success && res.data ? res.data : [];

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Promo & Diskon</h1>
        <p className="text-stone-500 mt-1">Buat dan kelola penawaran khusus untuk menarik lebih banyak pelanggan.</p>
      </div>

      <PromotionClient initialPromotions={promotions} />
    </main>
  );
}
