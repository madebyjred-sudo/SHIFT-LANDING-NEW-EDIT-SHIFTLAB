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
        numberAlt: "Paso 1 — auditorías de madurez digital",
        content: (
            <span className="font-glitz font-light">
                <strong>
                    Auditorías
                    <br />
                    de madurez
                    <br />
                    digital
                </strong>
            </span>
        ),
        bgClass: "bg-[#1E35E4]",
        alignClass: "mr-auto max-w-[580px]!",
    },
    {
        id: "2",
        numberImageSrc: "/assets/svg/2.svg",
        numberAlt: "Paso 2 — implementación de IA",
        content: (
            <span className="font-glitz font-light">
                <strong>
                    Implementación
                    <br />
                    de IA en flujos
                    <br />
                    estratégicos
                </strong>
            </span>
        ),
        bgClass: "bg-[#0E1745]",
        alignClass: "ml-[25%] translate-x-[-25%] max-w-[580px]!",
    },
    {
        id: "3",
        numberImageSrc: "/assets/svg/3.svg",
        numberAlt: "Paso 3 — automatización de procesos",
        content: (
            <span className="font-glitz font-light">
                <strong>
                    Automatización
                    <br />
                    de procesos
                </strong>
            </span>
        ),
        bgClass: "bg-[#1E35E4]",
        alignClass: "mx-auto max-w-[580px]!",
    },
    {
        id: "4",
        numberImageSrc: "/assets/svg/4.svg",
        numberAlt: "Paso 4 — diseño de productos",
        content: (
            <span className="font-glitz font-light">
                <strong>
                    Diseño de
                    <br />
                    productos
                    <br />
                    comunicacionales
                </strong>
            </span>
        ),
        bgClass: "bg-[#0E1745]",
        alignClass: "ml-[75%] translate-x-[-75%] max-w-[580px]!",
    },
    {
        id: "5",
        numberImageSrc: "/assets/svg/5.svg",
        numberAlt: "Paso 5 — dashboards ejecutivos",
        content: (
            <span className="font-glitz font-light">
                <strong>
                    Dashboards
                    <br />
                    ejecutivos y data
                    <br />
                    intelligence
                </strong>
            </span>
        ),
        bgClass: "bg-[#1E35E4]",
        alignClass: "ml-auto max-w-[580px]!",
    },
];

const CARD_TOP_OFFSET_CLASSES = "pt-0";

/** Multiplier for heading↔cards vertical rhythm (0.9 = 10% tighter than base). */
const SERVICIOS_HEADING_CARD_GAP = 0.9;

/** Matches `pb-10` on the title under `md`; added to sticky pin on narrow viewports only. */
const MOBILE_SERVICIOS_TITLE_BOTTOM_GAP_PX = 40;

/** SSR-safe initial pin until `useLayoutEffect` measures the viewport (must match server + first client paint). */
const STACK_PIN_TOP_FALLBACK_PX = DEFAULT_NAV_H + 60;

/** Above all impact card slots (max card z is 10 + 4×10) so the title is not covered by the stack. */
const SERVICIOS_HEADING_STACK_Z = 100;

/** One shared “air” band under the navbar (matches title `paddingTop` in CSS). */
function serviciosTitleAirBandPx(navPx: number): number {
    const vh = getVisualViewportHeight();
    if (vh <= 0) return Math.round(80 * SERVICIOS_HEADING_CARD_GAP);
    return Math.round((vh - navPx) * 0.1 * SERVICIOS_HEADING_CARD_GAP);
}

/**
 * Y-offset (px) where card rows stick: under the nav + same air as the title + room for the large h2.
 * Title uses `top: navH` + padding only — do not fold this band into the title’s `top` or it doubles with padding.
 */
function serviciosStackPinTopPx(navPx: number): number {
    const vh = getVisualViewportHeight();
    if (vh <= 0) return Math.round(navPx + 80 * SERVICIOS_HEADING_CARD_GAP);
    const vw =
        typeof window !== "undefined" ? window.innerWidth : vh;
    const isNarrowViewport = vw < MOBILE_BREAKPOINT_PX;
    const vmin = Math.min(vw, vh);
    const vminBand = Math.min(Math.max(vmin * 0.12, 48), 76);
    const belowHeading = Math.round(
        Math.max(vminBand, 104) * SERVICIOS_HEADING_CARD_GAP,
    );
    const pin = Math.round(navPx + serviciosTitleAirBandPx(navPx) + belowHeading);
    return pin + (isNarrowViewport ? MOBILE_SERVICIOS_TITLE_BOTTOM_GAP_PX : 0);
}

export default function ShiftLabServiceSection() {
    const navH = useNavbarHeight();
    const lenis = useLenis();
    const prefersReducedMotion = useReducedMotion();

    const titleWrapRef = useRef<HTMLDivElement>(null);
    const lastCardWrapRef = useRef<HTMLDivElement>(null);

    const [stackPinTopPx, setStackPinTopPx] = useState(
        STACK_PIN_TOP_FALLBACK_PX,
    );

    const [responsiveStickyTop, setResponsiveStickyTop] = useState(
        STACK_PIN_TOP_FALLBACK_PX,
    );
    useLayoutEffect(() => {
        const sync = () => {
            const calculatedStackTop =
                serviciosStackPinTopPx(navH);

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
                responsiveTop = navH + 140;
            }


            // Desktop
            else {
                responsiveTop = calculatedStackTop;
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
        titleEl.style.transform =
            lift > 0.5 ? `translate3d(0, ${-lift}px, 0)` : "";
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
        <Section className="pb-0! sm:pb-10 pt-0! sm:pt-0!">
            <div className="relative z-10 mx-auto w-full max-w-[1380px]">
                <div className="relative isolate mx-auto max-w-[380px] sm:max-w-full lg:pb-30">
                    <div
                        ref={titleWrapRef}
                        className={
                            prefersReducedMotion
                                ? "relative pb-10 md:pb-10"
                                : "sticky bg-white will-change-transform pb-10 md:pb-10"
                        }
                        style={
                            prefersReducedMotion
                                ? undefined
                                : {
                                    paddingTop: `calc((100dvh - ${navH}px) * ${0.1 * SERVICIOS_HEADING_CARD_GAP})`,
                                    top: navH,
                                    zIndex: SERVICIOS_HEADING_STACK_Z,
                                }
                        }
                    >
                        <h2 className="font-glitz text-center md:text-left text-2xl leading-[105%] text-[#0E1745] md:text-3xl lg:text-[50px]">
                            Servicios de <span className="block md:hidden" />
                            Innovación
                        </h2>
                    </div>
                    {impactCards.map((card, index) => {
                        const isFirstCard = index === 0;
                        const isLastCard = index === impactCards.length - 1;
                        const minHeightClasses = isLastCard
                            ? "min-h-[45vh] md:min-h-[47vh]"
                            : "min-h-[45vh] md:min-h-[clamp(220px,47vh,520px)]";

                        const paddingBottom = isLastCard
                            ? "0vh"
                            : "0vh";

                        return (
                            <div
                                key={card.id}
                                ref={isLastCard ? lastCardWrapRef : undefined}
                                className={`flex w-full flex-col ${minHeightClasses} ${isFirstCard ? "" : CARD_TOP_OFFSET_CLASSES} ${prefersReducedMotion ? "relative" : "sticky"}`}
                                style={{
                                    zIndex: 10 + index * 10,
                                    paddingBottom,
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