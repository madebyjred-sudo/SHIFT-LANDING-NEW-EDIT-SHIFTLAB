"use client";

import Section from "@/components/common/Section";
import ImpactCard from "@/components/common/ImpactCard";
import {
  DEFAULT_NAV_H,
  getVisualViewportHeight,
  MOBILE_BREAKPOINT_PX,
  useNavbarHeight,
} from "@/lib/stickyCardStackViewport";
import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useLenis } from "lenis/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type ImpactCardData = {
  id: string;
  numberImageSrc: string;
  numberAlt: string;
  content: React.ReactNode;
  bgClass: string;
  alignClass: string;
};

const impactCards: ImpactCardData[] = [
  {
    id: "1",
    numberImageSrc: "/assets/svg/1.svg",
    numberAlt: "Numeral 1 — triple impacto en las personas",
    content: (
      <span>
        <strong className="font-glitz font-light">En las personas:</strong>
        <br />
        cultivando confianza,
        <br /> orgullo y sentido de
        <br /> pertenencia
      </span>
    ),
    bgClass: "bg-[#1E35E4]",
    alignClass: "mr-auto",
  },
  {
    id: "2",
    numberImageSrc: "/assets/svg/2.svg",
    numberAlt: "Numeral 2 — triple impacto en los negocios",
    content: (
      <span>
        <strong className="font-glitz font-light">En los negocios:</strong>
        <br />
        fortaleciendo<br /> reputaciones que crean <br />valor a largo plazo
      </span>
    ),
    bgClass: "bg-[#0E1745]",
    alignClass: "mx-auto",
  },
  {
    id: "3",
    numberImageSrc: "/assets/svg/3.svg",
    numberAlt: "Numeral 3 — triple impacto en el país",
    content: (
      <span>
        <strong className="font-glitz font-light">En el país:</strong>
        &nbsp;
        impulsando una <br />comunicación que eleve <br />la conversación pública y<br /> fomente el bien común
      </span>
    ),
    bgClass: "bg-[#1E35E4]",
    alignClass: "ml-auto",
  },
];

const CARD_TOP_OFFSET_CLASSES = "pt-10";

/** Multiplier for heading↔cards vertical rhythm (0.9 = 10% tighter than base). */
const PURPOSE_HEADING_CARD_GAP = 0.9;

/** Matches `pb-10` on the title under `md`; added to sticky pin on narrow viewports only. */
const MOBILE_PURPOSE_TITLE_BOTTOM_GAP_PX = 40;

/** SSR-safe initial pin until `useLayoutEffect` measures the viewport (must match server + first client paint). */
const STACK_PIN_TOP_FALLBACK_PX = DEFAULT_NAV_H + 60;

/** Above all impact card slots (max card z is 10 + 4×10) so the title is not covered by the stack. */
const PURPOSE_HEADING_STACK_Z = 100;

/** One shared “air” band under the navbar (matches title `paddingTop` in CSS). */
function purposeTitleAirBandPx(navPx: number): number {
  const vh = getVisualViewportHeight();
  if (vh <= 0) return Math.round(80 * PURPOSE_HEADING_CARD_GAP);
  return Math.round((vh - navPx) * 0.1 * PURPOSE_HEADING_CARD_GAP);
}

/**
 * Y-offset (px) where card rows stick: under the nav + same air as the title + room for the large h2.
 * Title uses `top: navH` + padding only — do not fold this band into the title’s `top` or it doubles with padding.
 */
function purposeStackPinTopPx(navPx: number): number {
  const vh = getVisualViewportHeight();
  if (vh <= 0) return Math.round(navPx + 80 * PURPOSE_HEADING_CARD_GAP);
  const vw = typeof window !== "undefined" ? window.innerWidth : vh;
  const isNarrowViewport = vw < MOBILE_BREAKPOINT_PX;
  const vmin = Math.min(vw, vh);
  const vminBand = Math.min(Math.max(vmin * 0.12, 48), 76);
  const belowHeading = Math.round(Math.max(vminBand, 104) * PURPOSE_HEADING_CARD_GAP);
  const pin = Math.round(navPx + purposeTitleAirBandPx(navPx) + belowHeading);
  return pin + (isNarrowViewport ? MOBILE_PURPOSE_TITLE_BOTTOM_GAP_PX : 0);
}

