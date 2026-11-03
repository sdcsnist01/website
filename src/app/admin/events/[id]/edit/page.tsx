import { notFound } from "next/navigation";
import EventForm from "@/components/admin/EventForm";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/events-db";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();

  if (error || !data) {
    notFound();
  }

  const event = data as EventRow;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-on-surface">Edit event</h2>
        <p className="mt-1 text-on-surface-variant">{event.title}</p>
      </div>
      <EventForm initial={event} />
    </div>
  );
}
