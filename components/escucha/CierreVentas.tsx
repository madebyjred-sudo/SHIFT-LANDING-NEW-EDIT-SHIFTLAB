"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { gancho } from "@/lib/escucha/gancho";
import { TarjetaFabiana } from "./CierreSinReporte";
import type { Reporte as ReporteData } from "@/lib/escucha/solicitudes";

/* Cierre del reporte: el hallazgo más fuerte de SU reporte, el aviso de que un
 * especialista de Shift le escribe (aceptó al pedirlo con su correo de trabajo)
 * y un atajo para quien quiere hablar hoy. Sin formulario: ya tenemos todo. */

type Tono = "eco" | "sentinel" | "integral";
const T: Record<Tono, { fondo: string; tinta: string; suave: string; linea: string; acento: string; btn: string; btnTxt: string; fuente: string; titular: string; radio: string }> = {
  eco: { fondo: "#0A0E27", tinta: "#ffffff", suave: "rgba(255,255,255,.68)", linea: "rgba(255,255,255,.14)", acento: "#9fb0ff", btn: "#ffffff", btnTxt: "#0e1745", fuente: "var(--font-fira-sans)", titular: "var(--font-figtree)", radio: "4px" },
  sentinel: { fondo: "#17171B", tinta: "#F4F4F2", suave: "rgba(244,244,242,.66)", linea: "rgba(244,244,242,.14)", acento: "#B98AEB", btn: "#9244D8", btnTxt: "#ffffff", fuente: "var(--font-plex)", titular: "var(--font-plex)", radio: "4px" },
  integral: { fondo: "#0E1438", tinta: "#ffffff", suave: "rgba(255,255,255,.68)", linea: "rgba(255,255,255,.14)", acento: "#5BE9FF", btn: "#1534DC", btnTxt: "#ffffff", fuente: "var(--font-figtree)", titular: "var(--font-figtree)", radio: "14px" },
};

const PASOS = [
  ["Lectura de tu reporte", "20 minutos con alguien que conoce tu mercado: qué significa cada número y qué no."],
  ["Qué hacer primero", "Las dos o tres acciones que más mueven el resultado, con su fuente."],
  ["Cómo se ve todos los días", "El mismo reporte con monitoreo continuo, al lado de tus competidores."],
];

export default function CierreVentas({ r, tono }: { r: Omit<ReporteData, "correo">; tono: Tono }) {
  const t = T[tono];
  const g = gancho(r);
  const [estado, setEstado] = useState<"no" | "enviando" | "ok" | "fallo">("no");
  const vence = new Date(r.creado + 30 * 86400e3).toLocaleDateString("es-CR", { day: "numeric", month: "long" });

  async function hoy() {
    if (estado === "enviando" || estado === "ok") return;
    setEstado("enviando");
    try {
      const res = await fetch("/api/escucha/contacto", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id }) });
      setEstado(res.ok ? "ok" : "fallo");
    } catch {
      setEstado("fallo");
    }
  }

  return (
    <section className="relative mt-16 overflow-hidden" style={{ background: t.fondo, color: t.tinta, fontFamily: t.fuente, borderRadius: tono === "integral" ? 22 : 0 }}>
      <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em]" style={{ color: t.acento }}>Lo que sigue</p>
          <motion.h2 initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="mt-5 text-[30px] font-bold leading-[1.08] tracking-[-0.02em] md:text-[44px]" style={{ fontFamily: t.titular }}>
            {g.titulo}
          </motion.h2>
          <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed" style={{ color: t.suave }}>
            Un especialista de Shift en {r.pais} te va a escribir en las próximas 24 horas hábiles para leer este reporte contigo.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button type="button" onClick={hoy} disabled={estado === "enviando" || estado === "ok"} className="px-7 py-4 text-[16px] font-semibold transition-opacity disabled:opacity-70" style={{ background: t.btn, color: t.btnTxt, borderRadius: t.radio, fontFamily: t.titular }}>
              {estado === "enviando" ? "Avisando…" : estado === "ok" ? "Listo, te escribimos hoy" : "Prefiero hablar hoy"}
            </button>
            <span className="text-[13px]" style={{ color: t.suave }}>Este reporte vence el {vence}.</span>
          </div>
          <div className="mt-8">
            <TarjetaFabiana tono={tono} texto="Directora de Desarrollo de Negocio, Shift Latam. Ella o alguien de su equipo te escribe con este reporte en la mano, no con una presentación genérica." />
          </div>
          <AnimatePresence>
            {estado === "ok" && (
              <motion.p key="ok" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 max-w-[480px] text-[14px] leading-relaxed" style={{ color: t.suave }}>
                Le avisamos al equipo de Shift. Te escriben hoy al correo con el que pediste el reporte.
              </motion.p>
            )}
            {estado === "fallo" && (
              <motion.p key="no" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-[14px]" style={{ color: t.suave }}>
                No pudimos avisar ahora. Responde el correo del reporte y te escribimos hoy.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        <ol className="self-end border-t" style={{ borderColor: t.linea }}>
          {PASOS.map(([titulo, d], i) => (
            <motion.li key={titulo} initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.12, duration: 0.6 }} className="grid grid-cols-[28px_minmax(0,1fr)] gap-4 border-b py-5" style={{ borderColor: t.linea }}>
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: t.acento }}>{i + 1}</span>
              <span>
                <span className="block text-[17px] font-semibold" style={{ fontFamily: t.titular }}>{titulo}</span>
                <span className="mt-1 block text-[14.5px] leading-relaxed" style={{ color: t.suave }}>{d}</span>
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
