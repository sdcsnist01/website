"use client";
import { forwardRef, useImperativeHandle, useCallback } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { motion, useAnimate } from "motion/react";
import { useResolvedIconLoop } from "@/hooks/useResolvedIconLoop";

const SparklesIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = "currentColor", strokeWidth = 2, className = "", loop = false },
    ref,
  ) => {
    const shouldLoop = useResolvedIconLoop(loop);
    const [scope, animate] = useAnimate();

    const start = useCallback(async () => {
      animate(".sparkle-main", { rotate: 180, scale: [1, 1.2, 1] }, { duration: 0.6, ease: "easeInOut" });
      animate(
        ".sparkle-top",
        { rotate: -90, scale: [1, 0.8, 1.1], opacity: [1, 0.6, 1] },
        { duration: 0.5, ease: "easeInOut", delay: 0.1 },
      );
      animate(
        ".sparkle-bottom",
        { rotate: 90, scale: [1, 1.15, 0.9], opacity: [1, 0.7, 1] },
        { duration: 0.5, ease: "easeInOut", delay: 0.05 },
      );
    }, [animate]);

    const stop = useCallback(() => {
      animate(".sparkle-main", { rotate: 0, scale: 1 }, { duration: 0.25 });
      animate(".sparkle-top", { rotate: 0, scale: 1, opacity: 1 }, { duration: 0.25 });
      animate(".sparkle-bottom", { rotate: 0, scale: 1, opacity: 1 }, { duration: 0.25 });
    }, [animate]);

    useImperativeHandle(ref, () => ({
      startAnimation: start,
      stopAnimation: stop,
    }));

    return (
      <motion.svg
        ref={scope}
        onHoverStart={shouldLoop ? undefined : start}
        onHoverEnd={shouldLoop ? undefined : stop}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`cursor-pointer ${className}`}
        style={{ overflow: "visible" }}
      >
        <motion.path
          className="sparkle-bottom"
          d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z"
          style={{ transformOrigin: "18px 18px" }}
          animate={shouldLoop ? { rotate: [0, 90, 0], scale: [1, 1.15, 1], opacity: [1, 0.6, 1] } : undefined}
          transition={shouldLoop ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
        <motion.path
          className="sparkle-top"
          d="M16 6a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2z"
          style={{ transformOrigin: "18px 6px" }}
          animate={shouldLoop ? { rotate: [0, -90, 0], scale: [1, 1.1, 1], opacity: [1, 0.55, 1] } : undefined}
          transition={shouldLoop ? { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 } : undefined}
        />
        <motion.path
          className="sparkle-main"
          d="M9 18a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z"
          style={{ transformOrigin: "9px 12px" }}
          animate={shouldLoop ? { rotate: [0, 180, 360], scale: [1, 1.15, 1] } : undefined}
          transition={shouldLoop ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
      </motion.svg>
    );
  },
);

SparklesIcon.displayName = "SparklesIcon";
export default SparklesIcon;
