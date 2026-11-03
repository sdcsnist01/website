"use client";

import FloatWords from "@/components/ui/FloatWords";
import Image from "next/image";
import Link from "next/link";

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/sdc.snist/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/sdc-snist-student-chapter/" },
  { label: "GitHub", href: "https://github.com/sdc-india" },
] as const;

const LINK_CLASS =
  "inline-flex min-h-10 items-center text-[14.5px] text-[#4a4a52] transition-colors duration-200 hover:text-primary";

export default function Footer() {
  return (
    <footer className="relative mt-12 w-full overflow-hidden border-t border-[#e4ddd2] bg-[#f1ebe2] px-4 pb-[env(safe-area-inset-bottom)] pt-10 sm:px-6 md:mt-24 md:px-8 md:pt-20">
      <FloatWords preset="footer" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(23,23,25,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(23,23,25,0.03) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(180deg, #000 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1100px]">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-[#e0d8cc] pb-8 md:flex-row md:items-end md:gap-8 md:pb-12">
          <div>
            <div className="font-mono-ui mb-3 text-xs tracking-[3px] text-[#a91f29] md:mb-4">CONTACT</div>
            <p className="font-grotesk text-[clamp(30px,8.4vw,68px)] leading-[1] text-[#171719]">
              Let&apos;s build <span className="text-primary">something.</span>
            </p>
            <p className="mt-3 max-w-[44ch] text-pretty text-[15px] leading-relaxed text-[#5c5c66] md:mt-4 md:text-base">
              Have an idea, want to collaborate, or ready to join the community?
            </p>
          </div>
          <div className="flex w-full flex-col gap-2.5 md:w-auto md:flex-row md:gap-3">
            <Link
              href="/join"
              className="pressable inline-flex min-h-11 w-full items-center justify-center gap-3 whitespace-nowrap rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(217,39,46,0.24)] transition-colors hover:bg-primary-dim md:min-h-13 md:w-auto md:px-7 md:text-[15px]"
            >
              Join the Community <span aria-hidden>→</span>
            </Link>
            <Link
              href="/contact"
              className="pressable inline-flex min-h-11 w-full items-center justify-center gap-3 whitespace-nowrap rounded-full border border-[#d8d2cf] bg-white px-6 text-sm font-semibold text-[#171719] transition-colors hover:border-[#f0b8b8] hover:bg-[#fdf0f0] md:min-h-13 md:w-auto md:px-7 md:text-[15px]"
            >
              Get in Touch <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-7 py-7 md:grid-cols-[1.4fr_1fr_1fr] md:gap-12 md:py-12">
          <div className="col-span-2 max-w-[340px] md:col-span-1">
            <Link
              href="/"
              aria-label="SDC SNIST home"
              className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-[12px] border border-[#eae6e4] bg-white shadow-[0_6px_20px_rgba(26,26,28,0.08)] md:h-14 md:w-14 md:rounded-[14px]"
            >
              <Image src="/sdc-india-logo.jpeg" alt="" width={56} height={56} className="h-full w-full object-contain p-1" />
            </Link>
            <p className="mt-3.5 text-pretty text-[14px] leading-relaxed text-[#5c5c66] md:mt-5 md:text-[14.5px]">
              Student Developers Community, SNIST. A place to learn, collaborate, and build.
            </p>
          </div>

          <nav aria-label="Explore" className="flex flex-col">
            <div className="font-mono-ui mb-1.5 text-[11px] tracking-[2.5px] text-[#77736c] md:mb-2.5">EXPLORE</div>
            <Link href="/" className={LINK_CLASS}>Home</Link>
            <Link href="/about" className={LINK_CLASS}>About</Link>
            <Link href="/events" className={LINK_CLASS}>Events</Link>
            <Link href="/blog" className={LINK_CLASS}>Blog</Link>
            <Link href="/contact" className={LINK_CLASS}>Contact</Link>
          </nav>

          <div className="flex flex-col">
            <div className="font-mono-ui mb-1.5 text-[11px] tracking-[2.5px] text-[#77736c] md:mb-2.5">CONNECT</div>
            {SOCIALS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                {item.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-1.5 border-t border-[#e0d8cc] py-4 text-center text-[12px] text-[#77736c] md:flex-row md:py-6 md:text-[12.5px]">
          <span>© {new Date().getFullYear()} Student Developers Community, SNIST.</span>
        </div>
      </div>
    </footer>
  );
}
