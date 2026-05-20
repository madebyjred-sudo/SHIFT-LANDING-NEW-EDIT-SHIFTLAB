"use client";

import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import {
  CARD_STACK_INSET_CLASSES,
  CARD_TOP_OFFSET_CLASSES,
  useNavbarHeight,
  usePanelScrollPx,
} from "@/lib/stickyCardStackViewport";
import { useStickyServiciosHeaderScroll } from "@/lib/stickyServiciosHeaderScroll";

const SERVICIOS = [
  {
    title: "Crisis y gestión de riesgo",
    borderColor: "var(--Color-Blue-Royal-Blue, #1534DC)",
    imageSrc: "/assets/images/servicios/crisis.svg",
  },
  {
    title: "Media performance y data",
    borderColor: "var(--Color-Violet-Magenta, #F540FF)",
    imageSrc: "/assets/images/servicios/media-performance.svg",
  },
  {
    title: "Creatividad y campañas integradas",
    borderColor: "var(--Color-Blue-Navy-Blue, #0E1745)",
    imageSrc: "/assets/images/servicios/creatividad.svg",
  },
  {
    title: "Estrategia corporativa y reputación",
    borderColor: "var(--Color-Blue-Royal-Blue, #1534DC)",
    imageSrc: "/assets/images/servicios/influencia.svg",
  },
] as const;

export default function HomeServiciosSection() {
  const lenis = useLenis();
  const navH = useNavbarHeight();
  const panelScrollPx = usePanelScrollPx(navH, lenis);
  const prefersReducedMotion = useReducedMotion();
  const headerBlockRef = useRef<HTMLElement>(null);
  const headerOpacity = useMotionValue(1);

  useStickyServiciosHeaderScroll(navH, headerOpacity, headerBlockRef);

  useEffect(() => {
    if (typeof window === "undefined") return;
    for (const item of SERVICIOS) {
      const img = new window.Image();
      img.decoding = "async";
      img.src = item.imageSrc;
    }
  }, []);

  const panelMinFallback = `calc(100dvh - ${navH}px)`;

  return (
    <section className="relative mt-10 md:mt-30 mb-20">
      <motion.header
        ref={headerBlockRef}
        style={{ opacity: headerOpacity }}
        className="mx-auto w-full max-w-[1380px] px-6 pt-12 md:px-12 md:pt-16 lg:px-16 lg:pt-20"
      >
        <h2
          className="font-glitz align-middle text-[48px] font-normal leading-[44px] tracking-normal sm:text-[64px] sm:leading-[52px] md:text-[96px] md:leading-[40px]"
          style={{ color: "var(--Color-Blue-Royal-Blue, #1534DC)" }}
        >
          Servicios
        </h2>
      </motion.header>

      <div
        className={`relative isolate ${CARD_STACK_INSET_CLASSES} pt-4 md:pt-6`}
      >
        {SERVICIOS.map((item, index) => (
          <div
            key={item.title}
            data-card-slot
            className={`flex w-full flex-col ${CARD_TOP_OFFSET_CLASSES} ${prefersReducedMotion ? "relative" : "sticky"
              }`}
            style={{
              zIndex: 10 + index * 10,
              ...(!prefersReducedMotion ? { top: navH } : undefined),
              ...(panelScrollPx != null
                ? {
                  height: panelScrollPx,
                  minHeight: panelScrollPx,
                }
                : {
                  minHeight: panelMinFallback,
                }),
            }}
          >
            <div
              className="relative flex min-h-0 flex-1 w-full max-w-[1380px] mx-auto overflow-hidden rounded-2xl border-5 md:border-18 border-solid"
              style={{ borderColor: item.borderColor }}
            >
              <div className="absolute inset-0">
                <Image
                  src={item.imageSrc}
                  alt={`Ilustración del servicio: ${item.title}`}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1380px) 100vw, 1380px"
                  priority
                />
              </div>

              <div className="relative z-1 flex w-full items-start p-5 sm:p-6 md:p-7 lg:p-8 ">
                <p className="flex items-center gap-[0.55em] text-left text-lg sm:text-xl md:text-[40px] font-semibold md:leading-[40px] tracking-normal text-white [font-family:var(--font-figtree)]">
                  <span
                    className="inline-block size-[0.35em] shrink-0 self-center rounded-full bg-[#D1D1D1]"
                    aria-hidden
                  />
                  <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                    {item.title}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
