"use client";

import { motion } from "framer-motion";
import { LabDotGrid } from "@/components/ui/lab-primitives";

/**
 * Shift LAB · About — editorial layout. Two columns on desktop: a Glitz
 * headline on the left and a mono lede with stat block on the right.
 * No code adornment.
 */

const STATS = [
  { value: "40+", label: "Años de criterio" },
  { value: "120+", label: "Premios regionales" },
  { value: "12", label: "Mercados activos" },
  { value: "∞", label: "Casos de uso IA" },
];

export default function ShiftLabInfoSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0A0E27] py-24 md:py-32">
      <LabDotGrid opacity={0.3} />

      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-6 md:px-12 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="max-w-3xl text-[40px] md:text-[64px] lg:text-[76px] leading-[1.02] [font-family:var(--font-glitz-local)] text-white">
              La unidad de
              <br />
              <span className="text-[#5BE9FF]">innovación</span> +{" "}
              <span className="text-[#F540FF]">IA</span>
              <br />
              de Shift Latam.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-10"
          >
            <p className="max-w-xl [font-family:var(--font-fira-mono)] text-[14px] md:text-[15px] leading-[1.8] text-white/70">
              Integramos tecnología, creatividad y negocio para generar
              eficiencia, profundidad estratégica y ventaja competitiva. No
              vendemos una herramienta — diseñamos el sistema donde tu equipo
              decide mejor.
            </p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-8 border-t border-white/10 pt-10">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="[font-family:var(--font-glitz-local)] text-5xl md:text-6xl leading-none text-white">
                    {s.value}
                  </div>
                  <div className="mt-3 [font-family:var(--font-fira-mono)] text-[11px] uppercase tracking-[0.18em] text-white/45">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
