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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = body as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      userId?: string;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return NextResponse.json({ error: "Invalid payment response." }, { status: 400 });
    }

    if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: member, error: memberError } = await admin
      .from("sdc_members")
      .select("*")
      .eq("id", userId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: "Membership record not found." }, { status: 404 });
    }

    if (member.razorpay_order_id !== razorpay_order_id) {
      return NextResponse.json({ error: "Order mismatch." }, { status: 400 });
    }

    if (member.status === "active") {
      return NextResponse.json({
        success: true,
        memberId: member.member_id,
        membershipYear: member.membership_year,
        message: "You are already an active member.",
      });
    }

    const { error: updateError } = await admin
      .from("sdc_members")
      .update({
        status: "active",
        razorpay_payment_id: razorpay_payment_id,
      })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json({ error: "Could not activate membership." }, { status: 500 });
    }

    await admin.auth.admin.updateUserById(userId, { email_confirm: true });

    await admin
      .from("profiles")
      .update({ full_name: member.full_name })
      .eq("id", userId);

    return NextResponse.json({
      success: true,
      memberId: member.member_id,
      membershipYear: member.membership_year,
      message: `Welcome to SDC SNIST! Your ${member.membership_year} membership is active.`,
    });
  } catch (error) {
    console.error("membership verify:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed." },
      { status: 500 },
    );
  }
}
