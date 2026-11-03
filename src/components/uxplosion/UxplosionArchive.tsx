"use client";

import Link from "next/link";
import Reveal from "@/components/home/Reveal";
import { EVENTS } from "@/data/events";

// Real past UXplosion editions, sourced from src/data/events.ts.
const EDITIONS = [
  {
    no: "01",
    id: "8",
    title: "UXplosion – Where Creativity Meets Functionality",
    year: "2024",
    blurb: "Where it started.",
  },
  {
    no: "02",
    id: "4",
    title: "UXplosion 2.0",
    year: "2025",
    blurb: "Workshop week and the first build sprint.",
  },
];

export default function UxplosionArchive() {
  return (
    <section
      id="archive"
      className="relative z-[2] px-4 py-16 sm:px-6 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6FA8]">
            <span aria-hidden="true" className="text-sm">
              ✳
            </span>{" "}
            Archive
          </div>
          <h2
            className="mb-12 text-[clamp(28px,3.4vw,48px)] font-semibold leading-[1.06] tracking-[-0.026em] md:mb-16"
            style={{ fontFamily: "var(--font-uxp-heading)" }}
          >
            Every edition so far.
          </h2>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mb-14 flex flex-col items-start justify-between gap-6 rounded-[28px] border border-white/10 p-8 sm:flex-row sm:items-center md:p-10">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF2F7D]/40 bg-[#FF2F7D]/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#FF6FA8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF2F7D]" />
                Completed
              </span>
              <div
                className="text-[clamp(22px,2.6vw,32px)] font-semibold leading-tight tracking-[-0.02em] text-[#F4F0F2]"
                style={{ fontFamily: "var(--font-uxp-heading)" }}
              >
                UXplosion Season 3 —{" "}
                <span className="bg-gradient-to-r from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] bg-clip-text text-transparent">
                  That&apos;s a Wrap
                </span>
              </div>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#B8B2B7]">
                79 teams, eight hours of building and three winners. Thank you
                to everyone who took part.
              </p>
            </div>
            <a
              href="#teams"
              className="inline-flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] px-7 py-3.5 text-[14px] font-bold text-[#0A0A0C] no-underline transition-transform hover:-translate-y-0.5"
            >
              See the Winners
            </a>
          </div>
        </Reveal>

        <div>
          {EDITIONS.map((ed, i) => {
            const event = EVENTS.find((e) => e.id === ed.id);
            const content = (
              <div className="ux-ar-ed relative grid grid-cols-[54px_1fr] items-baseline gap-x-5 py-6 sm:grid-cols-[54px_1fr_auto] sm:gap-x-8">
                <span
                  className="ux-ar-no text-[15px] font-semibold text-[#7A7278]"
                  style={{ fontFamily: "var(--font-uxp-heading)" }}
                >
                  {ed.no}
                </span>
                <div>
                  <span
                    className="ux-ar-word text-[clamp(19px,2.4vw,28px)] font-medium leading-tight text-[#D8D2D6]"
                    style={{ fontFamily: "var(--font-uxp-heading)" }}
                  >
                    {ed.title}
                  </span>
                  <div className="mt-1 text-[13.5px] text-[#7A7278]">
                    {ed.blurb}
                  </div>
                </div>
                <span className="col-span-2 mt-2 text-[13.5px] font-semibold text-[#B8B2B7] sm:col-span-1 sm:mt-0">
                  {ed.year}
                </span>
                <div className="ux-ar-rule" aria-hidden="true" />
              </div>
            );
            return (
              <Reveal key={ed.no} delay={i * 0.08}>
                {event ? (
                  <Link
                    href={`/events/${event.id}`}
                    className="block border-t border-white/[0.055]"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="border-t border-white/[0.055]">{content}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
