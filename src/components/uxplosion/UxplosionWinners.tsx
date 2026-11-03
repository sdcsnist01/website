"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// Listed in rank order (the mobile stacking order); `podium` places each one
// on the desktop podium: 2nd left, 1st centre, 3rd right.
const WINNERS = [
  {
    place: "1st",
    label: "Winner",
    team: "Hopeless Guys",
    prize: "₹5,000",
    photo: "/uxplosion3-winner-1st.jpg",
    podium: "lg:order-2",
    step: "lg:h-28",
  },
  {
    place: "2nd",
    label: "Runner-up",
    team: "Aaya Sher",
    prize: "₹3,000",
    photo: "/uxplosion3-winner-2nd.jpg",
    podium: "lg:order-1",
    step: "lg:h-16",
  },
  {
    place: "3rd",
    label: "Second runner-up",
    team: "Cognitrix",
    prize: "₹2,000",
    photo: "/uxplosion3-winner-3rd.jpg",
    podium: "lg:order-3",
    step: "lg:h-8",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export default function UxplosionWinners() {
  const reduce = usePrefersReducedMotion();

  return (
    <ol className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 md:mb-20 lg:grid-cols-[1fr_1.3fr_1fr] lg:items-end lg:gap-6">
      {WINNERS.map((w, i) => {
        const first = i === 0;
        return (
          <motion.li
            key={w.place}
            className={`flex flex-col ${w.podium} ${first ? "sm:col-span-2 lg:col-span-1" : ""}`}
            initial={reduce ? false : { opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: first ? 0 : 0.2 + 0.12 * i, ease: EASE }}
          >
            <div
              className={`ux-wn-card group overflow-hidden rounded-2xl border ${
                first
                  ? "ux-wn-champ border-[#FF2F7D]/60 bg-gradient-to-br from-[#FF2F7D]/[0.16] via-[#FF5368]/[0.07] to-[#FF8A45]/[0.04] sm:mx-auto sm:w-full sm:max-w-[560px] lg:max-w-none"
                  : "border-white/[0.08] bg-white/[0.02]"
              }`}
            >
              <div className={`relative w-full overflow-hidden ${first ? "aspect-[4/3]" : "aspect-[16/11]"}`}>
                <motion.div
                  className="absolute inset-0"
                  initial={reduce ? false : { scale: 1.15 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1.2, delay: first ? 0 : 0.2 + 0.12 * i, ease: EASE }}
                >
                  <Image
                    src={w.photo}
                    alt={`${w.team} receiving the UXplosion 3.0 ${w.place} prize`}
                    fill
                    sizes={
                      first
                        ? "(min-width: 1024px) 440px, (min-width: 640px) 560px, 100vw"
                        : "(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
                    }
                    className="ux-wn-photo object-cover"
                  />
                </motion.div>
                {first && (
                  <>
                    <div aria-hidden="true" className="ux-wn-shine pointer-events-none absolute inset-0" />
                    <div className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-[#FF2F7D] to-[#FF8A45] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_6px_20px_-6px_rgba(255,47,125,0.8)]">
                      ★ Champions
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 p-4 md:p-5">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6FA8]">{w.label}</div>
                  <div
                    className={`mt-1.5 truncate font-semibold ${
                      first ? "text-[clamp(22px,2.2vw,30px)]" : "text-[clamp(18px,1.6vw,22px)]"
                    } tracking-[-0.015em] text-[#F4F0F2]`}
                    style={{ fontFamily: "var(--font-uxp-heading)" }}
                  >
                    {w.team}
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-[#B8B2B7]">{w.prize} prize</div>
                </div>
                <div
                  className={`flex-shrink-0 font-semibold leading-none tracking-[-0.04em] ${
                    first
                      ? "bg-gradient-to-br from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] bg-clip-text text-[clamp(40px,4vw,56px)] text-transparent"
                      : "text-[clamp(30px,2.6vw,40px)] text-white/80"
                  }`}
                  style={{ fontFamily: "var(--font-uxp-heading)" }}
                >
                  {w.place}
                </div>
              </div>
            </div>

            <motion.div
              aria-hidden="true"
              className={`mx-3 mt-3 hidden origin-bottom rounded-t-lg lg:block ${w.step} ${
                first
                  ? "bg-gradient-to-b from-[#FF2F7D]/45 via-[#FF5368]/15 to-transparent"
                  : "bg-gradient-to-b from-white/[0.1] to-transparent"
              }`}
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 + 0.12 * i, ease: EASE }}
            />
          </motion.li>
        );
      })}
    </ol>
  );
}
