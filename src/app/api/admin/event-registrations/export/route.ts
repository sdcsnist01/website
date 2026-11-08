import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  EVENT_REGISTRATION_COLUMNS,
  MAX_EVENT_EXPORT_ROWS,
  applyEventRegistrationFilters,
  buildEventRegistrationsCsv,
  parseEventRegistrationFilters,
  type EventRegistrationRow,
} from "@/lib/event-registrations-admin";

/** Admin: CSV of every event registration matching the current filters. */
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const filters = parseEventRegistrationFilters(new URL(request.url).searchParams);

  try {
    const admin = createAdminClient();
    const [list, events] = await Promise.all([
      applyEventRegistrationFilters(admin.from("event_registrations").select(EVENT_REGISTRATION_COLUMNS), filters)
        .order("created_at", { ascending: false })
        .limit(MAX_EVENT_EXPORT_ROWS),
      admin.from("events").select("id, title"),
    ]);

    if (list.error || events.error) {
      console.error("admin event registrations export:", list.error ?? events.error);
      return NextResponse.json({ error: "Export failed." }, { status: 503 });
    }

    const titles = new Map((events.data ?? []).map((e) => [String(e.id), e.title as string]));
    const rows = ((list.data ?? []) as EventRegistrationRow[]).map((row) => ({
      ...row,
      event_title: titles.get(String(row.event_id)) ?? null,
    }));

    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(buildEventRegistrationsCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="sdc-event-registrations-${date}.csv"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("admin event registrations export:", error);
    return NextResponse.json({ error: "Export failed." }, { status: 503 });
  }
}
