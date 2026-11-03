"use client";

import Reveal from "@/components/home/Reveal";

const TIERS = [
  {
    key: "sdc",
    badge: "Member Pass",
    name: "SDC Members",
    price: "₹99",
    unit: "participant",
    desc: "For registered SDC members.",
    emphasized: false,
    features: null,
    footerNote: null,
  },
  {
    key: "non-member",
    badge: null,
    name: "Non-Members",
    price: "₹199",
    unit: "participant",
    desc: "Open to all SNIST students.",
    emphasized: false,
    features: null,
    footerNote: null,
  },
  {
    key: "combo",
    badge: "Best Value",
    name: "SDC Membership + Hackathon/Bootcamp Pass",
    price: "₹319",
    unit: null,
    desc: null,
    emphasized: true,
    features: [
      "Full SDC Membership (community + resources)",
      "Access to Hackathons & Bootcamps",
      "Workshops, Webinars & Exclusive Events",
      "Networking & Mentorship Opportunities",
    ],
    footerNote: "Limited time offer · One pass. Full access.",
  },
] as const;

export default function UxplosionPricing() {
  return (
    <section
      id="register"
      className="relative z-[2] overflow-hidden px-4 py-20 text-center sm:px-6 md:px-8 md:py-28 lg:py-32"
    >
      <div aria-hidden="true" className="ux-pricing-grid-bg pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="ux-pricing-glow-bg pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(760px,88vw)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,47,125,0.13), rgba(255,138,69,0.05) 44%, transparent 70%)" }}
      />

      <div className="relative z-[1] mx-auto max-w-[1080px]">
        <Reveal>
          <div className="mb-5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6FA8]">
            <span aria-hidden="true" className="text-sm">✳</span> Pricing
          </div>
          <h2
            className="mb-5 text-[clamp(30px,3.6vw,52px)] font-semibold leading-[1.06] tracking-[-0.026em] text-balance"
            style={{ fontFamily: "var(--font-uxp-heading)" }}
          >
            One pass.{" "}
            <span className="bg-gradient-to-r from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] bg-clip-text text-transparent">
              Bootcamp + hackathon.
            </span>
          </h2>
          <p className="mx-auto mb-10 max-w-[440px] text-[16.5px] leading-relaxed text-[#B8B2B7] md:mb-12">
            Register once for the full UXplosion 3.0 experience.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
          {TIERS.map((tier, i) => (
            <Reveal
              key={tier.key}
              delay={0.1 + i * 0.08}
              className={tier.features ? "col-span-2 md:col-span-1" : undefined}
            >
              <div
                className={
                  tier.emphasized
                    ? "relative h-full rounded-none bg-gradient-to-br from-[#FF2F7D]/50 to-[#FF8A45]/20 p-px shadow-[0_0_20px_-8px_rgba(255,47,125,0.5)]"
                    : "relative h-full rounded-none bg-white/[0.07] p-px"
                }
              >
                <div className="flex h-full flex-col rounded-none bg-[#0D0D0F] p-4 sm:p-8 md:p-9">
                  {tier.badge ? (
                    <span
                      className={
                        tier.emphasized
                          ? "mb-3 inline-flex w-fit items-center gap-1.5 self-center rounded-full bg-gradient-to-r from-[#FF2F7D] to-[#FF8A45] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#0A0A0C] sm:mb-5 sm:gap-2 sm:px-4 sm:py-1.5 sm:text-[10.5px] sm:tracking-[0.14em]"
                          : "mb-3 inline-flex w-fit items-center gap-1.5 self-center rounded-full border border-[#FF2F7D]/30 bg-[#FF2F7D]/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#F4F0F2] sm:mb-5 sm:gap-2 sm:px-4 sm:py-1.5 sm:text-[10.5px] sm:tracking-[0.14em]"
                      }
                    >
                      {tier.emphasized ? (
                        <span aria-hidden="true">★</span>
                      ) : (
                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FF6FA8]" />
                      )}
                      {tier.badge}
                    </span>
                  ) : (
                    <div className="mb-3 h-[19px] sm:mb-5 sm:h-[27px]" aria-hidden="true" />
                  )}

                  <div
                    className="mx-auto max-w-[260px] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#D8D2D6] sm:max-w-none sm:text-[15px]"
                    style={{ fontFamily: "var(--font-uxp-heading)" }}
                  >
                    {tier.name}
                  </div>

                  <div className="mt-2.5 flex flex-col items-center gap-0.5 sm:mt-4 sm:flex-row sm:items-end sm:justify-center sm:gap-1.5">
                    <span
                      className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-[#F4F0F2] sm:text-[clamp(38px,5vw,52px)]"
                      style={{ fontFamily: "var(--font-uxp-heading)" }}
                    >
                      {tier.price}
                    </span>
                    {tier.unit ? (
                      <span className="text-[10px] text-[#7A7278] sm:mb-1.5 sm:text-[12.5px]">/ {tier.unit}</span>
                    ) : null}
                  </div>

                  {tier.features ? (
                    <ul className="mx-auto mt-3 flex w-full max-w-[340px] flex-col gap-2 text-left sm:mt-6 sm:gap-2.5">
                      {tier.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-[11.5px] leading-snug text-[#D8D2D6] sm:text-[13.5px]"
                        >
                          <span aria-hidden="true" className="mt-0.5 flex-shrink-0 text-[#FF6FA8]">
                            ✓
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <>
                      <p className="mx-auto mt-2.5 max-w-[240px] text-[11px] leading-relaxed text-[#8F898F] sm:mt-3 sm:text-[13.5px]">
                        {tier.desc}
                      </p>

                      <div className="mb-4 mt-2.5 flex items-center justify-center gap-1 text-[8px] font-bold uppercase tracking-[0.04em] text-[#B8B2B7] sm:mb-8 sm:mt-4 sm:gap-1.5 sm:text-[11.5px] sm:tracking-[0.08em]">
                        <span aria-hidden="true" className="h-1 w-1 flex-shrink-0 rounded-full bg-[#FF6FA8]" />
                        <span className="text-balance">Includes Bootcamp + Hackathon</span>
                      </div>
                    </>
                  )}

                  <span
                    aria-disabled="true"
                    className={
                      tier.emphasized
                        ? "relative mt-6 flex w-full cursor-not-allowed items-center justify-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] px-3 py-2.5 text-[12px] font-bold text-[#0A0A0C] opacity-60 sm:mt-8 sm:gap-2 sm:px-8 sm:py-[15px] sm:text-[15px]"
                        : "mt-auto flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-full border border-[#F4F0F2]/25 px-3 py-2.5 text-[12px] font-semibold text-[#F4F0F2] opacity-60 sm:gap-2 sm:px-8 sm:py-[15px] sm:text-[15px]"
                    }
                  >
                    Registrations Closed
                  </span>

                  {tier.footerNote ? (
                    <p className="mt-3 text-[9.5px] text-[#7A7278] sm:text-[11px]">{tier.footerNote}</p>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.26}>
          <p className="mt-8 text-[12.5px] text-[#7A7278] md:mt-10">
            Both passes include the complete Bootcamp + Hackathon experience.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
