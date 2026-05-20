"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import GradientText from "@/components/ui/GradientText";

const ABOUTUS = [
  {
    imageSrc: "/assets/images/aboutus/persona-1.png",
    title: "Rodrigo Castro",
    description: "CEO Shift Latam",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-2.png",
    title: "Gabriela Piedra",
    description: "Senior VP Shift Latam",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-3.png",
    title: "Oscar Solano",
    description: "VP - CCO & CSO Shift \n Latam",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-4.png",
    title: "Gonzalo Piñeros",
    description: "General Manager Shift \n Colombia",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-5.png",
    title: "Angélica Moreno",
    description: "General Manager Shift \n Ecuador",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-6.png",
    title: "Camila Ferreiro",
    description: "General Manager Shift \n El Salvador",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-7.png",
    title: "Andrea Gandara",
    description: "General Director Shift \n Guatemala",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-8.png",
    title: "Rosario Montenero",
    description: "General Manager Shift \n Nicaragua",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-9.png",
    title: "Sarah Beirute",
    description: "VP PR & Experience \n Shift Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-10.png",
    title: "Camila Chaquea",
    description: "Chief Digital Officer \n Shift Colombia",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-11.png",
    title: "Fabiana Martínez",
    description: "Business Development \n Director Shift Latam",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-12.png",
    title: "Daniela Biffi",
    description: "General Manager Miami",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-13.png",
    title: "Ana Fonseca",
    description: "Operations Lead Shift \n Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-14.png",
    title: "Nathy Chinchilla",
    description: "Head of Creative Shift \n Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-15.png",
    title: "Ana Solera",
    description: "Creative Art Director \n Shift Latam",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-16.png",
    title: "Andrés Herrera",
    description: "Innovation & Digital \n Director Shift Guatemala",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-17.png",
    title: "Paula Rozo",
    description: "General Account \n Director Shift Colombia",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-18.png",
    title: "Loly Cando",
    description: "General Account \n Director Shift Ecuador",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-19.png",
    title: "Johanna Perlaza",
    description: "Account Director Shift \n Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-20.png",
    title: "Pamela Campos",
    description: "Account Director Shift \n Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-21.png",
    title: "Melanie Méndez",
    description: "Account Supervisor Shift \n Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-22.png",
    title: "Johanna Mora",
    description: "Account Supervisor \n Shift Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-23.png",
    title: "Carmen Mata",
    description: "Experience Lead Shift \n Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-24.png",
    title: "Laura Hurtado",
    description: "Digital Director Shift \n Colombia",
  },
] as const;

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
    <section ref={introSectionRef} className="relative bg-white my-14">
      {/* Clip only the decorative wave so intro slide (translateY) is not cropped */}

      <div className="relative z-10 mx-auto w-full max-w-[1815px] px-10 py-10 md:px-16 md:py-40 lg:px-20">
        <div className="w-full">
          <div className="sm:flex-row sm:justify-between gap-[40px] sm:gap-0">

            <h2 className="max-w-[632px] text-center sm:text-left mt-6 sm:mt-8 text-3xl sm:text-[50px] [font-family:var(--font-glitz-local)] font-normal leading-[1.08] bg-linear-to-r from-[#1534DC] via-[#2A43E6] to-[#F540FF] bg-clip-text text-transparent">
              <GradientText text="Liderazgo y Seniority" className="bg-[linear-gradient(94.15deg,_#0E1745_-9.8%,_#1534DC_43.51%,_#F540FF_80.34%)]!" />
            </h2>

            <p className="mt-8 sm:mt-4 text-center sm:text-left max-w-[610px] sm:max-w-[785px] text-sm sm:text-lg leading-tight text-[#111A31] [font-family:var(--font-fira-sans)]">
              Nuestro equipo senior combina experiencia en consultoría estratégica, reputación corporativa, crisis, innovación y transformación digital.
            </p>

            <div className="mt-[100px] grid gap-4 min-[450px]:gap-10 sm:gap-6 gap-y-[80px] grid-cols-2 sm:grid-cols-4 max-w-[400px] sm:max-w-full mx-auto sm:mx-0">
              {ABOUTUS.map((aboutus, index) => (
                <div key={index} className="flex flex-col gap-4">
                  <div className="overflow-hidden ">
                    <Image
                      src={aboutus.imageSrc}
                      alt={aboutus.title}
                      width={234}
                      height={235}
                      className="h-auto w-full object-cover rounded-[32px] sm:max-w-[234px] sm:max-h-[235px]"
                    />
                  </div>

                  <div className="flex flex-col gap-2 ">
                    <span className="text-[#0E1745] text-[28px] font-bold leading-[140%] tracking-[-0.03em] [font-family:var(--font-figtree)]">
                      {aboutus.title}
                    </span>
                    <p
                      className="xl:whitespace-pre-line text-[#F540FF] text-[16px] font-normal [font-style:normal] leading-[106%] tracking-[0%] [font-family:var(--font-figtree)] [leading-trim:none]"
                    >
                      {aboutus.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
