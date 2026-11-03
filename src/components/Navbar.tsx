"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { NavBar } from "@/components/ui/tubelight-navbar";

const navItems = [
  { name: "Home", url: "/" },
  { name: "About", url: "/about" },
  { name: "Events", url: "/events" },
  { name: "Blog", url: "/blog" },
  { name: "Contact", url: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  // The menu is tied to the route it was opened on, so navigating to another route closes it
  // without an effect that resets state.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const menuOpen = openPath === pathname;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenPath(null);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      // The overlay covers the page, so Tab cycles only through the trigger and menu links.
      const focusable = [
        triggerRef.current,
        ...(menuRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? []),
      ].filter((el): el is HTMLElement => el !== null);
      const index = focusable.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey
        ? index <= 0
          ? focusable.length - 1
          : index - 1
        : index === -1 || index === focusable.length - 1
          ? 0
          : index + 1;
      e.preventDefault();
      focusable[next]?.focus();
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  function toggleMenu() {
    setOpenPath(menuOpen ? null : pathname);
  }
  return (
    <>
      <Link
        href="/"
        aria-label="SDC SNIST home"
        className="fixed left-[clamp(20px,2.6vw,40px)] top-4 z-[60] flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border border-[#eae6e4] bg-white shadow-[0_4px_14px_rgba(26,26,28,0.06)] transition-transform duration-300 hover:-translate-y-0.5 md:top-6"
      >
        <Image src="/sdc-india-logo.jpeg" alt="SDC SNIST logo" width={40} height={40} className="h-10 w-10 rounded-md object-contain" priority />
      </Link>

      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-nav-menu"
        className="fixed right-[clamp(20px,2.6vw,40px)] top-4 z-[70] flex h-12 w-12 flex-col items-center justify-center gap-[5px] rounded-[14px] border border-[#eae6e4] bg-white shadow-[0_4px_14px_rgba(26,26,28,0.06)] md:hidden"
      >
        <span
          aria-hidden
          className={`block h-0.5 w-5 rounded-full bg-[#1a1a1c] transition-transform duration-300 ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`}
        />
        <span
          aria-hidden
          className={`block h-0.5 w-5 rounded-full bg-[#1a1a1c] transition-transform duration-300 ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`}
        />
      </button>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              type="button"
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-[60] bg-[rgba(23,23,25,0.35)] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setOpenPath(null);
                triggerRef.current?.focus();
              }}
            />
            <motion.nav
              ref={menuRef}
              id="mobile-nav-menu"
              aria-label="Mobile navigation"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 right-0 top-0 z-[61] flex w-[82%] max-w-[340px] flex-col bg-white shadow-[-8px_0_32px_rgba(23,23,25,0.1)] md:hidden"
            >
              <div className="flex items-center justify-between px-5 pb-3 pt-5">
                <span className="font-mono-ui text-[11px] tracking-[2.5px] text-[#77736c]">MENU</span>
                <button
                  type="button"
                  onClick={() => {
                    setOpenPath(null);
                    triggerRef.current?.focus();
                  }}
                  aria-label="Close menu"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#eae6e4] bg-white text-xl leading-none text-[#1a1a1c]"
                >
                  ×
                </button>
              </div>
              <ul className="flex flex-col gap-1 px-3 py-2">
                {navItems.map((item) => {
                  const active = pathname === item.url;
                  return (
                    <li key={item.url}>
                      <Link
                        href={item.url}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpenPath(null)}
                        className={`flex min-h-[52px] items-center justify-between rounded-xl px-5 text-[17px] font-medium transition-colors ${
                          active ? "text-primary" : "text-[#1a1a1c] hover:bg-[#fdf0f0] hover:text-primary"
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-auto p-5">
                <Link
                  href="/join"
                  onClick={() => setOpenPath(null)}
                  className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-primary text-[15px] font-medium text-white shadow-[0_8px_20px_rgba(217,39,46,0.22)] transition-colors hover:bg-primary-dim"
                >
                  Join Us <span aria-hidden>→</span>
                </Link>
              </div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>

      <NavBar items={navItems} activeUrl={pathname} />

      <Link
        href="/join"
        className="pressable fixed right-[clamp(20px,2.6vw,40px)] top-[25px] z-50 hidden h-[50px] items-center gap-2.5 rounded-full bg-primary px-6 text-[14.5px] font-medium text-white shadow-[0_6px_16px_rgba(217,39,46,0.2)] transition-colors hover:bg-primary-dim md:inline-flex"
      >
        Join Us
        <span aria-hidden>→</span>
      </Link>
    </>
  );
}
