"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const SPONSORS = [
  { name: "UI/UX Hyderabad", image: "/sponser1.jpeg" },
  { name: "GoTogetherRides — LinQ", image: "/sponser2.jpeg" },
  { name: 'Huddle',image:"/sponser3.jpeg"},
  {name:"StudentKare",image:"/sponser4.jpeg"},
];

const REPEATS = 4;
const RUN = Array.from({ length: REPEATS }, () => SPONSORS).flat();

const RUN_SECONDS = 30;
const ARC_HEIGHT = 10;
const ARC_SCALE = 0.05;

export default function UxplosionSponsors() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    let offsets: number[] = [];
    let widths: number[] = [];
    let runWidth = 0;
    let wrapperWidth = 0;

    const measure = () => {
      const firstRun = track.children[0] as HTMLElement | undefined;
      runWidth = firstRun?.offsetWidth ?? 0;
      wrapperWidth = wrapper.clientWidth;
      offsets = itemRefs.current.map((el) => el?.offsetLeft ?? 0);
      widths = itemRefs.current.map((el) => el?.offsetWidth ?? 0);
    };

    measure();
    window.addEventListener("resize", measure);

    if (reducedMotion) {
      track.style.transform = "translateX(0px)";
      itemRefs.current.forEach((el) => {
        if (el) el.style.transform = "translateY(0px) scale(1)";
      });
      return () => window.removeEventListener("resize", measure);
    }

    let trackX = 0;
    let paused = false;
    let last = performance.now();
    let raf = 0;

    const onEnter = () => {
      paused = true;
    };
    const onLeave = () => {
      paused = false;
    };
    wrapper.addEventListener("mouseenter", onEnter);
    wrapper.addEventListener("mouseleave", onLeave);

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!paused && runWidth > 0) {
        trackX -= (runWidth / RUN_SECONDS) * dt;
        if (trackX <= -runWidth) trackX += runWidth;
        track.style.transform = `translateX(${trackX}px)`;
      }

      const half = wrapperWidth / 2;
      if (half > 0) {
        itemRefs.current.forEach((el, i) => {
          if (!el) return;
          const centerX = trackX + offsets[i] + widths[i] / 2;
          const normalized = Math.max(-1, Math.min(1, (centerX - half) / half));
          const t = Math.max(0, 1 - normalized * normalized);
          el.style.transform = `translateY(${-ARC_HEIGHT * t}px) scale(${1 + ARC_SCALE * t})`;
        });
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      wrapper.removeEventListener("mouseenter", onEnter);
      wrapper.removeEventListener("mouseleave", onLeave);
    };
  }, [reducedMotion]);

  let itemIndex = 0;

  return (
    <section className="relative z-[2] py-14 md:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,47,125,0.22) 35%, rgba(255,138,69,0.14) 65%, transparent)",
        }}
      />

      <div className="mx-auto mb-8 max-w-[1180px] px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.2em] text-[#FF6FA8]">
          <span aria-hidden="true" className="text-[13px]">
            ✳
          </span>{" "}
          Backed by
        </div>
      </div>

      <div
        ref={wrapperRef}
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent)",
        }}
      >
        <div ref={trackRef} className="ux-spo-track">
          {[0, 1].map((copy) => (
            <div className="ux-spo-run" key={copy} aria-hidden={copy === 1}>
              {RUN.map((sponsor, i) => {
                const index = itemIndex++;
                return (
                  <div
                    key={`${copy}-${i}-${sponsor.name}`}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    className="ux-spo-item"
                  >
                    <div className="ux-spo-logo">
                      <Image
                        src={sponsor.image}
                        alt={sponsor.name}
                        fill
                        sizes="68px"
                        className="object-contain p-1.5"
                      />
                    </div>
                    <span
                      className="ux-spo-name text-[clamp(17px,1.9vw,23px)]"
                      style={{ fontFamily: "var(--font-uxp-heading)" }}
                    >
                      {sponsor.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
