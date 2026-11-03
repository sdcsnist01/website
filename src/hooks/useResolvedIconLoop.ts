"use client";

import { useEffect, useState } from "react";

const MOBILE_MQ = "(max-width: 767px)";

/**
 * Resolves `loop` prop:
 * - true / false → as-is
 * - "mobile" → true only below the md breakpoint
 */
export function useResolvedIconLoop(loop: boolean | "mobile" | undefined): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (loop !== "mobile") return;
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [loop]);

  if (loop === true) return true;
  if (loop === "mobile") return isMobile;
  return false;
}
