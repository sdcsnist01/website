"use client";

import { motion } from "motion/react";
import Reveal from "@/components/home/Reveal";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const JOURNEY = [
  { n: "01", title: "Learn", text: "Understand the fundamentals." },
  { n: "02", title: "Explore", text: "Think through the problem." },
  { n: "03", title: "Design", text: "Turn ideas into interfaces." },
  { n: "04", title: "Build", text: "Put everything into practice." },
];

export default function UxplosionAbout() {
  const reduce = usePrefersReducedMotion();

  return (
    <section id="experience" className="relative z-[2] overflow-hidden px-4 py-16 sm:px-6 md:px-8 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,111,168,0.024) 1px, transparent 1px), linear-gradient(90deg, rgba(255,111,168,0.024) 1px, transparent 1px)",
          backgroundSize: "110px 110px, 110px 110px",
          maskImage: "radial-gradient(100% 80% at 30% 40%, #000 10%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(100% 80% at 30% 40%, #000 10%, transparent 90%)",
        }}
      />

      <div className="relative mx-auto grid max-w-[1180px] gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">
        <Reveal>
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6FA8]">
            <span aria-hidden="true" className="text-sm">
              ✳
            </span>{" "}
            The UXplosion Experience
          </div>
          <h2
            className="mb-6 text-[clamp(30px,3.6vw,52px)] font-semibold leading-[1.06] tracking-[-0.026em]"
            style={{ fontFamily: "var(--font-uxp-heading)" }}
          >
            More than a bootcamp.
            <br />
            <span className="bg-gradient-to-r from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] bg-clip-text text-transparent">
              A design journey.
            </span>
          </h2>
          <p className="max-w-[460px] text-[16.5px] leading-relaxed text-[#B8B2B7]">
            UXplosion 3.0 is a hands-on UI/UX learning experience. Participants learn design principles, explore
            practical techniques, work alongside others, and apply everything in the final design challenge.
          </p>
        </Reveal>

        <div className="relative">
          <div className="absolute bottom-[39px] left-[19px] top-[39px] w-px bg-white/[0.08]" />
          <motion.div
            initial={reduce ? undefined : { height: 0 }}
            whileInView={reduce ? undefined : { height: "calc(100% - 78px)" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.5, ease: [0.35, 0.15, 0.2, 1], delay: 0.2 }}
            className="absolute left-[19px] top-[39px] w-px bg-gradient-to-b from-[#FF2F7D] via-[#FF5368] to-[#FF8A45]"
            style={{ boxShadow: "0 0 8px rgba(255,47,125,0.45)" }}
          />

          <div className="flex flex-col gap-1.5">
            {JOURNEY.map((step, i) => (
              <Reveal key={step.n} delay={0.1 + i * 0.08}>
                <div className="group relative flex gap-5 rounded-2xl py-5 pl-0 pr-5 transition-colors hover:bg-white/[0.022] hover:shadow-[inset_0_0_0_1px_rgba(255,47,125,0.2)]">
                  <span
                    className="relative flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-[#0A0A0C] text-[12.5px] font-semibold text-[#FF6FA8] shadow-[inset_0_0_0_1px_rgba(255,47,125,0.28)]"
                    style={{ fontFamily: "var(--font-uxp-heading)" }}
                  >
                    {step.n}
                  </span>
                  <div className="pt-1.5">
                    <div
                      className="text-[17px] font-semibold uppercase tracking-[0.02em]"
                      style={{ fontFamily: "var(--font-uxp-heading)" }}
                    >
                      {step.title}
                    </div>
                    <div className="mt-1.5 text-[14.5px] leading-relaxed text-[#8F898F]">{step.text}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
