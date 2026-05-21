"use client";

import { motion } from "framer-motion";
import { LabDotGrid, LabScanlines } from "@/components/ui/lab-primitives";

/**
 * Shift LAB · Philosophy — "No usamos IA como tendencia".
 * Editorial layout: big quote-style headline on the left, a clean side
 * panel with two contrasting principles on the right (no diff syntax).
 */

const CONTRAST = [
  {
    no: "Modelos opacos que deciden solos.",
    yes: "Humano y máquina en el mismo flujo.",
  },
  {
    no: "Demos de IA sin caso de negocio.",
    yes: "IA al servicio de la estrategia.",
  },
  {
    no: "Adopción por hype.",
    yes: "Adopción por evidencia.",
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
            <h2 className="max-w-[14ch] text-[44px] md:text-[76px] lg:text-[96px] leading-[0.98] [font-family:var(--font-glitz-local)] text-white">
              No usamos
              <br />
              <span className="text-white/30">IA como</span>
              <br />
              <span className="text-[#F540FF]">tendencia.</span>
            </h2>

            <p className="mt-10 max-w-xl [font-family:var(--font-fira-mono)] text-[14px] md:text-[15px] leading-[1.8] text-white/70">
              La integramos como flujo operativo para mejorar análisis,
              acelerar decisiones y potenciar el criterio humano.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-7 lg:pt-8"
          >
            {CONTRAST.map((row, i) => (
              <div key={i} className="border-l border-white/10 pl-5">
                <p className="[font-family:var(--font-fira-mono)] text-[12.5px] uppercase tracking-[0.14em] text-white/35 line-through decoration-white/20">
                  {row.no}
                </p>
                <p className="mt-2 [font-family:var(--font-figtree)] text-[16px] md:text-[17px] leading-[1.35] font-semibold text-white">
                  {row.yes}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
