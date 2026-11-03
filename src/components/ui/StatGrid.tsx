"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

type Stat = {
  /** Display value such as "50k+", "120+", "45" or "1M+". Split into number and red suffix for styling. */
  value: string;
  label: string;
};

/** Splits "50k+" into { num: 50, suffix: "k+", decimals: 0 }. Values without digits render as-is. */
function splitValue(value: string) {
  const match = /^(\d[\d.,]*)(.*)$/.exec(value);
  if (!match) return { num: null, text: value, suffix: "" };
  const digits = match[1].replace(/,/g, "");
  return { num: Number(digits), text: match[1], suffix: match[2] };
}

/** Counts from 0 to the target once the figure scrolls into view, as the reference does (statProgress). */
function CountUp({ target, text }: { target: number | null; text: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    if (target === null || reduce) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1500;
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          setValue(Math.round(target * eased));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, reduce]);

  const shown = target === null || reduce ? text : value === null ? "0" : value.toLocaleString("en-US");
  return (
    <span ref={ref} className="tabular-nums">
      {shown}
    </span>
  );
}

/** Shared statistics band from the Claude Design reference: grotesk figures, red suffix, red rule, mono label. */
export default function StatGrid({ stats, className = "" }: { stats: Stat[]; className?: string }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 ${className}`}>
      {stats.map((stat, i) => {
        const { num, text, suffix } = splitValue(stat.value);
        return (
          <div
            key={stat.label}
            className={[
              "py-5 md:px-6 md:py-2",
              i % 2 === 1 ? "border-l border-[#e4ddd6] pl-5 md:pl-6" : "pr-3 md:pr-6",
              i >= 2 ? "border-t border-[#e4ddd6] md:border-t-0" : "",
              i === 0 ? "md:pl-0" : "md:border-l md:border-[#e4ddd6]",
            ].join(" ")}
          >
            <p className="font-grotesk text-[clamp(52px,7.4vw,104px)] font-bold leading-[0.95] text-on-surface">
              <CountUp target={num} text={text} />
              <span className="text-primary">{suffix}</span>
            </p>
            <div className="mt-4 flex items-center gap-2.5">
              <span className="h-0.5 w-[18px] shrink-0 bg-primary" aria-hidden />
              <span className="font-mono-ui text-[11.5px] uppercase tracking-[2.5px] text-on-surface-variant">
                {stat.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
