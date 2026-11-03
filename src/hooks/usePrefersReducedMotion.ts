"use client";

import { useEffect, useState } from "react";

/**
 * Correctly detects the user's reduced-motion preference.
 *
 * Not `useReducedMotion` from `motion/react`: the installed version queries
 * `matchMedia("(prefers-reduced-motion)")` without the `: reduce` value,
 * which matches `true` in any browser that supports the media feature at
 * all — i.e. it returns `true` almost everywhere, regardless of the user's
 * actual setting, silently skipping every animation gated by it.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
