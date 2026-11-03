"use client";

import { motion } from "motion/react";
import Link from "next/link";

interface NavItem {
  name: string;
  url: string;
}

interface NavBarProps {
  items: NavItem[];
  activeUrl?: string;
}

/**
 * Desktop pill navigation from the Claude Design reference: 50px white pill, 14.5px medium
 * labels, active item in red with a 2px red indicator and no background. Hidden below md, where the
 * drawer in Navbar takes over.
 */
export function NavBar({ items, activeUrl }: NavBarProps) {
  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed left-1/2 top-[25px] z-50 hidden -translate-x-1/2 md:block"
    >
      <ul className="pointer-events-auto flex h-[50px] items-center gap-0.5 rounded-full border border-[#eae6e4] bg-white px-1.5 shadow-[0_6px_20px_rgba(26,26,28,0.05)]">
        {items.map((item) => {
          const isActive = item.url === activeUrl;
          return (
            <li key={item.url} className="relative">
              <Link
                href={item.url}
                aria-current={isActive ? "page" : undefined}
                className={`relative inline-flex h-[38px] items-center rounded-full px-5 text-[14.5px] font-medium tracking-[-0.005em] transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-[#1a1a1c] hover:bg-[#fdf0f0] hover:text-primary"
                }`}
              >
                {item.name}
                {isActive ? (
                  <motion.span
                    layoutId="nav-indicator"
                    aria-hidden
                    className="absolute bottom-[6px] left-5 right-5 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
