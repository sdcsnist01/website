import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ADMIN_PAYMENTS_PAGE_SIZE,
  ADMIN_PAYMENT_COLUMNS,
  MAX_EXPORT_ROWS,
  applyAdminPaymentFilters,
  computeAdminPaymentStats,
  parseAdminPaymentFilters,
  type AdminPaymentRow,
} from "@/lib/membership-payments-admin";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/** Admin: one page of membership payments plus stats for the whole filtered set. */
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const filters = parseAdminPaymentFilters(new URL(request.url).searchParams);
  const start = (filters.page - 1) * ADMIN_PAYMENTS_PAGE_SIZE;

  try {
    const admin = createAdminClient();
    const listQuery = applyAdminPaymentFilters(
      admin.from("membership_payments").select(ADMIN_PAYMENT_COLUMNS, { count: "exact" }),
      filters,
    )
      .order("created_at", { ascending: false })
      .range(start, start + ADMIN_PAYMENTS_PAGE_SIZE - 1);

    const statsQuery = applyAdminPaymentFilters(
      admin.from("membership_payments").select("status, amount_paise, status_detail"),
      filters,
    ).limit(MAX_EXPORT_ROWS);

    const [list, statsRows] = await Promise.all([listQuery, statsQuery]);
    if (list.error || statsRows.error) {
      console.error("admin membership payments:", list.error ?? statsRows.error);
      return NextResponse.json({ error: "Payments unavailable." }, { status: 503, headers: NO_STORE });
    }

    return NextResponse.json(
      {
        rows: (list.data ?? []) as AdminPaymentRow[],
        total: list.count ?? 0,
        page: filters.page,
        pageSize: ADMIN_PAYMENTS_PAGE_SIZE,
        stats: computeAdminPaymentStats(
          (statsRows.data ?? []) as Pick<AdminPaymentRow, "status" | "amount_paise" | "status_detail">[],
        ),
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("admin membership payments GET:", error);
    return NextResponse.json({ error: "Payments unavailable." }, { status: 503, headers: NO_STORE });
  }
}
