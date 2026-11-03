import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function verifySignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = body as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      registrationId?: string;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !registrationId) {
      return NextResponse.json({ error: "Invalid payment response." }, { status: 400 });
    }

    if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: registration, error: regError } = await admin
      .from("event_registrations")
      .select("id, event_id, status, razorpay_order_id")
      .eq("id", registrationId)
      .single();

    if (regError || !registration) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    if (registration.razorpay_order_id !== razorpay_order_id) {
      return NextResponse.json({ error: "Order mismatch." }, { status: 400 });
    }

    if (registration.status === "paid") {
      return NextResponse.json({ success: true, message: "Already registered." });
    }

    const { error: updateError } = await admin
      .from("event_registrations")
      .update({
        status: "paid",
        razorpay_payment_id: razorpay_payment_id,
      })
      .eq("id", registrationId);

    if (updateError) {
      return NextResponse.json({ error: "Could not confirm registration." }, { status: 500 });
    }

    const { data: event } = await admin
      .from("events")
      .select("attendees")
      .eq("id", registration.event_id)
      .single();

    if (event) {
      await admin
        .from("events")
        .update({ attendees: (event.attendees ?? 0) + 1 })
        .eq("id", registration.event_id);
    }

    return NextResponse.json({ success: true, message: "Registration confirmed!" });
  } catch (error) {
    console.error("verify error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed." },
      { status: 500 },
    );
  }
}
