"use client";
import { forwardRef, useImperativeHandle, useCallback } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { motion, useAnimate } from "motion/react";
import { useResolvedIconLoop } from "@/hooks/useResolvedIconLoop";

const LibraryIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = "currentColor", strokeWidth = 2, className = "", loop = false },
    ref,
  ) => {
    const shouldLoop = useResolvedIconLoop(loop);
    const [scope, animate] = useAnimate();

    const start = useCallback(() => {
      animate(".book-2", { y: -3, rotate: -8 }, { duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] });
      animate(".book-3", { rotate: -12 }, { duration: 0.4, ease: "easeOut" });
      animate(".book-4", { rotate: -5 }, { duration: 0.4, ease: "easeOut" });
      animate(".book-1", { rotate: 12 }, { duration: 0.4, ease: "easeOut" });
    }, [animate]);

    const stop = useCallback(() => {
      animate(".book-1, .book-2, .book-3, .book-4", { rotate: 0, y: 0 }, { duration: 0.3, ease: "easeInOut" });
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
          className="book-1"
          d="m16 6 4 14"
          style={{ transformOrigin: "18px 20px" }}
          animate={shouldLoop ? { rotate: [0, 12, 0] } : undefined}
          transition={shouldLoop ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
        <motion.path
          className="book-2"
          d="M12 6v14"
          style={{ transformOrigin: "12px 20px" }}
          animate={shouldLoop ? { y: [0, -3, 0], rotate: [0, -8, 0] } : undefined}
          transition={shouldLoop ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
        <motion.path
          className="book-3"
          d="M8 8v12"
          style={{ transformOrigin: "8px 20px" }}
          animate={shouldLoop ? { rotate: [0, -12, 0] } : undefined}
          transition={shouldLoop ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
        <motion.path
          className="book-4"
          d="M4 4v16"
          style={{ transformOrigin: "4px 20px" }}
          animate={shouldLoop ? { rotate: [0, -5, 0] } : undefined}
          transition={shouldLoop ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
      </motion.svg>
    );
  },
);

LibraryIcon.displayName = "LibraryIcon";
export default LibraryIcon;
