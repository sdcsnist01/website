/**
 * Admin reporting over event_registrations: filter parsing, stats and CSV export.
 * Server-side only; callers must have verified the admin role first.
 */
import { csvCell, istDayStart, validDate } from "@/lib/membership-payments-admin";

export const EVENT_REGISTRATION_STATUSES = ["pending", "paid", "failed", "cancelled"] as const;
export type EventRegistrationStatus = (typeof EVENT_REGISTRATION_STATUSES)[number];

export const EVENT_REGISTRATIONS_PAGE_SIZE = 25;
export const MAX_EVENT_EXPORT_ROWS = 10000;

export const EVENT_REGISTRATION_COLUMNS =
  "id, event_id, name, email, phone, amount_paise, currency, gateway, status, status_detail, payment_method, cashfree_order_id, cashfree_cf_order_id, cashfree_payment_id, razorpay_order_id, razorpay_payment_id, paid_at, created_at";

export type EventRegistrationRow = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string | null;
  amount_paise: number;
  currency: string;
  gateway: "cashfree" | "razorpay";
  status: EventRegistrationStatus;
  status_detail: string | null;
  payment_method: string | null;
  cashfree_order_id: string | null;
  cashfree_cf_order_id: string | null;
  cashfree_payment_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  paid_at: string | null;
  created_at: string;
};

/** A registration with its event's title attached for display. */
export type AdminEventRegistration = EventRegistrationRow & { event_title: string | null };

export type EventRegistrationFilters = {
  status: EventRegistrationStatus | null;
  eventId: string | null;
  from: string | null;
  to: string | null;
  search: string;
  page: number;
};

export type EventRegistrationStats = {
  revenuePaise: number;
  total: number;
  paid: number;
  pending: number;
  failed: number;
  cancelled: number;
};

export function parseEventRegistrationFilters(params: URLSearchParams): EventRegistrationFilters {
  const status = params.get("status");
  const eventId = params.get("event");
  const page = Number.parseInt(params.get("page") ?? "1", 10);
  return {
    status: (EVENT_REGISTRATION_STATUSES as readonly string[]).includes(status ?? "")
      ? (status as EventRegistrationStatus)
      : null,
    eventId: eventId && /^[A-Za-z0-9-]{1,64}$/.test(eventId) ? eventId : null,
    from: validDate(params.get("from")),
    to: validDate(params.get("to")),
    // Strip PostgREST filter syntax (, ( ) " * % \) so search text stays a literal substring.
    search: (params.get("q") ?? "").replace(/[,()"*%\\]/g, " ").trim().slice(0, 100),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

// Loosely typed on purpose: constraining against Supabase's builder types is too deep for tsc.
type FilterableQuery = {
  eq(column: string, value: string): FilterableQuery;
  gte(column: string, value: string): FilterableQuery;
  lt(column: string, value: string): FilterableQuery;
  or(filters: string): FilterableQuery;
};

/** Applies the filters to a Supabase select on event_registrations and returns the same builder type. */
export function applyEventRegistrationFilters<Q>(query: Q, filters: EventRegistrationFilters): Q {
  let q = query as unknown as FilterableQuery;
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.eventId) q = q.eq("event_id", filters.eventId);
  if (filters.from) q = q.gte("created_at", istDayStart(filters.from));
  if (filters.to) q = q.lt("created_at", istDayStart(filters.to, 1));
  if (filters.search) {
    // Quoted so dots and colons in emails or IDs are read as part of the value.
    const term = `"%${filters.search}%"`;
    q = q.or(
      ["name", "email", "phone", "cashfree_order_id", "cashfree_payment_id"]
        .map((column) => `${column}.ilike.${term}`)
        .join(","),
    );
  }
  return q as unknown as Q;
}

export function computeEventRegistrationStats(
  rows: Pick<EventRegistrationRow, "status" | "amount_paise">[],
): EventRegistrationStats {
  const stats: EventRegistrationStats = { revenuePaise: 0, total: rows.length, paid: 0, pending: 0, failed: 0, cancelled: 0 };
  for (const row of rows) {
    if (row.status in stats) stats[row.status] += 1;
    if (row.status === "paid") stats.revenuePaise += row.amount_paise;
  }
  return stats;
}

const CSV_COLUMNS: [string, (row: AdminEventRegistration) => string | number | null][] = [
  ["Registered (UTC)", (r) => r.created_at],
  ["Paid (UTC)", (r) => r.paid_at],
  ["Event", (r) => r.event_title],
  ["Status", (r) => r.status],
  ["Amount (INR)", (r) => (r.amount_paise / 100).toFixed(2)],
  ["Gateway", (r) => r.gateway],
  ["Payment method", (r) => r.payment_method],
  ["Name", (r) => r.name],
  ["Email", (r) => r.email],
  ["Phone", (r) => r.phone],
  ["Order ID", (r) => r.cashfree_order_id ?? r.razorpay_order_id],
  ["Cashfree order ID", (r) => r.cashfree_cf_order_id],
  ["Payment ID", (r) => r.cashfree_payment_id ?? r.razorpay_payment_id],
  ["Detail", (r) => r.status_detail],
];

/** CSV with a UTF-8 BOM so Excel shows ₹ and non-ASCII names correctly. Formula-safe via csvCell. */
export function buildEventRegistrationsCsv(rows: AdminEventRegistration[]): string {
  const lines = [CSV_COLUMNS.map(([header]) => csvCell(header)).join(",")];
  for (const row of rows) lines.push(CSV_COLUMNS.map(([, get]) => csvCell(get(row))).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}
