"use client";

import { useMemo } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";

const PHASES = [
  { name: "Start", text: "Teams form and the brief goes live." },
  { name: "Ideate", text: "Explore directions and pick one worth building." },
  { name: "Build", text: "Design and prototype the core of the idea." },
  { name: "Iterate", text: "Test assumptions and rework what is not landing." },
  { name: "Refine", text: "Tighten the flows and cut what is not needed." },
  { name: "Test", text: "Run it end to end and fix what breaks." },
  { name: "Polish", text: "Final pass on detail, copy, and presentation." },
  { name: "Present", text: "Show the work and explain the thinking." },
];

const FACTS = [
  { v: "8 hours", k: "Build window" },
  { v: "9 AM – 7:30 PM", k: "Event hours" },
  { v: "On campus", k: "Venue" },
  { v: "Buses provided", k: "Travel" },
  { v: "Team-based", k: "Participation" },
];

const RING_C = 490;

// Position of each phase label around the ring, mirroring the mockup's
// per-index x/y/shift/dir layout for an 8-point radial arrangement.
const PHASE_LAYOUT = [
  { x: "50%", y: "-6%", dir: "column" as const, shift: "-50% 0" },
  { x: "82%", y: "10%", dir: "row" as const, shift: "0 -50%" },
  { x: "104%", y: "50%", dir: "row" as const, shift: "0 -50%" },
  { x: "82%", y: "90%", dir: "row" as const, shift: "0 -50%" },
  { x: "50%", y: "106%", dir: "column" as const, shift: "-50% 0" },
  { x: "18%", y: "90%", dir: "row-reverse" as const, shift: "-100% -50%" },
  { x: "-4%", y: "50%", dir: "row-reverse" as const, shift: "-100% -50%" },
  { x: "18%", y: "10%", dir: "row-reverse" as const, shift: "-100% -50%" },
];

