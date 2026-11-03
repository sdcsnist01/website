import EventsExperience from "@/components/events/EventsExperience";
import { getAllEvents } from "@/lib/events-service";
import type { Event } from "@/types/events";

function sortEventsByDateDesc(events: Event[]) {
  return [...events].sort((a, b) => {
    if (a.date === "TBD") return 1;
    if (b.date === "TBD") return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export default async function EventsPage() {
  const events = sortEventsByDateDesc(await getAllEvents());

  return (
    <main className="relative min-h-screen overflow-x-clip bg-background pt-24 font-body text-on-surface">
      <EventsExperience events={events} />
    </main>
  );
}
