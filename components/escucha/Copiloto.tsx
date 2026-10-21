"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { HERRAMIENTAS } from "@/lib/escucha/herramientas";

/* El copiloto de cada plataforma contado como lo que es: una entidad que se
 * despierta al activar la plataforma, ve cada dato que entra, lo guarda y
 * después responde. Un compañero de trabajo que no descansa. En la integral,
 * los dos (Eco y Sentinel) se conectan por MCP a las herramientas del cliente.
 *
 * Un solo componente con tres pieles: cada landing pasa su tema. */

type Tema = "eco" | "sentinel" | "integral";

const PIEL: Record<Tema, { fondo: string; tinta: string; suave: string; regla: string; acento: string; acento2: string; tarjeta: string; fuente: string; titular: string }> = {
  eco: { fondo: "#f6f7fb", tinta: "#0e1745", suave: "#4a5488", regla: "#e3e5f1", acento: "#1534dc", acento2: "#f540ff", tarjeta: "#ffffff", fuente: "var(--font-fira-sans)", titular: "var(--font-figtree)" },
  sentinel: { fondo: "#F4F4F2", tinta: "#17171B", suave: "#5F6068", regla: "#DCDCD6", acento: "#9244D8", acento2: "#9244D8", tarjeta: "#ffffff", fuente: "var(--font-plex)", titular: "var(--font-plex)" },
  integral: { fondo: "#0A0E27", tinta: "#ffffff", suave: "rgba(255,255,255,0.7)", regla: "rgba(255,255,255,0.12)", acento: "#5BE9FF", acento2: "#F540FF", tarjeta: "#0E1438", fuente: "var(--font-fira-sans)", titular: "var(--font-zilla-slab)" },
};

const MOMENTOS = [
  { t: "Se despierta", d: "Al activar la plataforma nace una entidad dedicada a tu marca. Desde ese minuto trabaja sola, de día y de noche." },
  { t: "Ve", d: "Lee cada dato que entra: cada respuesta de una IA, cada mención, cada titular. Nada pasa sin que lo mire." },
  { t: "Guarda", d: "Lo que importa se queda en su memoria con su fuente y su fecha. Cada semana sabe más de tu marca que la anterior." },
  { t: "Responde", d: "Le preguntas como a un colega y contesta con tus datos, citando de dónde salió cada cosa." },
];

const CHAT: Record<Exclude<Tema, "integral">, { p: string; r: string; fuentes: string[]; memoria: string }> = {
  eco: {
    p: "¿En qué preguntas la IA recomienda a mi competencia y no a nosotros?",
    r: "En las de precio y en las de comparación directa, sobre todo en las IA que buscan en internet. Las fuentes que citan en esas respuestas son dos portales de reseñas donde tu marca no aparece.",
    fuentes: ["Corrida semanal · 7 IA", "Preguntas de precio", "Fuentes citadas"],
    memoria: "Recuerda cada corrida desde que se activó",
  },
  sentinel: {
    p: "¿Qué encendió la conversación del martes?",
    r: "Un video en TikTok sobre la espera en tus tiendas, que dos medios retomaron en la tarde. De ahí salió la mayor parte de las menciones del día y el tono se volvió negativo. Te avisé en cuanto empezó a crecer.",
    fuentes: ["TikTok", "Medios digitales", "Alerta enviada"],
    memoria: "Recuerda cada mención desde que se activó",
  },
};

