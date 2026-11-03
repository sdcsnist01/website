"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import HeroSpotlight from "@/components/home/HeroSpotlight";
import FloatWords from "@/components/ui/FloatWords";
import ArrowNarrowRightIcon from "@/components/ui/arrow-narrow-right-icon";

const SIDE_WORDS = ["CODE", "LEARN", "BUILD", "TOGETHER"];
const NUMBERS = ["01", "02", "03", "04"];

export default function HomeHero() {
  const reduce = useReducedMotion();

  const item = (delay: number) =>
    reduce
      ? undefined
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#F8F5F0] pt-28 md:pt-24">
      <HeroSpotlight />
      <FloatWords preset="hero" />

      {/* Decorative field: soft red orbs, hairline rings and rules. Purely visual. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="hero-drift absolute -bottom-[22vw] -left-[14vw] h-[44vw] w-[44vw] min-h-80 min-w-80 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #F06A6A 0%, rgba(240,106,106,0.55) 35%, rgba(253,240,240,0.4) 65%, rgba(255,255,255,0) 75%)",
          }}
        />
        <div className="absolute -bottom-[28vw] -left-[20vw] h-[56vw] w-[56vw] min-h-[420px] min-w-[420px] rounded-full border border-primary/10" />
        <div
          className="hero-drift absolute -right-[10vw] -top-[16vw] h-[34vw] w-[34vw] min-h-[260px] min-w-[260px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 40% 60%, #FDF0F0 0%, rgba(253,240,240,0.6) 45%, rgba(255,255,255,0) 72%)",
          }}
        />
        <div className="absolute -right-[18vw] -top-[24vw] h-[50vw] w-[50vw] min-h-[380px] min-w-[380px] rounded-full border border-[#F4F2F0]" />
        <div className="absolute inset-y-0 left-[12.5%] w-px bg-gradient-to-b from-transparent via-[#EAE6E4] to-transparent" />
        <div className="absolute inset-y-0 right-[18%] w-px bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
        <div
          className="absolute bottom-[6%] right-[3%] h-56 w-60 opacity-70"
          style={{ backgroundImage: "radial-gradient(#D8D2CF 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
      </div>

      {/* Side rails: section numbers on the left, keywords on the right. Desktop only. */}
      <div
        aria-hidden
        className="absolute left-[clamp(20px,4.5vw,64px)] top-[29%] z-[2] hidden gap-4 md:flex"
      >
        <div className="anim-line-grow h-32 w-0.5 bg-gradient-to-b from-primary to-primary/15" />
        <div className="anim-side-in flex flex-col gap-[18px] font-mono-ui text-xs tracking-[1.5px]">
          {NUMBERS.map((n, i) => (
            <span key={n} className={i === 0 ? "font-medium text-primary" : "text-[#8A8A94]"}>
              {n}
            </span>
          ))}
        </div>
      </div>
      <div
        aria-hidden
        className="anim-side-in-r absolute right-[clamp(20px,2.6vw,40px)] top-[44%] z-[2] hidden flex-col gap-3.5 md:flex"
      >
        <div className="mb-3 h-0.5 w-[26px] bg-primary" />
        {SIDE_WORDS.map((word) => (
          <span key={word} className="font-mono-ui text-[11px] tracking-[3px] text-[#8A8A94]">
            {word}
          </span>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 pb-28 pt-8 text-center sm:px-8 md:pb-36">
        <motion.div
          {...item(0.15)}
          className="mb-7 inline-flex items-center gap-3 rounded-full bg-[#F4F2F0] px-5 py-2.5"
        >
          <span className="hero-pulse h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="font-mono-ui text-xs font-medium tracking-[3.5px] text-[#1A1A1C]">WELCOME TO</span>
        </motion.div>

        <motion.h1
          {...item(0.25)}
          className="font-display-hero mb-6 text-[clamp(56px,10vw,132px)] leading-[0.95] text-[#1A1A1C] md:whitespace-nowrap"
        >
          SDC <span className="text-primary">SNIST</span>
        </motion.h1>

        <motion.h2
          {...item(0.35)}
          className="font-body text-balance text-[clamp(30px,4.4vw,58px)] font-semibold leading-[1.12] tracking-[-0.03em] text-[#1F232B]"
        >
          Building the Future with <span className="text-primary">Student Developers.</span>
        </motion.h2>

        <motion.p
          {...item(0.45)}
          className="mx-auto mt-7 max-w-[620px] text-pretty text-[clamp(15.5px,1.4vw,18px)] leading-[1.65] text-[#5C5C66]"
        >
          Innovate, Collaborate, and Elevate your engineering skills. Join a network of elite student engineers
          pushing the boundaries of technology.
        </motion.p>

        <motion.div
          {...item(0.55)}
          className="relative z-20 mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row sm:gap-6"
        >
          <Link
            href="/join"
            className="pressable group inline-flex min-h-14 w-full items-center justify-center gap-3.5 rounded-full bg-primary px-9 py-4 text-base font-semibold text-on-primary-fixed shadow-[0_14px_30px_rgba(214,40,40,0.28)] transition-all duration-500 hover:-translate-y-0.5 hover:bg-[#B01F1F] hover:shadow-[0_18px_34px_rgba(214,40,40,0.32)] sm:w-auto"
          >
            Get Started
            <ArrowNarrowRightIcon
              size={18}
              strokeWidth={2.5}
              className="!cursor-pointer transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/about"
            className="pressable inline-flex min-h-14 w-full items-center justify-center rounded-full border border-[#D8D2CF] bg-white px-10 py-4 text-base font-semibold text-[#1A1A1C] transition-colors duration-300 hover:border-[#F0B8B8] hover:bg-[#FDF0F0] sm:w-auto"
          >
            Learn More
          </Link>
        </motion.div>
      </div>

      {/* Bottom-left tagline from the reference hero. Desktop only, like the side rails. */}
      <div
        aria-hidden
        className="anim-side-in absolute bottom-14 left-[clamp(20px,4.5vw,64px)] z-[2] hidden items-start gap-6 md:flex"
      >
        <div className="mt-[30px] h-0.5 w-7 bg-primary" />
        <div className="flex flex-col gap-3.5 font-mono-ui text-[11px] tracking-[3px] text-[#5C5C66]">
          <span>IDEAS TODAY</span>
          <span>A BRIGHTER TOMORROW</span>
        </div>
      </div>

      <div aria-hidden className="absolute bottom-7 left-1/2 z-[2] hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
        <span className="font-mono-ui text-[11px] tracking-[3.5px] text-[#8A8A94]">EXPLORE</span>
        <span className="h-8 w-0.5 bg-gradient-to-b from-transparent to-primary" />
        <span className="h-3 w-7 rounded-full border-2 border-primary" />
      </div>
    </section>
  );
}
