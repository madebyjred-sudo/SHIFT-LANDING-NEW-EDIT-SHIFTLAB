"use client";

import RouteScrollToTop from "@/components/layout/RouteScrollToTop";
import ScrollTriggerLenisBridge from "@/components/layout/ScrollTriggerLenisBridge";
import { ReactLenis } from "lenis/react";
import { useEffect, useState } from "react";

/**
 * Smooth scroll for the full page. Disabled when the user prefers reduced motion.
 */
export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (reduceMotion) {
    return (
      <>
        <RouteScrollToTop />
        {children}
      </>
    );
  }

  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.09,
        wheelMultiplier: 0.95,
        smoothWheel: true,
        syncTouch: true,
        touchMultiplier: 1.4,
      }}
    >
      <ScrollTriggerLenisBridge />
      <RouteScrollToTop />
      {children}
    </ReactLenis>
  );
}
