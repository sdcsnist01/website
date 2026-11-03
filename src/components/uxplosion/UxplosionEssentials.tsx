"use client";

import Reveal from "@/components/home/Reveal";

const ESSENTIALS = [
  {
    label: "Bootcamp Duration",
    value: "3 Days",
    text: "Guided online sessions, one focus area per day.",
  },
  {
    label: "Team Size",
    value: "2–3 Members",
    text: "Teams will be segregated later.",
  },
  {
    label: "Format",
    value: "Bootcamp + Hackathon",
    text: "Online bootcamp week, then one on-campus build day.",
  },
];

export default function UxplosionEssentials() {
  return (
    <section className="relative z-[2] px-4 py-16 sm:px-6 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6FA8]">
            <span aria-hidden="true" className="text-sm">
              ✳
            </span>{" "}
            Event Information
          </div>
          <h2
            className="mb-12 text-[clamp(28px,3.4vw,48px)] font-semibold leading-[1.06] tracking-[-0.026em] md:mb-16"
            style={{ fontFamily: "var(--font-uxp-heading)" }}
          >
            The essentials.
          </h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {ESSENTIALS.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.08}>
              <div className="h-full rounded-[28px] border border-white/10 p-8 transition-all duration-300 hover:border-[#FF8A45]/50 hover:shadow-[0_0_34px_-10px_rgba(255,138,69,0.4)]">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FF6FA8]">{item.label}</div>
                <div
                  className="mt-3 text-[clamp(24px,2.6vw,32px)] font-semibold leading-tight tracking-[-0.02em] text-[#F4F0F2]"
                  style={{ fontFamily: "var(--font-uxp-heading)" }}
                >
                  {item.value}
                </div>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[#8F898F]">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
