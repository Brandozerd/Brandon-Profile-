"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Entry transition for each section.
 *
 * Deliberately animates on mount rather than on scroll. A `whileInView` variant
 * leaves everything below the fold at `opacity: 0` until the viewport reaches
 * it, which means slow hydration, a JS error, or any full-page capture renders
 * a blank page. Content is never allowed to depend on scrolling to be visible.
 *
 * The stagger is motivated: the sections carry a reading order (conditions now,
 * then today, then the week, then the detail) and the delay makes that order
 * legible on arrival. It runs once, never loops, and collapses to a plain
 * render under `prefers-reduced-motion`.
 */
export function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
