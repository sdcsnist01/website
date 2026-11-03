"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

const LINKS = [
  { href: "#timeline", label: "Timeline" },
  { href: "#teams", label: "Teams" },
  { href: "#gallery", label: "Gallery" },
  { href: "#experience", label: "Experience" },
  { href: "#faq", label: "FAQ" },
];

export default function UxplosionNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        className="ux-nav"
        aria-label="Main"
        style={{
          background: scrolled ? "rgba(10,10,12,0.72)" : "rgba(10,10,12,0)",
          backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
          borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0)"}`,
        }}
      >
        <a href="#top" aria-label="UXplosion home" className="flex items-center no-underline">
          <Image
            src="/sdc-logo.png"
            alt="SDC — Student Developers Community"
            width={1050}
            height={487}
            className="h-8 w-auto"
            priority
          />
        </a>

        <div className="ux-nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>

        <span
          aria-disabled="true"
          className="ux-nav-register pointer-events-none inline-flex cursor-not-allowed items-center rounded-full bg-gradient-to-r from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] px-[22px] py-[10px] text-[13.5px] font-bold text-[#0A0A0C] no-underline opacity-60"
        >
          Registrations Closed
        </span>

        <button
          type="button"
          className="ux-nav-burger h-[42px] w-[42px] items-center justify-center rounded-[11px] border border-[#F4F0F2]/16 bg-[#0A0A0C]/50 p-0"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4F0F2" strokeWidth={1.9} aria-hidden="true">
            <path d={menuOpen ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
          </svg>
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-x-0 top-0 z-[19] flex flex-col gap-1 border-b border-white/[0.07] bg-[#0A0A0C]/94 px-[clamp(20px,5vw,48px)] pb-[26px] pt-[88px] backdrop-blur-[18px]"
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-white/[0.06] py-[14px] text-[22px] font-medium text-[#F4F0F2] no-underline last:border-b-0"
                style={{ fontFamily: "var(--font-uxp-heading)" }}
              >
                {l.label}
              </a>
            ))}
            <span
              aria-disabled="true"
              className="mt-4 cursor-not-allowed rounded-full bg-gradient-to-r from-[#FF2F7D] via-[#FF5368] to-[#FF8A45] py-[15px] text-center text-[15px] font-bold text-[#0A0A0C] no-underline opacity-60"
            >
              Registrations Closed
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
