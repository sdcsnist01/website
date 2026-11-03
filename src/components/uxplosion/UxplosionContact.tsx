"use client";

import Reveal from "@/components/home/Reveal";
import TelephoneIcon from "@/components/ui/telephone-icon";

const CONTACTS = [
  {
    name: "Srikanth Kesani",
    role: "Organizer",
    phoneDisplay: "+91 80964 84145",
    phoneHref: "tel:+918096484145",
  },
  {
    name: "Suchitha",
    role: "Organizer",
    phoneDisplay: "+91 76710 50098",
    phoneHref: "tel:+917671050098",
  },
  {
    name: "Sharan",
    role: "Organizer",
    phoneDisplay: "+91 93928 86797",
    phoneHref: "tel:+919392886797",
  },
];

export default function UxplosionContact() {
  return (
    <section id="contact" className="relative z-[2] px-4 py-16 sm:px-6 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6FA8]">
            <span aria-hidden="true" className="text-sm">✳</span> Contact
          </div>
          <h2
            className="mb-4 text-[clamp(28px,3.4vw,48px)] font-semibold leading-[1.06] tracking-[-0.026em]"
            style={{ fontFamily: "var(--font-uxp-heading)" }}
          >
            Talk to the organizers.
          </h2>
          <p className="mb-12 max-w-[560px] text-[16px] leading-relaxed text-[#B8B2B7] md:mb-16">
            Got a query about registration or the event? Reach the team directly.
          </p>
        </Reveal>

        <div className="ux-ct-list border-t border-white/[0.055]">
          {CONTACTS.map((c, i) => (
            <Reveal key={c.phoneHref} delay={i * 0.06}>
              <a
                href={c.phoneHref}
                aria-label={`Call ${c.name}, ${c.role}, at ${c.phoneDisplay}`}
                className="ux-ct-row group flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-white/[0.055] py-6 no-underline"
              >
                <div>
                  <div
                    className="ux-ct-name text-[17px] font-semibold text-[#D8D2D6] sm:text-[19px]"
                    style={{ fontFamily: "var(--font-uxp-heading)" }}
                  >
                    {c.name}
                  </div>
                  <div className="mt-1 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[#7A7278]">
                    {c.role}
                  </div>
                </div>
                <div className="ux-ct-phone flex items-center gap-2.5 font-mono text-[15px] text-[#B8B2B7] sm:text-[16px]">
                  <TelephoneIcon size={18} strokeWidth={2} color="currentColor" className="!cursor-pointer" />
                  {c.phoneDisplay}
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={CONTACTS.length * 0.06}>
          <p className="mt-8 text-[14px] leading-relaxed text-[#7A7278]">
            Any issues? Just mail us at{" "}
            <a
              href="mailto:Sdc@sreenidhi.edu.in"
              className="font-semibold text-[#B8B2B7] underline decoration-white/20 underline-offset-4 transition-colors hover:text-[#FF6FA8]"
            >
              Sdc@sreenidhi.edu.in
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
