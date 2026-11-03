"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

/**
 * Drifting background words from the Claude Design reference (FloatWords.dc.html).
 * Each preset is [text, side, x%, y%, size(vw), alpha, rotate, kind, parallax, pointer px, anim, duration s, onMobile].
 * Scroll and pointer offsets are written to CSS variables on the root, as in the reference.
 */
type Kind = "solid" | "outline-red" | "thin" | "red" | "outline";
type WordSpec = [string, "l" | "r", number, number, number, number, number, Kind, number, number, string, number, 0 | 1];
export type FloatWordsPreset = "hero" | "stats" | "gallery" | "about" | "story" | "board" | "contact" | "footer";

const PRESETS: Record<FloatWordsPreset, WordSpec[]> = {
  hero: [
    ["HACKATHON", "l", -6, 62, 12, 0.055, -3, "solid", 0.06, 12, "A", 24, 1],
    ["BUILD", "r", -2, 3, 12, 0.14, 2, "outline-red", -0.04, 8, "B", 28, 1],
    ["BOOTCAMP", "l", 4, 90, 5, 0.07, 0, "thin", 0.03, 0, "C", 21, 0],
    ["STUDENT DEVELOPERS", "r", -10, 86, 4.4, 0.09, -2, "thin", 0.05, 0, "D", 26, 0],
    ["UXplosion", "l", 3, 8, 4, 0.12, 4, "red", 0, 6, "E", 22, 1],
    ["AI / ML", "r", 16, 62, 3, 0.1, 0, "red", 0, 0, "F", 20, 0],
  ],
  stats: [
    ["WORKSHOPS", "r", -4, 2, 9, 0.05, 0, "solid", 0.05, 0, "B", 24, 1],
    ["TECH TALKS", "l", 36, 80, 6, 0.12, 0, "outline-red", -0.03, 0, "C", 20, 0],
    ["HashItOut", "l", 2, 68, 3.6, 0.12, -2, "red", 0, 0, "E", 18, 0],
  ],
  gallery: [
    ["BUILD NIGHT", "l", -4, 8, 12, 0.12, -2, "outline", 0.05, 0, "A", 24, 1],
    ["COLLABORATE", "r", -6, 90, 9, 0.05, 0, "solid", -0.04, 0, "D", 22, 1],
    ["UXplosion", "r", 6, 2, 4, 0.12, 3, "red", 0, 0, "F", 19, 0],
  ],
  about: [
    ["COMMUNITY", "l", -5, 66, 14, 0.12, -2, "outline", 0.05, 10, "A", 24, 1],
    ["BUILD TOGETHER", "r", -10, 86, 7, 0.05, 0, "solid", -0.04, 0, "C", 21, 1],
    ["INNOVATE", "r", 8, 6, 3.6, 0.12, 2, "red", 0, 0, "E", 18, 0],
  ],
  story: [
    ["INNOVATE", "r", 3, 5, 10, 0.05, 2, "outline", 0.04, 0, "B", 26, 0],
    ["BUILD", "l", 3, 90, 6, 0.045, 0, "outline", -0.03, 0, "D", 22, 0],
  ],
  board: [
    ["THE PEOPLE", "l", -6, 1, 14, 0.14, -2, "outline-red", 0.05, 12, "A", 24, 1],
    ["COLLABORATE", "r", -6, 66, 7, 0.05, 0, "solid", -0.03, 0, "C", 22, 1],
    ["Innovate", "l", 4, 74, 3.4, 0.1, 2, "red", 0, 0, "E", 19, 0],
  ],
  // Footer words as on desktop, but the two large ones stay off mobile so they never sit behind the copyright or CTA text.
  footer: [
    ["BUILD NIGHT", "l", -4, 8, 12, 0.12, -2, "outline", 0.05, 0, "A", 24, 0],
    ["COLLABORATE", "r", -6, 90, 9, 0.05, 0, "solid", -0.04, 0, "D", 22, 0],
    ["UXplosion", "r", 6, 2, 4, 0.12, 3, "red", 0, 0, "F", 19, 1],
  ],
  contact: [
    ["CONNECT", "l", -3, 8, 11, 0.09, -2, "outline-red", 0.04, 10, "A", 24, 1],
    ["SAY HELLO", "r", -6, 78, 8, 0.05, 0, "solid", -0.04, 0, "C", 22, 1],
    ["Collab", "r", 8, 2, 3.6, 0.12, 2, "red", 0, 0, "E", 18, 0],
    ["WE LISTEN", "l", 4, 92, 3.2, 0.07, 0, "thin", 0.03, 0, "D", 21, 0],
  ],
};

