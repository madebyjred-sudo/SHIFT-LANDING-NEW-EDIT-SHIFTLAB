"use client";

import { useRef, type CSSProperties } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * ScrollLayeredText — scroll-driven version of `components/ui/layered-text.tsx`.
 *
 * Same isometric/skewed cascading reveal, but instead of hover-trigger it
 * runs against `useScroll(scrollYProgress)` so it stays IN SYNC with
 * surrounding scroll-linked elements (e.g. the awards video expanding).
 *
 * Each line gets its own staggered scroll window: line 0 starts revealing
 * immediately, line N-1 finishes near the end of progress. Wave goes up.
 *
 * `progress` (optional): when provided, replaces the internal useScroll so
 * the text shares progress with an outer element (e.g. an expanding video
 * card driven by the same scroll). This is what makes overlay placement
 * feel like ONE motion instead of two parallel ones.
 */

type Line = { top: string; bottom: string };

export type ScrollLayeredTextProps = {
  lines: Line[];
  /** CSS font-size desktop. Default 80px */
  fontSize?: string;
  /** CSS font-size mobile (<md). Default 32px */
  fontSizeMd?: string;
  /** Per-line height in px (desktop). Default 60 */
  lineHeight?: number;
  /** Per-line height in px (mobile). Default 36 */
  lineHeightMd?: number;
  /** Stairs offset per line in px (desktop). Default 35 */
  staircaseOffset?: number;
  /** Stairs offset per line in px (mobile). Default 18 */
  staircaseOffsetMd?: number;
  /** Tailwind / inline className for color, padding, etc. */
  className?: string;
  /** External scroll progress (0..1). If omitted, the component runs its
   *  own `useScroll` against its container. Pass this to keep the reveal
   *  in lock-step with a parent (e.g. an expanding video card). */
  progress?: MotionValue<number>;
};

function LayeredLine({
  progress,
  line,
  index,
  total,
  lineHeight,
  lineHeightMd,
  staircaseOffset,
  staircaseOffsetMd,
}: {
  progress: MotionValue<number>;
  line: Line;
  index: number;
  total: number;
  lineHeight: number;
  lineHeightMd: number;
  staircaseOffset: number;
  staircaseOffsetMd: number;
}) {
  // Each line's reveal window — staggered along scroll. Whole cascade
  // is parked in the LATTER half of progress so it coincides with the
  // container's opacity fade-in (also gated to ~[0.45, 0.95]).
  const baseStart = 0.4;
  const stagger = 0.07;
  const windowSize = 0.22;
  const start = baseStart + index * stagger;
  const end = Math.min(1, start + windowSize);

  const y = useTransform(progress, [start, end], [0, -lineHeight], {
    clamp: true,
  });
  const yMobile = useTransform(progress, [start, end], [0, -lineHeightMd], {
    clamp: true,
  });

  const isEven = index % 2 === 0;
  const centerIndex = Math.floor(total / 2);
  const translateX = (index - centerIndex) * staircaseOffset;
  const translateXMobile = (index - centerIndex) * staircaseOffsetMd;

  // Isometric skew alternates between rows for the cascade illusion
  const skewTransform = isEven
    ? "skew(60deg, -30deg) scaleY(0.66667)"
    : "skew(0deg, -30deg) scaleY(1.33333)";

  return (
    <li
      className="overflow-hidden relative shift-layered-line"
      style={
        {
          height: `${lineHeight}px`,
          transform: `translateX(${translateX}px) ${skewTransform}`,
          // CSS vars consumed by the global stylesheet at the bottom of this file
          "--li-h-md": `${lineHeightMd}px`,
          "--li-tx-md": `${translateXMobile}px`,
          "--li-skew-md": skewTransform,
        } as CSSProperties
      }
    >
      {/* Desktop motion */}
      <motion.div className="hidden md:block" style={{ y }}>
        <Para text={line.top} height={lineHeight} />
        <Para text={line.bottom} height={lineHeight} />
      </motion.div>
      {/* Mobile motion */}
      <motion.div className="md:hidden" style={{ y: yMobile }}>
        <Para text={line.top} height={lineHeightMd} />
        <Para text={line.bottom} height={lineHeightMd} />
      </motion.div>
    </li>
  );
}

function Para({ text, height }: { text: string; height: number }) {
  return (
    <p
      className="px-[15px] align-top whitespace-nowrap m-0"
      style={{
        height,
        lineHeight: `${height - 5}px`,
      }}
    >
      {text || " "}
    </p>
  );
}

export default function ScrollLayeredText({
  lines,
  fontSize = "80px",
  fontSizeMd = "32px",
  lineHeight = 60,
  lineHeightMd = 30,
  staircaseOffset = 35,
  staircaseOffsetMd = 18,
  className = "",
  progress,
}: ScrollLayeredTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Scroll progress through this section: 0 when its top first enters
  // the viewport, 1 when its bottom exits at the top. Used only when
  // no external `progress` MotionValue is provided.
  const { scrollYProgress: ownProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const driverProgress = progress ?? ownProgress;

  // Container fade — stays at 0 while the video is still inset, then ramps
  // up only during the LATTER half of the expansion so the text never
  // shows before the video has clearly opened up.
  const containerOpacity = useTransform(driverProgress, [0.45, 0.95], [0, 1], {
    clamp: true,
  });

  // Reduced-motion fallback: just render the final state (no animation)
  if (reduced) {
    return (
      <div
        ref={ref}
        className={`mx-auto py-24 [font-family:var(--font-glitz-local)] antialiased ${className}`}
        style={{ fontSize }}
      >
        <ul className="list-none p-0 m-0 flex flex-col items-center">
          {lines.map((line, i) => (
            <li
              key={i}
              className="overflow-hidden relative"
              style={{ height: lineHeight }}
            >
              <Para text={line.bottom} height={lineHeight} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={`shift-layered-root mx-auto py-12 md:py-16 [font-family:var(--font-glitz-local)] antialiased ${className}`}
      style={{
        fontSize,
        opacity: containerOpacity,
        ["--shift-layered-fs-md" as string]: fontSizeMd,
      }}
    >
      <ul className="list-none p-0 m-0 flex flex-col items-center">
        {lines.map((line, i) => (
          <LayeredLine
            key={i}
            progress={driverProgress}
            line={line}
            index={i}
            total={lines.length}
            lineHeight={lineHeight}
            lineHeightMd={lineHeightMd}
            staircaseOffset={staircaseOffset}
            staircaseOffsetMd={staircaseOffsetMd}
          />
        ))}
      </ul>
    </motion.div>
  );
}