export default function Copiloto({ tema }: { tema: Tema }) {
  const c = PIEL[tema];
  const ref = useRef<HTMLDivElement>(null);
  const enVista = useInView(ref, { once: false, amount: 0.3 });
  const [activo, setActivo] = useState(0);

  useEffect(() => {
    if (!enVista) return;
    const id = setInterval(() => setActivo((v) => (v + 1) % MOMENTOS.length), 2600);
    return () => clearInterval(id);
  }, [enVista]);

  const titulo =
    tema === "integral"
      ? "Dos compañeros que no duermen, conectados a tu equipo."
      : tema === "eco"
        ? "Eco no solo mide. Despierta a alguien que aprende de tu marca."
        : "Sentinel no solo escucha. Despierta a alguien que aprende de tu marca.";
  const bajada =
    tema === "integral"
      ? "Cada plataforma trae su copiloto: el de Eco aprende lo que la IA dice de ti; el de Sentinel, lo que dice la gente. Con las dos activas, conversan entre ellos y llegan a tus herramientas por MCP, el estándar con el que hoy se conectan los asistentes de IA."
      : "Detrás del tablero hay un copiloto que es también un cerebro. No es un chat genérico: aprende de cada dato que la plataforma extrae, lo recuerda y te responde con eso. Un compañero de trabajo que no descansa.";

  return (
    <section ref={ref} className="relative overflow-hidden py-20 md:py-28" style={{ background: c.fondo, color: c.tinta, fontFamily: c.fuente }}>
      <div className="mx-auto w-full max-w-[1180px] px-6 md:px-10">
        <p className="text-[13px] font-semibold" style={{ color: c.acento }}>
          {tema === "integral" ? "Copilotos de Eco y Sentinel" : "El copiloto"}
        </p>
        <h2 className="mt-3 max-w-[820px] text-[32px] font-bold leading-[1.08] tracking-[-0.01em] md:text-[48px]" style={{ fontFamily: c.titular }}>
          {titulo}
        </h2>
        <p className="mt-5 max-w-[680px] text-[17px] leading-relaxed" style={{ color: c.suave }}>
          {bajada}
        </p>

        {tema === "integral" ? (
          <>
                        {/* El ciclo: una línea con cuatro momentos; el activo se enciende. */}
        <div className="mt-14 grid gap-8 md:grid-cols-4 md:gap-6">
          {MOMENTOS.map((m, i) => {
            const on = i === activo;
            return (
              <button key={m.t} type="button" onClick={() => setActivo(i)} className="group relative self-start text-left">
                <div className="relative h-[2px] w-full" style={{ background: c.regla }}>
                  <motion.div className="absolute inset-y-0 left-0" style={{ background: c.acento }} initial={false} animate={{ width: on ? "100%" : i < activo ? "100%" : "0%" }} transition={{ duration: on ? 2.4 : 0.3, ease: "linear" }} />
                  <motion.span
                    className="absolute -top-[5px] left-0 block h-3 w-3 rounded-full"
                    style={{ background: on || i < activo ? c.acento : c.regla, boxShadow: on ? `0 0 0 6px ${c.acento}22` : "none" }}
                    animate={on ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                    transition={{ duration: 1.2, repeat: on ? Infinity : 0 }}
                  />
                </div>
                <h3 className="mt-5 text-[20px] font-semibold" style={{ fontFamily: c.titular, opacity: on ? 1 : 0.55 }}>
                  {m.t}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed transition-opacity" style={{ color: c.suave, opacity: on ? 1 : 0.6 }}>
                  {m.d}
                </p>
              </button>
            );
          })}
        </div>
            <Conexion c={c} />
          </>
        ) : (
          <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-stretch">
            <ol className="flex flex-col justify-between gap-7">
              {MOMENTOS.map((m, i) => {
                const on = i === activo;
                return (
                  <li key={m.t}>
                    <button type="button" onClick={() => setActivo(i)} className="grid w-full grid-cols-[14px_minmax(0,1fr)] gap-4 text-left">
                      <span className="relative mt-[9px] flex justify-center">
                        <motion.span className="block h-3 w-3 rounded-full" style={{ background: on || i < activo ? c.acento : c.regla, boxShadow: on ? `0 0 0 6px ${c.acento}22` : "none" }} animate={on ? { scale: [1, 1.25, 1] } : { scale: 1 }} transition={{ duration: 1.2, repeat: on ? Infinity : 0 }} />
                      </span>
                      <span>
                        <span className="block text-[20px] font-semibold" style={{ fontFamily: c.titular, opacity: on ? 1 : 0.5 }}>{m.t}</span>
                        <span className="mt-1 block text-[15px] leading-relaxed transition-opacity" style={{ color: c.suave, opacity: on ? 1 : 0.6 }}>{m.d}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <Conversacion c={c} chat={CHAT[tema]} vivo={enVista} nombre={tema === "eco" ? "Eco" : "Sentinel"} />
          </div>
        )}
      </div>
    </section>
  );
}

function Conversacion({ c, chat, vivo, nombre }: { c: (typeof PIEL)["eco"]; chat: { p: string; r: string; fuentes: string[]; memoria: string }; vivo: boolean; nombre: string }) {
  const [paso, setPaso] = useState(0);
  useEffect(() => {
    if (!vivo) return;
    setPaso(0);
    const a = setTimeout(() => setPaso(1), 600);
    const b = setTimeout(() => setPaso(2), 1900);
    const d = setTimeout(() => setPaso(3), 2700);
    return () => [a, b, d].forEach(clearTimeout);
  }, [vivo]);
  const mono = (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold text-white" style={{ background: c.acento }}>
      {nombre[0]}
    </span>
  );
  return (
    <div className="flex min-h-[460px] flex-col overflow-hidden rounded-[10px] border shadow-[0_24px_60px_-40px_rgba(0,0,0,0.35)]" style={{ background: c.tarjeta, borderColor: c.regla }}>
      {/* Barra del copiloto */}
      <div className="flex items-center gap-3 border-b px-5 py-3.5" style={{ borderColor: c.regla }}>
        {mono}
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-tight">Copiloto de {nombre}</p>
          <p className="text-[12px]" style={{ color: c.suave }}>{chat.memoria}</p>
        </div>
        <span className="flex items-center gap-1.5 text-[12px]" style={{ color: c.suave }}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" style={{ background: c.acento }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: c.acento }} />
          </span>
          Despierto
        </span>
      </div>

      {/* Conversación */}
      <div className="flex flex-1 flex-col justify-end gap-4 px-5 py-6">
        <AnimatePresence>
          {paso >= 1 && (
            <motion.p key="p" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-auto max-w-[78%] rounded-[14px] rounded-br-[4px] px-4 py-2.5 text-[15px] leading-relaxed text-white" style={{ background: c.acento }}>
              {chat.p}
            </motion.p>
          )}
          {paso === 1 && (
            <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
              {mono}
              <span className="flex gap-1">
                {[0, 1, 2].map((k) => (
                  <motion.span key={k} className="h-1.5 w-1.5 rounded-full" style={{ background: c.suave }} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: k * 0.15 }} />
                ))}
              </span>
              <span className="text-[13px]" style={{ color: c.suave }}>Buscando en su memoria</span>
            </motion.div>
          )}
          {paso >= 2 && (
            <motion.div key="r" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              {mono}
              <div className="min-w-0 max-w-[86%]">
                <p className="rounded-[14px] rounded-tl-[4px] px-4 py-3 text-[15px] leading-relaxed" style={{ background: c.fondo }}>
                  {chat.r}
                </p>
                {paso >= 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex flex-wrap gap-1.5">
                    {chat.fuentes.map((f) => (
                      <span key={f} className="rounded-[6px] border px-2 py-0.5 text-[12px]" style={{ borderColor: c.regla, color: c.suave }}>
                        {f}
                      </span>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Campo de pregunta (ilustrativo) */}
      <div className="border-t px-4 py-3" style={{ borderColor: c.regla }}>
        <div className="flex items-center gap-3 rounded-[8px] border px-3.5 py-2.5" style={{ borderColor: c.regla, background: c.fondo }}>
          <span className="flex-1 text-[14px]" style={{ color: c.suave }}>Pregúntale lo que quieras sobre tu marca</span>
          <span className="grid h-7 w-7 place-items-center rounded-[6px] text-white" style={{ background: c.acento }} aria-hidden>
            ↑
          </span>
        </div>
        <p className="mt-2 px-1 text-[11px]" style={{ color: c.suave }}>Conversación de ejemplo. En tu plataforma responde con tus datos y cita la fuente de cada cifra.</p>
      </div>
    </div>
  );
}

function Conexion({ c }: { c: (typeof PIEL)["integral"] }) {
  const nodo = (nombre: string, sub: string, color: string) => (
    <div className="rounded-[14px] border px-5 py-4" style={{ borderColor: c.regla, background: c.tarjeta }}>
      <p className="text-[18px] font-bold" style={{ fontFamily: c.titular, color }}>
        {nombre}
      </p>
      <p className="mt-1 text-[13px]" style={{ color: c.suave }}>
        {sub}
      </p>
    </div>
  );
  return (
    <div className="mt-16 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_120px_minmax(0,1.1fr)]">
      <div className="space-y-4">
        {nodo("Copiloto de Eco", "Sabe lo que cada IA dice de tu marca", c.acento)}
        {nodo("Copiloto de Sentinel", "Sabe lo que dicen la gente y los medios", c.acento2)}
      </div>
      <div className="relative hidden h-[180px] lg:block" aria-hidden>
        <svg viewBox="0 0 120 180" className="absolute inset-0 h-full w-full">
          {[50, 130].map((y0, i) => (
            <g key={y0}>
              <path d={`M0 ${y0} C60 ${y0} 60 90 120 90`} fill="none" stroke={c.regla} strokeWidth="1.5" />
              <motion.circle r="3" fill={i ? c.acento2 : c.acento} animate={{ offsetDistance: ["0%", "100%"] }} style={{ offsetPath: `path("M0 ${y0} C60 ${y0} 60 90 120 90")` }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.9 }} />
            </g>
          ))}
        </svg>
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: c.fondo, border: `1px solid ${c.regla}`, color: c.tinta }}>
          MCP
        </span>
      </div>
      <div>
        <p className="text-[14px]" style={{ color: c.suave }}>
          Tu equipo les pregunta desde donde ya trabaja:
        </p>
        <div className="mt-4 grid grid-cols-4 gap-x-4 gap-y-5">
          {HERRAMIENTAS.map((h) => (
            <div key={h.key} className="flex flex-col items-center gap-2 text-center">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
                <path d={h.d} />
              </svg>
              <span className="text-[12px]" style={{ color: c.suave }}>
                {h.nombre}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[15px] leading-relaxed" style={{ color: c.suave }}>
          «¿La IA ya repite lo que salió hoy en medios?» se contesta en un mensaje: uno trae la conversación, el otro las respuestas de la IA, y llegan juntos al chat de tu equipo.
        </p>
      </div>
    </div>
  );
}
