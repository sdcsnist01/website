"use client";

import Reveal from "@/components/home/Reveal";

const DAYS = [
  { mark: "01", label: "Day 01", title: "Design Foundations",topic:"How do we design products people actually need and can use?", date: "Sept 22", time: "5:30 PM – 7:00 PM", mode: "Online" },
  { mark: "02", label: "Day 02", title: "AI & Emerging Experiences",topic:"How do we design when technology becomes intelligent, conversational and autonomous?", date: "Sept 23", time: "5:30 PM – 7:00 PM", mode: "Online" },
  { mark: "03", label: "Day 03", title: " Design at Scale & Future",topic:"How do we build and scale design across complex ecosystems?", date: "Sept 24", time: "5:30 PM – 7:00 PM", mode: "Online" },
];

const FINALE = {
  title: "Hackathon",
  description:
    "One on-campus build day in teams of 2–3. Teams are segregated later. Buses will be provided.",
  mode: "Offline · SNIST",
  date: "Sept 27",
  duration: "9:00 AM – 7:30 PM",
};

export default function UxplosionTimeline() {
  return (
    <section id="timeline" className="relative z-[2] overflow-hidden px-4 py-16 sm:px-6 md:px-8 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,111,168,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,111,168,0.022) 1px, transparent 1px)",
          backgroundSize: "110px 110px, 110px 110px",
          maskImage: "radial-gradient(100% 75% at 60% 45%, #000 8%, transparent 92%)",
          WebkitMaskImage: "radial-gradient(100% 75% at 60% 45%, #000 8%, transparent 92%)",
        }}
      />

      <div className="relative mx-auto max-w-[1180px]">
        <Reveal>
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6FA8]">
            <span aria-hidden="true" className="text-sm">
              ✳
            </span>{" "}
            The Journey
          </div>
          <h2
            className="mb-5 text-[clamp(30px,3.6vw,52px)] font-semibold leading-[1.06] tracking-[-0.026em]"
            style={{ fontFamily: "var(--font-uxp-heading)" }}
          >
            One week.
            <br />
            <span className="bg-gradient-to-r from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] bg-clip-text text-transparent">
              One design journey.
            </span>
          </h2>
          <p className="mb-14 max-w-[520px] text-[16.5px] leading-relaxed text-[#B8B2B7] md:mb-[70px]">
            A week of guided learning and hands-on practice, leading into the final design challenge.
          </p>
        </Reveal>

        <div className="ux-jn-list">
          {DAYS.map((day, i) => (
            <Reveal key={day.mark} delay={i * 0.06}>
              <div className="ux-jn-row grid grid-cols-[auto_1fr] items-center gap-x-5 border-t border-white/[0.07] px-1 py-6 sm:grid-cols-[auto_1fr_auto] sm:gap-x-10 md:gap-x-14">
                <div
                  className="ux-jn-num text-right text-[clamp(34px,4.4vw,58px)] font-semibold leading-[0.9] tracking-[-0.03em] text-white/10 [font-variant-numeric:tabular-nums]"
                  style={{ fontFamily: "var(--font-uxp-heading)" }}
                >
                  {day.mark}
                </div>
                <div>
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#FF6FA8]">
                    {day.label}
                  </div>
                  <div
                    className="ux-jn-topic mt-2 text-[clamp(19px,2vw,26px)] font-medium leading-tight tracking-[-0.016em] text-[#D8D2D6]"
                    style={{ fontFamily: "var(--font-uxp-heading)" }}
                  >
                    {day.title}
                  </div>
                  <div className="mt-1.5 text-[13.5px] leading-relaxed text-[#7A7278]">
                    {day.topic}
                  </div>
                </div>
                <div className="col-span-2 mt-3 flex items-center justify-between sm:col-span-1 sm:mt-0 sm:flex-col sm:items-end sm:text-right">
                  <div>
                    <div className="text-[13.5px] font-semibold text-[#B8B2B7]">{day.date}</div>
                    <div className="mt-1 text-[13px] text-[#8F898F]">{day.time}</div>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A7278] sm:mt-2">
                    {day.mode}
                  </div>
                  <div className="ux-jn-cta hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#FF6FA8] opacity-0 transition-all sm:mt-3 sm:flex">
                    View session <span>→</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={DAYS.length * 0.06}>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-6 rounded-[28px] border border-[#FF2F7D]/25 bg-gradient-to-br from-[#FF2F7D]/[0.07] via-transparent to-transparent p-8 md:p-10">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#0A0A0C]">
                  Finale
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8F898F]">
                  {FINALE.mode}
                </span>
              </div>
              <div
                className="text-[clamp(22px,2.6vw,32px)] font-semibold leading-tight tracking-[-0.02em] text-[#F4F0F2]"
                style={{ fontFamily: "var(--font-uxp-heading)" }}
              >
                {FINALE.title}
              </div>
              <p className="mt-2.5 max-w-[440px] text-[14.5px] leading-relaxed text-[#B8B2B7]">
                {FINALE.description}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-[15px] font-semibold text-[#F4F0F2]">{FINALE.date}</div>
              <div className="mt-1 text-[13px] text-[#8F898F]">{FINALE.duration}</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
