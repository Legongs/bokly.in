"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { format, subDays, startOfDay, endOfDay, isSameDay } from "date-fns";
import { ActionResponse } from "./tenant.actions";

export interface DashboardMetrics {
  totalRevenue: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  recentTrend: { date: string; value: number }[]; // 30 days
  topServices: { id: string; name: string; bookings: number; revenue: number }[];
}

export async function getTenantAnalytics(tenantId: string): Promise<ActionResponse<DashboardMetrics>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== tenantId) {
      return { success: false, error: "Akses ditolak." };
    }

    // We fetch bookings for the last 30 days
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, 29));

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        status,
        services (
          id,
          name,
          price
        )
      `)
      .eq("tenant_id", tenantId)
      .gte("booking_date", format(startDate, "yyyy-MM-dd"))
      .lte("booking_date", format(endDate, "yyyy-MM-dd"));

    if (error) {
      return { success: false, error: "Gagal mengambil data analitik." };
    }

    let totalRevenue = 0;
    let completedBookings = 0;
    let cancelledBookings = 0;

    const trendMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      trendMap.set(format(subDays(endDate, i), "yyyy-MM-dd"), 0);
    }

    const serviceStats = new Map<string, { name: string; bookings: number; revenue: number }>();

    (bookings || []).forEach((b: any) => {
      const dateKey = b.booking_date;
      const price = Number(b.services?.price || 0);
      const isCompleted = b.status === "completed" || b.status === "confirmed";

      if (b.status === "cancelled") {
        cancelledBookings++;
      }

      if (isCompleted) {
        totalRevenue += price;
        completedBookings++;
        
        // Update trend
        if (trendMap.has(dateKey)) {
          trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + price);
        }

        // Update services
        if (b.services) {
          const svcId = b.services.id;
          if (!serviceStats.has(svcId)) {
            serviceStats.set(svcId, { name: b.services.name, bookings: 0, revenue: 0 });
          }
          const stat = serviceStats.get(svcId)!;
          stat.bookings += 1;
          stat.revenue += price;
        }
      }
    });

    const recentTrend = Array.from(trendMap.entries()).map(([date, value]) => ({ date, value }));
    const topServices = Array.from(serviceStats.entries())
      .map(([id, stat]) => ({ id, ...stat }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // top 5

    return {
      success: true,
      data: {
        totalRevenue,
        totalBookings: (bookings || []).length,
        completedBookings,
        cancelledBookings,
        recentTrend,
        topServices,
      }
    };
  } catch (err) {
    return { success: false, error: "Gagal memproses data analitik." };
  }
}
