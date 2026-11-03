"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

// The wrapper renders on the server and on the client alike; reducedMotion="user" drops the movement for reduced-motion users.
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
