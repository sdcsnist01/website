// Shared hackathon timer model. The persisted row in `hackathon_timers` is the
// single source of truth; every client derives the remaining time from
// timestamps (never by decrementing a counter), so refreshes and multiple
// screens always agree.

export const UXPLOSION_TIMER_ID = "uxplosion-3.0";

export const MAX_TIMER_DURATION_MS = 48 * 60 * 60 * 1000;

export type TimerStatus = "idle" | "running" | "paused";

export type HackathonTimerState = {
  status: TimerStatus;
  /** Configured total length — used for the progress bar and reset. */
  durationMs: number;
  /** Remaining time while idle/paused. Ignored while running. */
  remainingMs: number;
  /** Epoch ms when the hackathon ends. Only set while running. */
  endsAt: number | null;
  updatedAt: string;
};

export type HackathonTimerRow = {
  id: string;
  status: TimerStatus;
  duration_ms: number;
  remaining_ms: number;
  ends_at: string | null;
  updated_at: string;
};

/** Payload returned by /api/hackathon-timer. */
export type HackathonTimerPayload = {
  timer: HackathonTimerState;
  serverNow: number;
};

export type TimerAction =
  | { action: "start" }
  | { action: "pause" }
  | { action: "reset" }
  | { action: "set_duration"; durationMs: number }
  | { action: "adjust"; deltaMs: number };

export type TimerPhase = "idle" | "paused" | "normal" | "final-hour" | "final-ten" | "up";

const HOUR_MS = 60 * 60 * 1000;
const TEN_MIN_MS = 10 * 60 * 1000;

export function rowToState(row: HackathonTimerRow): HackathonTimerState {
  return {
    status: row.status,
    durationMs: Number(row.duration_ms),
    remainingMs: Number(row.remaining_ms),
    endsAt: row.ends_at ? Date.parse(row.ends_at) : null,
    updatedAt: row.updated_at,
  };
}

export function remainingAt(state: HackathonTimerState, now: number): number {
  if (state.status === "running" && state.endsAt !== null) {
    return Math.max(0, state.endsAt - now);
  }
  return Math.max(0, state.remainingMs);
}

export function timerPhase(state: HackathonTimerState, remainingMs: number): TimerPhase {
  if (state.status === "idle") return "idle";
  if (remainingMs <= 0) return "up";
  if (state.status === "paused") return "paused";
  if (remainingMs <= TEN_MIN_MS) return "final-ten";
  if (remainingMs <= HOUR_MS) return "final-hour";
  return "normal";
}

export function splitDuration(ms: number) {
  // Round up so the display only reads 00:00:00 once time has truly run out.
  const total = Math.max(0, Math.ceil(ms / 1000));
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function formatDuration(ms: number) {
  const { hours, minutes, seconds } = splitDuration(ms);
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")).join(":");
}

/**
 * Applies an organizer action to the timer. Runs on the server with the
 * server clock, so the organizer's device clock never affects the result.
 */
export function applyTimerAction(
  state: HackathonTimerState,
  input: TimerAction,
  now: number,
): Omit<HackathonTimerState, "updatedAt"> {
  const remaining = remainingAt(state, now);

  switch (input.action) {
    case "start":
      if (state.status === "running" || remaining <= 0) return state;
      return { ...state, status: "running", endsAt: now + remaining, remainingMs: remaining };
    case "pause":
      if (state.status !== "running") return state;
      return { ...state, status: "paused", endsAt: null, remainingMs: remaining };
    case "reset":
      return { ...state, status: "idle", endsAt: null, remainingMs: state.durationMs };
    case "set_duration": {
      const durationMs = clamp(input.durationMs, 0, MAX_TIMER_DURATION_MS);
      return { status: "idle", durationMs, remainingMs: durationMs, endsAt: null };
    }
    case "adjust": {
      const next = clamp(remaining + input.deltaMs, 0, MAX_TIMER_DURATION_MS);
      if (state.status === "running") return { ...state, endsAt: now + next, remainingMs: next };
      return { ...state, remainingMs: next };
    }
  }
}

export function parseTimerAction(body: unknown): TimerAction | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  switch (b.action) {
    case "start":
    case "pause":
    case "reset":
      return { action: b.action };
    case "set_duration":
      return isFiniteNumber(b.durationMs) && b.durationMs > 0 && b.durationMs <= MAX_TIMER_DURATION_MS
        ? { action: "set_duration", durationMs: Math.round(b.durationMs) }
        : null;
    case "adjust":
      return isFiniteNumber(b.deltaMs) && Math.abs(b.deltaMs) <= MAX_TIMER_DURATION_MS
        ? { action: "adjust", deltaMs: Math.round(b.deltaMs) }
        : null;
    default:
      return null;
  }
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
