import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EVENT_ORDER_ID_PATTERN, getEventRegistrationByOrderId, syncCashfreeEventPayment } from "@/lib/event-payments";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * Public: the event return page polls this after Cashfree redirects back.
 * Re-checks the order with Cashfree; returns the outcome and event title only.
 */
export async function GET(request: Request) {
  const orderId = new URL(request.url).searchParams.get("order_id") ?? "";
  if (!EVENT_ORDER_ID_PATTERN.test(orderId)) {
    return NextResponse.json({ error: "Invalid order reference." }, { status: 400, headers: NO_STORE });
  }

  try {
    const admin = createAdminClient();
    const registration = await getEventRegistrationByOrderId(admin, orderId);
    if (!registration) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404, headers: NO_STORE });
    }

    const [result, { data: event }] = await Promise.all([
      syncCashfreeEventPayment(admin, registration),
      admin.from("events").select("title, slug").eq("id", registration.event_id).maybeSingle(),
    ]);

    return NextResponse.json(
      { status: result.status, eventTitle: event?.title ?? null, eventSlug: event?.slug ?? null },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("event payment-status:", error);
    return NextResponse.json(
      { error: "Could not check the payment right now. Please refresh in a moment." },
      { status: 503, headers: NO_STORE },
    );
  }
}
