"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getStrictContext } from "@/lib/get-strict-context";
import {
  UXPLOSION_TIMER_ID,
  remainingAt,
  timerPhase,
  type HackathonTimerPayload,
  type HackathonTimerState,
  type TimerPhase,
} from "@/lib/hackathon-timer";

const POLL_MS = 5000;
const TICK_MS = 200;
const CACHE_KEY = `hackathon-timer:${UXPLOSION_TIMER_ID}`;

type HackathonTimerContextValue = {
  timer: HackathonTimerState | null;
  /** Remaining time, rounded up to the whole second being displayed. */
  remainingMs: number;
  phase: TimerPhase | null;
  connection: "loading" | "live" | "offline";
  /** Apply a fresh server payload (e.g. the response to an organizer action). */
  receive: (payload: HackathonTimerPayload, sentAt?: number) => void;
  refresh: () => Promise<void>;
};

const [Provider, useHackathonTimer] = getStrictContext<HackathonTimerContextValue>("HackathonTimerProvider");

export { useHackathonTimer };

type CachedTimer = { timer: HackathonTimerState; offsetMs: number };

function readCache(): CachedTimer | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedTimer) : null;
  } catch {
    return null;
  }
}

function writeCache(value: CachedTimer) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode etc.) — the server remains the source of truth.
  }
}

/**
 * Single client-side view of the shared hackathon timer. Polls the persisted
 * state and derives the countdown from `endsAt` against a server-corrected
 * clock, so every screen shows the same time and a refresh never resets it.
 */
export default function HackathonTimerProvider({ children }: { children: React.ReactNode }) {
  const [timer, setTimer] = useState<HackathonTimerState | null>(null);
  const [connection, setConnection] = useState<HackathonTimerContextValue["connection"]>("loading");
  const [remainingMs, setRemainingMs] = useState(0);
  // Server clock minus local clock, so a projector with a skewed clock still
  // shows the right time.
  const offsetRef = useRef(0);
  const timerRef = useRef<HackathonTimerState | null>(null);

  const tick = useCallback(() => {
    const current = timerRef.current;
    if (!current) return;
    const ms = remainingAt(current, Date.now() + offsetRef.current);
    setRemainingMs(Math.ceil(ms / 1000) * 1000);
  }, []);

  const apply = useCallback(
    (next: HackathonTimerState, offsetMs: number) => {
      offsetRef.current = offsetMs;
      timerRef.current = next;
      setTimer(next);
      tick();
    },
    [tick],
  );

  const receive = useCallback(
    (payload: HackathonTimerPayload, sentAt?: number) => {
      const receivedAt = Date.now();
      const localMid = sentAt === undefined ? receivedAt : (sentAt + receivedAt) / 2;
      const offsetMs = payload.serverNow - localMid;
      apply(payload.timer, offsetMs);
      setConnection("live");
      writeCache({ timer: payload.timer, offsetMs });
    },
    [apply],
  );

  const refresh = useCallback(async () => {
    const sentAt = Date.now();
    try {
      const res = await fetch("/api/hackathon-timer", { cache: "no-store" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      receive((await res.json()) as HackathonTimerPayload, sentAt);
    } catch {
      // Keep counting down from the last known state; just flag the connection.
      setConnection("offline");
    }
  }, [receive]);

  useEffect(() => {
    const cached = readCache();
    // Restoring from cache lets a refresh during a network blip keep showing
    // the countdown instead of a blank screen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cached) apply(cached.timer, cached.offsetMs);
    refresh();

    const poll = setInterval(refresh, POLL_MS);
    const clock = setInterval(tick, TICK_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", refresh);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", refresh);
    };
  }, [apply, refresh, tick]);

  const value = useMemo<HackathonTimerContextValue>(
    () => ({
      timer,
      remainingMs,
      phase: timer ? timerPhase(timer, remainingMs) : null,
      connection,
      receive,
      refresh,
    }),
    [timer, remainingMs, connection, receive, refresh],
  );

  return <Provider value={value}>{children}</Provider>;
}
