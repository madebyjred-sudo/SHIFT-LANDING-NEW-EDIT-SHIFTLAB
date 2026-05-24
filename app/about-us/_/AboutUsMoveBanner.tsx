"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import AutoplayLoopVideo from "@/components/common/AutoplayLoopVideo";

/**
 * "Nuestro Enfoque" banner — video full-bleed con texto overlay.
 *
 * El video nuevo (SHIFTWEB.mp4 → shiftweb.mp4) ya no incluye texto
 * dentro del frame, así que el texto vuelve a vivir como overlay CSS
 * encima del video (como estaba originalmente). Reveal animado vía
 * IntersectionObserver — la headline y el párrafo se desvanecen +
 * deslizan hacia arriba al entrar al viewport.
 *
 * Tint sutil para asegurar legibilidad del texto blanco sobre cualquier
 * frame del video, independiente de la luminosidad del subject.
 */
export default function AboutUsMoveBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = sectionRef.current;
    if (!target) return;

    // Fallback para browsers sin IntersectionObserver — mostramos
    // el texto desde el inicio en vez de quedarse oculto.
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (entry.intersectionRatio < 0.6) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: [0.6] }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden bg-white pt-4 md:pt-8 lg:pt-16">
      <div className="relative mx-auto h-[360px] w-full sm:h-[520px] md:h-[700px] lg:h-[879px]">
        <AutoplayLoopVideo
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src="/assets/videos/about/shiftweb.mp4"
          mimeType="video/mp4"
        />

        {/* Tint sutil — asegura legibilidad del texto blanco sin
            opacar demasiado el video. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 bg-black/25"
        />

        {/* Spring decoration — slide-in desde la izquierda al entrar
            al viewport. Acompaña visualmente al título. */}
        <Image
          src="/assets/svg/spring.svg"
          alt="Elemento gráfico decorativo — banner Nosotros"
          aria-hidden="true"
          width={849}
          height={728}
          className={`pointer-events-none absolute right-[-8%] top-1/2 z-10 h-auto w-[72%] -translate-y-1/2 transform transition-all duration-1000 ease-out md:right-[-2%] md:w-[54%] ${
            isVisible ? "translate-x-0 opacity-100" : "-translate-x-32 opacity-0"
          }`}
        />

        {/* Texto overlay — h2 + párrafo centrados, con reveal
            animado al entrar al viewport. */}
        <div
          className={`absolute inset-0 z-20 flex items-center justify-center px-6 text-center transition-all duration-1000 ease-out md:px-14 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
          }`}
        >
          <div
            className={`max-w-[980px] transform text-white transition-all duration-900 ease-out delay-150 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
            }`}
          >
            <h2 className="font-glitz text-[48px] leading-[0.95] md:text-[84px]">
              Nuestro enfoque
            </h2>
            <p className="mx-auto mt-4 max-w-[900px] font-sans text-[12px] leading-[1.3] text-white/95 md:mt-5 md:text-[18px]">
              Integramos estrategia, creatividad, asuntos públicos, data e inteligencia
              artificial para diseñar soluciones de comunicación con impacto medible.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
