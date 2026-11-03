import EventForm from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-on-surface">New event</h2>
        <p className="mt-1 text-on-surface-variant">Create a new event for the public events page.</p>
      </div>
      <EventForm />
    </div>
  );
}
