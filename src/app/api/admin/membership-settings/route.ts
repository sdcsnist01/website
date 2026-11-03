import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getMembershipFeeHistory,
  getMembershipPaymentStatusHistory,
  getMembershipSettings,
  parseMembershipSettingsUpdate,
} from "@/lib/membership-settings";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

async function readPayload(admin: SupabaseClient) {
  const [settings, history, statusHistory] = await Promise.all([
    getMembershipSettings(admin),
    getMembershipFeeHistory(admin),
    getMembershipPaymentStatusHistory(admin),
  ]);
  return { settings, history, statusHistory };
}

export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  try {
    return NextResponse.json(await readPayload(createAdminClient()), { headers: NO_STORE });
  } catch (error) {
    console.error("admin membership settings GET:", error);
    return NextResponse.json({ error: "Membership settings unavailable." }, { status: 503, headers: NO_STORE });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const parsed = parseMembershipSettingsUpdate(await request.json().catch(() => null));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400, headers: NO_STORE });
  }

  try {
    const admin = createAdminClient();
    const current = await getMembershipSettings(admin);

    // Both values are sent to the SQL function so the update and its history rows
    // are written in one transaction. Unchanged fields keep their current value.
    const { error: rpcError } = await admin.rpc("update_membership_settings", {
      p_fee_paise: parsed.feePaise ?? current.feePaise,
      p_payments_enabled: parsed.paymentsEnabled ?? current.paymentsEnabled,
      p_changed_by: auth.userId,
    });
    if (rpcError) {
      console.error("update_membership_settings failed:", rpcError);
      return NextResponse.json({ error: "Could not save membership settings." }, { status: 500, headers: NO_STORE });
    }

    return NextResponse.json(await readPayload(admin), { headers: NO_STORE });
  } catch (error) {
    console.error("admin membership settings PATCH:", error);
    return NextResponse.json({ error: "Could not save membership settings." }, { status: 500, headers: NO_STORE });
  }
}
