import type { Event, EventMode } from "@/types/events";

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  category: string;
  mode: EventMode;
  speaker: string | null;
  attendees: number;
  seats: number | null;
  duration: string | null;
  registration_url: string;
  requires_payment: boolean;
  registration_fee_paise: number;
  is_past: boolean;
  winners: string[];
  image: string | null;
  gallery_images: string[] | null;
  long_description: string | null;
  tags: string[] | null;
  agenda: Event["agenda"] | null;
  what_you_will_learn: string[] | null;
  who_should_attend: string[] | null;
  created_at: string;
  updated_at: string;
};

export type EventInsert = {
  slug: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  category: string;
  mode: EventMode;
  speaker?: string | null;
  attendees?: number;
  seats?: number | null;
  duration?: string | null;
  registration_url?: string;
  requires_payment?: boolean;
  registration_fee_paise?: number;
  is_past?: boolean;
  winners?: string[];
  image?: string | null;
  gallery_images?: string[] | null;
  long_description?: string | null;
};

export function mapEventRow(row: EventRow): Event {
  return {
    id: row.slug,
    title: row.title,
    description: row.description,
    date: row.event_date,
    time: row.event_time,
    location: row.location,
    category: row.category,
    mode: row.mode,
    speaker: row.speaker ?? "",
    attendees: row.attendees,
    seats: row.seats ?? undefined,
    duration: row.duration ?? "",
    registrationUrl: row.registration_url,
    requiresPayment: row.requires_payment,
    registrationFeePaise: row.registration_fee_paise,
    isPast: row.is_past,
    isLive: (row as any).is_live ?? false,
    winners: row.winners ?? [],
    image: row.image ?? undefined,
    galleryImages: row.gallery_images?.length ? row.gallery_images : undefined,
    longDescription: row.long_description ?? undefined,
    tags: row.tags ?? undefined,
    agenda: row.agenda ?? undefined,
    whatYouWillLearn: row.what_you_will_learn ?? undefined,
    whoShouldAttend: row.who_should_attend ?? undefined,
  };
}

export function eventToInsert(event: Partial<Event> & { slug: string; title: string; description: string }): EventInsert {
  return {
    slug: event.slug,
    title: event.title,
    description: event.description,
    event_date: event.date ?? "TBD",
    event_time: event.time ?? "TBD",
    location: event.location ?? "TBD",
    category: event.category ?? "Workshop",
    mode: event.mode ?? "OFFLINE",
    speaker: event.speaker ?? null,
    attendees: event.attendees ?? 0,
    seats: event.seats ?? null,
    duration: event.duration ?? null,
    registration_url: event.registrationUrl ?? "#",
    requires_payment: event.requiresPayment ?? false,
    registration_fee_paise: event.registrationFeePaise ?? 0,
    is_past: event.isPast ?? false,
    winners: event.winners ?? [],
    image: event.image ?? null,
    gallery_images: event.galleryImages ?? null,
    long_description: event.longDescription ?? null,
  };
}
