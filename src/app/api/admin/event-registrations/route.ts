import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  EVENT_REGISTRATIONS_PAGE_SIZE,
  EVENT_REGISTRATION_COLUMNS,
  MAX_EVENT_EXPORT_ROWS,
  applyEventRegistrationFilters,
  computeEventRegistrationStats,
  parseEventRegistrationFilters,
  type EventRegistrationRow,
} from "@/lib/event-registrations-admin";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/** Admin: one page of event registrations, stats for the filtered set, and the event list for filtering. */
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const filters = parseEventRegistrationFilters(new URL(request.url).searchParams);
  const start = (filters.page - 1) * EVENT_REGISTRATIONS_PAGE_SIZE;

  try {
    const admin = createAdminClient();
    const listQuery = applyEventRegistrationFilters(
      admin.from("event_registrations").select(EVENT_REGISTRATION_COLUMNS, { count: "exact" }),
      filters,
    )
      .order("created_at", { ascending: false })
      .range(start, start + EVENT_REGISTRATIONS_PAGE_SIZE - 1);

    const statsQuery = applyEventRegistrationFilters(
      admin.from("event_registrations").select("status, amount_paise"),
      filters,
    ).limit(MAX_EVENT_EXPORT_ROWS);

    // Titles are looked up separately so this works without a declared foreign key.
    const eventsQuery = admin.from("events").select("id, title, requires_payment").order("title");

    const [list, statsRows, events] = await Promise.all([listQuery, statsQuery, eventsQuery]);
    if (list.error || statsRows.error || events.error) {
      console.error("admin event registrations:", list.error ?? statsRows.error ?? events.error);
      return NextResponse.json({ error: "Registrations unavailable." }, { status: 503, headers: NO_STORE });
    }

    const titles = new Map((events.data ?? []).map((e) => [String(e.id), e.title as string]));
    const rows = ((list.data ?? []) as EventRegistrationRow[]).map((row) => ({
      ...row,
      event_title: titles.get(String(row.event_id)) ?? null,
    }));

    return NextResponse.json(
      {
        rows,
        total: list.count ?? 0,
        page: filters.page,
        pageSize: EVENT_REGISTRATIONS_PAGE_SIZE,
        stats: computeEventRegistrationStats(
          (statsRows.data ?? []) as Pick<EventRegistrationRow, "status" | "amount_paise">[],
        ),
        events: (events.data ?? [])
          .filter((e) => e.requires_payment)
          .map((e) => ({ id: String(e.id), title: e.title as string })),
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("admin event registrations GET:", error);
    return NextResponse.json({ error: "Registrations unavailable." }, { status: 503, headers: NO_STORE });
  }
}
