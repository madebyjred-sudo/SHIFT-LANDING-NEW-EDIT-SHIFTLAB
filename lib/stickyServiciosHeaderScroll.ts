"use client";

import {
  animate,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { type RefObject, useEffect, useRef } from "react";

const HEADER_FADE_DISTANCE = 36;
const BLINK_DURATION_MS = 480;

function blinkLine(navH: number) {
  return navH + 52;
}

function resetBelow(navH: number) {
  return navH + 168;
}

function syncOpacityFromScroll(
  headerOpacity: MotionValue<number>,
  top: number,
  navH: number,
) {
  const o = Math.min(1, Math.max(0, (top - navH) / HEADER_FADE_DISTANCE));
  headerOpacity.set(o);
}

/**
 * Fade / blink “Servicios” heading as the sticky card stack scrolls (home only).
 */
export function useStickyServiciosHeaderScroll(
  navH: number,
  headerOpacity: MotionValue<number>,
  headerBlockRef: RefObject<HTMLElement | null>,
) {
  const prevTopRef = useRef<number | null>(null);
  const blinkPlayedRef = useRef(false);
  const blinkingRef = useRef(false);
  const blinkAnimRef = useRef<AnimationPlaybackControls | null>(null);
  const blinkEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const update = () => {
      const el = headerBlockRef.current;
      if (!el) return;

      const top = el.getBoundingClientRect().top;
      const prev = prevTopRef.current;
      prevTopRef.current = top;

      if (mq?.matches) {
        if (blinkEndTimerRef.current) {
          clearTimeout(blinkEndTimerRef.current);
          blinkEndTimerRef.current = null;
        }
        blinkAnimRef.current?.stop();
        blinkingRef.current = false;
        blinkPlayedRef.current = false;
        headerOpacity.set(top <= navH ? 0 : 1);
        return;
      }

      const line = blinkLine(navH);
      const resetY = resetBelow(navH);

      if (top > resetY) {
        if (blinkEndTimerRef.current) {
          clearTimeout(blinkEndTimerRef.current);
          blinkEndTimerRef.current = null;
        }
        blinkAnimRef.current?.stop();
        blinkingRef.current = false;
        blinkPlayedRef.current = false;
        headerOpacity.set(1);
        return;
      }

      if (blinkingRef.current) {
        return;
      }

      const crossedDown =
        prev !== null &&
        prev > line &&
        top <= line &&
        top > navH &&
        !blinkPlayedRef.current;

      if (crossedDown) {
        blinkPlayedRef.current = true;
        blinkingRef.current = true;
        blinkAnimRef.current?.stop();
        if (blinkEndTimerRef.current) {
          clearTimeout(blinkEndTimerRef.current);
        }

        blinkAnimRef.current = animate(
          headerOpacity,
          [1, 0.08, 1, 0],
          {
            duration: BLINK_DURATION_MS / 1000,
            times: [0, 0.2, 0.45, 1],
            ease: [0.22, 1, 0.36, 1],
          },
        );

        blinkEndTimerRef.current = setTimeout(() => {
          blinkEndTimerRef.current = null;
          blinkingRef.current = false;
          const t =
            headerBlockRef.current?.getBoundingClientRect().top ?? top;
          syncOpacityFromScroll(headerOpacity, t, navH);
        }, BLINK_DURATION_MS);

        return;
      }

      syncOpacityFromScroll(headerOpacity, top, navH);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (blinkEndTimerRef.current) {
        clearTimeout(blinkEndTimerRef.current);
        blinkEndTimerRef.current = null;
      }
      blinkAnimRef.current?.stop();
    };
  }, [navH, headerOpacity, headerBlockRef]);
}
