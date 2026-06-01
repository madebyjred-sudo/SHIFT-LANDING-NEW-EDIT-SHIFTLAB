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
  {
    imageSrc: "/assets/images/aboutus/persona-25.jpg",
    title: "Valentina Rosas Godoy",
    description: "Director Shift Venezuela",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-26-andrea.jpg",
    title: "Andrea Ramírez",
    description: "General Manager Shift \n Caribe",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-28.jpg",
    title: "María Marta Calvo",
    description: "General Manager Shift \n Honduras",
  },
  {
    imageSrc: "/assets/images/aboutus/persona-27.jpg",
    title: "Karla Cobreiro",
    description: "Office Director Miami",
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

            {/* Tablet + Desktop (md+): interactive 3D sphere con map
                de Latam de fondo. El sphere component soporta touch
                (drag con momentum) → funciona bien en tablets. En
                anteriores versiones era lg-only; ahora bajamos a md
                porque el tablet portrait (768px) tiene espacio
                suficiente y la experiencia visual es la misma. */}
            <LeadershipSphereDesktop />

            {/* Mobile (<md): grid simple con map de Latam como
                watermark de fondo (mismo asset que el sphere) — da
                continuidad visual al treatment regional sin pelearse
                con touch UX limitado en 375px. */}
            <div className="relative mt-[60px] md:hidden">
              {/* Map watermark — sutil detrás del grid */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply"
                style={{
                  backgroundImage: "url(/assets/images/regional/map.svg)",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center top",
                  backgroundSize: "120%",
                }}
              />
              <div className="relative grid gap-6 gap-y-[60px] grid-cols-2 max-w-[400px] mx-auto">
                {ABOUTUS.map((aboutus, index) => (
                  <div key={index} className="flex flex-col gap-3">
                    <div className="overflow-hidden">
                      <Image
                        src={aboutus.imageSrc}
                        alt={aboutus.title}
                        width={234}
                        height={235}
                        className="h-auto w-full object-cover rounded-[24px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[#0E1745] text-[18px] font-bold leading-[1.2] tracking-[-0.02em] [font-family:var(--font-figtree)]">
                        {aboutus.title}
                      </span>
                      <p className="text-[#F540FF] text-[13px] font-normal leading-[1.15] [font-family:var(--font-figtree)]">
                        {aboutus.description.replace(/\\n/g, " ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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

  // Track viewport width — sphere escala según el ancho disponible.
  // Min 480 para que sea usable en tablet portrait (768px - 40 padding
  // = 728 cap natural), max 980 para no reventar monitors grandes.
  const [width, setWidth] = useState<number>(0);
  useEffect(() => {
    const update = () => {
      // Padding más conservador en tablet (40 each side, 80 total),
      // pero la pantalla mínima sigue siendo md (768px) → siempre
      // tenemos al menos ~688px disponibles.
      const w = Math.min(window.innerWidth - 80, 980);
      setWidth(Math.max(480, w));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!width) {
    return <div className="hidden md:block mt-[100px] h-[600px]" aria-hidden />;
  }

  return (
    <div className="hidden md:flex mt-[60px] xl:mt-[80px] w-full justify-center">
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
