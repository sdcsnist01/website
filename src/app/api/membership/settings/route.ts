import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMembershipSettings } from "@/lib/membership-settings";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/** Public: the fee and whether memberships are open. Used by the join form. */
export async function GET() {
  try {
    const settings = await getMembershipSettings(createAdminClient());
    return NextResponse.json(
      {
        feeInr: settings.feeInr,
        feePaise: settings.feePaise,
        currency: settings.currency,
        paymentsEnabled: settings.paymentsEnabled,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("membership settings GET:", error);
    return NextResponse.json({ error: "Membership fee unavailable." }, { status: 503, headers: NO_STORE });
  }
}
