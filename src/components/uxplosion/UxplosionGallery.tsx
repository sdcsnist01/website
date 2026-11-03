"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import Reveal from "@/components/home/Reveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Photo = { src: string; w: number; h: number; caption: string };

const g = (n: string, w: number, h: number, caption: string): Photo => ({
  src: `/uxplosion3-gallery/${n}.jpg`,
  w,
  h,
  caption,
});

// The crew photo is pinned to the middle column (on desktop) and highlighted.
const CREW = "/uxplosion3-gallery/02.jpg";

// Mixed on purpose: group shots alternate with candid moments so neither
// bunches up in one part of the grid.
const PHOTOS: Photo[] = [
  g("09", 1600, 1592, "Where it was announced"),
  g("07", 1600, 1180, "Volunteers"),
  g("14", 1229, 1600, "Ideas into innovation"),
  g("12", 1600, 1191, "Doors open"),
  g("16", 1249, 1600, "Opening words"),
  g("03", 1600, 1146, "Team UXplosion"),
  g("04", 1221, 1600, "Mentor rounds"),
  g("15", 1600, 890, "Wall of thoughts"),
  g("06", 1600, 1120, "The organizers"),
  g("02", 1283, 1600, "The crew"),
  g("17", 1600, 1167, "The hall, ready to go"),
  g("10", 1199, 1600, "Checking in on the builds"),
  g("08", 1600, 1185, "Thumbs up from the team"),
  g("11", 1211, 1600, "The SDC photobooth"),
  g("13", 1600, 1128, "Clock's ticking"),
  g("18", 1600, 1193, "The crew behind the decor"),
  g("20", 1233, 1600, "Pens down"),
  g("01", 1600, 1129, "Everyone, one frame"),
  g("19", 1600, 1204, "Cake and confetti"),
];

// Masonry: each photo goes to the currently shortest column so the columns
// end level. Returns photo indices per column.
function layout(columns: number): number[][] {
  const cols: number[][] = Array.from({ length: columns }, () => []);
  const heights = new Array<number>(columns).fill(0);
  PHOTOS.forEach((p, i) => {
    const middle = Math.floor(columns / 2);
    const c =
      p.src === CREW && columns === 3
        ? middle
        : heights.indexOf(Math.min(...heights));
    cols[c].push(i);
    heights[c] += p.h / p.w;
  });
  return cols;
}

// Column count follows the same breakpoints as Tailwind's sm / lg.
const subscribeWidth = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
const getColumns = () =>
  window.matchMedia("(min-width: 1024px)").matches
    ? 3
    : window.matchMedia("(min-width: 640px)").matches
      ? 2
      : 1;

const EASE = [0.22, 1, 0.36, 1] as const;

const noopSubscribe = () => () => {};

export default function UxplosionGallery() {
  const reduce = usePrefersReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const columns = useSyncExternalStore(subscribeWidth, getColumns, () => 3);
  // Portals need document.body, which only exists after hydration.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const step = useCallback(
    (dir: 1 | -1) =>
      setOpen((i) =>
        i === null ? i : (i + dir + PHOTOS.length) % PHOTOS.length,
      ),
    [],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, step]);

  const current = open === null ? null : PHOTOS[open];

  return (
    <section
      id="gallery"
      className="relative z-[2] px-4 py-16 sm:px-6 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6FA8]">
            <span aria-hidden="true" className="text-sm">
              ✳
            </span>{" "}
            Gallery
          </div>
          <h2
            className="mb-4 text-[clamp(28px,3.4vw,48px)] font-semibold leading-[1.06] tracking-[-0.026em]"
            style={{ fontFamily: "var(--font-uxp-heading)" }}
          >
            Moments from the day.
          </h2>
          <p className="mb-12 max-w-[560px] text-[16px] leading-relaxed text-[#B8B2B7] md:mb-16">
            Eight hours of building, mentoring and celebrating at UXplosion 3.0.
          </p>
        </Reveal>

        <div className="flex gap-4">
          {layout(columns).map((indices, c) => (
            <div key={c} className="flex min-w-0 flex-1 flex-col gap-4">
              {indices.map((i) => {
                const p = PHOTOS[i];
                const crew = p.src === CREW;
                return (
                  <motion.button
                    key={p.src}
                    type="button"
                    onClick={() => setOpen(i)}
                    aria-label={`Open photo: ${p.caption}`}
                    className={`ux-gl-item group relative block w-full overflow-hidden rounded-2xl border text-left ${
                      crew
                        ? "ux-wn-champ border-[#FF2F7D]/60"
                        : "border-white/[0.08] bg-white/[0.02]"
                    }`}
                    initial={
                      reduce ? false : { opacity: 0, y: 40, scale: 0.97 }
                    }
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.7, delay: c * 0.08, ease: EASE }}
                  >
                    <Image
                      src={p.src}
                      alt={p.caption}
                      width={p.w}
                      height={p.h}
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                      className="ux-gl-photo h-auto w-full"
                    />
                    {crew && (
                      <div className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-[#FF2F7D] to-[#FF8A45] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_6px_20px_-6px_rgba(255,47,125,0.8)]">
                        ★ The crew
                      </div>
                    )}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0C]/85 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <span
                        className="text-[15px] font-semibold text-[#F4F0F2]"
                        style={{ fontFamily: "var(--font-uxp-heading)" }}
                      >
                        {p.caption}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {current && open !== null && (
              <motion.div
                key="lightbox"
                role="dialog"
                aria-modal="true"
                aria-label={current.caption}
                className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0A0A0C]/92 p-4 backdrop-blur-md md:p-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setOpen(null)}
              >
                <AnimatePresence mode="wait">
                  <motion.figure
                    key={current.src}
                    className="relative flex max-h-full max-w-[1200px] flex-col items-center"
                    initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Image
                      src={current.src}
                      alt={current.caption}
                      width={current.w}
                      height={current.h}
                      sizes="100vw"
                      className="h-auto max-h-[78vh] w-auto rounded-xl object-contain"
                      priority
                    />
                    <figcaption className="mt-4 text-center text-[14px] text-[#B8B2B7]">
                      {current.caption}
                      <span className="ml-3 font-mono text-[11px] text-white/35">
                        {open + 1} / {PHOTOS.length}
                      </span>
                    </figcaption>
                  </motion.figure>
                </AnimatePresence>

                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(null)}
                  className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl text-white transition-colors hover:bg-white/15"
                >
                  ×
                </button>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl text-white transition-colors hover:bg-white/15 md:left-6"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl text-white transition-colors hover:bg-white/15 md:right-6"
                >
                  ›
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}
