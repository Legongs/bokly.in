import { createClient } from "@supabase/supabase-js";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

async function check() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const DEMO_TENANT_ID = "d290f1ee-6c54-4b01-90e6-d701748f0851";
  
  const endDate = endOfDay(new Date());
  const startDate = startOfDay(subDays(endDate, 29));
  
  console.log("Start:", startDate.toISOString());
  console.log("End:", endDate.toISOString());

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`id, created_at, booking_date, payment_status, services(id, name, price)`)
    .eq("tenant_id", DEMO_TENANT_ID)
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());
    
  console.log("Found bookings:", bookings?.length);
  
  const trendMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    trendMap.set(format(subDays(endDate, i), "yyyy-MM-dd"), 0);
  }
  
  bookings?.forEach((b: any) => {
    const dateKey = format(new Date(b.created_at), "yyyy-MM-dd");
    const isCompleted = b.payment_status === "approved";
    console.log(`Booking ${b.id}: created_at=${b.created_at} -> dateKey=${dateKey} | approved=${isCompleted} | price=${b.services?.price} | in map? ${trendMap.has(dateKey)}`);
    
    if (isCompleted && trendMap.has(dateKey)) {
      trendMap.set(dateKey, trendMap.get(dateKey)! + Number(b.services?.price || 0));
    }
  });
  
  console.log("Trend values > 0:");
  for (const [k, v] of trendMap.entries()) {
    if (v > 0) console.log(`${k}: ${v}`);
  }
}

require("dotenv").config();
check();
