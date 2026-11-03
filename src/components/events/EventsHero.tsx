"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import ArrowNarrowRightIcon from "@/components/ui/arrow-narrow-right-icon";

export default function EventsHero({ eventCount }: { eventCount: number }) {
  const reduce = useReducedMotion();

  const item = (delay: number) =>
    reduce
      ? undefined
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-10 sm:px-6 sm:pb-20 md:px-8 md:pb-24">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full border border-[#f4f2f0]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-10 h-[360px] w-[360px] rounded-full opacity-70"
        style={{
          background: "radial-gradient(circle at 40% 60%, #fdf0f0 0%, rgba(253,240,240,0.6) 45%, rgba(255,255,255,0) 72%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div {...item(0)} className="mb-6 inline-flex items-center gap-3 rounded-full bg-[#f4f2f0] px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
          <span className="font-mono-ui text-xs tracking-[2.5px] text-on-surface">
            {eventCount} EXPERIENCES · CAMPUS &amp; BEYOND
          </span>
        </motion.div>

        <motion.h1
          {...item(0.08)}
          className="font-grotesk max-w-4xl text-balance text-[clamp(44px,8vw,112px)] font-bold leading-[0.95] text-on-surface"
        >
          SDC SNIST <span className="text-primary">Events</span>
        </motion.h1>

        <motion.p {...item(0.16)} className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-on-surface-variant md:text-xl">
          Empowering the next generation of engineers through world-class hackathons, technical summits, and
          collaborative meetups.
        </motion.p>

        <motion.div {...item(0.24)} className="mt-10">
          <a
            href="#events"
            className="pressable inline-flex min-h-13 items-center gap-3 rounded-full bg-primary px-8 text-base font-semibold text-white shadow-[0_14px_30px_rgba(217,39,46,0.25)] transition-colors hover:bg-primary-dim"
          >
            Browse Events
            <ArrowNarrowRightIcon size={18} strokeWidth={2.5} className="!cursor-pointer" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export function EventsJoinCta() {
  const reduce = useReducedMotion();

  return (
    <section className="px-4 pb-16 pt-4 sm:px-6 sm:pb-24 md:px-8">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-[#e4ddd6] bg-white px-6 py-14 text-center shadow-[0_18px_44px_rgba(23,23,25,0.06)] sm:px-10 md:py-20"
      >
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10">
          <h2 className="font-grotesk mb-5 text-balance text-3xl font-bold text-on-surface sm:text-4xl md:text-5xl">
            Join the community.
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-pretty text-lg text-on-surface-variant">
            Become a member for event access, workshops, and exclusive community invites.
          </p>
          <Link
            href="/join"
            className="pressable inline-flex min-h-13 items-center gap-3 rounded-full bg-primary px-8 text-sm font-semibold uppercase tracking-[1.5px] text-white transition-colors hover:bg-primary-dim"
          >
            Become a Member
            <ArrowNarrowRightIcon size={16} strokeWidth={2.5} className="!cursor-pointer" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
