import { createHmac, timingSafeEqual } from "crypto";

/**
 * Cashfree Payment Gateway (PG) helpers. Server only: reads CASHFREE_SECRET_KEY.
 * All gateway-specific details live here so the rest of the app deals only with
 * our own payment statuses: pending, successful, failed, cancelled.
 */

const API_VERSION = "2023-08-01";
const BASE_URLS = {
  sandbox: "https://sandbox.cashfree.com/pg",
  production: "https://api.cashfree.com/pg",
} as const;

export type CashfreeMode = keyof typeof BASE_URLS;
export type PaymentStatus = "pending" | "successful" | "failed" | "cancelled";

export function getCashfreeMode(): CashfreeMode {
  // Production must be opted into explicitly; anything else stays in sandbox.
  return process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";
}

function getCredentials() {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secretKey) {
    throw new Error("Missing Cashfree credentials");
  }
  return { appId, secretKey };
}

async function cashfreeRequest<T>(path: string, init: { method: "GET" | "POST"; body?: unknown }): Promise<T> {
  const { appId, secretKey } = getCredentials();
  const res = await fetch(`${BASE_URLS[getCashfreeMode()]}${path}`, {
    method: init.method,
    headers: {
      "Content-Type": "application/json",
      "x-api-version": API_VERSION,
      "x-client-id": appId,
      "x-client-secret": secretKey,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const data = (await res.json().catch(() => null)) as (T & { message?: string; code?: string }) | null;
  if (!res.ok || !data) {
    // Cashfree error bodies carry a message and code but no secrets or card data.
    throw new Error(`Cashfree ${init.method} ${path} failed (${res.status}): ${data?.message ?? "no response body"}`);
  }
  return data;
}

export type CashfreeOrder = {
  cf_order_id: string | number;
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
  payment_session_id?: string;
  order_expiry_time?: string;
};

export type CashfreePayment = {
  cf_payment_id: string | number;
  payment_status: string;
  payment_amount?: number;
  payment_currency?: string;
  payment_group?: string;
  payment_message?: string;
  payment_time?: string;
  payment_completion_time?: string;
};

export function createCashfreeOrder(input: {
  orderId: string;
  amountPaise: number;
  customer: { id: string; name: string; email: string; phone: string };
  returnUrl: string;
  notifyUrl: string | null;
  note: string;
}): Promise<CashfreeOrder> {
  return cashfreeRequest<CashfreeOrder>("/orders", {
    method: "POST",
    body: {
      order_id: input.orderId,
      // Cashfree takes the amount in rupees; ours is stored in paise.
      order_amount: input.amountPaise / 100,
      order_currency: "INR",
      customer_details: {
        customer_id: input.customer.id,
        customer_name: input.customer.name,
        customer_email: input.customer.email,
        customer_phone: input.customer.phone,
      },
      order_meta: {
        return_url: input.returnUrl,
        ...(input.notifyUrl ? { notify_url: input.notifyUrl } : {}),
      },
      order_note: input.note,
    },
  });
}

export function getCashfreeOrder(orderId: string): Promise<CashfreeOrder> {
  return cashfreeRequest<CashfreeOrder>(`/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
}

export function getCashfreeOrderPayments(orderId: string): Promise<CashfreePayment[]> {
  return cashfreeRequest<CashfreePayment[]>(`/orders/${encodeURIComponent(orderId)}/payments`, { method: "GET" });
}

/**
 * Verifies a webhook: base64(HMAC-SHA256(timestamp + rawBody, secret key)).
 * `rawBody` must be the request body exactly as received, before JSON parsing.
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
  secretKey: string,
): boolean {
  if (!timestamp || !signature || !secretKey) return false;
  const expected = createHmac("sha256", secretKey).update(timestamp + rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function getCashfreeWebhookSecret(): string {
  return getCredentials().secretKey;
}

export type ResolvedPayment = {
  status: PaymentStatus;
  paymentId: string | null;
  paymentMethod: string | null;
  paidAt: string | null;
  detail: string | null;
};

function paymentTime(p: CashfreePayment): number {
  return Date.parse(p.payment_completion_time ?? p.payment_time ?? "") || 0;
}

/**
 * Maps Cashfree's order status and payment attempts to our status.
 * - Any SUCCESS attempt, or order PAID → successful.
 * - Order EXPIRED / TERMINATED → cancelled (no further attempts possible).
 * - Otherwise the latest attempt decides: FAILED → failed;
 *   USER_DROPPED / CANCELLED / VOID → cancelled; PENDING or none → pending.
 *   An ACTIVE order can still be paid later, so failed/cancelled are not final.
 */
export function resolveCashfreeStatus(order: CashfreeOrder, payments: CashfreePayment[]): ResolvedPayment {
  const success = payments.find((p) => p.payment_status === "SUCCESS");
  if (success || order.order_status === "PAID") {
    return {
      status: "successful",
      paymentId: success ? String(success.cf_payment_id) : null,
      paymentMethod: success?.payment_group ?? null,
      paidAt: success?.payment_completion_time ?? success?.payment_time ?? null,
      detail: null,
    };
  }

  const latest = [...payments].sort((a, b) => paymentTime(b) - paymentTime(a))[0];
  const latestFields = {
    paymentId: latest ? String(latest.cf_payment_id) : null,
    paymentMethod: latest?.payment_group ?? null,
    paidAt: null,
  };

  if (["EXPIRED", "TERMINATED", "TERMINATION_REQUESTED"].includes(order.order_status)) {
    return { status: "cancelled", ...latestFields, detail: `Order ${order.order_status.toLowerCase()}` };
  }

  switch (latest?.payment_status) {
    case "FAILED":
      return { status: "failed", ...latestFields, detail: latest.payment_message ?? "Payment failed" };
    case "USER_DROPPED":
    case "CANCELLED":
    case "VOID":
      return { status: "cancelled", ...latestFields, detail: "Payment was not completed" };
    default:
      return { status: "pending", ...latestFields, detail: null };
  }
}
