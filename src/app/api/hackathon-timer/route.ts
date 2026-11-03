import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  UXPLOSION_TIMER_ID,
  applyTimerAction,
  parseTimerAction,
  rowToState,
  type HackathonTimerPayload,
  type HackathonTimerRow,
} from "@/lib/hackathon-timer";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

async function readTimer() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("hackathon_timers")
    .select("id, status, duration_ms, remaining_ms, ends_at, updated_at")
    .eq("id", UXPLOSION_TIMER_ID)
    .single();
  return { admin, row: data as HackathonTimerRow | null, error };
}

export async function GET() {
  try {
    const { row, error } = await readTimer();
    if (error || !row) {
      console.error("hackathon_timers read failed:", error);
      return NextResponse.json({ error: "Timer unavailable." }, { status: 503, headers: NO_STORE });
    }
    const payload: HackathonTimerPayload = { timer: rowToState(row), serverNow: Date.now() };
    return NextResponse.json(payload, { headers: NO_STORE });
  } catch (err) {
    console.error("hackathon-timer GET error:", err);
    return NextResponse.json({ error: "Timer unavailable." }, { status: 503, headers: NO_STORE });
  }
}

export async function POST(request: Request) {
  try {
    // Same authorization rule as the /admin middleware: signed in + admin role.
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401, headers: NO_STORE });
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403, headers: NO_STORE });
    }

    const action = parseTimerAction(await request.json().catch(() => null));
    if (!action) {
      return NextResponse.json({ error: "Invalid timer action." }, { status: 400, headers: NO_STORE });
    }

    const { admin, row, error: readError } = await readTimer();
    if (readError || !row) {
      console.error("hackathon_timers read failed:", readError);
      return NextResponse.json({ error: "Timer unavailable." }, { status: 503, headers: NO_STORE });
    }

    const now = Date.now();
    const next = applyTimerAction(rowToState(row), action, now);
    const { data: updated, error: writeError } = await admin
      .from("hackathon_timers")
      .update({
        status: next.status,
        duration_ms: next.durationMs,
        remaining_ms: next.remainingMs,
        ends_at: next.endsAt === null ? null : new Date(next.endsAt).toISOString(),
        updated_at: new Date(now).toISOString(),
      })
      .eq("id", UXPLOSION_TIMER_ID)
      .select("id, status, duration_ms, remaining_ms, ends_at, updated_at")
      .single();

    if (writeError || !updated) {
      console.error("hackathon_timers update failed:", writeError);
      return NextResponse.json({ error: "Could not update the timer." }, { status: 500, headers: NO_STORE });
    }

    const payload: HackathonTimerPayload = {
      timer: rowToState(updated as HackathonTimerRow),
      serverNow: Date.now(),
    };
    return NextResponse.json(payload, { headers: NO_STORE });
  } catch (err) {
    console.error("hackathon-timer POST error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500, headers: NO_STORE });
  }
}
