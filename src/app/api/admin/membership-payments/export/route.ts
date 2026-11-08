import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ADMIN_PAYMENT_COLUMNS,
  MAX_EXPORT_ROWS,
  applyAdminPaymentFilters,
  buildPaymentsCsv,
  parseAdminPaymentFilters,
  type AdminPaymentRow,
} from "@/lib/membership-payments-admin";

/** Admin: CSV of every payment matching the current filters (opens in Excel/Sheets). */
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const filters = parseAdminPaymentFilters(new URL(request.url).searchParams);

  try {
    const { data, error } = await applyAdminPaymentFilters(
      createAdminClient().from("membership_payments").select(ADMIN_PAYMENT_COLUMNS),
      filters,
    )
      .order("created_at", { ascending: false })
      .limit(MAX_EXPORT_ROWS);

    if (error) {
      console.error("admin membership payments export:", error);
      return NextResponse.json({ error: "Export failed." }, { status: 503 });
    }

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(buildPaymentsCsv((data ?? []) as AdminPaymentRow[]), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="sdc-membership-payments-${date}.csv"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("admin membership payments export:", error);
    return NextResponse.json({ error: "Export failed." }, { status: 503 });
  }
}
