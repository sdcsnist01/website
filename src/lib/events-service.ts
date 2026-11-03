import { createClient } from "@/lib/supabase/server";
import { mapEventRow, type EventRow } from "@/lib/events-db";
import type { Event } from "@/types/events";
import { EVENTS } from "@/data/events";

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function fetchEventRows(): Promise<EventRow[] | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("is_past", { ascending: true })
      .order("event_date", { ascending: false });

    if (error) {
      console.warn("Supabase events unavailable, using static fallback:", error.message);
      return null;
    }

    if (!data?.length) {
      return null;
    }

    return data as EventRow[];
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown fetch error";
    console.warn("Supabase events unreachable, using static fallback:", message);
    return null;
  }
}

export async function getAllEvents(): Promise<Event[]> {
  const rows = await fetchEventRows();
  if (rows?.length) {
    return rows.map(mapEventRow);
  }
  return EVENTS;
}

export async function getEventById(id: string): Promise<Event | undefined> {
  if (!hasSupabaseEnv()) {
    return EVENTS.find((e) => e.id === id);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("events").select("*").eq("slug", id).maybeSingle();

    if (error || !data) {
      return EVENTS.find((e) => e.id === id);
    }

    return mapEventRow(data as EventRow);
  } catch {
    return EVENTS.find((e) => e.id === id);
  }
}

export async function getRelatedEvents(currentEventId: string, limit = 3): Promise<Event[]> {
  const all = await getAllEvents();
  const current = all.find((e) => e.id === currentEventId);
  if (!current) return [];

  return all
    .filter((e) => e.id !== currentEventId)
    .filter((e) => e.category === current.category || e.mode === current.mode)
    .slice(0, limit);
}
