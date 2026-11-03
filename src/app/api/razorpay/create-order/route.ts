import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventSlug, name, email, phone } = body as {
      eventSlug?: string;
      name?: string;
      email?: string;
      phone?: string;
    };

    if (!eventSlug || !name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Event, name, and email are required." }, { status: 400 });
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

    if (!event.requires_payment || event.registration_fee_paise <= 0) {
      return NextResponse.json({ error: "This event does not require paid registration." }, { status: 400 });
    }

    if (event.seats != null && event.attendees >= event.seats) {
      return NextResponse.json({ error: "No seats left for this event." }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    const receipt = `evt_${event.slug}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: event.registration_fee_paise,
      currency: "INR",
      receipt,
      notes: {
        event_slug: event.slug,
        event_title: event.title,
        registrant_email: email.trim(),
      },
    });

    const { data: registration, error: regError } = await admin
      .from("event_registrations")
      .insert({
        event_id: event.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        amount_paise: event.registration_fee_paise,
        currency: "INR",
        razorpay_order_id: order.id,
        status: "pending",
      })
      .select("id")
      .single();

    if (regError || !registration) {
      return NextResponse.json({ error: "Could not save registration." }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      registrationId: registration.id,
      eventTitle: event.title,
    });
  } catch (error) {
    console.error("create-order error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment order." },
      { status: 500 },
    );
  }
}
