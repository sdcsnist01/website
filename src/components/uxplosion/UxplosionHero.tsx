"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { HERO_TIMELINE, runHeroTextAssembly } from "./heroTextAssembly";

const EVENT_INFO = [
  { label: "Bootcamp · Online · 3 Days", value: "Sept 22–24" },
  { label: "Hackathon · Offline · SNIST", value: "Sept 27" },
];

const HIGHLIGHTS = [
  { icon: "🏆", value: "₹10,000", caption: "Prize Pool" },
  { icon: "💼", value: "Internship Opportunities", caption: "For standout participants" },
  { icon: "🎁", value: "Exciting Goodies", caption: "For participants" },
];

// Mirrors the mockup's own reveal choreography: the wordmark and "3.0" fade
// in on their own simple timers as their particle bursts settle, then the
// rest of the content cascades in as one staggered group.
export default function UxplosionHero() {
  const reduce = usePrefersReducedMotion();

  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const threeRef = useRef<HTMLSpanElement>(null);

  const [wordOn, setWordOn] = useState(reduce);
  const [threeOn, setThreeOn] = useState(reduce);
  const [contentOn, setContentOn] = useState(reduce);

  useEffect(() => {
    // wordOn/threeOn/contentOn already initialize to `reduce` via useState
    // above, so a reduced-motion visitor sees the final state immediately —
    // nothing more to do here.
    if (reduce) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let handle: { stop: () => void } | null = null;

    const start = () => {
      if (cancelled) return;
      const hero = heroRef.current;
      const canvas = canvasRef.current;
      const wordEl = wordRef.current;
      const threeEl = threeRef.current;
      if (hero && canvas && wordEl && threeEl) {
        handle = runHeroTextAssembly(canvas, hero, wordEl, threeEl);
      }
      timers.push(setTimeout(() => setWordOn(true), HERO_TIMELINE.wordSettle - 40));
      timers.push(setTimeout(() => setThreeOn(true), HERO_TIMELINE.threeSettle - 30));
      timers.push(setTimeout(() => setContentOn(true), HERO_TIMELINE.contentStart));
    };

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(start);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      handle?.stop();
    };
  }, [reduce]);

  const content = (delayMs: number): React.CSSProperties => ({
    opacity: contentOn ? 1 : 0,
    transform: contentOn ? "translateY(0)" : "translateY(14px)",
    transition: `opacity 500ms ease ${delayMs}ms, transform 500ms ease ${delayMs}ms`,
  });

  return (
    <section
      id="uxp-hero"
      ref={heroRef}
      className="relative z-[3] overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{ width: "100%", height: "100%" }}
      />

      <div className="ux-hero-inner">
        <div className="ux-hero-copy">
          <div style={content(0)} className="mb-[18px] flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.16em] text-[#FF6FA8]">
            <span className="text-base">✳</span> SDC Presents
          </div>

          <div className="relative mt-6 inline-block">
            <span
              ref={threeRef}
              className="ux-bubble-three absolute font-extrabold"
              style={{
                fontFamily: "var(--font-uxp-bubble)",
                fontSize: "clamp(1.8rem, 5.2vw, 3.8rem)",
                opacity: threeOn ? 1 : 0,
                transition: "opacity 220ms ease",
                left: "100%",
                top: 0,
                marginLeft: "0.35em",
                transform: "translateY(-38%)",
              }}
            >
              3.0
            </span>
            <h1
              ref={wordRef}
              className="ux-bubble-word block text-[clamp(2.4rem,13vw,10rem)] font-extrabold leading-[0.92] tracking-[-0.01em]"
              style={{ fontFamily: "var(--font-uxp-bubble)", opacity: wordOn ? 1 : 0, transition: "opacity 260ms ease" }}
            >
              UXplosion
            </h1>
          </div>

          <div style={content(30)} className="mb-5 mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FF2F7D]/30 bg-[#FF2F7D]/10 px-5 py-2.5 text-[13.5px] font-bold uppercase tracking-[0.08em] text-[#F4F0F2]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6FA8]" />
              Bootcamp + Hackathon
            </span>
            <span className="inline-flex items-center rounded-full border border-[#F4F0F2]/20 px-5 py-2.5 text-[13.5px] font-bold uppercase tracking-[0.08em] text-[#F4F0F2]">
              3-Day Bootcamp
            </span>
          </div>

          <p style={content(80)} className="mb-6 max-w-[520px] text-[17px] leading-relaxed text-[#B8B2B7]">
            Learn UI/UX through a 3-day bootcamp and put it into practice at the final design hackathon.
          </p>

          <div style={content(140)} className="relative mb-8 max-w-[560px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0A0A0C]/80 px-5 py-6 backdrop-blur-md sm:px-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-10 -top-16 h-32 w-32 rounded-full opacity-70 blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(255,47,125,0.35), transparent 70%)" }}
            />
            <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-5">
              {HIGHLIGHTS.map((h, i) => (
                <div
                  key={h.caption}
                  className={`flex items-center gap-3.5 sm:flex-col sm:items-start sm:gap-2 ${
                    i > 0 ? "border-t border-white/[0.07] pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0" : ""
                  }`}
                >
                  <span className="text-[24px] leading-none" aria-hidden="true">
                    {h.icon}
                  </span>
                  <div>
                    <div className="text-[17px] font-bold leading-tight text-[#F4F0F2]" style={{ fontFamily: "var(--font-uxp-heading)" }}>
                      {h.value}
                    </div>
                    <div className="mt-1 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[#A39CA1]">
                      {h.caption}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={content(200)} className="mb-10 flex flex-nowrap gap-2.5 sm:gap-3.5">
            <span
              aria-disabled="true"
              className="relative flex-1 sm:flex-none inline-flex cursor-not-allowed items-center justify-center overflow-hidden whitespace-nowrap rounded-full bg-gradient-to-r from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] px-4 sm:px-8 py-3.25 sm:py-3.75 text-[13px] sm:text-[15px] font-bold text-[#0A0A0C] opacity-60"
            >
              Registrations Closed
            </span>
            <a
              href="#timeline"
              className="flex-1 sm:flex-none inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[#F4F0F2]/25 px-4 sm:px-8 py-3.25 sm:py-3.75 text-[13px] sm:text-[15px] font-semibold text-[#F4F0F2] transition-colors hover:bg-white/5"
            >
              View Timeline
            </a>
          </div>

          <div style={content(300)} className="flex flex-wrap gap-8">
            {EVENT_INFO.map((info) => (
              <div key={info.label} className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FF2F7D]/10 shadow-[inset_0_0_0_1px_rgba(255,47,125,0.16)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF6FA8]" />
                </span>
                <div className="text-[13.5px] leading-tight">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8F898F]">
                    {info.label}
                  </div>
                  <div className="font-semibold text-[#F4F0F2]">{info.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <UxplosionPlayPanel reduce={!!reduce} />
      </div>
    </section>
  );
}

// Stagger offsets (ms), added on top of HERO_TIMELINE.contentStart, so the
// panel reads as a sequence — idea (grid card) → build (wireframe) →
// interaction (flow line + dots) → output (prototype) — rather than one
// group-wide fade.
const PLAY_STAGGER = {
  strip1: 0,
  wire: 1500,
  flow: 3000,
  proto: 4500,
  strip2: 6000,
  dots: 6000,
};

function UxplosionPlayPanel({ reduce }: { reduce: boolean }) {
  const reveal = (offsetMs: number) => ({
    initial: reduce ? undefined : { opacity: 0 },
    animate: reduce ? undefined : { opacity: 1 },
    transition: { delay: (HERO_TIMELINE.contentStart + offsetMs) / 1000, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <div aria-hidden="true" className="ux-play-panel">
      <motion.svg
        viewBox="0 0 300 306"
        className="absolute inset-0 h-full w-full overflow-visible"
        {...reveal(PLAY_STAGGER.flow)}
      >
        <path
          d="M74 196 C 128 196, 150 150, 196 112"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
        <path
          d="M74 196 C 128 196, 150 150, 196 112"
          fill="none"
          stroke="#FF2F7D"
          strokeWidth="1.1"
          strokeLinecap="round"
          className="ux-play-flow"
          style={{ filter: "drop-shadow(0 0 5px rgba(255,47,125,0.5))" }}
        />
      </motion.svg>

      <motion.div
        {...reveal(PLAY_STAGGER.wire)}
        className="ux-play-float absolute left-[2%] top-[42%] w-[54%] rounded-2xl bg-gradient-to-br from-[#FF2F7D]/25 to-white/5 p-px"
      >
        <div className="rounded-[15px] bg-[#08080A] p-4">
          <div className="mb-3 flex items-center gap-1.5">
            <span className="h-[5px] w-[5px] rounded-full bg-[#FF2F7D]" />
            <span className="h-[5px] w-[5px] rounded-full bg-white/15" />
            <span className="h-[5px] w-[5px] rounded-full bg-white/15" />
            <span className="ml-auto text-[8.5px] font-semibold uppercase tracking-[0.18em] text-[#635C61]">
              Wireframe
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="h-1.5 w-[72%] rounded bg-white/20" />
            <div className="h-1.5 w-[46%] rounded bg-white/[0.13]" />
            <div className="mt-1 grid grid-cols-3 gap-1.5">
              <div className="h-5 rounded bg-white/[0.09]" />
              <div className="h-5 rounded bg-white/[0.09]" />
              <div className="h-5 rounded bg-white/[0.09]" />
            </div>
          </div>
          <div className="relative mt-3.5 w-[56%]">
            <div className="flex h-[22px] items-center justify-center rounded-full bg-gradient-to-r from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] text-[8.5px] font-bold tracking-[0.04em] text-[#0A0A0C]">
              TRY IT
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        {...reveal(PLAY_STAGGER.proto)}
        className="ux-play-float2 absolute right-[1%] top-[6%] w-[44%] rounded-2xl bg-gradient-to-br from-[#FF8A45]/22 to-white/[0.03] p-px"
      >
        <div className="rounded-xl bg-[#08080A] p-3.5">
          <div className="mb-3 text-[8.5px] font-semibold uppercase tracking-[0.18em] text-[#635C61]">
            Prototype
          </div>
          <div className="h-[34px] rounded-md bg-gradient-to-br from-[#FF2F7D]/20 to-[#FF8A45]/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
          <div className="mt-2.5 flex gap-1.5">
            <div className="h-1.5 flex-1 rounded bg-white/10" />
            <div className="h-1.5 w-[22%] rounded bg-[#FF2F7D]/50" />
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-[#FF2F7D]/15">
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#FF6FA8" strokeWidth={3.4}>
                <path d="M4 12.5l5 5L20 6.5" />
              </svg>
            </span>
            <span className="text-[9px] font-semibold text-[#A39CA1]">Flow linked</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        {...reveal(PLAY_STAGGER.strip1)}
        className="ux-play-strip ux-play-float absolute left-[8%] top-[15%] w-[26%] rounded-xl bg-gradient-to-br from-[#8C5CF6]/20 to-white/[0.028] p-px"
      >
        <div className="rounded-[10px] bg-[#08080A] p-3">
          <div className="grid grid-cols-2 gap-1">
            <div className="h-2.5 rounded bg-white/[0.07]" />
            <div className="h-2.5 rounded bg-white/[0.04]" />
            <div className="h-2.5 rounded bg-white/[0.04]" />
            <div className="h-2.5 rounded bg-[#8C5CF6]/30" />
          </div>
          <div className="mt-2 h-[5px] w-[64%] rounded bg-white/[0.07]" />
        </div>
      </motion.div>

      <motion.div
        {...reveal(PLAY_STAGGER.strip2)}
        className="ux-play-strip ux-play-float2 absolute bottom-[5%] right-[12%] flex items-center gap-1.5 rounded-full bg-[#08080A] px-2.5 py-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF8A45]" />
        <span className="text-[9px] font-semibold tracking-[0.14em] text-[#7C757A]">INTERACTION</span>
      </motion.div>

      <motion.span
        {...reveal(PLAY_STAGGER.dots)}
        className="ux-play-node absolute left-[23%] top-[41%] h-[7px] w-[7px] rounded-full bg-[#FF2F7D] shadow-[0_0_10px_rgba(255,47,125,0.8)]"
      />
      <motion.span
        {...reveal(PLAY_STAGGER.dots)}
        className="ux-play-node absolute left-[65%] top-[37%] h-1.5 w-1.5 rounded-full bg-[#FF8A45] shadow-[0_0_9px_rgba(255,138,69,0.7)]"
        style={{ animationDelay: "-1.2s" }}
      />
      <motion.span
        {...reveal(PLAY_STAGGER.dots)}
        className="ux-play-node absolute left-[47%] top-[64%] h-[5px] w-[5px] rounded-full bg-[#8C5CF6] shadow-[0_0_8px_rgba(140,92,246,0.6)]"
        style={{ animationDelay: "-2.1s" }}
      />
    </div>
  );
}
