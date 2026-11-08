import type { SupabaseClient } from "@supabase/supabase-js";
import { getCashfreeOrder, getCashfreeOrderPayments, resolveCashfreeStatus, type PaymentStatus } from "@/lib/cashfree";
import { sendEmail } from "@/lib/email";
import { eventConfirmationEmail } from "@/lib/payment-emails";

/** Our Cashfree order IDs for events: sdce_<event slug, up to 20 chars>_<12 hex chars>. */
export const EVENT_ORDER_ID_PATTERN = /^sdce_[A-Za-z0-9-]{1,20}_[0-9a-f]{12}$/;

export function buildEventOrderId(slug: string, randomHex: string): string {
  const safeSlug = slug.replace(/[^A-Za-z0-9-]/g, "").slice(0, 20) || "event";
  return `sdce_${safeSlug}_${randomHex}`;
}

/** Registration statuses use 'paid' where our payment helpers say 'successful'. */
export type EventRegistrationStatus = "pending" | "paid" | "failed" | "cancelled";

export function toRegistrationStatus(status: PaymentStatus): EventRegistrationStatus {
  return status === "successful" ? "paid" : status;
}

export type EventRegistrationRow = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  cashfree_order_id: string;
  amount_paise: number;
  status: EventRegistrationStatus;
};

export async function getEventRegistrationByOrderId(
  admin: SupabaseClient,
  orderId: string,
): Promise<EventRegistrationRow | null> {
  const { data, error } = await admin
    .from("event_registrations")
    .select("id, event_id, name, email, cashfree_order_id, amount_paise, status")
    .eq("cashfree_order_id", orderId)
    .maybeSingle();
  if (error) throw new Error(`Registration lookup failed: ${error.message}`);
  return data as EventRegistrationRow | null;
}

/**
 * Asks Cashfree for the order's real status and applies it. Safe to call
 * repeatedly and concurrently; the attendee count is incremented at most once.
 */
export async function syncCashfreeEventPayment(
  admin: SupabaseClient,
  registration: EventRegistrationRow,
): Promise<{ status: EventRegistrationStatus; confirmed: boolean }> {
  if (registration.status === "paid") return { status: "paid", confirmed: false };

  const [order, payments] = await Promise.all([
    getCashfreeOrder(registration.cashfree_order_id),
    getCashfreeOrderPayments(registration.cashfree_order_id),
  ]);
  let resolved = resolveCashfreeStatus(order, payments);

  // Never confirm on a charge that doesn't match the amount we set for this order.
  if (
    resolved.status === "successful" &&
    (Math.round(Number(order.order_amount) * 100) !== registration.amount_paise || order.order_currency !== "INR")
  ) {
    console.error("Cashfree amount mismatch for event order", registration.cashfree_order_id);
    resolved = { ...resolved, status: "pending", detail: "Amount mismatch with Cashfree order. Manual review required." };
  }

  const { data, error } = await admin.rpc("apply_event_payment", {
    p_cashfree_order_id: registration.cashfree_order_id,
    p_status: toRegistrationStatus(resolved.status),
    p_payment_id: resolved.paymentId,
    p_payment_method: resolved.paymentMethod,
    p_paid_at: resolved.paidAt,
    p_status_detail: resolved.detail,
  });
  if (error) throw new Error(`apply_event_payment failed: ${error.message}`);

  const row = (Array.isArray(data) ? data[0] : data) as { final_status: EventRegistrationStatus; confirmed: boolean };

  if (row.confirmed) {
    // Sent once: `confirmed` is true only for the call that confirmed the registration.
    // sendEmail never throws, so a mail problem can't affect the registration.
    const { data: event } = await admin
      .from("events")
      .select("title, event_date, event_time, location")
      .eq("id", registration.event_id)
      .maybeSingle();
    await sendEmail(
      eventConfirmationEmail({
        to: registration.email,
        name: registration.name,
        eventTitle: event?.title ?? "your SDC event",
        date: event?.event_date ?? null,
        time: event?.event_time ?? null,
        location: event?.location ?? null,
        amountPaise: registration.amount_paise,
        orderId: registration.cashfree_order_id,
        paymentId: resolved.paymentId,
      }),
      `event ${registration.cashfree_order_id}`,
    );
  }

  return { status: row.final_status, confirmed: row.confirmed };
}
