"use client";

import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Next.js client navigations do not reset Lenis’s virtual scroll position.
 * On pathname change, snap to the top (native window scroll when Lenis is off).
 */
export default function RouteScrollToTop() {
  const pathname = usePathname();
  const lenis = useLenis();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  return null;
}
