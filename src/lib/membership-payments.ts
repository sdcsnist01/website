import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getCashfreeOrder,
  getCashfreeOrderPayments,
  resolveCashfreeStatus,
  type PaymentStatus,
} from "@/lib/cashfree";
import { sendEmail } from "@/lib/email";
import { membershipConfirmationEmail } from "@/lib/payment-emails";

/**
 * Our Cashfree order IDs: sdcm_<member ID>_<12 hex chars>. New member IDs are 6 digits,
 * but older records use other lengths, so any alphanumeric ID up to 20 chars is accepted.
 */
export const MEMBERSHIP_ORDER_ID_PATTERN = /^sdcm_[A-Za-z0-9]{1,20}_[0-9a-f]{12}$/;

/** Builds an order ID from a member ID, keeping only characters Cashfree allows. */
export function buildMembershipOrderId(memberId: string, randomHex: string): string {
  const safeMemberId = memberId.replace(/[^A-Za-z0-9]/g, "").slice(0, 20) || "member";
  return `sdcm_${safeMemberId}_${randomHex}`;
}

export type MembershipPaymentRow = {
  id: string;
  user_id: string | null;
  member_id: string;
  membership_year: number;
  full_name: string;
  email: string;
  gateway_order_id: string;
  payment_session_id: string | null;
  order_expires_at: string | null;
  amount_paise: number;
  status: PaymentStatus;
};

export type SyncResult = {
  status: PaymentStatus;
  memberId: string;
  membershipYear: number;
  activated: boolean;
  alreadyActive: boolean;
};

export async function getMembershipPaymentByOrderId(
  admin: SupabaseClient,
  orderId: string,
): Promise<MembershipPaymentRow | null> {
  const { data, error } = await admin
    .from("membership_payments")
    .select(
      "id, user_id, member_id, membership_year, full_name, email, gateway_order_id, payment_session_id, order_expires_at, amount_paise, status",
    )
    .eq("gateway", "cashfree")
    .eq("gateway_order_id", orderId)
    .maybeSingle();
  if (error) throw new Error(`Payment lookup failed: ${error.message}`);
  return data as MembershipPaymentRow | null;
}

/**
 * Asks Cashfree for the order's real status and applies it. Neither the browser's
 * return redirect nor the webhook body is trusted for the outcome; both only
 * trigger this check. Safe to call repeatedly and concurrently.
 */
export async function syncCashfreeMembershipPayment(
  admin: SupabaseClient,
  payment: MembershipPaymentRow,
): Promise<SyncResult> {
  const base = { memberId: payment.member_id, membershipYear: payment.membership_year };

  if (payment.status === "successful") {
    return { ...base, status: "successful", activated: false, alreadyActive: false };
  }

  const [order, payments] = await Promise.all([
    getCashfreeOrder(payment.gateway_order_id),
    getCashfreeOrderPayments(payment.gateway_order_id),
  ]);
  let resolved = resolveCashfreeStatus(order, payments);

  // Never activate on a charge that doesn't match the amount we set for this order.
  if (
    resolved.status === "successful" &&
    (Math.round(Number(order.order_amount) * 100) !== payment.amount_paise || order.order_currency !== "INR")
  ) {
    console.error("Cashfree amount mismatch for order", payment.gateway_order_id);
    resolved = {
      ...resolved,
      status: "pending",
      detail: "Amount mismatch with Cashfree order. Manual review required.",
    };
  }

  const { data, error } = await admin.rpc("apply_membership_payment", {
    p_gateway_order_id: payment.gateway_order_id,
    p_status: resolved.status,
    p_gateway_payment_id: resolved.paymentId,
    p_payment_method: resolved.paymentMethod,
    p_paid_at: resolved.paidAt,
    p_status_detail: resolved.detail,
  });
  if (error) throw new Error(`apply_membership_payment failed: ${error.message}`);

  const row = (Array.isArray(data) ? data[0] : data) as {
    final_status: PaymentStatus;
    activated: boolean;
    already_active: boolean;
    user_id: string | null;
  };

  if (row.activated && row.user_id) {
    // First activation only: confirm the account's email and set the profile name.
    await admin.auth.admin.updateUserById(row.user_id, { email_confirm: true });
    await admin.from("profiles").update({ full_name: payment.full_name }).eq("id", row.user_id);
  }

  if (row.activated) {
    // Sent once: `activated` is true only for the call that activated the membership.
    // sendEmail never throws, so a mail problem can't affect the payment.
    await sendEmail(
      membershipConfirmationEmail({
        to: payment.email,
        name: payment.full_name,
        memberId: payment.member_id,
        membershipYear: payment.membership_year,
        amountPaise: payment.amount_paise,
        orderId: payment.gateway_order_id,
        paymentId: resolved.paymentId,
      }),
      `membership ${payment.gateway_order_id}`,
    );
  }

  return {
    ...base,
    status: row.final_status,
    activated: row.activated,
    alreadyActive: row.already_active,
  };
}
