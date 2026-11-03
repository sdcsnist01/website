"use client";
import { forwardRef, useImperativeHandle, useCallback } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { motion, useAnimate } from "motion/react";
import { useResolvedIconLoop } from "@/hooks/useResolvedIconLoop";

const RadioIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = "currentColor", strokeWidth = 2, className = "", loop = false },
    ref,
  ) => {
    const shouldLoop = useResolvedIconLoop(loop);
    const [scope, animate] = useAnimate();

    const start = useCallback(async () => {
      animate(".center", { scale: [1, 1.3, 1] }, { duration: 0.5, ease: "easeInOut" });
      animate(
        ".wave-inner",
        { scale: [1, 1.15, 1], opacity: [1, 0.6, 1] },
        { duration: 0.6, ease: "easeInOut", delay: 0.1 },
      );
      await animate(
        ".wave-outer",
        { scale: [1, 1.2, 1], opacity: [1, 0.4, 1] },
        { duration: 0.7, ease: "easeInOut", delay: 0.2 },
      );
    }, [animate]);

    const stop = useCallback(() => {
      animate(".center, .wave-inner, .wave-outer", { scale: 1, opacity: 1 }, { duration: 0.2, ease: "easeInOut" });
    }, [animate]);

    useImperativeHandle(ref, () => ({
      startAnimation: start,
      stopAnimation: stop,
    }));

    return (
      <motion.svg
        ref={scope}
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
        onHoverStart={shouldLoop ? undefined : start}
        onHoverEnd={shouldLoop ? undefined : stop}
      >
        <motion.g
          className="wave-inner"
          style={{ transformOrigin: "12px 12px" }}
          animate={shouldLoop ? { scale: [1, 1.18, 1], opacity: [1, 0.55, 1] } : undefined}
          transition={shouldLoop ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
        >
          <path d="M16.247 7.761a6 6 0 0 1 0 8.478" />
          <path d="M7.753 16.239a6 6 0 0 1 0-8.478" />
        </motion.g>

        <motion.g
          className="wave-outer"
          style={{ transformOrigin: "12px 12px" }}
          animate={shouldLoop ? { scale: [1, 1.28, 1], opacity: [1, 0.35, 1] } : undefined}
          transition={shouldLoop ? { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 } : undefined}
        >
          <path d="M19.075 4.933a10 10 0 0 1 0 14.134" />
          <path d="M4.925 19.067a10 10 0 0 1 0-14.134" />
        </motion.g>

        <motion.circle
          className="center"
          cx="12"
          cy="12"
          r="2"
          style={{ transformOrigin: "12px 12px" }}
          animate={shouldLoop ? { scale: [1, 1.35, 1] } : undefined}
          transition={shouldLoop ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
      </motion.svg>
    );
  },
);

RadioIcon.displayName = "RadioIcon";
export default RadioIcon;
