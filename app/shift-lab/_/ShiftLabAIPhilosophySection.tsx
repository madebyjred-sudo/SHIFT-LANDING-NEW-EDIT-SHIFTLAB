"use client";

import { motion } from "framer-motion";
import { LabDotGrid, LabScanlines } from "@/components/ui/lab-primitives";

/**
 * Shift LAB · Philosophy — "Construimos donde vive la IA y se vuelve útil".
 *
 * Editorial layout: 3-line affirmative headline on the left, side panel
 * with 3 principles (title + body) on the right. No contrast / no
 * line-through — la copy es positiva, no defensiva.
 *
 * Positioning nuance (see /Users/juan/AGENTS/LANDING/notes/2026-05-23-
 * positioning-nuance-build-vs-make.md): NO atribuirnos autoría sobre
 * los modelos. Compramos los modelos; construimos la capa donde viven
 * y se vuelven útiles para briefs de comunicación.
 */

const CAPABILITIES = [
  {
    title: "Diseño + Ingeniería",
    body: "Diseñamos asistentes, sistemas internos, herramientas digitales y dashboards. El equipo de ingeniería y diseño trabaja junto a los estrategas de Shift desde el día uno del brief.",
  },
  {
    title: "Inteligencia aplicada",
    body: "Integramos modelos de IA al núcleo de procesos de comunicación. Aceleran la investigación, el monitoreo, la planeación y la producción. El equipo gana tiempo para narrativa, posicionamiento y relación.",
  },
  {
    title: "Operación continua",
    body: "Los productos siguen vivos después del lanzamiento. Los operamos junto al equipo cliente, los mantenemos al día y los evolucionamos cada vez que aparece un brief nuevo.",
  },
];

export default function ShiftLabAIPhilosophySection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0E1745] py-24 md:py-36">
      <LabDotGrid opacity={0.28} />
      <LabScanlines />

      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-6 md:px-12 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="max-w-[18ch] text-[44px] md:text-[76px] lg:text-[96px] leading-[0.98] [font-family:var(--font-zilla-slab)] font-bold text-white">
              Construimos
              <br />
              donde vive la IA
              <br />
              <span className="text-[#F540FF]">y se vuelve útil.</span>
            </h2>

            <p className="mt-10 max-w-xl [font-family:var(--font-fira-mono)] text-[14px] md:text-[15px] leading-[1.8] text-white/70">
              Es la unidad donde diseñamos, construimos y operamos los
              productos de IA que Shift Latam usa con sus clientes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-7 lg:pt-8"
          >
            {CAPABILITIES.map((p, i) => (
              <div key={i} className="border-l border-[#F540FF]/30 pl-5">
                <h3 className="[font-family:var(--font-figtree)] text-[16px] md:text-[17px] font-semibold text-white leading-[1.35]">
                  {p.title}
                </h3>
                <p className="mt-2 [font-family:var(--font-fira-mono)] text-[12.5px] md:text-[13px] leading-[1.7] text-white/65">
                  {p.body}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
