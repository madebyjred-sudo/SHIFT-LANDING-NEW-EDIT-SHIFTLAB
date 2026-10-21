"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CASAS } from "@/lib/escucha/casas";
import { ECO_REAL, FECHA_DATOS } from "@/lib/escucha/datos-reales";
import type { ResIA } from "@/lib/escucha/cliente";

/* Escena fija de Eco: la pantalla se queda quieta y el scroll cuenta la historia.
 * 1) Alguien le pregunta a la IA.  2) Las siete IA responden y la marca se
 * apaga en más de la mitad.  3) El radar de Eco barre y mide cada pregunta. */

/* Centro y radio del anillo de casas, relativos al centro de la columna: el radar usa los mismos.
 * En teléfono el anillo se achica para que las siete quepan con margen. */
const CY = 40;
function useRadio() {
  const [r, setR] = useState(165);
  useEffect(() => {
    const f = () => setR(window.innerWidth < 640 ? Math.min(128, (window.innerWidth - 90) / 2) : 165);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return r;
}

const BEATS_BASE = [
  { t: "Alguien le pregunta a una IA qué marca elegir.", s: "No busca en Google. No hace clic. Se queda con la respuesta." },
  { t: "Siete IA responden. En más de la mitad, tu marca no está.", s: `Solo el ${((ECO_REAL.nombrada / ECO_REAL.respuestas) * 100).toFixed(1).replace(".", ",")}% de ${ECO_REAL.respuestas.toLocaleString("es-CR")} respuestas nombra a la marca medida.` },
  { t: "Eco escucha cada pregunta, en cada IA, cada semana.", s: "Y te dice dónde estás, dónde no, quién ocupa tu lugar y qué publicar para volver." },
];

/* Con escucha: la pregunta que se le hizo a las IA, la respuesta real de una
 * de ellas tecleándose, y en el anillo se apagan las que NO nombraron a la marca. */
function limpiar(t: string, n = 210) {
  const s = t.replace(/\*\*|__|#+\s|\[\d+\]/g, "").replace(/\s+/g, " ").trim();
  if (s.length <= n) return s;
  const corte = s.slice(0, n);
  return corte.slice(0, corte.lastIndexOf(" ")) + "…";
}

export default function EscenaEco({ marca, pais, resultados }: { marca?: string; pais?: string; resultados?: ResIA[] }) {
  const validas = resultados?.filter((r) => !r.error) ?? [];
  const nombran = validas.filter((r) => r.nombra).length;
  const voz = validas.find((r) => r.nombra) ?? validas.find((r) => r.conoce) ?? validas[0];
  const casaVoz = CASAS.find((c) => c.key === voz?.key);
  const respuesta = voz ? limpiar(voz.answer) : "";
  const BEATS = marca && resultados
    ? [
        { t: `Alguien le pregunta a la IA por ${marca}.`, s: `No busca en Google. No hace clic. Se queda con lo que ${casaVoz?.nombre ?? "la IA"} le responde.` },
        { t: nombran === validas.length ? `Las ${validas.length} IA nombran a ${marca}.` : `${nombran} de ${validas.length} IA nombran a ${marca}.`, s: nombran === validas.length ? "Hoy, con esta pregunta. Con las preguntas de tu categoría la cuenta cambia: ahí no preguntan por ti." : "Las demás no te conocen o hablan de otra cosa. Y esa es la pregunta fácil: la que trae tu nombre." },
        BEATS_BASE[2],
      ]
    : BEATS_BASE;
  const R = useRadio();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);
  useMotionValueEvent(p, "change", (v) => setBeat(v < 0.33 ? 0 : v < 0.66 ? 1 : 2));

  const escalaPregunta = useTransform(p, [0, 0.2, 0.36], [1, 1, 0.62]);
  const yPregunta = useTransform(p, [0.2, 0.36], [0, CY - R - 78]);
  const radar = useTransform(p, [0.62, 1], [0, 1]);
  const tipeo = useTransform(p, [0, 0.16], [0, 1]);
  const pregunta = marca ? `Cuéntame sobre ${marca}${pais ? ` en ${pais}` : ""}.` : "¿Qué marca me recomiendas?";
  const [n, setN] = useState(0);
  useMotionValueEvent(tipeo, "change", (v) => setN(Math.round(v * pregunta.length)));
  // La respuesta se teclea después de la pregunta y se va cuando aparecen las siete.
  const tipeoR = useTransform(p, [0.12, 0.28], [0, 1]);
  const [nr, setNr] = useState(0);
  useMotionValueEvent(tipeoR, "change", (v) => setNr(Math.round(v * respuesta.length)));
  const opR = useTransform(p, [0.1, 0.13, 0.3, 0.35], [0, 1, 1, 0]);
  const yR = useTransform(p, [0.1, 0.14], [16, 0]);

  return (
    <section ref={ref} className="relative h-[340vh] bg-[#0e1745]" aria-label="Cómo funciona Eco">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-10 px-6 md:px-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="relative z-10 min-h-[200px] sm:min-h-[220px]">
            {BEATS.map((b, i) => (
              <motion.div key={i} className="absolute inset-0" initial={false} animate={{ opacity: beat === i ? 1 : 0, y: beat === i ? 0 : beat > i ? -24 : 24 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#7d8cff] [font-family:var(--font-figtree)]">{i + 1} de 3</p>
                <h2 className="mt-4 text-[34px] font-extrabold leading-[1.04] tracking-[-0.03em] text-white md:text-[52px] [font-family:var(--font-figtree)]">{b.t}</h2>
                <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white/65">{b.s}</p>
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 grid h-[400px] place-items-center md:h-[520px]">
            <RadarFondo progreso={radar} R={R} />
            <motion.div style={{ scale: escalaPregunta, y: yPregunta }} className="relative z-20 rounded-[18px] bg-white px-6 py-4 text-[20px] font-semibold text-[#0e1745] shadow-[0_30px_80px_-30px_rgba(21,52,220,0.8)] md:text-[24px] [font-family:var(--font-figtree)]">
              {pregunta.slice(0, n)}
              <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px] animate-pulse bg-[#1534dc]" />
            </motion.div>
            {respuesta && (
              <motion.div style={{ opacity: opR, y: yR }} className="absolute top-[calc(50%+56px)] z-20 w-[min(440px,86vw)] rounded-[18px] border border-white/15 bg-[#16205a] px-5 py-4 text-[15px] leading-relaxed text-white/85">
                <p className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/50 [font-family:var(--font-figtree)]">
                  {casaVoz && <span className="h-4 w-4" style={{ color: casaVoz.key === "gpt" || casaVoz.key === "grok" ? "#fff" : casaVoz.color }} dangerouslySetInnerHTML={{ __html: casaVoz.svg }} />}
                  {casaVoz?.nombre ?? "IA"} responde
                </p>
                {respuesta.slice(0, nr)}
                {nr < respuesta.length && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px] animate-pulse bg-white/70" />}
              </motion.div>
            )}
            {CASAS.map((c, i) => (
              <Casa key={c.key} i={i} total={CASAS.length} p={p} svg={c.svg} color={c.key === "gpt" || c.key === "grok" ? "#ffffff" : c.color} R={R} apaga={resultados ? !resultados.find((r) => r.key === c.key)?.nombra : i % 2 === 1 || i === 6} />
            ))}
          </div>
        </div>
        <p className="absolute bottom-6 left-0 right-0 text-center text-[12px] text-white/35">{marca && resultados ? `Escucha de ${marca}${pais ? `, ${pais}` : ""}, hoy` : `Medido por Eco, ${FECHA_DATOS}`}</p>
      </div>
    </section>
  );
}

function Casa({ i, total, p, svg, color, apaga, R }: { i: number; total: number; p: MotionValue<number>; svg: string; color: string; apaga: boolean; R: number }) {
  const ang = (i / total) * Math.PI * 2 - Math.PI / 2;
  const x = useTransform(p, [0.3, 0.46], [0, Math.cos(ang) * R]);
  const y = useTransform(p, [0.3, 0.46], [0, Math.sin(ang) * R + CY]);
  const op = useTransform(p, (v) => {
    if (v < 0.3) return 0;
    if (v < 0.4) return (v - 0.3) / 0.1;
    if (!apaga || v < 0.5) return 1;
    if (v < 0.6) return 1 - ((v - 0.5) / 0.1) * 0.8;
    if (v < 0.72) return 0.2;
    if (v < 0.82) return 0.2 + ((v - 0.72) / 0.1) * 0.8;
    return 1;
  });
  const anillo = useTransform(p, (v) => {
    if (v < 0.5) return 0;
    if (!apaga) return Math.min(1, (v - 0.5) / 0.1);
    return v < 0.72 ? 0 : Math.min(1, (v - 0.72) / 0.1);
  });
  return (
    <motion.div style={{ x, y, opacity: op }} className="absolute grid h-[54px] w-[54px] place-items-center sm:h-[68px] sm:w-[68px] rounded-full border border-white/20 bg-[#16205a]">
      <span className="h-7 w-7" style={{ color }} dangerouslySetInnerHTML={{ __html: svg }} />
      <motion.span style={{ opacity: anillo }} className="absolute -inset-1 rounded-full border-2 border-[#3450ff] shadow-[0_0_24px_rgba(52,80,255,0.7)]" />
    </motion.div>
  );
}

function RadarFondo({ progreso, R }: { progreso: MotionValue<number>; R: number }) {
  const op = useTransform(progreso, [0, 0.25, 1], [0, 1, 1]);
  const giro = useTransform(progreso, [0, 1], [0, 720]);
  const D = 760;
  return (
    <motion.div
      style={{ opacity: op, width: D, height: D, left: "50%", top: `calc(50% + ${CY}px)`, x: "-50%", y: "-50%" }}
      aria-hidden
      className="pointer-events-none absolute z-0"
    >
      {[R * 2 + 70, R * 2 + 240, R * 2 + 430].map((d) => (
        <span key={d} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#3450ff]/25" style={{ width: d, height: d }} />
      ))}
      <motion.span
        style={{ rotate: giro, background: "conic-gradient(from 0deg, rgba(52,80,255,0.32), rgba(52,80,255,0) 70deg, transparent 360deg)" }}
        className="absolute inset-0 rounded-full [mask-image:radial-gradient(circle,#000_55%,transparent_70%)]"
      />
    </motion.div>
  );
}
