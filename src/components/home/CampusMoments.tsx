"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import FloatWords from "@/components/ui/FloatWords";

/**
 * Asymmetric four-photo grid from the SDC landing reference.
 * Each tile has its own grid placement on desktop and an aspect ratio on mobile.
 */
const MOMENTS = [
  {
    src: "/LaunchPad20261.jpeg",
    label: "Launchpad 2026",
    cat: "LAUNCHPAD",
    place: "md:col-start-1 md:row-span-2 md:row-start-1 md:min-h-[560px]",
    ratio: "aspect-[4/5] md:aspect-auto",
    pos: "center 72%",
    titleSize: "text-[clamp(38px,4.4vw,58px)] md:text-[clamp(38px,4.4vw,58px)]",
  },
  {
    src: "/LaunchPad20262.jpeg",
    label: "Campus energy",
    cat: "CAMPUS",
    place: "md:col-span-2 md:col-start-2 md:row-start-1 md:min-h-[250px]",
    ratio: "aspect-[16/10] md:aspect-auto",
    pos: "center 55%",
    titleSize: "text-[28px] md:text-[36px]",
  },
  {
    src: "/LaunchPad20263.jpeg",
    label: "Hands-on sessions",
    cat: "WORKSHOP",
    place: "md:col-start-2 md:row-start-2 md:mt-7 md:min-h-[250px]",
    ratio: "aspect-[16/10] md:aspect-auto",
    pos: "center 62%",
    titleSize: "text-[24px]",
  },
  {
    src: "/LaunchPad20264.jpeg",
    label: "Community stage",
    cat: "COMMUNITY",
    place: "md:col-start-3 md:row-start-2 md:-mr-6 md:min-h-[250px]",
    ratio: "aspect-[16/10] md:aspect-auto",
    pos: "center 60%",
    titleSize: "text-[24px]",
  },
] as const;

export default function CampusMoments() {
  const reduce = useReducedMotion();

  return (
    <section aria-label="Event photo gallery" className="relative overflow-hidden bg-[#F8F5F0] px-4 pb-14 pt-14 sm:px-6 sm:pt-20 md:px-8 md:pb-22 md:pt-22">
      <FloatWords preset="gallery" />
      <div className="relative mx-auto max-w-[1100px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-5 md:mb-9">
          <div>
            <div className="mb-3.5 flex items-center gap-3">
              <span className="h-0.5 w-7 bg-primary" />
              <span className="font-mono-ui text-xs tracking-[3px] text-primary">ON CAMPUS</span>
            </div>
            <h2 className="font-grotesk text-balance text-[clamp(34px,5vw,68px)] leading-[0.98] text-[#151518]">
              Moments from the floor
            </h2>
          </div>
          <Link
            href="/events"
            className="font-mono-ui pressable min-h-6 text-xs tracking-[2px] text-[#151518] transition-colors hover:text-primary"
          >
            ALL EVENTS →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-[1.3fr_1fr_1fr] md:grid-rows-[repeat(2,minmax(270px,1fr))] md:gap-3.5">
          {MOMENTS.map((moment, index) => (
            <motion.figure
              key={moment.src}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.11, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative m-0 ${moment.place} ${moment.ratio}`}
            >
              <Link
                href="/events"
                aria-label={`${moment.label}, see events`}
                className="absolute inset-0 overflow-hidden rounded-md border border-black/10 bg-[#E4DDD6] transition-[border-color,box-shadow] duration-500 hover:border-[#B81D21]/45 hover:shadow-[0_20px_44px_rgba(184,29,33,0.12)]"
              >
                <Image
                  src={moment.src}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105 motion-reduce:transition-none"
                  style={{ objectPosition: moment.pos }}
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute -bottom-[10%] -top-[10%] left-0 w-[30%] bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 -skew-x-[16deg] group-hover:animate-[gsweep_1.1s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:hidden" />
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-md p-[1.5px] opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:linear-gradient(110deg,#A91F29_0%,#FF8F8A_35%,#A91F29_70%)] [background-size:200%_100%] [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)] [mask-composite:exclude] motion-safe:animate-[borderFlow_4s_linear_infinite]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      index === 0
                        ? "linear-gradient(180deg, rgba(23,23,25,0) 38%, rgba(23,23,25,0.86) 100%)"
                        : "linear-gradient(180deg, rgba(23,23,25,0) 45%, rgba(23,23,25,0.8) 100%)",
                  }}
                />
                <span className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="font-mono-ui mb-2 flex items-center gap-2.5 text-[11px] tracking-[2px] text-[#FFB4B0]">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span className="h-px w-4 bg-[#FFB4B0]" />
                    <span>{moment.cat}</span>
                  </span>
                  <span className={`font-grotesk block leading-[1.02] ${moment.titleSize}`}>{moment.label}</span>
                  <span className="font-mono-ui mt-2.5 block text-[11px] tracking-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                    SEE EVENTS →
                  </span>
                </span>
              </Link>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
