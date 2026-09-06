"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import webpush from "web-push";
import type { ActionResponse } from "./tenant.actions";

// Initialize web-push with VAPID keys
// This is safe even if env vars are missing at build time, it will just throw when used
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function savePushSubscription(
  subscription: any,
  type: "dashboard" | "storefront"
): Promise<ActionResponse<null>> {
  try {
    let tenantId = null;
    let supabase;

    if (type === "dashboard") {
      supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: "Akses ditolak: Anda belum login." };
      }
      tenantId = user.id;
    } else {
      supabase = createAdminClient();
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          tenant_id: tenantId,
          endpoint: subscription.endpoint,
          keys_p256dh: subscription.keys.p256dh,
          keys_auth: subscription.keys.auth,
          subscription_type: type,
        },
        { onConflict: "endpoint" }
      );

    if (error) {
      console.error("Gagal menyimpan subscription:", error);
      return { success: false, error: "Gagal menyimpan pendaftaran notifikasi." };
    }

    return { success: true, data: null };
  } catch (err) {
    console.error("Error savePushSubscription:", err);
    return { success: false, error: "Terjadi kesalahan internal saat menyimpan." };
  }
}

export async function sendPushToTenant(
  tenantId: string,
  title: string,
  body: string,
  url: string
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not configured. Skipping push notification.");
    return;
  }

  try {
    const supabase = createAdminClient();
    
    // Ambil semua langganan tenant bersangkutan (dashboard)
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, keys_p256dh, keys_auth")
      .eq("tenant_id", tenantId)
      .eq("subscription_type", "dashboard");

    if (error || !subscriptions || subscriptions.length === 0) {
      return;
    }

    const payload = JSON.stringify({ title, body, url });

    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys_p256dh,
            auth: sub.keys_auth,
          },
        };

        await webpush.sendNotification(pushSubscription, payload);
      } catch (err: any) {
        console.error("Failed to send push notification to endpoint:", sub.endpoint, err);
        // Self-cleaning: jika expired/invalid
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        }
      }
    }
  } catch (err) {
    console.error("Error sendPushToTenant:", err);
  }
}
