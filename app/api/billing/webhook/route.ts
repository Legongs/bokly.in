import { NextRequest, NextResponse } from "next/server";
import { handleMidtransWebhook } from "@/lib/actions/billing.actions";
import * as Sentry from "@sentry/nextjs";

// POST /api/billing/webhook
// Midtrans akan POST ke endpoint ini setiap kali status pembayaran berubah.
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    await handleMidtransWebhook(payload);
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    // Capture ke Sentry tapi tetap return 200 
    // agar Midtrans tidak retry terus-menerus
    Sentry.captureException(error, {
      tags: { context: "midtrans_webhook" },
      extra: { timestamp: new Date().toISOString() },
    });
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }
}
