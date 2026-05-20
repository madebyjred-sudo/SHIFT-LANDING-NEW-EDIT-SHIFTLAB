"use client";

import Section from "@/components/common/Section";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ShiftingCultureModelSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        y: 200,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <Section className="max-w-none! pt-20 pb-5!">
      <div ref={containerRef} className="mx-auto w-full max-w-[1240px]">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:gap-12 md:text-left">
          <h2 className="text-3xl leading-[1.05] font-glitz  text-[#1534DC] md:text-4xl lg:text-[50px]">
            <span className="rotate-180 inline-block">?</span>Cómo funciona <br /> el modelo?
          </h2>

          <p className="md:max-w-[50%] lg:max-w-[55%] xl:max-w-[60%] text-[18px] font-normal [font-style:normal] leading-[125%] tracking-[0%] text-[#111A31] [font-family:var(--font-fira-sans)] [leading-trim:none] md:pt-30">
            Nuestro modelo identifica tensiones culturales relevantes,
            traduce datos en narrativas estratégicas y convierte conversaciones
            en influencia sostenible. No diseñamos campañas aisladas;
            diseñamos movimientos que impactan mercados y comunidades.
          </p>
        </div>

        <div className="mt-16 h-px w-full bg-[#1534DC] md:mt-18" />
      </div>
    </Section>
  );
}
