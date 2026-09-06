import { getCustomerPortalData } from "@/lib/actions/customer-portal.actions";
import { BookingManageClient } from "@/components/customer/booking-manage";
import { PushNotificationPrompt } from "@/components/pwa/push-notification-prompt";
import { PromoBanner } from "@/components/customer/promo-banner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kelola Booking - Portal Pelanggan",
  description: "Lihat detail dan riwayat booking Anda.",
};

export default async function BookingManagePage({
  params,
}: {
  params: Promise<{ tenant: string; token: string }>;
}) {
  const resolvedParams = await params;
  const { data, success, error } = await getCustomerPortalData(resolvedParams.token);

  if (!success || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-stone-900 mb-2">Booking Tidak Ditemukan</h1>
          <p className="text-stone-500 text-sm">{error || "Tautan yang Anda tuju mungkin sudah kedaluwarsa atau tidak valid."}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <PromoBanner tenantId={data.tenant.id} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <PushNotificationPrompt subscriptionType="storefront" />
      </div>
      <BookingManageClient initialData={data} />
    </main>
  );
}
