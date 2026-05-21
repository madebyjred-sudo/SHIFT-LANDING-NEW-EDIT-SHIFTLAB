"use client";

import type { ComponentProps, ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * FooterSection — the full-width chrome from the footer-section component:
 *   - rounded-t-4xl (md: rounded-t-6xl)
 *   - radial gradient at top center + base dark fill
 *   - decorative horizontal blur line at top edge
 *   - border-t
 *   - AnimatedContainer (blur 4px → 0, translateY -8 → 0, opacity 0 → 1) on view
 *
 * The original component used `max-w-6xl` to contain the footer — we
 * intentionally let the dark card span full viewport width (the
 * `max-w-6xl mx-auto` was leaving ugly white margins on either side).
 * Inner content is capped at `max-w-[96rem]` so it doesn't sprawl on
 * 4K monitors.
 */

type FooterSectionProps = {
  children: ReactNode;
  className?: string;
  /** Background base color. Defaults to near-black to match Shift palette. */
  baseColor?: string;
};

export function FooterSection({
  children,
  className,
  baseColor = "#0A0A0A",
}: FooterSectionProps) {
  return (
    <footer
      className={[
        "relative isolate w-full overflow-hidden text-white",
        "flex flex-col items-center justify-center",
        "px-6 py-12 md:px-10 lg:px-16 lg:py-16",
        "rounded-t-[2rem] md:rounded-t-[4rem]",
        "border-t border-white/10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        backgroundImage:
          "radial-gradient(35% 128px at 50% 0%, rgba(255,255,255,0.08), transparent)",
        backgroundColor: baseColor,
      }}
    >
      {/* Decorative top blur line (bg-foreground/20 h-px w-1/3 blur) */}
      <span
        aria-hidden
        className="absolute top-0 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-[4px]"
      />
      {children}
    </footer>
  );
}

const containerVariants: Variants = {
  hidden: { filter: "blur(4px)", y: -8, opacity: 0 },
  visible: { filter: "blur(0px)", y: 0, opacity: 1 },
};

type AnimatedContainerProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>["className"];
  children: ReactNode;
};

export function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: AnimatedContainerProps) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
