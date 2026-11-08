import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCashfreeOrder, getCashfreeMode } from "@/lib/cashfree";
import { getMembershipSettings } from "@/lib/membership-settings";
import { buildMembershipOrderId } from "@/lib/membership-payments";
import { generateUniqueMemberId, isMemberJoiningYear } from "@/lib/member-id";

// Reuse an open order only if it stays payable for at least this long.
const ORDER_REUSE_MIN_REMAINING_MS = 5 * 60 * 1000;

function generateAccountPassword() {
  return randomBytes(24).toString("base64url");
}

/** Indian mobile number as 10 digits, accepting +91 / 0 prefixes and spaces. */
function normalizePhone(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/** Public base URL for Cashfree redirects and webhooks. SITE_URL overrides the request host. */
function getSiteUrl(request: Request): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  return host ? `${proto}://${host}` : new URL(request.url).origin;
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
    const mobile = phone ? normalizePhone(phone) : null;
    const batchYear = typeof joiningYear === "number" ? joiningYear : Number(joiningYear);

    if (!name || !roll || !mail || !phone?.trim()) {
      return NextResponse.json(
        { error: "Name, roll number, email, and phone are required." },
        { status: 400 },
      );
    }

    if (!mobile) {
      return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
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

    // Razorpay columns are left out on purpose so historical Razorpay IDs are kept.
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
        status: "pending",
      },
      { onConflict: "id" },
    );

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    const mode = getCashfreeMode();

    // Interrupted checkout: reuse the student's open order at the current fee
    // instead of creating a second order they could pay twice.
    const { data: openOrder } = await admin
      .from("membership_payments")
      .select("gateway_order_id, payment_session_id, order_expires_at")
      .eq("gateway", "cashfree")
      .eq("user_id", userId)
      .eq("amount_paise", settings.feePaise)
      .neq("status", "successful")
      .not("payment_session_id", "is", null)
      .gt("order_expires_at", new Date(Date.now() + ORDER_REUSE_MIN_REMAINING_MS).toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (openOrder?.payment_session_id) {
      return NextResponse.json({
        orderId: openOrder.gateway_order_id,
        paymentSessionId: openOrder.payment_session_id,
        mode,
      });
    }

    const orderId = buildMembershipOrderId(memberId, randomBytes(6).toString("hex"));

    // Record the order before Cashfree knows about it, so a payment can never
    // arrive for an order we have no row for. The amount is fixed here.
    const { error: insertError } = await admin.from("membership_payments").insert({
      user_id: userId,
      member_id: memberId,
      full_name: name,
      email: mail,
      roll_number: roll,
      membership_year: batchYear,
      gateway: "cashfree",
      gateway_order_id: orderId,
      amount_paise: settings.feePaise,
      currency: "INR",
      status: "pending",
    });
    if (insertError) {
      console.error("membership_payments insert failed:", insertError);
      return NextResponse.json({ error: "Could not start membership payment." }, { status: 500 });
    }

    const siteUrl = getSiteUrl(request);
    let order;
    try {
      order = await createCashfreeOrder({
        orderId,
        amountPaise: settings.feePaise,
        customer: { id: `sdc_${userId.replace(/-/g, "")}`, name, email: mail, phone: mobile },
        returnUrl: `${siteUrl}/join/payment-status?order_id={order_id}`,
        // Cashfree only delivers webhooks to https URLs.
        notifyUrl: siteUrl.startsWith("https://") ? `${siteUrl}/api/membership/cashfree-webhook` : null,
        note: `SDC SNIST membership ${batchYear} (${memberId})`,
      });
    } catch (err) {
      await admin
        .from("membership_payments")
        .update({ status: "cancelled", status_detail: "Cashfree order could not be created" })
        .eq("gateway_order_id", orderId);
      throw err;
    }

    if (!order.payment_session_id) {
      throw new Error("Cashfree did not return a payment session");
    }

    await admin
      .from("membership_payments")
      .update({
        gateway_cf_order_id: String(order.cf_order_id),
        payment_session_id: order.payment_session_id,
        order_expires_at: order.order_expiry_time ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("gateway_order_id", orderId);

    return NextResponse.json({ orderId, paymentSessionId: order.payment_session_id, mode });
  } catch (error) {
    console.error("membership create-order:", error);
    const message = error instanceof Error ? error.message : "Failed to start membership payment.";
    const friendly =
      message === "fetch failed" || message.toLowerCase().includes("enotfound")
        ? "Could not reach the membership database. Check Supabase configuration and try again."
        : message === "Missing Cashfree credentials"
          ? "Cashfree is not configured. Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY to .env.local."
          : message.startsWith("Cashfree")
            ? "Could not start the payment with Cashfree. Please try again."
            : message;
    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
