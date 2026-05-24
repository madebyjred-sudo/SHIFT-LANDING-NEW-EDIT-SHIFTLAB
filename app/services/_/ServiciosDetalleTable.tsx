"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Servicios · Detalle
 *
 * Tabla pequeña editorial que sigue a las 4 cards. Cierra la sección
 * con el detalle granular de cada capa: sub-servicios concretos +
 * resultado típico de un engagement. Responde la pregunta natural
 * del visitante después de los cards: "OK, ¿qué hay adentro?".
 *
 * Source de verdad: content/knowledge/about-shift-pn.yaml (sección
 * `servicios.*.capabilities`). Si actualizás capabilities en el KB,
 * sincronizar acá manualmente.
 */

type Capa = "Estrategia" | "Creatividad" | "Media+Data" | "Crisis";

type Row = {
  capa: Capa;
  nombre: string;
  sub: string[];
  resultado: string;
};

// Color por capa — alineado con los acentos de los cards de
// HomeServiciosSection (Reputación blue, Creatividad magenta,
// Media+Data cyan, Crisis blanco). Se usa para el borde-izquierdo
// del "Resultado" en mobile y como halo sutil debajo del icon.
const CAPA_COLORS: Record<Capa, string> = {
  Estrategia: "#5BAEFF", // azul más legible sobre el navy del fondo
  Creatividad: "#F540FF",
  "Media+Data": "#5BE9FF",
  Crisis: "#FFFFFF",
};

// Iconos opaline 3D — uno por capa. Renderizados con un halo radial
// sutil del color de la capa por debajo para reforzar el código de
// color sin romper el lenguaje opaline (que es magenta/púrpura uniforme).
const CAPA_ICONS: Record<Capa, string> = {
  Estrategia: "/assets/icons/opaline/brain.png",
  Creatividad: "/assets/icons/opaline/lightning-bolt.png",
  "Media+Data": "/assets/icons/opaline/bar-chart.png",
  Crisis: "/assets/icons/opaline/warning.png",
};

const ROWS: Row[] = [
  {
    capa: "Estrategia",
    nombre: "Estrategia Corporativa y Reputación",
    sub: [
      "Auditoría reputacional",
      "Asuntos públicos",
      "ESG y sostenibilidad",
      "Comunicación interna",
      "CEO branding",
      "Narrativa institucional",
    ],
    resultado: "Plan estratégico con horizonte multi-año",
  },
  {
    capa: "Creatividad",
    nombre: "Creatividad y Campañas Integradas",
    sub: [
      "Campañas integradas regionales",
      "PR creativo y storytelling",
      "Activaciones culturales",
      "Influencer y partnerships",
      "Producción audiovisual",
      "Branded content",
    ],
    resultado: "Plataforma de campaña lista para activar",
  },
  {
    capa: "Media+Data",
    nombre: "Media Performance y Data",
    sub: [
      "Paid + earned media",
      "Escucha social en tiempo real",
      "Dashboards ejecutivos",
      "SEO / AEO",
      "Modelos de atribución",
    ],
    resultado: "Sistema de medición con dashboards en vivo",
  },
  {
    capa: "Crisis",
    nombre: "Crisis y Gestión de Riesgo",
    sub: [
      "Monitoreo y alerta temprana",
      "Manejo de vocería",
      "Stakeholders y autoridades",
      "Narrativa de respuesta",
      "Simulacros y entrenamiento",
    ],
    resultado: "Plan operativo y equipo entrenado",
  },
];

