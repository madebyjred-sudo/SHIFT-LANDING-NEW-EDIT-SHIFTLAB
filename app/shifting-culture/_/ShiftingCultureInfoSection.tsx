"use client";

import Image from "next/image";
import TextSection from "@/components/common/TextSection";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ShiftingCultureInfoSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });

      // Both elements move together from left to right at exactly the same time
      tl.from(
        [".animate-text", ".animate-spring"],
        {
          x: -150,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
        },
        0 // The '0' ensures it starts at the very beginning of the timeline
      )
        // Spring image additionally zooms out simultaneously
        .from(
          ".animate-spring",
          {
            scale: 1.2,
            duration: 1,
            ease: "power2.out",
          },
          0 // Also starts at '0'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const backgroundImage = (
    <div className="pointer-events-none absolute -right-10 top-[0%] z-0 h-full w-auto">
      <div className="animate-spring h-full w-auto origin-center">
        <Image
          src="/assets/svg/spring.svg"
          alt="Elemento gráfico decorativo tipo resorte — Shifting Culture"
          aria-hidden="true"
          width={849}
          height={728}
          className="h-full w-auto md:scale-[110%] lg:scale-[220%]"
        />
      </div>
    </div>
  );

  const mainText = (
    <p className="animate-text w-full [font-family:var(--font-fira-sans)] max-w-[380px] pt-4 md:pt-1 text-base leading-tight text-[#111A31] sm:text-lg">
      <span>
        <strong className="text-[#F540FF]">
          Shifting Culture® es el modelo propietario de SHIFT LATAM que conecta cultura, reputación y negocio en un solo sistema estratégico.
        </strong>{" "}
        Creemos que las marcas no compiten por atención, sino por significado, y ese significado se construye desde la cultura.
      </span>
    </p>
  );

  return (
    <div className="relative z-10 py-10" ref={containerRef}>
      <TextSection
        backgroundImage={backgroundImage}
        mainText={mainText}
        subText={<></>}
      />
    </div>
  );
}
