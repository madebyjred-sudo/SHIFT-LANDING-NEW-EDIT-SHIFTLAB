"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { useLayoutEffect } from "react";

/**
 * Lenis smooth-scroll and GSAP ScrollTrigger both drive scroll position.
 * Without a scroller proxy, ScrollTrigger reads native scroll while Lenis
 * animates separately — pin/stack effects do not stay fixed. This bridges them.
 *
 * @see https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.scrollerProxy/
 */
export default function ScrollTriggerLenisBridge() {
  const lenis = useLenis();

  useLayoutEffect(() => {
    if (!lenis) return;

    gsap.registerPlugin(ScrollTrigger);

    const scroller = lenis.rootElement;

    ScrollTrigger.scrollerProxy(scroller, {
      scrollTop(value?: number) {
        if (arguments.length && typeof value === "number") {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      // Transform-based pins fight smooth scroll; fixed pins stack like layered floors.
      pinType: "fixed",
    });

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", onLenisScroll);

    const onRefresh = () => {
      lenis.resize();
    };
    ScrollTrigger.addEventListener("refresh", onRefresh);

    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onLenisScroll);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      ScrollTrigger.scrollerProxy(scroller);
      ScrollTrigger.refresh();
    };
  }, [lenis]);

  return null;
}
