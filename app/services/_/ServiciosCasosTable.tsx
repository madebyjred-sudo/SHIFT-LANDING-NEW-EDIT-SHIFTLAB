"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/**
 * Servicios · Casos destacados
 *
 * Tabla editorial pequeña que cierra el área de servicios con prueba
 * concreta: campañas, partnerships y herramientas ya publicadas.
 * Pensada para que el visitante de marketing pase del catálogo
 * abstracto (cards arriba) a la evidencia verificable (cliente +
 * reconocimiento público).
 *
 * Casos vienen de fuentes públicas verificadas (Cannes, PRWeek,
 * Latinspots, El Financiero, telediario.cr). Si agregás nuevos,
 * mantené el mismo estándar: tiene que poder linkearse a una nota.
 */

type Capa = "Estrategia" | "Creatividad" | "Media+Data" | "Crisis";

type Caso = {
  titulo: string;
  cliente: string;
  capa: Capa;
  ano: string;
  reconocimiento: string;
};

// Map cada capa a su color de brand (decision: usar los 3 colores del
// sistema más blanco, una por capa, para que cada categoría sea
// reconocible de un vistazo).
const CAPA_COLORS: Record<Capa, string> = {
  Estrategia: "#1534DC",
  Creatividad: "#F540FF",
  "Media+Data": "#5BE9FF",
  Crisis: "#FFFFFF",
};

const CASOS: Caso[] = [
  {
    titulo: "Bienvenidos al Grupo",
    cliente: "con PHD + RIOT/TBWA CR",
    capa: "Creatividad",
    ano: "2024",
    reconocimiento: "Cannes Lions — Bronce Glass + Plata PR",
  },
  {
    titulo: "Cambiemos la Regla",
    cliente: "Garnier Group + Nosotras Women Connecting",
    capa: "Crisis",
    ano: "2024",
    reconocimiento: "Ley de higiene menstrual aprobada en CR",
  },
  {
    titulo: "Colors of Costa Rica",
    cliente: "Instituto Costarricense de Turismo (ICT)",
    capa: "Creatividad",
    ano: "2025",
    reconocimiento: "Plataforma país con Mario Hernández",
  },
  {
    titulo: "BIT Centenario",
    cliente: "Microsoft · Minecraft Education",
    capa: "Creatividad",
    ano: "2022",
    reconocimiento: "SABRE Awards LATAM",
  },
  {
    titulo: "Brand Influence Index",
    cliente: "El Financiero CR",
    capa: "Media+Data",
    ano: "2026",
    reconocimiento: "Herramienta propietaria de medición behavioral",
  },
];

export default function ServiciosCasosTable() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0E1745] py-24 md:py-32">
      <div className="mx-auto w-full max-w-[1380px] px-6 md:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <p className="[font-family:var(--font-fira-mono)] text-[11px] uppercase tracking-[0.2em] text-white/40">
            Casos destacados
          </p>
          <h2 className="mt-5 text-[40px] md:text-[64px] lg:text-[72px] leading-[1.02] [font-family:var(--font-glitz-local)] text-white">
            Lo que ya está{" "}
            <span className="text-[#5BE9FF]">afuera.</span>
          </h2>
          <p className="mt-6 max-w-xl [font-family:var(--font-fira-mono)] text-[13.5px] md:text-[14.5px] leading-[1.8] text-white/65">
            Una selección de campañas, partnerships y herramientas
            publicadas — verificable en prensa.
          </p>
        </motion.div>

        {/* Desktop table */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-14 hidden lg:block"
        >
          {/* Header row */}
          <div
            className="grid items-end border-t border-[#5BE9FF]/30 pb-4 pt-5 [font-family:var(--font-fira-mono)] text-[10.5px] uppercase tracking-[0.18em] text-white/40"
            style={{
              gridTemplateColumns: "1.6fr 1.4fr 0.9fr 1.8fr",
              columnGap: "1.5rem",
            }}
          >
            <span>Caso</span>
            <span>Cliente / partners</span>
            <span>Capa</span>
            <span>Año · Reconocimiento</span>
          </div>

          {/* Rows */}
          {CASOS.map((c) => (
            <div
              key={c.titulo}
              className="grid items-center border-t border-white/10 py-7"
              style={{
                gridTemplateColumns: "1.6fr 1.4fr 0.9fr 1.8fr",
                columnGap: "1.5rem",
              }}
            >
              <h3 className="[font-family:var(--font-figtree)] text-[17px] font-semibold leading-[1.25] text-white">
                <span className="mr-2 text-[#F540FF]">·</span>
                {c.titulo}
              </h3>
              <p className="[font-family:var(--font-fira-mono)] text-[12.5px] leading-[1.5] text-white/65">
                {c.cliente}
              </p>
              <div>
                <span
                  className="inline-block rounded-full border px-3 py-1 [font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.15em]"
                  style={{
                    color: CAPA_COLORS[c.capa],
                    borderColor: `${CAPA_COLORS[c.capa]}55`,
                    backgroundColor: `${CAPA_COLORS[c.capa]}12`,
                  }}
                >
                  {c.capa}
                </span>
              </div>
              <p className="[font-family:var(--font-fira-mono)] text-[12.5px] leading-[1.5] text-white/85">
                <span className="text-white/55">{c.ano}</span>
                <span className="mx-2 text-white/30">·</span>
                {c.reconocimiento}
              </p>
            </div>
          ))}

          {/* Closing footer line — subtle CTA hacia /awards */}
          <div className="mt-2 flex items-center justify-end border-t border-white/10 pt-5">
            <Link
              href="/awards"
              className="group inline-flex items-center gap-2 [font-family:var(--font-fira-mono)] text-[12px] uppercase tracking-[0.16em] text-white/55 transition-colors hover:text-white"
            >
              <span>Ver todos los premios</span>
              <span className="text-[#5BE9FF] transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Mobile / tablet — cada caso como bloque vertical */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-12 lg:hidden"
        >
          <div className="border-t border-[#5BE9FF]/30" />
          {CASOS.map((c) => (
            <article
              key={c.titulo}
              className="border-b border-white/10 py-7"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className="inline-block rounded-full border px-2.5 py-1 [font-family:var(--font-fira-mono)] text-[9.5px] uppercase tracking-[0.15em]"
                  style={{
                    color: CAPA_COLORS[c.capa],
                    borderColor: `${CAPA_COLORS[c.capa]}55`,
                    backgroundColor: `${CAPA_COLORS[c.capa]}12`,
                  }}
                >
                  {c.capa}
                </span>
                <span className="[font-family:var(--font-fira-mono)] text-[11.5px] text-white/55">
                  {c.ano}
                </span>
              </div>
              <h3 className="mt-3 [font-family:var(--font-figtree)] text-[18px] font-semibold leading-[1.25] text-white">
                <span className="mr-2 text-[#F540FF]">·</span>
                {c.titulo}
              </h3>
              <p className="mt-2 [font-family:var(--font-fira-mono)] text-[12.5px] leading-[1.55] text-white/85">
                {c.reconocimiento}
              </p>
              <p className="mt-2 [font-family:var(--font-fira-mono)] text-[12px] leading-[1.5] text-white/55">
                {c.cliente}
              </p>
            </article>
          ))}
          <div className="mt-6 flex items-center justify-end">
            <Link
              href="/awards"
              className="group inline-flex items-center gap-2 [font-family:var(--font-fira-mono)] text-[12px] uppercase tracking-[0.16em] text-white/55 transition-colors hover:text-white"
            >
              <span>Ver todos los premios</span>
              <span className="text-[#5BE9FF] transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
