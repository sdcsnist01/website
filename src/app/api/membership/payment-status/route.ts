import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MEMBERSHIP_ORDER_ID_PATTERN,
  getMembershipPaymentByOrderId,
  syncCashfreeMembershipPayment,
} from "@/lib/membership-payments";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * Public: the return page polls this after Cashfree redirects back.
 * Re-checks the order with Cashfree and returns only the outcome and member ID,
 * never personal details.
 */
export async function GET(request: Request) {
  const orderId = new URL(request.url).searchParams.get("order_id") ?? "";
  if (!MEMBERSHIP_ORDER_ID_PATTERN.test(orderId)) {
    return NextResponse.json({ error: "Invalid order reference." }, { status: 400, headers: NO_STORE });
  }

  try {
    const admin = createAdminClient();
    const payment = await getMembershipPaymentByOrderId(admin, orderId);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found." }, { status: 404, headers: NO_STORE });
    }

    const result = await syncCashfreeMembershipPayment(admin, payment);
    return NextResponse.json(
      {
        status: result.status,
        memberId: result.status === "successful" ? result.memberId : null,
        membershipYear: result.membershipYear,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("membership payment-status:", error);
    return NextResponse.json(
      { error: "Could not check the payment right now. Please refresh in a moment." },
      { status: 503, headers: NO_STORE },
    );
  }
}
