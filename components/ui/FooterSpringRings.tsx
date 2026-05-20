"use client";

import gsap from "gsap";
import { useCallback, useRef } from "react";

const HW = 11;
const STROKE = "#1534DC";
const STROKE_W = 0.5;

const FIGMA_RY_OVER_RX = 85.5 / 35.5;
const RY_MAX = HW * FIGMA_RY_OVER_RX;

const TOP_PAD = 2;
const BOTTOM_PAD = 1;
const CENTER_Y = TOP_PAD + RY_MAX;

const RING_GAP = 15;
const IDLE_CX_STEP = 2 * HW + RING_GAP;
const IDLE_CX = [
  14,
  14 + IDLE_CX_STEP,
  14 + 2 * IDLE_CX_STEP,
  14 + 3 * IDLE_CX_STEP,
  14 + 4 * IDLE_CX_STEP,
] as const;

const HOVER_CX = [14, 28, 45, 61, 75] as const;
const HOVER_SCALE = [0.769, 0.872, 1.0, 0.872, 0.769] as const;

const VIEW_W = IDLE_CX[IDLE_CX.length - 1] + HW + 6;
const VIEW_H = CENTER_Y + RY_MAX + BOTTOM_PAD;

function buildRingPath(cx: number, cy: number, ry: number, rx: number) {
  return [
    `M ${cx - rx} ${cy}`,
    `A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy}`,
    `A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy}`,
  ].join(" ");
}

export default function FooterSpringRings() {
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const progressRef = useRef({ t: 0 });

  const setPathRef = (el: SVGPathElement | null, i: number) => {
    pathRefs.current[i] = el;
  };

  const paths = () => pathRefs.current.filter(Boolean) as SVGPathElement[];

  const applyProgress = (t: number) => {
    progressRef.current.t = t;
    for (let i = 0; i < 5; i++) {
      const el = pathRefs.current[i];
      if (!el) continue;
      const hiddenInIdle = i >= 3;
      const visibility = hiddenInIdle ? t : 1;
      const cx = IDLE_CX[i] + (HOVER_CX[i] - IDLE_CX[i]) * t;
      const scale = 1 + (HOVER_SCALE[i] - 1) * t;
      const rx = Math.max(HW * scale * visibility, 0.001);
      const ry = Math.max(RY_MAX * scale * visibility, 0.001);
      el.setAttribute("d", buildRingPath(cx, CENTER_Y, ry, rx));
      el.style.opacity = String(visibility);
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
      className="ml-0 block w-max cursor-pointer select-none self-start rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8FA8F5]"
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
        preserveAspectRatio="xMinYMid meet"
        overflow="visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="will-change-auto block h-[86px] w-auto max-w-full sm:h-[100px] md:h-[120px] lg:h-[148px] xl:h-[158px]"
        aria-hidden
        shapeRendering="geometricPrecision"
      >
        {([0, 1, 3, 4, 2] as const).map((i) => (
          <path
            key={i}
            ref={(el) => setPathRef(el, i)}
            d={buildRingPath(IDLE_CX[i], CENTER_Y, RY_MAX, HW)}
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
