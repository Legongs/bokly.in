"use server";

import { z } from "zod";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { PLAN_PRICES } from "@/lib/subscription";
import type { ActionResponse } from "@/lib/actions/tenant.actions";
import type { BillingCycle, SubscriptionPlan } from "@/types/database.types";

// ── Constants ─────────────────────────────────────────────────────────────────
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? "";
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";
const MIDTRANS_SNAP_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions";

// ── Schemas ───────────────────────────────────────────────────────────────────
const createBillingIntentSchema = z.object({
  plan: z.enum(["pro", "bisnis"]),
  billingCycle: z.enum(["monthly", "yearly"]),
});

// ── createBillingIntent ───────────────────────────────────────────────────────
/**
 * Buat billing intent baru, panggil Midtrans Snap API, dan return snap token.
 * Tenant harus login — tenant_id diambil dari auth session.
 */
export async function createBillingIntent(
  plan: "pro" | "bisnis",
  billingCycle: BillingCycle
): Promise<ActionResponse<{ snapToken: string; orderId: string }>> {
  const parsed = createBillingIntentSchema.safeParse({ plan, billingCycle });
  if (!parsed.success) {
    return { success: false, error: "Data paket tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Kamu belum login. Silakan login ulang." };
    }

    const amount = PLAN_PRICES[parsed.data.plan][parsed.data.billingCycle === "monthly" ? "monthly" : "yearly"];
    const orderId = `buklyin-${user.id.slice(0, 8)}-${Date.now()}`;

    // Insert billing intent ke DB
    const { data: intentData, error: insertError } = await supabase
      .from("billing_intents")
      .insert({
        tenant_id: user.id,
        plan: parsed.data.plan,
        billing_cycle: parsed.data.billingCycle,
        amount,
        midtrans_order_id: orderId,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !intentData) {
      return { success: false, error: "Gagal membuat sesi pembayaran. Coba lagi ya." };
    }

    // Panggil Midtrans Snap API
    const authHeader = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64")}`;
    const planLabel = parsed.data.plan === "pro" ? "Paket Pro" : "Paket Bisnis";
    const cycleLabel = parsed.data.billingCycle === "monthly" ? "Bulanan" : "Tahunan";

    const snapRes = await fetch(MIDTRANS_SNAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        item_details: [
          {
            id: `${parsed.data.plan}-${parsed.data.billingCycle}`,
            price: amount,
            quantity: 1,
            name: `bukly.in ${planLabel} ${cycleLabel}`,
          },
        ],
        customer_details: {
          email: user.email,
        },
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://buklyin.vercel.app"}/dashboard/billing?payment=success`,
          error: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://buklyin.vercel.app"}/dashboard/billing?payment=error`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://buklyin.vercel.app"}/dashboard/billing?payment=pending`,
        },
      }),
    });

    if (!snapRes.ok) {
      return { success: false, error: "Gagal menghubungi gateway pembayaran. Coba lagi." };
    }

    const snapData = await snapRes.json();
    const snapToken: string = snapData.token;

    if (!snapToken) {
      return { success: false, error: "Gagal mendapatkan token pembayaran dari Midtrans." };
    }

    // Simpan snap token ke DB
    await supabase
      .from("billing_intents")
      .update({ midtrans_token: snapToken })
      .eq("id", intentData.id);

    return { success: true, data: { snapToken, orderId } };
  } catch {
    return { success: false, error: "Terjadi gangguan sistem. Coba lagi beberapa saat." };
  }
}

// ── handleMidtransWebhook ─────────────────────────────────────────────────────
/**
 * Verifikasi signature Midtrans dan update subscription sesuai status pembayaran.
 * Dipanggil dari POST /api/billing/webhook.
 */
export async function handleMidtransWebhook(payload: unknown): Promise<void> {
  if (!payload || typeof payload !== "object") return;

  const p = payload as Record<string, string>;
  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = p;

  // Verifikasi signature: SHA512(orderId + statusCode + grossAmount + serverKey)
  const expectedSignature = createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
    .digest("hex");

  if (signature_key !== expectedSignature) {
    console.error("[Webhook] Signature tidak valid, abaikan.");
    return;
  }

  // Tentukan apakah pembayaran berhasil
  const isPaid =
    (transaction_status === "capture" && fraud_status === "accept") ||
    transaction_status === "settlement";

  const isFailed =
    transaction_status === "deny" ||
    transaction_status === "cancel" ||
    transaction_status === "expire";

  try {
    const supabase = await createClient();

    // Ambil billing intent dari DB
    const { data: intent } = await supabase
      .from("billing_intents")
      .select("id, tenant_id, plan, billing_cycle, amount")
      .eq("midtrans_order_id", order_id)
      .single();

    if (!intent) {
      console.error("[Webhook] Billing intent tidak ditemukan untuk order:", order_id);
      return;
    }

    if (isPaid) {
      // Update billing intent status
      await supabase
        .from("billing_intents")
        .update({ status: "paid" })
        .eq("midtrans_order_id", order_id);

      // Hitung periode subscription baru
      const now = new Date();
      const periodEnd = new Date(now);
      if (intent.billing_cycle === "yearly") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // Upgrade subscription tenant
      await supabase
        .from("subscriptions")
        .update({
          plan: intent.plan as SubscriptionPlan,
          status: "active",
          billing_cycle: intent.billing_cycle as BillingCycle,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          midtrans_order_id: order_id,
          updated_at: now.toISOString(),
        })
        .eq("tenant_id", intent.tenant_id);

    } else if (isFailed) {
      await supabase
        .from("billing_intents")
        .update({ status: "failed" })
        .eq("midtrans_order_id", order_id);
    }
  } catch (err) {
    console.error("[Webhook] Error memproses webhook:", err);
  }
}
