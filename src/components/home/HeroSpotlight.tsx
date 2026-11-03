"use client";

import { useEffect, useState } from "react";

/** Soft spotlight that follows the pointer on desktop hero only. */
export default function HeroSpotlight() {
  const [pos, setPos] = useState({ x: 50, y: 40 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const onMove = (e: PointerEvent) => {
      setVisible(true);
      setPos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] hidden opacity-0 transition-opacity duration-500 md:block"
      style={{
        opacity: visible ? 1 : 0,
        background: `radial-gradient(520px circle at ${pos.x}% ${pos.y}%, rgba(217,32,47,0.10), transparent 55%)`,
      }}
    />
  );
}
