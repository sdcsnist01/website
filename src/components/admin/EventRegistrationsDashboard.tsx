"use client";

import { Fragment, useEffect, useState } from "react";
import type {
  AdminEventRegistration,
  EventRegistrationStats,
  EventRegistrationStatus,
} from "@/lib/event-registrations-admin";

type Payload = {
  rows: AdminEventRegistration[];
  total: number;
  page: number;
  pageSize: number;
  stats: EventRegistrationStats;
  events: { id: string; title: string }[];
};

type Filters = { q: string; status: "" | EventRegistrationStatus; event: string; from: string; to: string };
const EMPTY_FILTERS: Filters = { q: "", status: "", event: "", from: "", to: "" };

const inputClass =
  "w-full rounded-lg border border-[#d8d2cf] bg-white px-4 py-3 text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/70 focus:border-primary focus-visible:ring-4 focus-visible:ring-primary/15";

const labelClass = "font-mono-ui text-[11px] font-medium uppercase tracking-[1.5px] text-on-surface-variant";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const rupees = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const STATUS_STYLES: Record<EventRegistrationStatus, string> = {
  paid: "border-[#cfe5d4] bg-[#f1faf3] text-[#1d5a2c]",
  pending: "border-[#eadfb8] bg-[#fdf8e8] text-[#6b5512]",
  failed: "border-primary/30 bg-[#fdf0f0] text-[#7a1220]",
  cancelled: "border-[#d8d2cf] bg-[#f4f1ee] text-on-surface-variant",
};

function toQuery(filters: Filters, page?: number): string {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.status) params.set("status", filters.status);
  if (filters.event) params.set("event", filters.event);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (page && page > 1) params.set("page", String(page));
  return params.toString();
}