export default function UxplosionHackathon() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();

  const phaseIdx = Math.max(0, Math.min(7, Math.floor(progress * 7.999)));
  const ringOffset = RING_C - RING_C * progress;
  const glow = (0.1 + 0.12 * progress).toFixed(3);
  const phase = PHASES[phaseIdx];

  const facts = useMemo(() => FACTS, []);

  return (
    <section className="relative z-[2] px-4 py-20 sm:px-6 md:px-8 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="ux-eco-grid-bg absolute inset-0" />
        <div
          className="ux-eco-glow absolute left-0 top-0 h-full w-[46%] blur-[46px]"
          style={{
            background:
              "linear-gradient(100deg, rgba(255,47,125,0) 0%, rgba(255,47,125,0.10) 35%, rgba(255,83,104,0.09) 55%, rgba(255,138,69,0.07) 72%, rgba(255,138,69,0) 100%)",
          }}
        />
      </div>

      <div className="relative z-[2] mx-auto mb-10 max-w-[1180px] md:mb-0">
        <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6FA8]">
          <span aria-hidden="true" className="text-sm">
            ✳
          </span>{" "}
          The Hackathon
        </div>
      </div>

      <div ref={ref} className="relative" style={{ height: "400vh" }}>
        <div className="sticky top-0 mx-auto grid max-w-[1180px] items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16" style={{ minHeight: "100vh" }}>
          <div className="relative min-h-[190px] md:min-h-[230px] lg:min-h-72.5">
            {PHASES.map((p, i) => {
              const isCurrent = i === phaseIdx;
              const isPast = i < phaseIdx;
              return (
                <div
                  key={p.name}
                  aria-hidden={!isCurrent}
                  className="absolute inset-0 flex flex-col justify-center"
                  style={{
                    opacity: isCurrent ? 1 : 0,
                    transform: isCurrent ? "translateY(0)" : `translateY(${isPast ? -26 : 26}px)`,
                    filter: isCurrent ? "blur(0px)" : "blur(5px)",
                    transition: "opacity 700ms ease, transform 800ms cubic-bezier(.2,.7,.2,1), filter 700ms ease",
                  }}
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#FF6FA8]">{p.name}</div>
                  <div
                    className="mt-4 text-[clamp(30px,4.2vw,58px)] font-semibold leading-[1.04] tracking-[-0.03em] text-[#F4F0F2]"
                    style={{ fontFamily: "var(--font-uxp-heading)" }}
                  >
                    {p.text}
                  </div>
                </div>
              );
            })}
            <div
              className="absolute inset-x-0 bottom-6 h-px bg-gradient-to-r from-[#FF2F7D] via-[#FF8A45] to-transparent transition-all duration-700"
              style={{ width: `${((phaseIdx + 1) / PHASES.length) * 100}%` }}
            />
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[min(420px,58vh)]">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[112%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[background] duration-700"
              style={{
                background: `radial-gradient(circle, rgba(255,47,125,${glow}), rgba(255,138,69,0.05) 44%, transparent 70%)`,
              }}
            />

            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible" style={{ transform: "rotate(-90deg)" }}>
              <defs>
                <linearGradient id="hkRing" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF2F7D" />
                  <stop offset="55%" stopColor="#FF5368" />
                  <stop offset="100%" stopColor="#FF8A45" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="url(#hkRing)"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={ringOffset}
                style={{
                  transition: "stroke-dashoffset 300ms cubic-bezier(.3,.6,.2,1)",
                  filter: "drop-shadow(0 0 6px rgba(255,47,125,0.5))",
                }}
              />
            </svg>

            {PHASES.map((p, i) => {
              const layout = PHASE_LAYOUT[i];
              const active = i === phaseIdx;
              const passed = i < phaseIdx;
              return (
                <div
                  key={p.name}
                  className="absolute flex items-center gap-1.5 whitespace-nowrap transition-opacity duration-500"
                  style={{
                    left: layout.x,
                    top: layout.y,
                    transform: `translate(${layout.shift.split(" ")[0]}, ${layout.shift.split(" ")[1]})`,
                    flexDirection: layout.dir,
                    opacity: active ? 1 : passed ? 0.78 : 0.5,
                  }}
                >
                  <span
                    className="flex-shrink-0 rounded-full transition-all duration-300"
                    style={{
                      width: active ? "7px" : "5px",
                      height: active ? "7px" : "5px",
                      background: active ? "#FF2F7D" : passed ? "rgba(255,47,125,0.7)" : "rgba(255,255,255,0.38)",
                      boxShadow: active ? "0 0 14px rgba(255,47,125,0.85)" : "none",
                    }}
                  />
                  <span
                    className="text-[9.5px] font-bold uppercase tracking-[0.16em] transition-colors duration-300"
                    style={{ color: active ? "#FFFFFF" : passed ? "#CFC8CD" : "#9A9298" }}
                  >
                    {p.name}
                  </span>
                </div>
              );
            })}

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div
                className="bg-gradient-to-br from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] bg-clip-text text-[clamp(64px,9vw,130px)] font-semibold leading-[0.86] tracking-[-0.05em] text-transparent"
                style={{ fontFamily: "var(--font-uxp-heading)" }}
              >
                08<span className="text-[0.42em]">H</span>
              </div>
              <div className="mt-3.5 text-[10px] font-bold uppercase tracking-[0.28em] text-[#FF6FA8]">
                {phase.name}
              </div>
              <div className="mt-3 max-w-[230px] text-center text-[13.5px] leading-relaxed text-[#B8B2B7]">
                {phase.text}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-5 lg:gap-0">
            {facts.map((f, i) => (
              <div key={f.k} className={`py-4 pl-0 pr-3.5 lg:pl-4 ${i > 0 ? "border-t border-white/[0.06] pt-4 sm:border-t-0 sm:border-l lg:border-t-0" : ""}`}>
                <div
                  className="text-[clamp(15px,1.5vw,20px)] font-semibold tracking-[-0.012em] text-[#F0EAEE]"
                  style={{ fontFamily: "var(--font-uxp-heading)" }}
                >
                  {f.v}
                </div>
                <div className="mt-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#7A7278]">{f.k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
