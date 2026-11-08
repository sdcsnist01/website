import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCashfreeWebhookSecret, verifyCashfreeWebhookSignature } from "@/lib/cashfree";
import {
  MEMBERSHIP_ORDER_ID_PATTERN,
  getMembershipPaymentByOrderId,
  syncCashfreeMembershipPayment,
} from "@/lib/membership-payments";

type CashfreeWebhookBody = {
  type?: string;
  data?: {
    order?: { order_id?: string };
    payment?: { cf_payment_id?: string | number };
  };
};

/**
 * Cashfree payment webhooks. The signature proves the call came from Cashfree;
 * the outcome is then re-read from Cashfree's API, so a replayed or reordered
 * webhook can't change a payment. Returns 2xx once handled so Cashfree stops
 * retrying, and 5xx on our own failures so it retries later.
 */
export async function POST(request: Request) {
  // The signature covers the exact bytes received, so read the raw body first.
  const rawBody = await request.text();

  let secret: string;
  try {
    secret = getCashfreeWebhookSecret();
  } catch {
    console.error("cashfree-webhook: Cashfree credentials are not configured");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const valid = verifyCashfreeWebhookSignature(
    rawBody,
    request.headers.get("x-webhook-timestamp"),
    request.headers.get("x-webhook-signature"),
    secret,
  );
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let body: CashfreeWebhookBody;
  try {
    body = JSON.parse(rawBody) as CashfreeWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const orderId = body.data?.order?.order_id ?? "";
  const eventType = body.type ?? "UNKNOWN";
  const cfPaymentId = body.data?.payment?.cf_payment_id;

  // Not a membership order (e.g. another product on the same Cashfree account).
  if (!MEMBERSHIP_ORDER_ID_PATTERN.test(orderId)) {
    return NextResponse.json({ ignored: true });
  }

  const admin = createAdminClient();
  const { data: eventId, error: eventError } = await admin.rpc("record_membership_webhook_event", {
    p_event_type: eventType,
    p_gateway_order_id: orderId,
    p_gateway_payment_id: cfPaymentId === undefined ? null : String(cfPaymentId),
  });
  if (eventError) {
    console.error("cashfree-webhook: could not record event:", eventError);
    return NextResponse.json({ error: "Could not record event." }, { status: 500 });
  }

  try {
    const payment = await getMembershipPaymentByOrderId(admin, orderId);
    if (!payment) {
      // Our order format but no row: never created by us. Acknowledge and log.
      await admin
        .from("membership_payment_webhook_events")
        .update({ processed_at: new Date().toISOString(), processing_error: "No matching payment row" })
        .eq("id", eventId);
      return NextResponse.json({ ignored: true });
    }

    await syncCashfreeMembershipPayment(admin, payment);
    await admin
      .from("membership_payment_webhook_events")
      .update({ processed_at: new Date().toISOString(), processing_error: null })
      .eq("id", eventId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Processing failed";
    console.error("cashfree-webhook: processing failed:", message);
    await admin
      .from("membership_payment_webhook_events")
      .update({ processing_error: message.slice(0, 500) })
      .eq("id", eventId);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}
