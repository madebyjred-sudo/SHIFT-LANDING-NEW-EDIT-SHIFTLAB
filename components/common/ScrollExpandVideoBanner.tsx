"use client";

import { useCallback, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import AutoplayLoopVideo from "@/components/common/AutoplayLoopVideo";

/**
 * ScrollExpandVideoBanner — drop-in alternative to PageFullWidthVideoBanner.
 *
 * Inspired by the `scroll-expansion-hero` component (but not a literal port):
 *   - The video begins as an INSET CARD (rounded, narrower, with a soft shadow)
 *     sitting between the previous section and the next one.
 *   - As the user scrolls, the card EXPANDS smoothly to fill the viewport
 *     width with zero radius (so it reads as the page's full-bleed banner).
 *   - The shadow softens and a subtle dark vignette over the video fades
 *     out as the expansion progresses.
 *
 * Behavior is **scroll-driven** via framer-motion's `useScroll`, scoped to
 * the section element — it does NOT hijack global scroll (unlike the
 * source component). Reduced-motion users get the final full-width state
 * immediately.
 */

export type ScrollExpandVideoBannerProps = {
  src: string;
  mimeType?: string;
  poster?: string;
  /** Meaningful label for assistive tech. When omitted, video is decorative. */
  ariaLabel?: string;
  /** Force aspect ratio (e.g. "16 / 9"). Otherwise inferred from metadata. */
  aspectRatio?: string;
  /** Extra classes on the outer <section>. */
  sectionClassName?: string;
  /** When true, source attaches on first paint instead of on near-viewport. */
  priority?: boolean;
  /** When true, audio starts muted then unmutes after a short delay. */
  audioEnabled?: boolean;
  /** Starting width while the card is inset. Default: "62%" desktop, full on mobile. */
  insetWidth?: string;
  /** Starting border radius while the card is inset. Default: 32px */
  insetRadius?: number;
  /** Render-prop for overlay content positioned absolutely over the
   *  expanding video card. Receives the section's scroll progress so the
   *  overlay can sync its own motion (e.g. layered text reveal). */
  overlay?: (progress: MotionValue<number>) => ReactNode;
};

export default function ScrollExpandVideoBanner({
  src,
  mimeType = "video/mp4",
  poster,
  ariaLabel,
  aspectRatio: aspectRatioProp,
  sectionClassName = "",
  priority = false,
  audioEnabled = false,
  insetWidth = "62%",
  insetRadius = 32,
  overlay,
}: ScrollExpandVideoBannerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [measuredRatio, setMeasuredRatio] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const aspectRatio = aspectRatioProp ?? measuredRatio ?? "16 / 9";

  const onLoadedMetadata = useCallback(
    (e: SyntheticEvent<HTMLVideoElement>) => {
      if (aspectRatioProp) return;
      const { videoWidth, videoHeight } = e.currentTarget;
      if (videoWidth > 0 && videoHeight > 0) {
        setMeasuredRatio(`${videoWidth} / ${videoHeight}`);
      }
    },
    [aspectRatioProp],
  );

  // Section progress — 0 when the section's top first enters the viewport,
  // 1 by the time its center reaches the viewport center.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const width = useTransform(scrollYProgress, [0, 1], [insetWidth, "100%"]);
  const radius = useTransform(scrollYProgress, [0, 1], [insetRadius, 0]);
  const vignetteOpacity = useTransform(scrollYProgress, [0, 1], [0.18, 0]);
  const boxShadow = useTransform(
    scrollYProgress,
    (p) => {
      const o = 1 - p;
      return `0 30px 80px -25px rgba(21,52,220,${(0.35 * o).toFixed(3)}), 0 15px 45px -15px rgba(245,64,255,${(0.22 * o).toFixed(3)})`;
    }
  );

  // Reduced motion → render full-width immediately, no scroll behavior
  if (prefersReducedMotion) {
    return (
      <section
        ref={ref}
        className={`relative w-full overflow-hidden ${sectionClassName}`.trim()}
        style={{ aspectRatio }}
      >
        <AutoplayLoopVideo
          src={src}
          mimeType={mimeType}
          poster={poster}
          priority={priority}
          ariaLabel={ariaLabel}
          onLoadedMetadata={onLoadedMetadata}
          audioEnabled={audioEnabled}
        />
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className={`relative w-full ${sectionClassName}`.trim()}
    >
      <motion.div
        className="relative mx-auto overflow-hidden"
        style={{
          width,
          aspectRatio,
          borderRadius: radius,
          boxShadow,
        }}
      >
        <AutoplayLoopVideo
          src={src}
          mimeType={mimeType}
          poster={poster}
          priority={priority}
          ariaLabel={ariaLabel}
          onLoadedMetadata={onLoadedMetadata}
          audioEnabled={audioEnabled}
        />
        {/* Subtle vignette while card is small — fades out as it expands */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: vignetteOpacity,
            background:
              "radial-gradient(60% 60% at 50% 50%, transparent 40%, rgba(14,23,69,0.5) 100%)",
          }}
        />
        {/* Overlay slot — content sits OVER the video card and receives
            the same scrollYProgress for syncing motion. */}
        {overlay && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {overlay(scrollYProgress)}
          </div>
        )}
      </motion.div>
    </section>
  );
}
