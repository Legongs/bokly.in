// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Helper function to format date to Indonesian format (e.g., "Senin, 14 Juli 2025")
function formatIndonesianDate(dateString: string) {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const date = new Date(dateString);
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

async function sendFonnteMessage(token: string, target: string, message: string) {
  const response = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      "Authorization": token,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      target: target,
      message: message,
      countryCode: "62",
    }).toString(),
  });
  return response.json();
}

serve(async (req) => {
  try {
    // 1. Authorization Check
    const authHeader = req.headers.get("Authorization");
    const cronSecret = Deno.env.get("CRON_SECRET");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Allow if Authorization matches CRON_SECRET or SERVICE_ROLE_KEY
    if (
      authHeader !== `Bearer ${cronSecret}` &&
      authHeader !== `Bearer ${serviceRoleKey}`
    ) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Determine tomorrow's date in YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Adjust to Asia/Jakarta timezone roughly (UTC+7) if needed, but for simple date:
    const tomorrowStr = new Date(tomorrow.getTime() + 7 * 60 * 60 * 1000).toISOString().split("T")[0];

    console.log(`[send-booking-reminders] Executing for date: ${tomorrowStr}`);

    // 4. Query bookings for tomorrow that are approved and reminder_sent = false
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        customer_name,
        customer_wa,
        booking_date,
        start_time,
        payment_status,
        reminder_sent,
        services (
          name
        ),
        tenants (
          id,
          business_name,
          whatsapp_number,
          wa_api_key
        )
      `)
      .eq("booking_date", tomorrowStr)
      .eq("payment_status", "approved")
      .eq("reminder_sent", false);

    if (bookingsError) {
      throw new Error(`Failed to fetch bookings: ${bookingsError.message}`);
    }

    if (!bookings || bookings.length === 0) {
      return new Response(JSON.stringify({ sent: 0, failed: 0, skipped: 0, message: "No bookings to remind" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    let failed = 0;
    const globalFonnteToken = Deno.env.get("FONNTE_TOKEN");

    // Group bookings by tenant to send a summarized admin reminder
    const tenantSummary: Record<string, any> = {};

    // 5. Send reminders to customers
    for (const booking of bookings) {
      const tenant = booking.tenants;
      const service = booking.services;
      const fonnteToken = tenant.wa_api_key || globalFonnteToken;

      if (!fonnteToken) {
        console.warn(`[Skipping] No Fonnte Token for booking ${booking.id}`);
        failed++;
        continue;
      }

      const formattedDate = formatIndonesianDate(booking.booking_date);
      const startTime = booking.start_time.slice(0, 5); // Format HH:MM

      const customerMessage = `Halo ${booking.customer_name} 👋\n\nReminder booking kamu besok di ${tenant.business_name}:\n\n📅 ${formattedDate}\n⏰ ${startTime} WIB\n✂️ ${service.name}\n\nSampai jumpa besok ya! Kalau ada perubahan, hubungi kami di sini.`;

      try {
        const fonnteRes = await sendFonnteMessage(fonnteToken, booking.customer_wa, customerMessage);
        
        if (fonnteRes.status) {
          // Update reminder_sent flag
          await supabase
            .from("bookings")
            .update({ reminder_sent: true })
            .eq("id", booking.id);
            
          sent++;

          // Prepare summary for tenant
          if (!tenantSummary[tenant.id]) {
            tenantSummary[tenant.id] = {
              tenant,
              bookings: [],
              fonnteToken
            };
          }
          tenantSummary[tenant.id].bookings.push({
            time: startTime,
            customer: booking.customer_name,
            service: service.name
          });

        } else {
          console.error(`[Fonnte Error] Booking ${booking.id}:`, fonnteRes);
          failed++;
        }
      } catch (err) {
        console.error(`[Error] Booking ${booking.id}:`, err);
        failed++;
      }
    }

    // 6. Send summary to each tenant
    for (const tenantId in tenantSummary) {
      const summary = tenantSummary[tenantId];
      if (summary.bookings.length > 0 && summary.tenant.whatsapp_number) {
        // Sort bookings by time
        summary.bookings.sort((a: any, b: any) => a.time.localeCompare(b.time));
        
        const N = summary.bookings.length;
        let adminMessage = `📋 Reminder Admin — Jadwal Besok\n\nHai ${summary.tenant.business_name}, besok ada ${N} booking yang sudah confirmed:\n\n`;
        
        for (const b of summary.bookings) {
          adminMessage += `⏰ ${b.time} — ${b.customer} (${b.service})\n`;
        }
        
        adminMessage += `\nSemangat melayani! 💪`;

        try {
          await sendFonnteMessage(summary.fonnteToken, summary.tenant.whatsapp_number, adminMessage);
        } catch (err) {
          console.error(`[Error] Failed to send admin reminder to tenant ${tenantId}:`, err);
        }
      }
    }

    return new Response(JSON.stringify({ sent, failed, skipped: 0 }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