export default function PurposeImpactSection() {
  const navH = useNavbarHeight();
  const lenis = useLenis();
  const prefersReducedMotion = useReducedMotion();

  const titleWrapRef = useRef<HTMLDivElement>(null);
  const lastCardWrapRef = useRef<HTMLDivElement>(null);

  // const [stackPinTopPx, setStackPinTopPx] = useState(STACK_PIN_TOP_FALLBACK_PX);
  // const [responsiveStickyTop, setResponsiveStickyTop] = useState(STACK_PIN_TOP_FALLBACK_PX);

  const [stackPinTopPx, setStackPinTopPx] = useState(
    STACK_PIN_TOP_FALLBACK_PX,
  );

  const [responsiveStickyTop, setResponsiveStickyTop] = useState(
    STACK_PIN_TOP_FALLBACK_PX,
  );
  useLayoutEffect(() => {
    const sync = () => {
      const calculatedStackTop =
        purposeStackPinTopPx(navH);

      const vw =
        typeof window !== "undefined"
          ? window.innerWidth
          : 1440;

      let responsiveTop = calculatedStackTop;

      // Mobile
      if (vw < 768) {
        responsiveTop = navH + 168;
      }

      // Tablet
      else if (vw < 1024) {
        responsiveTop = navH + 192;
      }


      // Desktop
      else {
        responsiveTop = navH + 180;
      }

      setStackPinTopPx(calculatedStackTop);
      setResponsiveStickyTop(responsiveTop);
    };

    sync();

    window.addEventListener("resize", sync);

    const vv = window.visualViewport;

    vv?.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("resize", sync);
      vv?.removeEventListener("resize", sync);
    };
  }, [navH]);


  const syncHeadingExitLift = useCallback(() => {
    if (prefersReducedMotion) return;
    const titleEl = titleWrapRef.current;
    const lastEl = lastCardWrapRef.current;
    if (!titleEl || !lastEl) return;
    const pin = stackPinTopPx;
    const lift = Math.max(0, pin - lastEl.getBoundingClientRect().top);
    titleEl.style.transform = lift > 0.5 ? `translate3d(0, ${-lift}px, 0)` : "";
  }, [prefersReducedMotion, stackPinTopPx]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        syncHeadingExitLift();
      });
    };
    syncHeadingExitLift();
    if (lenis) {
      lenis.on("scroll", onScroll);
      return () => {
        lenis.off("scroll", onScroll);
        cancelAnimationFrame(raf);
      };
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [lenis, prefersReducedMotion, syncHeadingExitLift]);

  return (
    <Section className="py-0! md:py-0! lg:py-0! pt-16! md:pt-20! lg:pt-28!">
      <Image
        src="/assets/svg/wave-shape.svg"
        alt="Forma de onda decorativa de fondo — impacto y propósito"
        aria-hidden="true"
        width={1514}
        height={737}
        className="pointer-events-none -z-10 absolute left-[50%] translate-y-[-43%] min-w-[110%] w-full -translate-x-1/2 object-contain object-top opacity-15"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1380px]">
        <p className="md:max-w-[90%] [font-family:var(--font-fira-sans)] font-normal text-[20px] leading-[22px] tracking-[0] text-[#1B2240]">
          En Shift, entendemos que cada mensaje tiene el poder de mover algo: una emocion, una decision,
          una comunidad.
          <br />
          <span className=" inline-block pt-4 max-w-[80%]">
            Por eso trabajamos para que cada estrategia sea mas que una campana, que sea un acto de
            proposito, una demostracion de compromiso con la gente, el entorno y el futuro.</span>
        </p>

        <div className="relative isolate mx-auto max-w-[380px] sm:max-w-full lg:pb-30">
          <div
            ref={titleWrapRef}
            className={
              prefersReducedMotion
                ? "relative pb-10 md:pb-10 mt-14 lg:mt-24"
                : "sticky  will-change-transform pb-10 md:pb-10 mt-14 lg:mt-24"
            }
            style={
              prefersReducedMotion
                ? undefined
                : {
                  paddingTop: `calc((100dvh - ${navH}px) * ${0.1 * PURPOSE_HEADING_CARD_GAP})`,
                  top: navH,
                  zIndex: PURPOSE_HEADING_STACK_Z,
                }
            }
          >
            <h2 className="text-center min-[868px]:text-left font-glitz font-normal text-3xl sm:text-4xl md:text-[50px] leading-[100%] tracking-[0] text-[#1534DC]">
              Nuestros proyectos buscan <br /> generar un triple impacto:
            </h2>
          </div>

          {impactCards.map((card, index) => {
            const isFirstCard = index === 0;
            const isLastCard = index === impactCards.length - 1;
            const minHeightClasses = isLastCard
              ? "min-h-[45vh] md:min-h-[47vh]"
              : "min-h-[45vh] md:min-h-[clamp(220px,47vh,520px)]";

            return (
              <div
                key={card.id}
                ref={isLastCard ? lastCardWrapRef : undefined}
                className={`flex w-full flex-col ${minHeightClasses} ${isFirstCard ? "" : CARD_TOP_OFFSET_CLASSES} ${prefersReducedMotion ? "relative" : "sticky"}`}
                style={{
                  zIndex: 10 + index * 10,
                  ...(prefersReducedMotion
                    ? {}
                    : {
                      top: `${responsiveStickyTop}px`,
                    }),
                }}
              >
                {isFirstCard ? (
                  <div className={CARD_TOP_OFFSET_CLASSES}>
                    <ImpactCard
                      numberImageSrc={card.numberImageSrc}
                      numberAlt={card.numberAlt}
                      content={card.content}
                      bgClass={card.bgClass}
                      alignClass={`${card.alignClass} min-h-[200px] md:min-h-[310px]`}
                    />
                  </div>
                ) : (
                  <ImpactCard
                    numberImageSrc={card.numberImageSrc}
                    numberAlt={card.numberAlt}
                    content={card.content}
                    bgClass={card.bgClass}
                    alignClass={`${card.alignClass} min-h-[200px] md:min-h-[310px]`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
