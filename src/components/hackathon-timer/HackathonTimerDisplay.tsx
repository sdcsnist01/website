"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import UxplosionParticles from "@/components/uxplosion/UxplosionParticles";
import { splitDuration, type TimerPhase } from "@/lib/hackathon-timer";
import { useHackathonTimer } from "./HackathonTimerProvider";

const PHASE_PILL: Partial<Record<TimerPhase, string>> = {
  idle: "Starting soon",
  paused: "Timer paused",
  "final-hour": "Final hour",
  "final-ten": "Final 10 minutes",
};

const UNITS = ["Hours", "Minutes", "Seconds"] as const;
const IDLE_CURSOR_MS = 2500;

/**
 * Student-facing big-screen countdown. Display only: it reads the shared
 * timer through useHackathonTimer and never exposes organizer controls.
 * The only interaction is entering/leaving browser fullscreen.
 */
export default function HackathonTimerDisplay() {
  const { timer, remainingMs, phase, connection } = useHackathonTimer();
  const pointerActive = usePointerActivity(IDLE_CURSOR_MS);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  useScreenWakeLock();

  const { hours, minutes, seconds } = splitDuration(remainingMs);
  const groups = timer ? [hours, minutes, seconds].map((n) => String(n).padStart(2, "0")) : ["--", "--", "--"];
  const progress = timer && timer.durationMs > 0 ? 1 - remainingMs / Math.max(timer.durationMs, remainingMs) : 0;
  const isUp = phase === "up";
  const pill = phase ? PHASE_PILL[phase] : undefined;

  return (
    <div
      className="ux-page ux-stage"
      data-phase={phase ?? "loading"}
      data-pointer={pointerActive ? "active" : "idle"}
      onDoubleClick={toggleFullscreen}
    >
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-[#0A0A0C]" />
      <UxplosionParticles />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
        <div className="ux-eco-grid-bg absolute inset-0" />
        <div className="ux-stage-glow" />
      </div>

      <header className="ux-stage-header">
        <Image
          src="/sdc-logo.png"
          alt="SDC — Student Developers Community"
          width={1050}
          height={487}
          priority
          className="ux-stage-logo"
        />
        <div className="ux-stage-wordmark" aria-label="UXplosion 3.0">
          <span className="ux-bubble-word">UXplosion</span>
          <span className="ux-bubble-three">3.0</span>
        </div>
        <div className="ux-stage-social" aria-label="Instagram: sdc.snist">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
            <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
            <path d="M16.5 7.5v.01" />
          </svg>
          <span>SDC.SNIST</span>
        </div>
      </header>

      <main className="ux-stage-main">
        {isUp ? (
          <div key="up" className="ux-stage-up" role="status" aria-live="assertive">
            <div className="ux-stage-kicker">
              <span aria-hidden="true">✳</span> 00 : 00 : 00
            </div>
            <h1 className="ux-stage-up-title ux-bubble-word">
              Hackathon time
              <br />
              is up
            </h1>
            <p className="ux-stage-up-sub">Pens down — thank you for building.</p>
          </div>
        ) : (
          <div key="countdown" className="ux-stage-countdown">
            <div className="ux-stage-label">
              <h1 className="ux-stage-kicker">
                <span aria-hidden="true">✳</span> Hackathon time remaining
              </h1>
              {pill ? (
                <span className="ux-stage-pill">
                  <span className="ux-stage-pill-dot" aria-hidden="true" />
                  {pill}
                </span>
              ) : null}
            </div>

            <div
              className="ux-stage-clock"
              role="timer"
              aria-live="off"
              aria-label={timer ? `${hours} hours ${minutes} minutes ${seconds} seconds remaining` : "Loading timer"}
            >
              {groups.map((group, i) => (
                <div key={UNITS[i]} className="ux-stage-group-wrap">
                  {i > 0 ? (
                    <span className="ux-stage-colon" aria-hidden="true">
                      :
                    </span>
                  ) : null}
                  <div className="ux-stage-group">
                    <div className="ux-stage-digits" aria-hidden="true">
                      {group.split("").map((d, j) => (
                        <span key={j} className="ux-stage-digit">
                          {d}
                        </span>
                      ))}
                    </div>
                    <span className="ux-stage-unit" aria-hidden="true">
                      {UNITS[i]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="ux-stage-footer">
        <p className="ux-stage-tagline">
          Learn <span aria-hidden="true">•</span> Create <span aria-hidden="true">•</span> Build{" "}
          <span aria-hidden="true">•</span> Win
        </p>
        <div className="ux-stage-progress" aria-hidden="true">
          <div className="ux-stage-progress-fill" style={{ transform: `scaleX(${Math.min(1, Math.max(0, progress))})` }} />
        </div>
      </footer>

      {connection === "offline" ? (
        <div className="ux-stage-conn" role="status">
          <span className="ux-stage-conn-dot" aria-hidden="true" />
          {timer ? "Reconnecting…" : "Connecting to timer…"}
        </div>
      ) : null}

      <button
        type="button"
        onClick={toggleFullscreen}
        className="ux-stage-fs"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          {isFullscreen ? "fullscreen_exit" : "fullscreen"}
        </span>
      </button>
    </div>
  );
}

/** True while the pointer has moved recently — used to hide the cursor and fullscreen button on the projector. */
function usePointerActivity(idleMs: number) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const onMove = () => {
      setActive(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setActive(false), idleMs);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
    };
  }, [idleMs]);

  return active;
}

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "f" || e.key === "F") && !e.metaKey && !e.ctrlKey && !e.altKey) toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleFullscreen]);

  return { isFullscreen, toggleFullscreen };
}

/** Keeps the projector machine from dimming or sleeping mid-hackathon, where supported. */
function useScreenWakeLock() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        lock = await navigator.wakeLock.request("screen");
        if (cancelled) lock.release().catch(() => {});
      } catch {
        // Denied or unsupported — the timer still works.
      }
    };

    acquire();
    document.addEventListener("visibilitychange", acquire);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", acquire);
      lock?.release().catch(() => {});
    };
  }, []);
}
