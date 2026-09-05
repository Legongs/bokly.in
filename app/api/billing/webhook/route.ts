import { NextRequest, NextResponse } from "next/server";
import { handleMidtransWebhook } from "@/lib/actions/billing.actions";

// POST /api/billing/webhook
// Midtrans akan POST ke endpoint ini setiap kali status pembayaran berubah.
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    await handleMidtransWebhook(payload);
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch {
    // Return 200 agar Midtrans tidak retry terus-menerus
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }
}
