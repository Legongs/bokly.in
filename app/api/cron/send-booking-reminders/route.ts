import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { canUseAutoWaFeature } from "@/lib/subscription";
import { getGlobalFonnteConfig, isGlobalWaReady } from "@/lib/global-wa";

export const maxDuration = 60; // 60 seconds (untuk cron job Pro di Vercel)
export const dynamic = "force-dynamic"; // pastikan selalu dinamis

export async function GET(req: Request) {
  try {
    // 1. Validasi header CRON_SECRET
    const authHeader = req.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await getGlobalFonnteConfig();
    if (!isGlobalWaReady(config)) {
      return NextResponse.json({
        message: "Global WA disabled or API Key missing. Skipping cron.",
      });
    }

    const supabase = createAdminClient();
    
    // Timezone: Asia/Jakarta (WIB)
    const options = { timeZone: "Asia/Jakarta" };
    const today = new Date();
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-CA", options); // YYYY-MM-DD
    };

    const h1Date = new Date(today);
    h1Date.setDate(today.getDate() + 1);
    const h1DateString = formatDate(h1Date);

    const h2Date = new Date(today);
    h2Date.setDate(today.getDate() + 2);
    const h2DateString = formatDate(h2Date);

    const h3Date = new Date(today);
    h3Date.setDate(today.getDate() + 3);
    const h3DateString = formatDate(h3Date);

    let h1_sent = 0;
    let h2_sent = 0;
    let h3_sent = 0;
    let errors = 0;

    // Helper untuk mengirim WhatsApp dengan retry minimal & penanganan error agar loop tidak putus
    const sendWa = async (targetPhone: string, message: string) => {
      let normalizedPhone = targetPhone;
      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = "62" + normalizedPhone.slice(1);
      }
      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          "Authorization": config.apiKey,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          target: normalizedPhone,
          message: message,
          countryCode: "62",
        }).toString(),
      });
      const resData = await response.json();
      return response.ok && resData.status;
    };

    // Helper untuk memproses satu kelompok hari (H-1, H-2, atau H-3)
    const processGroup = async (
      dateString: string,
      flagColumn: "reminder_h1_sent" | "reminder_h2_sent" | "reminder_h3_sent",
      daysDesc: string
    ) => {
      let sentCount = 0;
      
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(`
          id, 
          tenant_id, 
          customer_name, 
          customer_wa, 
          booking_date, 
          start_time,
          tenants (business_name),
          services (name)
        `)
        .eq("payment_status", "approved")
        .eq(flagColumn, false)
        .eq("booking_date", dateString);

      if (error || !bookings) {
        console.error(`Error fetching bookings for ${daysDesc}:`, error);
        return 0;
      }

      for (const booking of bookings) {
        try {
          const tenant = booking.tenants as any;
          const service = booking.services as any;

          // Cek langganan (hanya Pro/Bisnis yang berhak mendapat WA otomatis)
          const canUse = await canUseAutoWaFeature(booking.tenant_id, "reminder");
          if (!canUse) continue; // skip

          const message = `Halo ${booking.customer_name}! Pengingat booking kamu di ${tenant.business_name}:

📅 ${booking.booking_date} (${daysDesc})
⏰ Jam ${booking.start_time.slice(0, 5)}
✂️ ${service.name}

Sampai jumpa!`;

          const success = await sendWa(booking.customer_wa, message);
          if (success) {
            await supabase
              .from("bookings")
              .update({ [flagColumn]: true } as any)
              .eq("id", booking.id);
            sentCount++;
          } else {
            errors++;
          }
        } catch (err) {
          console.error(`Error processing booking ${booking.id}:`, err);
          errors++;
        }
      }
      return sentCount;
    };

    // Eksekusi per kelompok
    h3_sent = await processGroup(h3DateString, "reminder_h3_sent", "3 hari lagi");
    h2_sent = await processGroup(h2DateString, "reminder_h2_sent", "2 hari lagi");
    h1_sent = await processGroup(h1DateString, "reminder_h1_sent", "besok");

    return NextResponse.json({
      h3_sent,
      h2_sent,
      h1_sent,
      errors
    });

  } catch (error: any) {
    console.error("Cron exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
