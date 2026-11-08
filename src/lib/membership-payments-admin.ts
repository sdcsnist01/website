/**
 * Admin reporting over membership_payments: filter parsing, stats and CSV export.
 * Server-side only; callers must have verified the admin role first.
 */

export const PAYMENT_STATUSES = ["pending", "successful", "failed", "cancelled"] as const;
export type AdminPaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ADMIN_PAYMENTS_PAGE_SIZE = 25;
const MAX_EXPORT_ROWS = 10000;

export const ADMIN_PAYMENT_COLUMNS =
  "id, member_id, full_name, email, roll_number, membership_year, gateway, gateway_order_id, gateway_cf_order_id, gateway_payment_id, payment_method, amount_paise, currency, status, status_detail, paid_at, created_at, updated_at";

export type AdminPaymentRow = {
  id: string;
  member_id: string;
  full_name: string;
  email: string;
  roll_number: string;
  membership_year: number;
  gateway: "cashfree" | "razorpay";
  gateway_order_id: string;
  gateway_cf_order_id: string | null;
  gateway_payment_id: string | null;
  payment_method: string | null;
  amount_paise: number;
  currency: string;
  status: AdminPaymentStatus;
  status_detail: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminPaymentFilters = {
  status: AdminPaymentStatus | null;
  /** Inclusive start date, YYYY-MM-DD in IST. */
  from: string | null;
  /** Inclusive end date, YYYY-MM-DD in IST. */
  to: string | null;
  search: string;
  page: number;
};

export type AdminPaymentStats = {
  revenuePaise: number;
  total: number;
  successful: number;
  pending: number;
  failed: number;
  cancelled: number;
  refundsFlagged: number;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** A YYYY-MM-DD date that parses as a real day, or null. */
export function validDate(value: string | null): string | null {
  if (!value || !DATE_PATTERN.test(value)) return null;
  return Number.isNaN(Date.parse(`${value}T00:00:00+05:30`)) ? null : value;
}

export function parseAdminPaymentFilters(params: URLSearchParams): AdminPaymentFilters {
  const status = params.get("status");
  const page = Number.parseInt(params.get("page") ?? "1", 10);
  return {
    status: (PAYMENT_STATUSES as readonly string[]).includes(status ?? "") ? (status as AdminPaymentStatus) : null,
    from: validDate(params.get("from")),
    to: validDate(params.get("to")),
    // PostgREST filter syntax uses , ( ) " and * ; strip them (and % \) so search text
    // can only ever be a literal substring, never part of the filter expression.
    search: (params.get("q") ?? "").replace(/[,()"*%\\]/g, " ").trim().slice(0, 100),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Start of the given IST day as an ISO timestamp, optionally shifted by whole days. */
export function istDayStart(date: string, addDays = 0): string {
  const start = new Date(`${date}T00:00:00+05:30`);
  start.setUTCDate(start.getUTCDate() + addDays);
  return start.toISOString();
}

// Minimal shape of the Supabase query builder methods we use. Typed loosely on
// purpose: constraining against Supabase's own builder types is too deep for tsc.
type FilterableQuery = {
  eq(column: string, value: string): FilterableQuery;
  gte(column: string, value: string): FilterableQuery;
  lt(column: string, value: string): FilterableQuery;
  or(filters: string): FilterableQuery;
};

/** Applies the filters to a Supabase select on membership_payments and returns the same builder type. */
export function applyAdminPaymentFilters<Q>(query: Q, filters: AdminPaymentFilters): Q {
  let q = query as unknown as FilterableQuery;
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.from) q = q.gte("created_at", istDayStart(filters.from));
  if (filters.to) q = q.lt("created_at", istDayStart(filters.to, 1));
  if (filters.search) {
    // Quoted so dots and colons in emails or IDs are read as part of the value.
    const term = `"%${filters.search}%"`;
    q = q.or(
      ["full_name", "email", "roll_number", "member_id", "gateway_order_id", "gateway_payment_id"]
        .map((column) => `${column}.ilike.${term}`)
        .join(","),
    );
  }
  return q as unknown as Q;
}

export function isRefundFlagged(row: Pick<AdminPaymentRow, "status_detail">): boolean {
  return row.status_detail?.toLowerCase().includes("refund required") ?? false;
}

export function computeAdminPaymentStats(
  rows: Pick<AdminPaymentRow, "status" | "amount_paise" | "status_detail">[],
): AdminPaymentStats {
  const stats: AdminPaymentStats = {
    revenuePaise: 0,
    total: rows.length,
    successful: 0,
    pending: 0,
    failed: 0,
    cancelled: 0,
    refundsFlagged: 0,
  };
  for (const row of rows) {
    stats[row.status] += 1;
    if (row.status === "successful") stats.revenuePaise += row.amount_paise;
    if (isRefundFlagged(row)) stats.refundsFlagged += 1;
  }
  return stats;
}

export { MAX_EXPORT_ROWS };

const CSV_HEADERS: [string, (row: AdminPaymentRow) => string | number | null][] = [
  ["Created (UTC)", (r) => r.created_at],
  ["Paid (UTC)", (r) => r.paid_at],
  ["Status", (r) => r.status],
  ["Amount (INR)", (r) => (r.amount_paise / 100).toFixed(2)],
  ["Gateway", (r) => r.gateway],
  ["Payment method", (r) => r.payment_method],
  ["Member ID", (r) => r.member_id],
  ["Name", (r) => r.full_name],
  ["Email", (r) => r.email],
  ["Roll number", (r) => r.roll_number],
  ["Batch year", (r) => r.membership_year],
  ["Order ID", (r) => r.gateway_order_id],
  ["Cashfree order ID", (r) => r.gateway_cf_order_id],
  ["Payment ID", (r) => r.gateway_payment_id],
  ["Detail", (r) => r.status_detail],
];

/**
 * One CSV cell. Quotes every value, and neutralises spreadsheet formulas
 * (cells starting with = + - @ tab or CR) so opening the export in Excel or
 * Sheets can't run anything a student typed into the form.
 */
export function csvCell(value: string | number | null | undefined): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** CSV with a UTF-8 BOM so Excel shows ₹ and non-ASCII names correctly. */
export function buildPaymentsCsv(rows: AdminPaymentRow[]): string {
  const lines = [CSV_HEADERS.map(([header]) => csvCell(header)).join(",")];
  for (const row of rows) {
    lines.push(CSV_HEADERS.map(([, get]) => csvCell(get(row))).join(","));
  }
  return `﻿${lines.join("\r\n")}\r\n`;
}
