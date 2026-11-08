import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCashfreeOrder, getCashfreeMode } from "@/lib/cashfree";
import { buildEventOrderId } from "@/lib/event-payments";
import { getCashfreeNotifyUrl, getSiteUrl, normalizePhone } from "@/lib/payment-request";

// Reuse an open order only if it stays payable for at least this long.
const ORDER_REUSE_MIN_REMAINING_MS = 5 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Paid event registration through Cashfree. The fee always comes from the event row. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventSlug, name, email, phone } = body as {
      eventSlug?: string;
      name?: string;
      email?: string;
      phone?: string;
    };

    const fullName = name?.trim();
    const mail = email?.trim().toLowerCase();
    const mobile = phone ? normalizePhone(phone) : null;

    if (!eventSlug || !fullName || !mail) {
      return NextResponse.json({ error: "Event, name, and email are required." }, { status: 400 });
    }
    if (!EMAIL_PATTERN.test(mail)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!mobile) {
      return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: event, error: eventError } = await admin
      .from("events")
      .select("id, slug, title, requires_payment, registration_fee_paise, is_past, seats, attendees")
      .eq("slug", eventSlug)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }
    if (event.is_past) {
      return NextResponse.json({ error: "Registration is closed for this event." }, { status: 400 });
    }
    if (!event.requires_payment || !(event.registration_fee_paise > 0)) {
      return NextResponse.json({ error: "This event does not require paid registration." }, { status: 400 });
    }
    if (event.seats != null && event.attendees >= event.seats) {
      return NextResponse.json({ error: "No seats left for this event." }, { status: 400 });
    }

    const { data: existing } = await admin
      .from("event_registrations")
      .select("cashfree_order_id, payment_session_id, order_expires_at, amount_paise, status")
      .eq("event_id", event.id)
      .eq("email", mail)
      .order("created_at", { ascending: false });

    if (existing?.some((r) => r.status === "paid")) {
      return NextResponse.json({ error: "This email is already registered for this event." }, { status: 400 });
    }

    const mode = getCashfreeMode();

    // Interrupted checkout: reuse the open order at the current fee instead of
    // creating a second one that could be paid twice.
    const reuseAfter = Date.now() + ORDER_REUSE_MIN_REMAINING_MS;
    const open = existing?.find(
      (r) =>
        r.cashfree_order_id &&
        r.payment_session_id &&
        r.amount_paise === event.registration_fee_paise &&
        r.order_expires_at &&
        Date.parse(r.order_expires_at) > reuseAfter,
    );
    if (open) {
      return NextResponse.json({
        orderId: open.cashfree_order_id,
        paymentSessionId: open.payment_session_id,
        mode,
      });
    }

    const orderId = buildEventOrderId(event.slug, randomBytes(6).toString("hex"));

    // Record the registration before Cashfree knows about the order, so a payment
    // can never arrive for an order we have no row for. The amount is fixed here.
    const { error: insertError } = await admin.from("event_registrations").insert({
      event_id: event.id,
      name: fullName,
      email: mail,
      phone: mobile,
      amount_paise: event.registration_fee_paise,
      currency: "INR",
      gateway: "cashfree",
      cashfree_order_id: orderId,
      status: "pending",
    });
    if (insertError) {
      console.error("event_registrations insert failed:", insertError);
      return NextResponse.json({ error: "Could not save registration." }, { status: 500 });
    }

    const siteUrl = getSiteUrl(request);
    let order;
    try {
      order = await createCashfreeOrder({
        orderId,
        amountPaise: event.registration_fee_paise,
        // Event registrants have no account; a hash of the email is a stable customer ID.
        customer: {
          id: `evt_${createHash("sha256").update(mail).digest("hex").slice(0, 24)}`,
          name: fullName,
          email: mail,
          phone: mobile,
        },
        returnUrl: `${siteUrl}/events/payment-status?order_id={order_id}`,
        notifyUrl: getCashfreeNotifyUrl(siteUrl),
        note: `SDC SNIST event: ${event.title}`.slice(0, 200),
      });
    } catch (err) {
      await admin
        .from("event_registrations")
        .update({ status: "cancelled", status_detail: "Cashfree order could not be created", updated_at: new Date().toISOString() })
        .eq("cashfree_order_id", orderId);
      throw err;
    }

    if (!order.payment_session_id) {
      throw new Error("Cashfree did not return a payment session");
    }

    await admin
      .from("event_registrations")
      .update({
        cashfree_cf_order_id: String(order.cf_order_id),
        payment_session_id: order.payment_session_id,
        order_expires_at: order.order_expiry_time ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("cashfree_order_id", orderId);

    return NextResponse.json({ orderId, paymentSessionId: order.payment_session_id, mode });
  } catch (error) {
    console.error("event create-order:", error);
    const message = error instanceof Error ? error.message : "Failed to start payment.";
    const friendly =
      message === "Missing Cashfree credentials"
        ? "Payments are not configured. Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY."
        : message.startsWith("Cashfree")
          ? "Could not start the payment with Cashfree. Please try again."
          : "Could not start the payment. Please try again.";
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
