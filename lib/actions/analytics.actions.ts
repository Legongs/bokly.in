"use server";

import { createClient } from "@/lib/supabase/server";

export type TopService = {
  id: string;
  name: string;
  count: number;
};

export type PeakHour = {
  hour: string;
  count: number;
};

export type TenantAnalytics = {
  totalRevenue: number;
  totalBookings: number;
  topServices: TopService[];
  peakHours: PeakHour[];
  smartSuggestion: string | null;
};

export async function getTenantAnalytics(tenantId: string): Promise<{ success: boolean; data?: TenantAnalytics; error?: string }> {
  try {
    const supabase = await createClient();

    // Ambil semua booking dengan status approved beserta relasi services-nya
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        id,
        start_time,
        services (
          id,
          name,
          price
        )
      `)
      .eq("tenant_id", tenantId)
      .eq("payment_status", "approved");

    if (error) {
      console.error("Error fetching analytics:", error);
      return { success: false, error: "Gagal mengambil data analitik dari database." };
    }

    if (!bookings || bookings.length === 0) {
      return {
        success: true,
        data: {
          totalRevenue: 0,
          totalBookings: 0,
          topServices: [],
          peakHours: [],
          smartSuggestion: "Belum ada jadwal yang disetujui nih. Yuk, promosiin link booking kamu biar mulai dapet pelanggan!",
        },
      };
    }

    let totalRevenue = 0;
    const totalBookings = bookings.length;

    const serviceCounts: Record<string, { name: string; count: number }> = {};
    const hourCounts: Record<string, number> = {};

    bookings.forEach((booking: any) => {
      // Hitung Revenue (Asumsi services terhubung)
      const service = booking.services;
      if (service) {
        totalRevenue += Number(service.price) || 0;
        
        // Hitung Layanan Terlaris
        if (!serviceCounts[service.id]) {
          serviceCounts[service.id] = { name: service.name, count: 0 };
        }
        serviceCounts[service.id].count += 1;
      }

      // Hitung Jam Ramai
      if (booking.start_time) {
        const hour = booking.start_time.slice(0, 5); // "HH:MM"
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    // Urutkan Layanan
    const topServices: TopService[] = Object.keys(serviceCounts)
      .map((id) => ({
        id,
        name: serviceCounts[id].name,
        count: serviceCounts[id].count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Ambil Top 5

    // Urutkan Jam Ramai
    const peakHours: PeakHour[] = Object.keys(hourCounts)
      .map((hour) => ({
        hour,
        count: hourCounts[hour],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Ambil Top 5

    // Buat Smart Suggestion
    let smartSuggestion = null;
    if (peakHours.length > 0) {
      const topHour = peakHours[0].hour;
      smartSuggestion = `Jam ${topHour} paling sering dibooking nih. Pertimbangkan buat nambah staf ekstra di jam sibuk ini, atau bikin promosi khusus di jam sepi biar pendapatan makin merata!`;
    }

    return {
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        topServices,
        peakHours,
        smartSuggestion,
      },
    };
  } catch (err) {
    console.error("Exception in getTenantAnalytics:", err);
    return { success: false, error: "Terjadi kesalahan internal saat menghitung analitik." };
  }
}
