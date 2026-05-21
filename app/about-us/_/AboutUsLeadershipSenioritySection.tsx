"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import GradientText from "@/components/ui/GradientText";
import SphereImageGrid, { type SphereImageItem } from "@/components/ui/img-sphere";

const ABOUTUS = [
  {
    imageSrc: "/assets/images/aboutus/persona-1.jpg",
    title: "Rodrigo Castro",
    description: "CEO Shift Latam",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-2.jpg",
    title: "Gabriela Piedra",
    description: "Senior VP Shift Latam",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-3.jpg",
    title: "Oscar Solano",
    description: "VP - CCO & CSO Shift \n Latam",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-4.jpg",
    title: "Gonzalo Piñeros",
    description: "General Manager Shift \n Colombia",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-5.jpg",
    title: "Angélica Moreno",
    description: "General Manager Shift \n Ecuador",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-6.jpg",
    title: "Camila Ferreiro",
    description: "General Manager Shift \n El Salvador",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-7.jpg",
    title: "Andrea Gandara",
    description: "General Director Shift \n Guatemala",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-8.jpg",
    title: "Rosario Montenero",
    description: "General Manager Shift \n Nicaragua",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-9.jpg",
    title: "Sarah Beirute",
    description: "VP PR & Experience \n Shift Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-10.jpg",
    title: "Camila Chaquea",
    description: "Chief Digital Officer \n Shift Colombia",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-11.jpg",
    title: "Fabiana Martínez",
    description: "Business Development \n Director Shift Latam",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-12.jpg",
    title: "Daniela Biffi",
    description: "General Manager Miami",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-13.jpg",
    title: "Ana Fonseca",
    description: "Operations Lead Shift \n Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-14.jpg",
    title: "Nathy Chinchilla",
    description: "Head of Creative Shift \n Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-15.jpg",
    title: "Ana Solera",
    description: "Creative Art Director \n Shift Latam",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-16.jpg",
    title: "Andrés Herrera",
    description: "Innovation & Digital \n Director Shift Guatemala",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-17.jpg",
    title: "Paula Rozo",
    description: "General Account \n Director Shift Colombia",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-18.jpg",
    title: "Loly Cando",
    description: "General Account \n Director Shift Ecuador",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-19.jpg",
    title: "Johanna Perlaza",
    description: "Account Director Shift \n Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-20.jpg",
    title: "Pamela Campos",
    description: "Account Director Shift \n Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-21.jpg",
    title: "Melanie Méndez",
    description: "Account Supervisor Shift \n Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-22.jpg",
    title: "Johanna Mora",
    description: "Account Supervisor \n Shift Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-23.jpg",
    title: "Carmen Mata",
    description: "Experience Lead Shift \n Costa Rica",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-24.jpg",
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

            {/* Desktop (lg+): interactive 3D sphere with hover-reveal names */}
            <LeadershipSphereDesktop />

            {/* Mobile / tablet: keep original grid */}
            <div className="mt-[100px] grid gap-4 min-[450px]:gap-10 sm:gap-6 gap-y-[80px] grid-cols-2 sm:grid-cols-4 max-w-[400px] sm:max-w-full mx-auto sm:mx-0 lg:hidden">
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

// -----------------------------------------------------------------------------
// Desktop-only: 3D rotating sphere with hover-reveal names.
// Hidden below lg breakpoint; the original grid takes over there.
// Sphere size adapts to the available width so it scales on huge monitors.
// -----------------------------------------------------------------------------
function LeadershipSphereDesktop() {
  const items: SphereImageItem[] = useMemo(
    () =>
      ABOUTUS.map((a, i) => ({
        id: `leader-${i}`,
        src: a.imageSrc,
        alt: a.title,
        name: a.title,
        role: a.description.replace(/\\n/g, " ").replace(/\s+/g, " ").trim(),
      })),
    []
  );

  // Track viewport width so we can scale the sphere container responsively.
  const [width, setWidth] = useState<number>(0);
  useEffect(() => {
    const update = () => {
      const w = Math.min(window.innerWidth - 80, 980);
      setWidth(Math.max(560, w));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!width) {
    return <div className="hidden lg:block mt-[100px] h-[700px]" aria-hidden />;
  }

  return (
    <div className="hidden lg:flex mt-[60px] xl:mt-[80px] w-full justify-center">
      <div
        className="relative"
        style={{ width: `${width}px`, height: `${width}px` }}
      >
        {/* Croquis dotted de Latinoamérica detrás del sphere.
            mix-blend-mode: multiply elimina el blanco del gradient del SVG
            para que solo se vean los puntos azules como watermark. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 mix-blend-multiply"
          style={{
            backgroundImage: "url(/assets/images/regional/map.svg)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "110%",
          }}
        />

        <SphereImageGrid
          images={items}
          containerSize={width}
          sphereRadius={width * 0.4}
          baseImageScale={0.18}
          autoRotate
          autoRotateSpeed={0.06}
          dragSensitivity={0.45}
          momentumDecay={0.97}
          maxRotationSpeed={4}
          perspective={1200}
          className="relative z-10"
        />
      </div>
    </div>
  );
}
