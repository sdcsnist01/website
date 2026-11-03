"use client";

import { useState } from "react";
import { useHackathonTimer } from "@/components/hackathon-timer/HackathonTimerProvider";
import { formatDuration, type HackathonTimerPayload, type TimerAction } from "@/lib/hackathon-timer";

const PHASE_LABEL: Record<string, string> = {
  idle: "Not started",
  paused: "Paused",
  normal: "Running",
  "final-hour": "Running — final hour",
  "final-ten": "Running — final 10 minutes",
  up: "Time's up",
};

const ADJUSTMENTS = [-5, -1, 1, 5];

export default function HackathonTimerControls() {
  const { timer, remainingMs, phase, connection, receive } = useHackathonTimer();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hours, setHours] = useState("8");
  const [minutes, setMinutes] = useState("0");

  async function send(action: TimerAction) {
    setPending(true);
    setError(null);
    const sentAt = Date.now();
    try {
      const res = await fetch("/api/hackathon-timer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Could not update the timer.");
      receive(data as HackathonTimerPayload, sentAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the timer.");
    } finally {
      setPending(false);
    }
  }

  function handleSetDuration(e: React.FormEvent) {
    e.preventDefault();
    const durationMs = ((Number(hours) || 0) * 60 + (Number(minutes) || 0)) * 60 * 1000;
    if (durationMs <= 0) {
      setError("Enter a duration greater than zero.");
      return;
    }
    if (timer?.status === "running" && !confirm("The timer is running. Replace it with a new duration (not started)?")) {
      return;
    }
    send({ action: "set_duration", durationMs });
  }

  const running = timer?.status === "running" && phase !== "up";
  const canStart = !!timer && timer.status !== "running" && remainingMs > 0;

  const btn =
    "rounded-xl px-5 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Hackathon timer</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            UXplosion 3.0 — changes appear on the big screen within a few seconds.
          </p>
        </div>
        <a
          href="/events/uxplosion3.0/timer"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[#d8d2cf] bg-white px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
        >
          Open display ↗
        </a>
      </div>

      {error ? (
        <p className="rounded-xl border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220]">{error}</p>
      ) : null}
      {connection === "offline" ? (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Can&apos;t reach the timer service. Showing the last known state.
        </p>
      ) : null}

      <section className="rounded-xl border border-[#e4ddd6] bg-surface-container p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {phase ? PHASE_LABEL[phase] : "Loading…"}
        </p>
        <p className="mt-2 font-mono text-5xl font-bold tabular-nums text-on-surface sm:text-6xl">
          {timer ? formatDuration(remainingMs) : "--:--:--"}
        </p>
        {timer ? (
          <p className="mt-2 text-sm text-on-surface-variant">
            Configured duration: {formatDuration(timer.durationMs)}
            {timer.status === "running" && timer.endsAt
              ? ` · Ends at ${new Date(timer.endsAt).toLocaleTimeString()}`
              : null}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending || !canStart}
            onClick={() => send({ action: "start" })}
            className={`${btn} bg-primary text-on-primary-fixed`}
          >
            {timer?.status === "paused" ? "Resume" : "Start"}
          </button>
          <button
            type="button"
            disabled={pending || !running}
            onClick={() => send({ action: "pause" })}
            className={`${btn} border border-outline-variant/30 text-on-surface hover:bg-surface-container-high`}
          >
            Pause
          </button>
          <button
            type="button"
            disabled={pending || !timer}
            onClick={() => {
              if (confirm("Reset the timer to its full configured duration?")) send({ action: "reset" });
            }}
            className={`${btn} border border-primary/30 text-[#7a1220] hover:bg-[#fdf0f0]`}
          >
            Reset
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Adjust</span>
          {ADJUSTMENTS.map((m) => (
            <button
              key={m}
              type="button"
              disabled={pending || !timer || phase === "up"}
              onClick={() => send({ action: "adjust", deltaMs: m * 60 * 1000 })}
              className="rounded-full border border-[#d8d2cf] bg-white px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50"
            >
              {m > 0 ? `+${m}` : `−${Math.abs(m)}`} min
            </button>
          ))}
        </div>
      </section>

      <form
        onSubmit={handleSetDuration}
        className="rounded-xl border border-[#e4ddd6] bg-surface-container p-6"
      >
        <h3 className="font-semibold text-on-surface">Set duration</h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Replaces the configured length and puts the timer back to &ldquo;not started&rdquo;.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Hours</span>
            <input
              type="number"
              min={0}
              max={48}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-24 rounded-lg border border-[#d8d2cf] bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Minutes</span>
            <input
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-24 rounded-lg border border-[#d8d2cf] bg-white px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className={`${btn} border border-outline-variant/30 text-on-surface hover:bg-surface-container-high`}
          >
            Set duration
          </button>
        </div>
      </form>
    </div>
  );
}