export default function ServiciosDetalleTable() {
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
            Detalle de servicios
          </p>
          <h2 className="mt-5 text-[40px] md:text-[64px] lg:text-[72px] leading-[1.02] [font-family:var(--font-glitz-local)] text-white">
            Lo que incluye{" "}
            <span className="text-[#F540FF]">cada capa.</span>
          </h2>
          <p className="mt-6 max-w-xl [font-family:var(--font-fira-mono)] text-[13.5px] md:text-[14.5px] leading-[1.8] text-white/65">
            Las cuatro áreas con sus sub-servicios y el resultado
            típico de un engagement.
          </p>
        </motion.div>

        {/* Desktop / tablet ancho — tabla 3 columnas */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-14 hidden lg:block"
        >
          {/* Header row */}
          <div
            className="grid items-end border-t border-white/15 pb-4 pt-5 [font-family:var(--font-fira-mono)] text-[10.5px] uppercase tracking-[0.18em] text-white/40"
            style={{
              gridTemplateColumns: "1.2fr 1.9fr 1.3fr",
              columnGap: "2rem",
            }}
          >
            <span>Capa</span>
            <span>Sub-servicios</span>
            <span>Resultado típico</span>
          </div>

          {/* Body rows */}
          {ROWS.map((r) => (
            <div
              key={r.capa}
              className="grid items-start border-t border-white/10 py-7"
              style={{
                gridTemplateColumns: "1.2fr 1.9fr 1.3fr",
                columnGap: "2rem",
              }}
            >
              {/* Capa name con opaline icon + color-coded halo
                  detrás. El halo es lo que mantiene el código de
                  color por capa (icon de por sí es magenta/púrpura
                  uniforme y no diferencia capas). */}
              <div className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center"
                >
                  <span
                    className="absolute inset-0 rounded-full opacity-30 blur-[10px]"
                    style={{ backgroundColor: CAPA_COLORS[r.capa] }}
                  />
                  <Image
                    src={CAPA_ICONS[r.capa]}
                    alt=""
                    width={40}
                    height={40}
                    className="relative h-10 w-10 object-contain"
                  />
                </span>
                <h3 className="mt-1 [font-family:var(--font-figtree)] text-[17px] font-semibold leading-[1.25] text-white">
                  {r.nombre}
                </h3>
              </div>

              {/* Sub-servicios (inline, separados por ·) */}
              <p className="[font-family:var(--font-fira-mono)] text-[13px] leading-[1.7] text-white/70">
                {r.sub.map((s, i) => (
                  <span key={s}>
                    {i > 0 && (
                      <span className="mx-2 text-white/25">·</span>
                    )}
                    {s}
                  </span>
                ))}
              </p>

              {/* Resultado típico — Figtree medium para que se lea como
                  el "outcome" de la fila, no como nota al pie. */}
              <p className="[font-family:var(--font-figtree)] text-[14.5px] md:text-[15px] leading-[1.45] font-medium text-white">
                {r.resultado}
              </p>
            </div>
          ))}

          {/* Closing rule */}
          <div className="border-t border-white/10" />
        </motion.div>

        {/* Mobile / tablet — bloques verticales */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-12 lg:hidden"
        >
          <div className="border-t border-white/15" />
          {ROWS.map((r) => (
            <article
              key={r.capa}
              className="border-b border-white/10 py-7"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center"
                >
                  <span
                    className="absolute inset-0 rounded-full opacity-30 blur-[10px]"
                    style={{ backgroundColor: CAPA_COLORS[r.capa] }}
                  />
                  <Image
                    src={CAPA_ICONS[r.capa]}
                    alt=""
                    width={36}
                    height={36}
                    className="relative h-9 w-9 object-contain"
                  />
                </span>
                <h3 className="mt-1 [font-family:var(--font-figtree)] text-[18px] font-semibold leading-[1.25] text-white">
                  {r.nombre}
                </h3>
              </div>

              <p className="mt-3 [font-family:var(--font-fira-mono)] text-[12.5px] leading-[1.7] text-white/70">
                {r.sub.map((s, i) => (
                  <span key={s}>
                    {i > 0 && (
                      <span className="mx-2 text-white/25">·</span>
                    )}
                    {s}
                  </span>
                ))}
              </p>

              <div className="mt-4 border-l-2 pl-3" style={{ borderColor: `${CAPA_COLORS[r.capa]}55` }}>
                <p className="[font-family:var(--font-fira-mono)] text-[10.5px] uppercase tracking-[0.18em] text-white/40">
                  Resultado
                </p>
                <p className="mt-1.5 [font-family:var(--font-figtree)] text-[14.5px] leading-[1.4] font-medium text-white">
                  {r.resultado}
                </p>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
