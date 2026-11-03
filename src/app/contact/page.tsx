"use client";

import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import SectionHeader from "@/components/ui/SectionHeader";
import FloatWords from "@/components/ui/FloatWords";
import ExternalLinkIcon from "@/components/ui/external-link-icon";
import InstagramIcon from "@/components/ui/instagram-icon";
import LinkedinIcon from "@/components/ui/linkedin-icon";
import GithubIcon from "@/components/ui/github-icon";

const links = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/sdc.snist/",
    hint: "Campus highlights",
    Icon: InstagramIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/sdc-snist-student-chapter/",
    hint: "Professional updates",
    Icon: LinkedinIcon,
  },
  {
    label: "GitHub",
    href: "https://github.com/sdc-india",
    hint: "Open source",
    Icon: GithubIcon,
  },
] as const;

// Entrances use the shared CSS classes, which switch off under prefers-reduced-motion in globals.css.
const enter = (delay: string) => ({ animationDelay: delay });

export default function ContactPage() {
  return (
    <main className="relative overflow-x-clip bg-background font-body text-on-surface">
      <section aria-label="Contact" className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-32 md:px-8 md:pb-20">
        {/* Decoration starts below the nav and fades out before the footer, so no word is cut off at an edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[120px] overflow-hidden"
          style={{ maskImage: "linear-gradient(180deg, #000 72%, transparent 100%)", WebkitMaskImage: "linear-gradient(180deg, #000 72%, transparent 100%)" }}
        >
          <FloatWords preset="contact" />
          <div
            className="anim-drift-red absolute -left-[12vw] -top-[14vw] h-[46vw] w-[46vw] min-h-[320px] min-w-[320px] rounded-full opacity-80"
            style={{ background: "radial-gradient(circle, rgba(229,37,41,0.22) 0%, rgba(229,37,41,0) 68%)" }}
          />
          <div
            className="absolute -bottom-[16vw] -right-[12vw] h-[44vw] w-[44vw] min-h-[300px] min-w-[300px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(253,236,234,1) 0%, rgba(253,236,234,0) 70%)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(229,37,41,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(229,37,41,0.06) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse at 40% 30%, #000 0%, transparent 72%)",
              WebkitMaskImage: "radial-gradient(ellipse at 40% 30%, #000 0%, transparent 72%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-[1100px]">
          <div className="anim-fade-up" style={enter("0s")}>
            <SectionHeader
              as="h1"
              eyebrow="GET IN TOUCH"
              title={
                <>
                  Contact <span className="text-primary">us</span>
                </>
              }
              subtitle="Questions, collabs, or speaker proposals. Send a message and the SDC SNIST team will follow up."
            />
          </div>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
            <div>
              <ul className="anim-fade-up space-y-4" style={enter("0.12s")}>
                {links.map(({ label, href, hint, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-[#e4ddd6] bg-white p-4 pr-5 shadow-[0_4px_14px_rgba(26,26,28,0.05)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_16px_34px_rgba(217,39,46,0.12)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5"
                    >
                      <span
                        aria-hidden
                        className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white"
                      >
                        <Icon size={22} strokeWidth={2} color="currentColor" className="!cursor-pointer" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-grotesk text-lg font-bold text-on-surface">{label}</span>
                        <span className="block text-sm text-on-surface-variant">
                          {hint} <span className="sr-only">(opens in a new tab)</span>
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#e4ddd6] text-on-surface transition-[background-color,border-color,color] duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white"
                      >
                        <ExternalLinkIcon
                          size={16}
                          strokeWidth={2}
                          color="currentColor"
                          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 !cursor-pointer"
                        />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <div className="anim-fade-up mt-8" style={enter("0.24s")}>
                <Link
                  href="/join"
                  className="font-mono-ui pressable group inline-flex min-h-11 items-center gap-2.5 rounded-full px-1 text-xs tracking-[1.5px] text-primary transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
                >
                  OR BECOME A MEMBER
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none">
                    →
                  </span>
                </Link>
              </div>
            </div>

            <div
              className="anim-fade-up relative overflow-hidden rounded-2xl border border-[#e4ddd6] bg-white p-6 shadow-[0_18px_44px_rgba(23,23,25,0.07)] sm:p-8 md:p-10"
              style={enter("0.2s")}
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-[#f0a3a6] to-transparent" />
              <h2 className="font-grotesk text-2xl font-bold text-on-surface sm:text-[28px]">Send a message</h2>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                We store your note securely and review new messages regularly.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
