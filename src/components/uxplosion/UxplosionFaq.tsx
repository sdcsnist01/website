"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Reveal from "@/components/home/Reveal";

const FAQS = [
  {
    q: "What is UXplosion 3.0?",
    a: "UXplosion 3.0 is SDC's UI/UX event at SNIST — a four-day bootcamp that builds day by day and ends in a full-day on-campus design hackathon.",
  },
  {
    q: "What does the Bootcamp + Hackathon format mean?",
    a: "The bootcamp runs online across four evenings, one focus area per day. After it, everyone comes to campus for a single full-day design hackathon.",
  },
  {
    q: "Who can participate?",
    a: "Open to every branch and every year. No prior design or hackathon experience is required.",
  },
  {
    q: "What is the team size?",
    a: "Teams will consist of 2–3 members.",
  },
  {
    q: "When is the hackathon?",
    a: "The hackathon is on September 27 at SNIST, running from 9:00 AM to 7:30 PM as a full-day, on-campus design challenge. Buses will be provided.",
  },
  {
    q: "What is the registration fee?",
    a: "₹99 per participant for SDC members and ₹199 per participant for non-members. One registration covers both the bootcamp and the hackathon.",
  },
  {
    q: "Can I participate individually?",
    a: "Yes, you register individually for the bootcamp. After Day 4, you'll get a team formation form and can connect with other participants to form a team of 2–3 members for the hackathon.",
  },
  {
    q: "Can I attend if I have no prior design knowledge? Are there any prerequisites for the bootcamp?",
    a: "No prior design or hackathon experience is required. The bootcamp is designed for participants of all skill levels, including beginners.",
  },
  {
    q: "What should I bring on the hackathon day?",
    a: "Bring a laptop, a charger, and an idea worth building. Anything else will be announced before the day.",
  },
];

export default function UxplosionFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative z-[2] px-4 py-16 sm:px-6 md:px-8 md:py-24">
      <div className="mx-auto max-w-[820px]">
        <Reveal>
          <div className="mb-3.5 flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.2em] text-[#FF6FA8]">
            <span aria-hidden="true" className="text-[13px]">
              ✳
            </span>{" "}
            FAQ
          </div>
          <h2
            className="mb-8 text-[clamp(28px,3.4vw,44px)] font-semibold leading-[1.04] tracking-[-0.028em] md:mb-10"
            style={{ fontFamily: "var(--font-uxp-heading)" }}
          >
            Questions,{" "}
            <span className="bg-gradient-to-r from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] bg-clip-text text-transparent">
              answered.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="border-t border-white/[0.055]">
            {FAQS.map((item, i) => {
              const open = openIndex === i;
              return (
                <div key={item.q} className="ux-fq-row" data-open={open}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    className="ux-fq-q grid w-full grid-cols-[1fr_22px] items-start gap-5 px-0.5 py-[22px] text-left text-[clamp(16px,1.7vw,19.5px)] font-medium leading-snug tracking-[-0.012em]"
                    style={{ fontFamily: "var(--font-uxp-heading)" }}
                  >
                    <span>{item.q}</span>
                    <span className="ux-fq-sign" aria-hidden="true" />
                  </button>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.7, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="max-w-[640px] px-0.5 pb-6 pr-11 text-[15px] leading-relaxed text-[#8F898F]">
                          {item.a}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
