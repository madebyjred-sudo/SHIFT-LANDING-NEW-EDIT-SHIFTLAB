"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LabDotGrid } from "@/components/ui/lab-primitives";

type LabService = {
  id: string;
  title: string;
  body: string;
};

const SERVICES: LabService[] = [
  {
    id: "01",
    title: "Auditorías de madurez digital",
    body: "Mapeamos el estado real de tu organización: data, herramientas, criterio y cultura. Salimos con un plan de IA con horizontes claros.",
  },
  {
    id: "02",
    title: "Implementación de IA en flujos estratégicos",
    body: "Integramos modelos al ciclo de planeación, monitoreo de reputación y producción creativa. Sin reemplazar, amplificando.",
  },
  {
    id: "03",
    title: "Automatización de procesos",
    body: "Orquestación de tareas repetitivas para liberar tiempo del equipo y enfocarlo en lo que sólo el criterio humano resuelve bien.",
  },
  {
    id: "04",
    title: "Diseño de productos comunicacionales",
    body: "Herramientas internas, dashboards y micro-aplicaciones que viven dentro de tus campañas y relaciones con audiencias.",
  },
  {
    id: "05",
    title: "Dashboards ejecutivos y data intelligence",
    body: "Indicadores accionables: reputación, conversación social, performance editorial y eficiencia operativa, en un solo lugar.",
  },
];

export default function ShiftLabServiceSection() {
  // Mobile keeps the regular vertical grid (sticky horizontal scroll
  // performs poorly with touch). Desktop gets the pinned horizontal
  // showcase.
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop ? <PinnedHorizontal /> : <VerticalGrid />;
}

// ----------------------------------------------------------------------
// Desktop · pinned section, cards drift horizontally on scroll
// ----------------------------------------------------------------------
function PinnedHorizontal() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // The horizontal strip is wider than the viewport (5 cards × ~46vw +
  // gaps). We translate by ~65% of the track's own width to show all
  // cards. The first 8% of progress is "intro hold" so the title can
  // settle; the last 8% is "outro hold" with the last card visible.
  const x = useTransform(scrollYProgress, [0.08, 0.92], ["0%", "-65%"], {
    clamp: true,
  });

  // Progress bar fill (0 → 100%)
  const fillPct = useTransform(scrollYProgress, [0.08, 0.92], ["0%", "100%"], {
    clamp: true,
  });

  return (
    <section
      ref={sectionRef}
      className="relative isolate bg-[#0A0E27]"
      style={{ height: "440vh" }}
    >
      <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden">
        <LabDotGrid opacity={0.3} />

        {/* Heading */}
        <div className="relative z-10 mx-auto w-full max-w-[1380px] flex-shrink-0 px-6 md:px-12 lg:px-16 pt-32 pb-8">
          <div className="grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
            <h2 className="text-[44px] md:text-[64px] lg:text-[76px] leading-[1.02] [font-family:var(--font-glitz-local)] text-white">
              Servicios de{" "}
              <span className="text-[#5BE9FF]">innovación.</span>
            </h2>
            <p className="max-w-md [font-family:var(--font-fira-mono)] text-[13px] leading-[1.8] text-white/60">
              Cinco capas interconectadas. Se instalan por separado o en
              conjunto, según el momento de tu organización.
            </p>
          </div>
        </div>

        {/* Horizontal track */}
        <div className="relative z-10 flex flex-1 items-center overflow-hidden">
          <motion.ul
            style={{ x }}
            className="flex h-full items-center gap-6 px-6 md:px-12 lg:px-16 list-none m-0 p-0 will-change-transform"
          >
            {SERVICES.map((service, i) => (
              <CardLi key={service.id} service={service} index={i} />
            ))}
          </motion.ul>
        </div>

        {/* Progress rail */}
        <div className="relative z-10 mx-auto w-full max-w-[1380px] flex-shrink-0 px-6 md:px-12 lg:px-16 pb-10">
          <div className="flex items-center gap-4">
            <span className="[font-family:var(--font-fira-mono)] text-[11px] uppercase tracking-[0.18em] text-white/40">
              01
            </span>
            <div className="relative h-px flex-1 overflow-hidden bg-white/10">
              <motion.div
                style={{ width: fillPct }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#5BE9FF] to-[#F540FF]"
              />
            </div>
            <span className="[font-family:var(--font-fira-mono)] text-[11px] uppercase tracking-[0.18em] text-white/40">
              05
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CardLi({
  service,
  index,
}: {
  service: LabService;
  index: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay: index * 0.06 }}
      className="group relative flex h-[clamp(360px,55vh,520px)] w-[clamp(360px,46vw,520px)] flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-8 backdrop-blur-sm transition-colors duration-300 hover:border-[#F540FF]/35 hover:bg-white/[0.05]"
    >
      <span className="[font-family:var(--font-glitz-local)] text-7xl leading-none text-white/15 transition-colors duration-300 group-hover:text-[#F540FF]/55">
        {service.id}
      </span>

      <h3 className="mt-8 text-[26px] md:text-[28px] leading-[1.12] [font-family:var(--font-glitz-local)] text-white">
        {service.title}
      </h3>

      <p className="mt-5 flex-1 [font-family:var(--font-fira-mono)] text-[13.5px] leading-[1.8] text-white/65">
        {service.body}
      </p>
    </motion.li>
  );
}

// ----------------------------------------------------------------------
// Mobile / tablet · simple vertical grid (same content, no pin)
// ----------------------------------------------------------------------
function VerticalGrid() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0A0E27] py-24">
      <LabDotGrid opacity={0.3} />
      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-6 md:px-12">
        <div className="mb-14 max-w-3xl">
          <h2 className="text-[40px] md:text-[60px] leading-[1.02] [font-family:var(--font-glitz-local)] text-white">
            Servicios de{" "}
            <span className="text-[#5BE9FF]">innovación.</span>
          </h2>
          <p className="mt-6 max-w-xl [font-family:var(--font-fira-mono)] text-[14px] leading-[1.8] text-white/60">
            Cinco capas interconectadas. Se instalan por separado o en
            conjunto, según el momento de tu organización.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {SERVICES.map((service, idx) => (
            <motion.article
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-7 backdrop-blur-sm"
            >
              <span className="[font-family:var(--font-glitz-local)] text-6xl leading-none text-white/15 group-hover:text-[#F540FF]/55 transition-colors duration-300">
                {service.id}
              </span>
              <h3 className="mt-6 text-[22px] leading-[1.12] [font-family:var(--font-glitz-local)] text-white">
                {service.title}
              </h3>
              <p className="mt-4 flex-1 [font-family:var(--font-fira-mono)] text-[13px] leading-[1.75] text-white/60">
                {service.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
