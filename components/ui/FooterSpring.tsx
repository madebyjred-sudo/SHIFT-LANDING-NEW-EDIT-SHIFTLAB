"use client";

import gsap from "gsap";
import { useCallback, useRef } from "react";

/**
 * Idle coils use Ellipse 31 geometry: ry/rx = 85.5/35.5 per arch (HW = rx at scale 1).
 */
const HW = 11;
/** Lighter than legacy #1534DC so arches read softer on lavender. */
const STROKE = "#1534DC";
const STROKE_W = 0.5;

const FIGMA_RY_OVER_RX = 85.5 / 35.5;

/** Rise at full scale (center ring, collapsed + idle). */
const RY_MAX = HW * FIGMA_RY_OVER_RX;

/** Baseline = feet on the seam; tiny pad below for round stroke caps (not empty “lift”). */
const TOP_PAD = 2;
const BOTTOM_PAD = 1;

const ARCH_BASE = TOP_PAD + RY_MAX;

/** Default: five identical arches — gap between silhouettes (center − center = 2×HW + RING_GAP). */
const RING_GAP = 15;
const IDLE_CX_STEP = 2 * HW + RING_GAP;
const IDLE_CX = [
  14,
  14 + IDLE_CX_STEP,
  14 + 2 * IDLE_CX_STEP,
  14 + 3 * IDLE_CX_STEP,
  14 + 4 * IDLE_CX_STEP,
] as const;

/**
 * Collapsed: symmetric nest, tight cx so neighbors’ legs cross above the baseline (reference).
 * Scale: outer < mid < center (same ry/rx ratio per ring).
 */
const HOVER_CX = [14, 28, 45, 61, 75] as const;
const HOVER_SCALE = [0.769, 0.872, 1.0, 0.872, 0.769] as const;

const VIEW_W = IDLE_CX[IDLE_CX.length - 1] + HW + 6;
const VIEW_H = ARCH_BASE + BOTTOM_PAD;

/**
 * Upper semellipse (Ellipse 31 proportions). `rx`/`ry` scale together so shape matches design.
 */
function buildPath(cx: number, ry: number, rx: number) {
  const yb = ARCH_BASE;
  const x0 = cx - rx;
  const x1 = cx + rx;
  const yt = yb - ry;
  const K = 0.5522847498;
  return [
    `M ${x0} ${yb}`,
    `C ${x0} ${yb - ry * K} ${cx - rx * K} ${yt} ${cx} ${yt}`,
    `C ${cx + rx * K} ${yt} ${x1} ${yb - ry * K} ${x1} ${yb}`,
  ].join(" ");
}

export default function FooterSpring() {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const progressRef = useRef({ t: 0 });

  const setPathRef = (el: SVGPathElement | null, i: number) => {
    pathRefs.current[i] = el;
  };

  const paths = () =>
    pathRefs.current.filter(Boolean) as SVGPathElement[];

  const applyProgress = (t: number) => {
    progressRef.current.t = t;
    for (let i = 0; i < 5; i++) {
      const el = pathRefs.current[i];
      if (!el) continue;
      const cx = IDLE_CX[i] + (HOVER_CX[i] - IDLE_CX[i]) * t;
      const scale = 1 + (HOVER_SCALE[i] - 1) * t;
      const rx = HW * scale;
      const ry = RY_MAX * scale;
      el.setAttribute("d", buildPath(cx, ry, rx));
    }
  };

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const runHover = useCallback(() => {
    if (prefersReducedMotion()) {
      applyProgress(1);
      return;
    }
    const p = paths();
    if (!p.length) return;
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(progressRef.current, {
      t: 1,
      duration: 0.48,
      ease: "sine.inOut",
      onUpdate: () => applyProgress(progressRef.current.t),
      overwrite: "auto",
    });
  }, []);

  const runIdle = useCallback(() => {
    if (prefersReducedMotion()) {
      applyProgress(0);
      return;
    }
    const p = paths();
    if (!p.length) return;
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(progressRef.current, {
      t: 0,
      duration: 0.52,
      ease: "power2.out",
      onUpdate: () => applyProgress(progressRef.current.t),
      overwrite: "auto",
    });
  }, []);

  return (
    <div
      data-footer-spring=""
      className="footer-spring ml-0 block w-max cursor-pointer select-none self-start rounded-sm outline-none"
      onMouseEnter={runHover}
      onFocus={runHover}
      onMouseLeave={runIdle}
      onBlur={runIdle}
      tabIndex={0}
      role="img"
      aria-label="Decoración resorte"
    >
      <svg
        width={VIEW_W}
        height={VIEW_H}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMinYMax meet"
        overflow="visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="will-change-auto block h-11 w-auto max-w-full sm:h-[52px] md:h-[75px]"
        aria-hidden
        shapeRendering="geometricPrecision"
      >
        {([0, 1, 3, 4, 2] as const).map((i) => (
          <path
            key={i}
            ref={(el) => setPathRef(el, i)}
            d={buildPath(IDLE_CX[i], RY_MAX, HW)}
            stroke={STROKE}
            strokeWidth={STROKE_W}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
}
