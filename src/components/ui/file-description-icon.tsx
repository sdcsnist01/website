"use client";
import { forwardRef, useImperativeHandle, useCallback } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { motion, useAnimate } from "motion/react";
import { useResolvedIconLoop } from "@/hooks/useResolvedIconLoop";

const FileDescriptionIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  (
    { size = 24, color = "currentColor", strokeWidth = 2, className = "", loop = false },
    ref,
  ) => {
    const shouldLoop = useResolvedIconLoop(loop);
    const [scope, animate] = useAnimate();

    const start = useCallback(async () => {
      await animate(".file-fold", { pathLength: [0, 1] }, { duration: 0.3, ease: "easeOut" });
      animate(".file-lines", { pathLength: [0, 1] }, { duration: 0.4, ease: "easeOut" });
    }, [animate]);

    const stop = useCallback(async () => {
      animate(".file-fold, .file-lines", { pathLength: 1 }, { duration: 0.2 });
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
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />

        <motion.path
          d="M14 3v4a1 1 0 0 0 1 1h4"
          className="file-fold"
          initial={shouldLoop ? { pathLength: 0 } : undefined}
          animate={shouldLoop ? { pathLength: [0, 1, 1, 0] } : undefined}
          transition={shouldLoop ? { duration: 2.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.7, 1] } : undefined}
        />

        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />

        <motion.path
          d="M9 17h6"
          className="file-lines"
          initial={shouldLoop ? { pathLength: 0 } : undefined}
          animate={shouldLoop ? { pathLength: [0, 1, 1, 0] } : undefined}
          transition={
            shouldLoop
              ? { duration: 2.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.7, 1], delay: 0.15 }
              : undefined
          }
        />
        <motion.path
          d="M9 13h6"
          className="file-lines"
          initial={shouldLoop ? { pathLength: 0 } : undefined}
          animate={shouldLoop ? { pathLength: [0, 1, 1, 0] } : undefined}
          transition={
            shouldLoop
              ? { duration: 2.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.7, 1], delay: 0.08 }
              : undefined
          }
        />
      </motion.svg>
    );
  },
);

FileDescriptionIcon.displayName = "FileDescriptionIcon";
export default FileDescriptionIcon;
