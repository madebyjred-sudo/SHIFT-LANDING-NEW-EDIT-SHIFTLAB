"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import GradientText from "@/components/ui/GradientText";

function subscribePrefersReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getPrefersReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function HomeIntroSection() {
  const introSectionRef = useRef<HTMLElement>(null);
  const introBlockRef = useRef<HTMLDivElement>(null);
  const [introVisible, setIntroVisible] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    () => false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (introVisible) return;

    const target = introSectionRef.current;
    if (!target) return;

    // Fallback for older browsers: reveal immediately instead of waiting for scroll percentage.
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
      {
        threshold: 0.3,
      }
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

  return (
    <section ref={introSectionRef} className="relative bg-white mb-14 md:mb-14 ">
      {/* Clip only the decorative wave so intro slide (translateY) is not cropped */}

      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-10 pt-28 pb-10 md:px-16 md:pt-40 md:pb-10 lg:px-20">
        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between  sm:gap-4 md:gap-6">

            <h2 className="max-w-[632px] mt-6 sm:mt-8 text-2xl sm:text-[50px] [font-family:var(--font-glitz-local)] font-normal leading-[1.08] bg-linear-to-r from-[#1534DC] via-[#2A43E6] to-[#F540FF] bg-clip-text text-transparent">
              <GradientText text="Agencia de Comunicación" />
              <GradientText text="y Relaciones Públicas" />
              <GradientText text="en Latinoamérica" />
            </h2>

            <p className="mt-8 sm:mt-10 max-w-[770px] sm:max-w-[535px] text-sm sm:text-lg leading-tight text-[#111A31] [font-family:var(--font-fira-sans)]">
              Shift Latam Afiliado a Omnicom PR es una agencia de comunicación estratégica y relaciones públicas con más de 40 años de experiencia regional. Operamos como una red integrada que combina consultoría, creatividad, data e innovación para construir reputaciones sólidas en mercados complejos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