const DOTS: [number, number, number, number][] = [
  [12, 22, 0, 5.5],
  [28, 64, 1.6, 7],
  [47, 12, 3.2, 6.2],
  [63, 74, 0.8, 7.4],
  [78, 30, 2.4, 6],
  [90, 58, 4, 6.8],
];

export default function FloatWords({ preset = "hero", tone = "light" }: { preset?: FloatWordsPreset; tone?: "light" | "dark" }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = (q: string) => window.matchMedia(q).matches;
    const reduce = mq("(prefers-reduced-motion: reduce)");
    const fine = mq("(hover: hover) and (pointer: fine)");
    const el = rootRef.current;
    if (!el) return;

    const onResize = () => setMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);

    let visible = false;
    let raf = 0;
    let mx = 0;
    let my = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--off", (r.top + r.height / 2 - window.innerHeight / 2).toFixed(0));
        el.style.setProperty("--mx", mx.toFixed(3));
        el.style.setProperty("--my", my.toFixed(3));
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          if (entry.isIntersecting) {
            el.setAttribute("data-in", "1");
            schedule();
          }
        });
      },
      { threshold: 0 },
    );
    io.observe(el);

    const onScroll = () => {
      if (visible) schedule();
    };
    const onPointer = (e: PointerEvent) => {
      if (!visible) return;
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      schedule();
    };
    if (!reduce) {
      window.addEventListener("scroll", onScroll, { passive: true });
      if (fine) window.addEventListener("pointermove", onPointer, { passive: true });
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const words = useMemo(() => {
    const dark = tone === "dark";
    const ink = dark ? "255,255,255" : "23,23,25";
    const red = dark ? "232,162,154" : "217,39,46";
    return PRESETS[preset]
      .filter((w) => !mobile || w[12] === 1)
      .map((w, i) => {
        const [text, side, x, y, s, a, rot, kind, par, ptr, anim, dur] = w;
        const size = s * (mobile ? 1.7 : 1);
        const big = s >= 9;
        const outline = kind === "outline" || kind === "outline-red";
        const col = kind === "red" ? `rgba(${red},${a})` : `rgba(${ink},${a})`;
        const stroke = kind === "outline-red" ? `rgba(${red},${a})` : `rgba(${ink},${a})`;
        const outer: CSSProperties = {
          position: "absolute",
          [side === "r" ? "right" : "left"]: `${x}%`,
          top: `${y}%`,
          transform: `translate3d(calc(var(--mx,0) * ${ptr}px), calc(var(--off,0) * ${par}px + var(--my,0) * ${ptr}px), 0)`,
          transition: "transform .5s cubic-bezier(.22,1,.36,1)",
          pointerEvents: "none",
        };
        const mid: CSSProperties = {
          display: "block",
          animation: `fw${anim} ${dur}s ease-in-out ${(-i * 3.1).toFixed(1)}s infinite`,
          willChange: "transform",
        };
        const inner: CSSProperties = {
          display: "block",
          whiteSpace: "nowrap",
          fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
          fontWeight: kind === "thin" ? 300 : 700,
          fontSize: `min(${size}vw, ${(size * 14.5).toFixed(0)}px)`,
          lineHeight: 0.9,
          letterSpacing: big ? "-0.045em" : "0.16em",
          transform: `rotate(${rot}deg)`,
          transitionDelay: `${i * 120}ms`,
          color: outline ? "transparent" : col,
          ...(outline ? { WebkitTextStroke: `1.2px ${stroke}` } : {}),
        };
        return { key: `${text}-${i}`, text, outer, mid, inner };
      });
  }, [preset, tone, mobile]);

  return (
    <div
      ref={rootRef}
      data-fw="1"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {words.map((w) => (
        <span key={w.key} style={w.outer}>
          <span data-fwm="1" style={w.mid}>
            <span data-fwi="1" style={w.inner}>
              {w.text}
            </span>
          </span>
        </span>
      ))}
      {DOTS.map(([x, y, delay, duration], i) => {
        const c = i % 2 ? `rgba(${tone === "dark" ? "232,162,154" : "217,39,46"},.85)` : "rgba(232,162,154,.95)";
        return (
          <span
            key={`dot-${i}`}
            data-fwd="1"
            className="motion-reduce:hidden"
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 6px ${c}`,
              opacity: 0,
              animation: `fwGlint ${duration}s ease-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}
