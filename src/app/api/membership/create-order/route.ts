import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/razorpay";
import { getMembershipSettings } from "@/lib/membership-settings";
import { generateUniqueMemberId, isMemberJoiningYear } from "@/lib/member-id";

function generateAccountPassword() {
  return randomBytes(24).toString("base64url");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, rollNumber, email, phone, joiningYear } = body as {
      fullName?: string;
      rollNumber?: string;
      email?: string;
      phone?: string;
      joiningYear?: number;
    };

    const name = fullName?.trim();
    const roll = rollNumber?.trim();
    const mail = email?.trim().toLowerCase();
    const mobile = phone?.trim();
    const batchYear = typeof joiningYear === "number" ? joiningYear : Number(joiningYear);

    if (!name || !roll || !mail || !mobile) {
      return NextResponse.json(
        { error: "Name, roll number, email, and phone are required." },
        { status: 400 },
      );
    }

    if (!isMemberJoiningYear(batchYear)) {
      return NextResponse.json(
        { error: "Select a valid year of joining (2023–2026)." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();

    // The fee always comes from the database, never from the request body.
    const settings = await getMembershipSettings(admin);
    if (!settings.paymentsEnabled) {
      return NextResponse.json({ error: "Membership payments are currently closed." }, { status: 503 });
    }

    const { data: existingByEmail } = await admin
      .from("sdc_members")
      .select("id, status, member_id")
      .eq("email", mail)
      .maybeSingle();

    const { data: existingByRoll } = await admin
      .from("sdc_members")
      .select("id, status")
      .eq("roll_number", roll)
      .maybeSingle();

    if (existingByEmail?.status === "active") {
      return NextResponse.json({ error: "This email is already registered as a member." }, { status: 400 });
    }

    if (existingByRoll && existingByRoll.id !== existingByEmail?.id) {
      return NextResponse.json({ error: "This roll number is already registered." }, { status: 400 });
    }

    if (existingByRoll?.status === "active") {
      return NextResponse.json({ error: "This roll number is already a member." }, { status: 400 });
    }

    let userId = existingByEmail?.id;
    let memberId = existingByEmail?.member_id;

    if (!userId) {
      const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email: mail,
        password: generateAccountPassword(),
        email_confirm: false,
        user_metadata: { full_name: name, roll_number: roll, phone: mobile },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("already")) {
          return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
        }
        const authMessage =
          authError.message === "fetch failed"
            ? "Could not reach the membership database. Check Supabase configuration and try again."
            : authError.message;
        return NextResponse.json({ error: authMessage }, { status: 400 });
      }

      if (!authData.user) {
        return NextResponse.json({ error: "Could not create account." }, { status: 500 });
      }

      userId = authData.user.id;
    } else {
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { full_name: name, roll_number: roll, phone: mobile },
      });
    }

    if (!memberId) {
      memberId = await generateUniqueMemberId(admin, batchYear);
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: settings.feePaise,
      currency: "INR",
      receipt: `member_${memberId}_${Date.now()}`,
      notes: {
        type: "membership",
        email: mail,
        member_id: memberId,
        roll_number: roll,
        joining_year: String(batchYear),
      },
    });

    const { error: memberError } = await admin.from("sdc_members").upsert(
      {
        id: userId,
        member_id: memberId,
        roll_number: roll,
        email: mail,
        phone: mobile,
        full_name: name,
        membership_year: batchYear,
        amount_paise: settings.feePaise,
        currency: "INR",
        razorpay_order_id: order.id,
        razorpay_payment_id: null,
        status: "pending",
      },
      { onConflict: "id" },
    );

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      userId,
      memberId,
    });
  } catch (error) {
    console.error("membership create-order:", error);
    const message = error instanceof Error ? error.message : "Failed to start membership payment.";
    const friendly =
      message === "fetch failed" || message.toLowerCase().includes("enotfound")
        ? "Could not reach the membership database. Check Supabase configuration and try again."
        : message === "Missing Razorpay credentials"
          ? "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local."
          : message;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
