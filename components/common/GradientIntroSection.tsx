"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import GradientText from "@/components/ui/GradientText";
import OutlineArrowButton from "@/components/ui/OutlineArrowButton";
import {
  getPrefersReducedMotionServerSnapshot,
  getPrefersReducedMotionSnapshot,
  subscribePrefersReducedMotion,
} from "@/lib/prefersReducedMotion";

const INTERSECTION_THRESHOLD = 0.3;

export type GradientIntroVariant = "home" | "services";

type GradientIntroSectionProps = {
  variant: GradientIntroVariant;
};

export default function GradientIntroSection({ variant }: GradientIntroSectionProps) {
  const introSectionRef = useRef<HTMLElement>(null);
  const introBlockRef = useRef<HTMLDivElement>(null);
  const [introVisible, setIntroVisible] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    getPrefersReducedMotionServerSnapshot,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (introVisible) return;

    const target = introSectionRef.current;
    if (!target) return;

    if (!("IntersectionObserver" in window)) {
      setIntroVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setIntroVisible(true);
        observer.disconnect();
      },
      { threshold: INTERSECTION_THRESHOLD },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [introVisible]);

  const introReplayRef = useRef(false);

  useLayoutEffect(() => {
    if (!introVisible || prefersReducedMotion) return;
    if (introReplayRef.current) return;
    introReplayRef.current = true;
    const el = introBlockRef.current;
    if (!el) return;
    el.classList.remove("shift-logo-enter--on");
    void el.offsetWidth;
    el.classList.add("shift-logo-enter--on");
  }, [introVisible, prefersReducedMotion]);

  const isHome = variant === "home";

  return (
    <section
      ref={introSectionRef}
      className={
        isHome ? "relative bg-white my-14" : "relative bg-white"
      }
    >
      {isHome ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute right-0 top-1/2 h-[105%] w-[66%] scale-150 -translate-y-1/2 translate-x-1/2 bg-contain bg-center bg-no-repeat sm:h-[90%] sm:w-[50%] sm:scale-140 lg:h-[98%] lg:translate-x-[44%] xl:h-[102%] xl:translate-x-[42%] xl:scale-120 2xl:scale-100"
            style={{ backgroundImage: "url('/assets/svg/wave-shape.svg')" }}
          />
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="absolute right-0 top-1/2 h-[130%] w-[95%] -translate-y-1/2 translate-x-[38%] sm:h-[105%] sm:w-[68%] sm:translate-x-[33%] md:h-[88%] md:w-[52%] md:translate-x-[28%] bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/assets/svg/wave-shape.svg')" }}
          />
          <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-white via-white/82 to-transparent" />
        </div>
      )}

      <div
        className={
          isHome
            ? "relative z-10 mx-auto w-full max-w-[1815px] px-10 py-10 md:px-16 md:py-40 lg:px-20"
            : "relative z-10 mx-auto w-full max-w-[1380px] px-6 py-24 sm:px-10 sm:py-28 md:px-16 md:py-36 lg:px-20 lg:py-42"
        }
      >
        <div className={isHome ? "w-full max-w-[980px]" : "w-full max-w-[760px]"}>
          <div
            ref={introBlockRef}
            className={
              introVisible
                ? "shift-logo-enter shift-logo-enter--on"
                : "shift-logo-enter shift-logo-enter--concealed"
            }
          >
            {isHome && (
              <Image
                src="/assets/svg/nav-logo.svg"
                alt="Logotipo Shift Latam — agencia regional de comunicación"
                width={103}
                height={55}
                className="h-auto w-[130px] sm:w-[333px]"
                priority
              />
            )}

            <h2
              className={
                isHome
                  ? "mt-6 sm:mt-8 text-2xl sm:text-4xl md:text-[50px] [font-family:var(--font-glitz-local)] font-medium leading-[1.08] bg-[linear-gradient(96.73deg,#002E6D_19.07%,#1534DC_57.2%,#F540FF_100%)] bg-clip-text text-transparent"
                  : "text-[2.15rem] leading-[1.02] sm:text-[2.6rem] md:text-[50px] [font-family:var(--font-glitz-local)] font-medium leading-[1.08] bg-[linear-gradient(96.73deg,#002E6D_19.07%,#1534DC_57.2%,#F540FF_100%)] bg-clip-text text-transparent lg:mt-20"
              }
            >
              {isHome ? (
                <>
                  <GradientText text="Agencia de" className="bg-[linear-gradient(88.13deg,_#002E6D_-0.85%,_#1534DC_43.69%,_#F540FF_93.7%)]! lg:bg-[linear-gradient(88.13deg,_#002E6D_-0.85%,_#1534DC_33.69%,_#F540FF_63.7%)]!"/>
                  <GradientText text="Comunicación Estratégica" className="bg-[linear-gradient(88.13deg,_#002E6D_-0.85%,_#1534DC_43.69%,_#F540FF_93.7%)]! lg:bg-[linear-gradient(88.13deg,_#002E6D_-0.85%,_#1534DC_33.69%,_#F540FF_63.7%)]!"/>
                  <GradientText text="en Latinoamérica" className=" bg-[linear-gradient(88.13deg,_#002E6D_-0.85%,_#1534DC_43.69%,_#F540FF_93.7%)]! lg:bg-[linear-gradient(88.13deg,_#002E6D_-0.85%,_#1534DC_33.69%,_#F540FF_63.7%)]!"/>
                </>
              ) : (
                <>
                  <GradientText text="Servicios de" className="md:bg-[linear-gradient(94.15deg,_#0E1745_-9.8%,_#1534DC_43.51%,_#F540FF_80.34%)]!" />
                  <GradientText text="Comunicación Estratégica" className="md:bg-[linear-gradient(94.15deg,_#0E1745_-9.8%,_#1534DC_43.51%,_#F540FF_80.34%)]!" />
                  <GradientText text="en Latinoamérica" className="md:bg-[linear-gradient(94.15deg,_#0E1745_-9.8%,_#1534DC_43.51%,_#F540FF_80.34%)]!" />
                </>
              )}
            </h2>

            {isHome ? (
              <>
                <p className="mt-8 sm:mt-10 sm:max-w-[80%] text-sm sm:text-lg leading-tight text-[#111A31] [font-family:var(--font-fira-sans)]">
                  En SHIFT LATAM Porter Novelli somos una agencia de comunicación estratégica,
                  reputación corporativa y creatividad cultural con presencia regional. Diseñamos
                  estrategias que conectan reputación, cultura y crecimiento en mercados complejos
                  de Latinoamérica.
                </p>
                <div className="mt-8 sm:mt-12">
                  <OutlineArrowButton label="Conocé más" href="/services" />
                </div>
              </>
            ) : (
              <>
                <p className="mt-8 max-w-[66ch] text-[14px] leading-[1.33] text-[#0E1745] sm:mt-10 sm:text-[16px] md:text-[18px]">
                  En SHIFT LATAM ofrecemos servicios integrados de comunicación estratégica,
                  reputación corporativa, creatividad cultural, gestión de crisis, performance
                  digital y análisis de datos.
                </p>
                <p className="mt-6 max-w-[64ch] text-[14px] leading-[1.33] text-[#0E1745] sm:mt-7 sm:text-[16px] md:text-[18px]">
                  Nuestro modelo conecta estrategia, ejecución y medición bajo una gobernanza
                  regional que garantiza consistencia y resultados.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