export default function EventRegistrationsDashboard() {
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/event-registrations?${toQuery(applied, page)}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error ?? "Could not load registrations.");
        return body as Payload;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load registrations.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applied, page]);

  // Every change of filters or page starts a new fetch in the effect above.
  function load(nextFilters: Filters, nextPage: number) {
    setLoading(true);
    setError(null);
    setExpanded(null);
    setApplied(nextFilters);
    setPage(nextPage);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const exportQuery = toQuery(applied);

  return (
    <section aria-labelledby="event-registrations-heading" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="event-registrations-heading" className="font-grotesk text-2xl font-bold text-on-surface">
            Event registrations
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Paid event registrations (Cashfree, plus older Razorpay ones). Totals follow the filters below.
          </p>
        </div>
        <a
          href={`/api/admin/event-registrations/export${exportQuery ? `?${exportQuery}` : ""}`}
          className="pressable font-mono-ui inline-flex min-h-11 items-center justify-center rounded-full border border-primary/40 px-6 text-xs uppercase tracking-[1.5px] text-primary transition-colors hover:bg-[#fdf0f0]"
        >
          Export CSV
        </a>
      </div>

      {data ? (
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            { label: "Revenue collected", value: rupees(data.stats.revenuePaise), emphasis: true },
            { label: "Paid", value: data.stats.paid },
            { label: "Pending", value: data.stats.pending },
            { label: "Failed", value: data.stats.failed },
            { label: "Cancelled", value: data.stats.cancelled },
          ].map((tile) => (
            <div key={tile.label} className="rounded-xl border border-[#e4ddd6] bg-white px-4 py-4">
              <dt className={labelClass}>{tile.label}</dt>
              <dd className={`font-grotesk mt-2 text-2xl font-bold ${tile.emphasis ? "text-primary" : "text-on-surface"}`}>
                {tile.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load({ ...draft }, 1);
        }}
        className="grid gap-4 rounded-xl border border-[#e4ddd6] bg-white p-5 md:grid-cols-6"
      >
        <label className="block space-y-2 md:col-span-2">
          <span className={labelClass}>Search</span>
          <input
            type="search"
            className={inputClass}
            placeholder="Name, email, phone or order ID"
            value={draft.q}
            onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
          />
        </label>
        <label className="block space-y-2">
          <span className={labelClass}>Event</span>
          <select
            className={inputClass}
            value={draft.event}
            onChange={(e) => setDraft((d) => ({ ...d, event: e.target.value }))}
          >
            <option value="">All events</option>
            {(data?.events ?? []).map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className={labelClass}>Status</span>
          <select
            className={inputClass}
            value={draft.status}
            onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as Filters["status"] }))}
          >
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="block space-y-2">
          <span className={labelClass}>From</span>
          <input type="date" className={inputClass} value={draft.from} onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))} />
        </label>
        <label className="block space-y-2">
          <span className={labelClass}>To</span>
          <input type="date" className={inputClass} value={draft.to} onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))} />
        </label>
        <div className="flex flex-wrap gap-3 md:col-span-6">
          <button
            type="submit"
            className="pressable font-mono-ui inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-xs uppercase tracking-[1.5px] text-white transition-colors hover:bg-primary-dim"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(EMPTY_FILTERS);
              load(EMPTY_FILTERS, 1);
            }}
            className="font-mono-ui inline-flex min-h-11 items-center justify-center rounded-full px-6 text-xs uppercase tracking-[1.5px] text-on-surface-variant transition-colors hover:bg-[#f4f1ee]"
          >
            Reset
          </button>
        </div>
      </form>

      {error ? (
        <p role="alert" className="rounded-lg border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220]">
          {error}
        </p>
      ) : null}

      {loading && !data ? <p className="text-sm text-on-surface-variant">Loading registrations…</p> : null}

      {data && data.rows.length === 0 ? (
        <p className="rounded-xl border border-[#e4ddd6] bg-white px-5 py-8 text-center text-sm text-on-surface-variant">
          No registrations match these filters.
        </p>
      ) : null}

      {data && data.rows.length > 0 ? (
        <div className={`overflow-x-auto rounded-xl border border-[#e4ddd6] bg-white ${loading ? "opacity-60" : ""}`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#e4ddd6] font-mono-ui text-[11px] uppercase tracking-[1.5px] text-on-surface-variant">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Registered (IST)</th>
                <th scope="col" className="px-4 py-3 font-medium">Event</th>
                <th scope="col" className="px-4 py-3 font-medium">Attendee</th>
                <th scope="col" className="px-4 py-3 font-medium">Amount</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <Fragment key={row.id}>
                  <tr className="border-b border-[#f0ebe6] align-top last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-on-surface">{dateFormatter.format(new Date(row.created_at))}</td>
                    <td className="px-4 py-3 text-on-surface">{row.event_title ?? "—"}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-on-surface">{row.name}</p>
                      <p className="font-mono-ui text-xs text-on-surface-variant">{row.payment_method ?? (row.gateway === "razorpay" ? "Razorpay" : "—")}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-on-surface">{rupees(row.amount_paise)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[row.status] ?? STATUS_STYLES.cancelled}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        aria-expanded={expanded === row.id}
                        onClick={() => setExpanded((id) => (id === row.id ? null : row.id))}
                        className="font-mono-ui text-xs uppercase tracking-[1.5px] text-primary hover:underline"
                      >
                        {expanded === row.id ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                  {expanded === row.id ? (
                    <tr className="border-b border-[#f0ebe6] bg-[#faf8f6]">
                      <td colSpan={6} className="px-4 py-4">
                        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                          {(
                            [
                              ["Email", row.email],
                              ["Phone", row.phone],
                              ["Gateway", row.gateway === "cashfree" ? "Cashfree" : "Razorpay"],
                              ["Order ID", row.cashfree_order_id ?? row.razorpay_order_id],
                              ["Cashfree order ID", row.cashfree_cf_order_id],
                              ["Payment ID", row.cashfree_payment_id ?? row.razorpay_payment_id],
                              ["Paid at (IST)", row.paid_at ? dateFormatter.format(new Date(row.paid_at)) : null],
                              ["Detail", row.status_detail],
                            ] as [string, string | null][]
                          ).map(([label, value]) => (
                            <div key={label} className="min-w-0">
                              <dt className={labelClass}>{label}</dt>
                              <dd className="mt-1 break-all font-mono-ui text-xs text-on-surface">{value ?? "—"}</dd>
                            </div>
                          ))}
                        </dl>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {data && data.total > data.pageSize ? (
        <nav aria-label="Registration pages" className="flex items-center justify-between gap-4 text-sm text-on-surface-variant">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => load(applied, page - 1)}
            className="rounded-full px-4 py-2 transition-colors hover:bg-[#f4f1ee] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>
          <span>
            Page {page} of {totalPages} · {data.total} registrations
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => load(applied, page + 1)}
            className="rounded-full px-4 py-2 transition-colors hover:bg-[#f4f1ee] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </nav>
      ) : null}
    </section>
  );
}
