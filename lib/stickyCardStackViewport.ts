"use client";

import { useLayoutEffect, useState } from "react";

export const DEFAULT_NAV_H = 77;
export const MOBILE_BREAKPOINT_PX = 768;
export const MOBILE_PANEL_HEIGHT_RATIO = 0.78;

/** Space between sticky navbar and card edge when pinned. */
export const CARD_TOP_OFFSET_CLASSES = "pt-6 md:pt-8 lg:pt-10";
/** Horizontal inset for cards — aligned with Servicios heading / page grid. */
export const CARD_STACK_INSET_CLASSES = "px-6 md:px-12 lg:px-16";

/** Visible viewport height (accounts for mobile browser UI via Visual Viewport API). */
export function getVisualViewportHeight(): number {
  if (typeof window === "undefined") return 0;
  const vv = window.visualViewport;
  const h = vv?.height;
  if (h != null && h > 0) {
    return Math.round(h);
  }
  return Math.round(window.innerHeight);
}

export function useNavbarHeight() {
  const [height, setHeight] = useState(DEFAULT_NAV_H);

  useLayoutEffect(() => {
    const nav = document.querySelector("body > header");
    if (!nav) return;

    const measure = () => {
      setHeight(nav.getBoundingClientRect().height);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return height;
}

/**
 * Viewport pixel height for each sticky card slot (visible height − nav).
 * Uses Visual Viewport + Lenis resize so sticky stack height matches mobile chrome.
 */
export function usePanelScrollPx(
  navH: number,
  lenis: { resize: () => void } | null | undefined,
) {
  const [px, setPx] = useState<number | null>(null);

  useLayoutEffect(() => {
    const sync = () => {
      const viewportHeight = getVisualViewportHeight();
      const base = Math.max(1, viewportHeight - navH);
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT_PX;
      const next = isMobile
        ? Math.max(1, Math.round(base * MOBILE_PANEL_HEIGHT_RATIO))
        : base;
      setPx((prev) => {
        if (prev !== next) {
          queueMicrotask(() => lenis?.resize());
        }
        return next;
      });
    };

    sync();
    window.addEventListener("resize", sync);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);

    const onOrient = () => {
      requestAnimationFrame(sync);
    };
    window.addEventListener("orientationchange", onOrient);

    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", onOrient);
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
    };
  }, [navH, lenis]);

  return px;
}
