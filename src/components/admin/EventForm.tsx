"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EventMode } from "@/types/events";
import { createClient } from "@/lib/supabase/client";
import { eventToInsert, type EventRow } from "@/lib/events-db";

const MODES: EventMode[] = ["ONLINE", "OFFLINE", "HYBRID"];
const CATEGORIES = ["Hackathon", "Workshop", "Conference", "Meetup"];

type EventFormProps = {
  initial?: EventRow;
};

export default function EventForm({ initial }: EventFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    date: initial?.event_date ?? "",
    time: initial?.event_time ?? "",
    location: initial?.location ?? "",
    category: initial?.category ?? "Workshop",
    mode: (initial?.mode ?? "OFFLINE") as EventMode,
    speaker: initial?.speaker ?? "",
    attendees: initial?.attendees ?? 0,
    seats: initial?.seats?.toString() ?? "",
    duration: initial?.duration ?? "",
    registrationUrl: initial?.registration_url ?? "#",
    requiresPayment: initial?.requires_payment ?? false,
    registrationFeeInr: initial?.registration_fee_paise ? String(initial.registration_fee_paise / 100) : "",
    isPast: initial?.is_past ?? false,
    winners: (initial?.winners ?? []).join(", "),
    image: initial?.image ?? "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = eventToInsert({
      slug: form.slug.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date.trim(),
      time: form.time.trim(),
      location: form.location.trim(),
      category: form.category,
      mode: form.mode,
      speaker: form.speaker.trim(),
      attendees: Number(form.attendees) || 0,
      seats: form.seats ? Number(form.seats) : undefined,
      duration: form.duration.trim(),
      registrationUrl: form.registrationUrl.trim() || "#",
      requiresPayment: form.requiresPayment,
      registrationFeePaise: form.requiresPayment
        ? Math.round((parseFloat(form.registrationFeeInr) || 0) * 100)
        : 0,
      isPast: form.isPast,
      winners: form.winners
        .split(",")
        .map((w) => w.trim())
        .filter(Boolean),
      image: form.image.trim() || undefined,
    });

    if (initial) {
      const { error: updateError } = await supabase.from("events").update(payload).eq("id", initial.id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("events").insert(payload);
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }

    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error ? (
        <p className="rounded-xl border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220]">{error}</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Slug (URL id)" required>
          <input
            className={inputClass}
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            disabled={!!initial}
            placeholder="hack-for-hyd-2026"
            required
          />
        </Field>
        <Field label="Title" required>
          <input className={inputClass} value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </Field>
      </div>

      <Field label="Description" required>
        <textarea
          className={`${inputClass} min-h-28`}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Date">
          <input className={inputClass} value={form.date} onChange={(e) => update("date", e.target.value)} />
        </Field>
        <Field label="Time">
          <input className={inputClass} value={form.time} onChange={(e) => update("time", e.target.value)} />
        </Field>
        <Field label="Duration">
          <input className={inputClass} value={form.duration} onChange={(e) => update("duration", e.target.value)} />
        </Field>
      </div>

      <Field label="Location">
        <input className={inputClass} value={form.location} onChange={(e) => update("location", e.target.value)} />
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Category">
          <select className={inputClass} value={form.category} onChange={(e) => update("category", e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mode">
          <select className={inputClass} value={form.mode} onChange={(e) => update("mode", e.target.value as EventMode)}>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Image path">
          <input className={inputClass} value={form.image} onChange={(e) => update("image", e.target.value)} placeholder="/event.jpg" />
        </Field>
      </div>

      <Field label="Speaker(s)">
        <input className={inputClass} value={form.speaker} onChange={(e) => update("speaker", e.target.value)} />
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Attendees">
          <input
            type="number"
            className={inputClass}
            value={form.attendees}
            onChange={(e) => update("attendees", Number(e.target.value))}
          />
        </Field>
        <Field label="Seats (optional)">
          <input className={inputClass} value={form.seats} onChange={(e) => update("seats", e.target.value)} />
        </Field>
        <Field label="Registration URL">
          <input className={inputClass} value={form.registrationUrl} onChange={(e) => update("registrationUrl", e.target.value)} />
        </Field>
      </div>

      <Field label="Winners (comma-separated)">
        <input className={inputClass} value={form.winners} onChange={(e) => update("winners", e.target.value)} />
      </Field>

      <label className="flex items-center gap-3 text-sm text-on-surface-variant">
        <input
          type="checkbox"
          checked={form.requiresPayment}
          onChange={(e) => update("requiresPayment", e.target.checked)}
          className="h-4 w-4 rounded border-outline-variant/40"
        />
        Require Razorpay payment to register
      </label>

      {form.requiresPayment ? (
        <Field label="Registration fee (INR)">
          <input
            type="number"
            min="1"
            step="1"
            className={inputClass}
            value={form.registrationFeeInr}
            onChange={(e) => update("registrationFeeInr", e.target.value)}
            placeholder="499"
            required
          />
        </Field>
      ) : null}

      <label className="flex items-center gap-3 text-sm text-on-surface-variant">
        <input
          type="checkbox"
          checked={form.isPast}
          onChange={(e) => update("isPast", e.target.checked)}
          className="h-4 w-4 rounded border-outline-variant/40"
        />
        Mark as past event
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : initial ? "Update event" : "Create event"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-full border border-[#d8d2cf] bg-white px-6 py-3 text-sm font-semibold text-on-surface">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-[#d8d2cf] bg-white px-4 py-3 text-on-surface outline-none placeholder:text-on-surface-variant/70 focus:border-primary focus-visible:ring-4 focus-visible:ring-primary/15";
