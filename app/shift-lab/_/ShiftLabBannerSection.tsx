"use client";

import { motion } from "framer-motion";
import { LabDotGrid } from "@/components/ui/lab-primitives";
import ShiftLabEcoCard from "./ShiftLabEcoCard";
import ShiftLabBrandhubCard from "./ShiftLabBrandhubCard";
import EscuchaGratis from "@/components/escucha/EscuchaGratis";

/**
 * Shift LAB · Banner — la familia de apps de Shift Lab conviviendo como
 * hermanas: Eco (tema claro) y Brandhub (sistema de su app, navy). Cada una
 * rompe con el diseño de la landing a propósito y trae el mundo de su producto.
 * En desktop van al lado, mismo tamaño; en pantallas menores se apilan.
 *
 * A propósito rompe el ancho del resto de la landing (max-w-[1380px]): esta
 * fila va DE BORDE A BORDE, con gutters chicos, porque es el estante de apps
 * de Shift Lab y va a sumar más hermanas (carrusel/grilla).
 */
export default function ShiftLabBannerSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0A0E27] pb-20 md:pb-28">
      <LabDotGrid opacity={0.2} />

      <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 2xl:px-10">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <ShiftLabEcoCard />
          </motion.div>

          <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            <ShiftLabBrandhubCard />
          </motion.div>
        </div>

        {/* Escucha gratis: la parte interactiva del dossier, aquí mismo.
            La misma herramienta vive sola en /shift-lab/escucha-gratis (pauta). */}
        <motion.div
          id="escucha-gratis"
          className="mx-auto mt-20 w-full max-w-[1380px] scroll-mt-28 md:mt-28"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#5BE9FF] [font-family:var(--font-figtree)]">Pruébalo con tu marca</p>
          <h2 className="mt-3 max-w-4xl text-[32px] font-bold leading-[1.08] text-white md:text-[48px] [font-family:var(--font-zilla-slab)]">
            Escucha gratis lo que dicen de ti <span className="text-[#F540FF]">la IA</span>, las redes y los medios.
          </h2>
          <div className="mt-8">
            <EscuchaGratis variante="seccion" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
