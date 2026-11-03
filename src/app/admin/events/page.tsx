import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/events-db";
import DeleteEventButton from "@/components/admin/DeleteEventButton";
import SignOutButton from "@/components/admin/SignOutButton";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("is_past", { ascending: true })
    .order("event_date", { ascending: false });

  const events = (data ?? []) as EventRow[];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Events</h2>
          <p className="mt-1 text-on-surface-variant">
            {events.length} total · changes appear on the public site immediately
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SignOutButton />
          <Link
            href="/admin/events/new"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            + New event
          </Link>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220]">
          Failed to load events: {error.message}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[#e4ddd6]">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-high text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-outline-variant/10">
                <td className="px-4 py-3 font-medium text-on-surface">{event.title}</td>
                <td className="px-4 py-3 text-on-surface-variant">{event.event_date}</td>
                <td className="px-4 py-3 text-on-surface-variant">{event.category}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      event.is_past ? "bg-[#efeae4] text-on-surface-variant" : "bg-primary/20 text-primary"
                    }`}
                  >
                    {event.is_past ? "Past" : "Upcoming"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="rounded-full border border-[#d8d2cf] bg-white px-3 py-1.5 text-xs font-semibold text-on-surface hover:border-primary/40"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/events/${event.slug}`}
                      className="rounded-full border border-[#d8d2cf] bg-white px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                      target="_blank"
                    >
                      View
                    </Link>
                    <DeleteEventButton eventId={event.id} title={event.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!events.length ? (
          <p className="px-4 py-8 text-center text-on-surface-variant">No events yet. Create your first event.</p>
        ) : null}
      </div>
    </div>
  );
}
