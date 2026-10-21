"use client";

import { motion } from "framer-motion";
import type { Calientes } from "@/lib/escucha/calientes";

/* Palabras calientes: lo que la gente busca sobre tu marca, lo que la IA dice
 * de ella y lo que sube en la conversación. Tres columnas, sin cajas. */

type Tono = "eco" | "sentinel" | "integral";
const T: Record<Tono, { tinta: string; suave: string; linea: string; acento: string; sube: string; fondo: string }> = {
  eco: { tinta: "#0e1745", suave: "#4a5488", linea: "#e3e5f1", acento: "#1534dc", sube: "#12a150", fondo: "#f4f5fb" },
  sentinel: { tinta: "#17171B", suave: "#5F6068", linea: "#DCDCD6", acento: "#9244D8", sube: "#1E874B", fondo: "#F4F4F2" },
  integral: { tinta: "#ffffff", suave: "rgba(255,255,255,0.62)", linea: "rgba(255,255,255,0.12)", acento: "#5BE9FF", sube: "#4ADE80", fondo: "rgba(255,255,255,0.04)" },
};

function Columna({ titulo, sub, vacio, tono, children }: { titulo: string; sub: string; vacio: boolean; tono: Tono; children: React.ReactNode }) {
  const c = T[tono];
  return (
    <div>
      <h3 className="text-[17px] font-semibold" style={{ color: c.tinta }}>{titulo}</h3>
      <p className="mt-1 text-[13px] leading-relaxed" style={{ color: c.suave }}>{sub}</p>
      <div className="mt-4 border-t" style={{ borderColor: c.tinta === "#ffffff" ? "rgba(255,255,255,0.25)" : c.tinta }}>
        {vacio ? <p className="py-4 text-[13px]" style={{ color: c.suave }}>Sin datos suficientes en esta fuente.</p> : children}
      </div>
    </div>
  );
}

export default function PalabrasCalientes({ marca, pais, calientes, tono }: { marca: string; pais: string; calientes: Calientes; tono: Tono }) {
  const c = T[tono];
  const maxIA = Math.max(1, ...calientes.ia.map((x) => x.ias));
  const fila = "flex items-center justify-between gap-4 border-b py-2.5 text-[14px]";
  const cols = [true, tono !== "sentinel", tono !== "eco"];
  return (
    <section className="py-14 md:py-20" aria-labelledby="calientes">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: c.acento }}>Palabras calientes</p>
      <h2 id="calientes" className="mt-3 max-w-3xl text-[28px] font-bold leading-[1.1] md:text-[38px]" style={{ color: c.tinta }}>
        Lo que se busca, se responde y se comenta sobre {marca}
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed" style={{ color: c.suave }}>
        Son los términos con los que la gente llega a tu marca. Úsalos en tu sitio, tus notas y tus respuestas: sirven para buscadores (SEO) y para que la IA te encuentre y te cite (AEO).
      </p>
      <div className={`mt-10 grid gap-10 ${cols.filter(Boolean).length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
        {cols[0] && (
          <Columna tono={tono} titulo={`Lo que se busca en Google · ${pais}`} sub="Autocompletado de Google en tu país, en el orden en que lo sugiere." vacio={calientes.busqueda.length === 0}>
            {calientes.busqueda.slice(0, 10).map((b, i) => (
              <motion.div key={b.t} initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className={fila} style={{ borderColor: c.linea }}>
                <span style={{ color: c.tinta }}>{b.t}</span>
                <span className="text-[12px] tabular-nums" style={{ color: c.suave }}>#{b.orden}</span>
              </motion.div>
            ))}
          </Columna>
        )}
        {cols[1] && (
          <Columna tono={tono} titulo="Lo que repite la IA" sub="Términos que las IA usan al hablar de tu marca, y en cuántas de ellas aparecen." vacio={calientes.ia.length === 0}>
            {calientes.ia.slice(0, 10).map((x, i) => (
              <motion.div key={x.t} initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className={fila} style={{ borderColor: c.linea }}>
                <span style={{ color: c.tinta }}>{x.t}</span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 rounded-full" style={{ width: `${(x.ias / maxIA) * 56}px`, background: c.acento }} />
                  <span className="w-[52px] text-right text-[12px] tabular-nums" style={{ color: c.suave }}>{x.ias} IA</span>
                </span>
              </motion.div>
            ))}
          </Columna>
        )}
        {cols[2] && (
          <Columna tono={tono} titulo="Lo que sube en la conversación" sub="Términos de redes y medios, últimos 15 días contra los 15 anteriores." vacio={calientes.conversacion.length === 0}>
            {calientes.conversacion.slice(0, 10).map((x, i) => (
              <motion.div key={x.t} initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className={fila} style={{ borderColor: c.linea }}>
                <span style={{ color: c.tinta }}>{x.t}</span>
                <span className="flex items-baseline gap-3 tabular-nums">
                  <span className="text-[12px] font-semibold" style={{ color: x.cambio >= 0 ? c.sube : "#e5484d" }}>{x.cambio >= 0 ? "↑" : "↓"} {Math.abs(x.cambio)} %</span>
                  <span className="w-[44px] text-right text-[12px]" style={{ color: c.suave }}>{x.n}</span>
                </span>
              </motion.div>
            ))}
          </Columna>
        )}
      </div>
    </section>
  );
}
