"use client";

import Image from "next/image";
import Reveal from "@/components/home/Reveal";
import InstagramIcon from "@/components/ui/instagram-icon";
import LinkedinIcon from "@/components/ui/linkedin-icon";

const SPEAKER = {
  name: "Madhu Pilli",
  role: "AI Product & Design Expert",
  about:
    "Helps startups turn ideas into AI-powered products through Product Design, UX/UI, rapid prototyping, and development.",
  photo: "/speaker.jpeg",
  instagram: "https://www.instagram.com/madhu_pilli/",
  linkedin: "https://www.linkedin.com/in/madhu-pilli/",
};

export default function UxplosionSpeaker() {
  return (
    <section id="speaker" className="relative z-[2] overflow-hidden px-4 py-16 sm:px-6 md:px-8 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,111,168,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,111,168,0.018) 1px, transparent 1px)",
            backgroundSize: "110px 110px, 110px 110px",
            maskImage: "radial-gradient(90% 80% at 24% 46%, #000 6%, transparent 88%)",
            WebkitMaskImage: "radial-gradient(90% 80% at 24% 46%, #000 6%, transparent 88%)",
          }}
        />
        <div
          className="absolute left-[2%] top-[12%] aspect-square w-[46%] rounded-full blur-[8px]"
          style={{ background: "radial-gradient(circle, rgba(255,47,125,0.10), rgba(255,138,69,0.035) 44%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-[1] mx-auto max-w-[1180px]">
        <Reveal>
          <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6FA8]">
            <span aria-hidden="true" className="text-sm">
              ✳
            </span>{" "}
            Guest Speaker
          </div>
        </Reveal>

        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,300px)_1fr] md:gap-16">
          <Reveal delay={0.05}>
            <div className="relative mx-auto aspect-square w-full max-w-[260px] overflow-hidden rounded-[22px] bg-gradient-to-br from-[#FF2F7D]/20 via-[#FF5368]/10 to-[#FF8A45]/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-transform duration-700 hover:scale-[1.012]">
              <Image
                src={SPEAKER.photo}
                alt={SPEAKER.name}
                fill
                sizes="(min-width: 768px) 300px, 260px"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <h2
              className="mb-2 text-[clamp(28px,3.4vw,44px)] font-semibold leading-tight tracking-[-0.026em]"
              style={{ fontFamily: "var(--font-uxp-heading)" }}
            >
              {SPEAKER.name}
            </h2>
            <p className="mb-5 text-[15px] font-semibold uppercase tracking-[0.08em] text-[#FF6FA8]">
              {SPEAKER.role}
            </p>
            <p className="mb-7 max-w-[560px] text-[16px] leading-relaxed text-[#B8B2B7]">{SPEAKER.about}</p>
            <div className="flex items-center gap-6">
              <a
                href={SPEAKER.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#B8B2B7] transition-colors hover:text-[#F4F0F2]"
              >
                <InstagramIcon size={18} strokeWidth={2} color="currentColor" className="!cursor-pointer" />
                Instagram
              </a>
              <a
                href={SPEAKER.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#B8B2B7] transition-colors hover:text-[#F4F0F2]"
              >
                <LinkedinIcon size={18} strokeWidth={2} color="currentColor" className="!cursor-pointer" />
                LinkedIn
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
