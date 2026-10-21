"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { CASAS } from "@/lib/escucha/casas";
import { paisDelNavegador, paisPorCc } from "@/lib/escucha/paises";

/* Panel de Shift LAB en la barra: se despliega bajo el pill (no es un modal).
 * Tres columnas: la escucha gratis (se lanza desde aquí mismo), las
 * plataformas y lo que Shift LAB construye. Abajo, la puerta a /shift-lab. */

const ease = [0.22, 1, 0.36, 1] as const;

const HERRAMIENTAS = [
  { href: "/shift-lab/escucha-gratis", t: "Escucha integral", d: "IA, redes y medios en una sola lectura", icono: "/escucha/sentinel/iconos/redes.svg" },
  { href: "/shift-lab/escucha-ia", t: "Qué dice la IA de tu marca", d: "Siete IA, en menos de un minuto", icono: "/escucha/eco/iconos/verbatim.webp" },
  { href: "/shift-lab/escucha-digital", t: "Qué se dice en redes y medios", d: "30 días de conversación de tu país", icono: "/escucha/sentinel/iconos/escucha.svg" },
];

const PLATAFORMAS = [
  { href: "/shift-lab/escucha-ia", t: "Eco", d: "Visibilidad de tu marca en la IA", color: "#3450FF" },
  { href: "/shift-lab/escucha-digital", t: "Sentinel", d: "Escucha, tono y alertas en vivo", color: "#9244D8" },
  { href: "https://brandhub.shiftlatam.agency/dossier", t: "Brandhub", d: "El sistema de marca, en un solo lugar", color: "#F540FF", fuera: true },
];

const GUIA = { href: "/shift-lab/guia-ia", t: "Guía de marca en IA" };
const SERVICIOS = ["Auditoría de madurez en IA", "IA integrada a tus flujos", "Automatización de tareas", "Productos digitales a medida", "Dashboards e inteligencia de datos"];

export function LabPanel({ open, isLight, onClose }: { open: boolean; isLight: boolean; onClose: () => void }) {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const tinta = isLight ? "text-[#0E1745]" : "text-white";
  const suave = isLight ? "text-[#4A5488]" : "text-white/60";
  const rotulo = `text-[11px] font-semibold uppercase tracking-[0.14em] [font-family:var(--font-figtree,inherit)] ${isLight ? "text-[#1534DC]" : "text-[#5BE9FF]"}`;
  const fila = `group flex items-start gap-3 rounded-[12px] p-2.5 -mx-2.5 transition-colors duration-200 ${isLight ? "hover:bg-[#1534DC]/[0.06]" : "hover:bg-white/[0.06]"}`;

  const lanzar = (e: React.FormEvent) => {
    e.preventDefault();
    const m = marca.trim();
    if (m.length < 2) return;
    onClose();
    router.push(`/shift-lab/escucha-gratis?marca=${encodeURIComponent(m)}&pais=${paisDelNavegador()}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="lab"
          role="region"
          aria-label="Shift LAB"
          initial={{ opacity: 0, y: -8, clipPath: "inset(0 0 100% 0 round 22px)" }}
          animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0 round 22px)" }}
          exit={{ opacity: 0, y: -6, clipPath: "inset(0 0 100% 0 round 22px)", transition: { duration: 0.22 } }}
          transition={{ duration: 0.45, ease }}
          style={{ x: "-50%" }}
          className={[
            "absolute left-1/2 top-[calc(100%+12px)] w-[min(920px,calc(100vw-32px))] overflow-hidden rounded-[22px] border text-left normal-case tracking-normal",
            isLight
              ? "border-[#1534DC]/12 bg-white shadow-[0_30px_80px_-24px_rgba(21,52,220,0.35)]"
              : "border-white/10 bg-[#0B1030] shadow-[0_30px_80px_-24px_rgba(0,0,0,0.7)]",
          ].join(" ")}
        >
          <div className="grid gap-8 p-6 md:grid-cols-[1.25fr_1fr_0.9fr] md:p-7">
            {/* 1 · Escucha gratis: se lanza aquí mismo */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4, ease }}>
              <p className={rotulo}>Escucha gratis</p>
              <p className={`mt-3 text-[20px] font-bold leading-[1.15] [font-family:var(--font-figtree,inherit)] ${tinta}`}>
                ¿Qué dicen de tu marca la gente y la IA?
              </p>
              <form onSubmit={lanzar} className={`mt-4 flex items-center gap-1.5 rounded-[14px] border p-1.5 ${isLight ? "border-[#1534DC]/15 bg-white" : "border-white/12 bg-white/[0.04]"}`}>
                <input
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  maxLength={60}
                  placeholder="tuempresa.com o tu marca"
                  aria-label="Sitio web o marca"
                  className={`h-10 min-w-0 flex-1 bg-transparent px-3 text-[15px] outline-none [font-family:var(--font-figtree,inherit)] ${isLight ? "text-[#0E1745] placeholder:text-[#4A5488]/60" : "text-white placeholder:text-white/40"}`}
                />
                <button type="submit" disabled={marca.trim().length < 2} className="h-10 shrink-0 rounded-[10px] bg-[#1534DC] px-4 text-[14px] font-semibold text-white transition hover:bg-[#2A47F0] disabled:opacity-50 [font-family:var(--font-figtree,inherit)]">
                  Escuchar
                </button>
              </form>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex -space-x-1">
                  {CASAS.slice(0, 6).map((c) => (
                    <span key={c.key} className={`grid h-5 w-5 place-items-center rounded-full ${isLight ? "bg-[#EEF0FA]" : "bg-[#16205A]"}`}>
                      <span className="h-3 w-3" style={{ color: c.key === "gpt" || c.key === "grok" ? (isLight ? "#0E1745" : "#fff") : c.color }} dangerouslySetInnerHTML={{ __html: c.svg }} />
                    </span>
                  ))}
                </span>
                <span className={`text-[12px] ${suave}`}>7 IA y 30 días de redes y medios de {paisPorCc(typeof window === "undefined" ? "cr" : paisDelNavegador()).nombre}</span>
              </div>
              <ul className="mt-5 space-y-0.5">
                {HERRAMIENTAS.map((h) => (
                  <li key={h.href}>
                    <Link href={h.href} onClick={onClose} className={fila}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={h.icono} alt="" aria-hidden className="h-9 w-9 shrink-0 object-contain" />
                      <span>
                        <span className={`block text-[14px] font-semibold [font-family:var(--font-figtree,inherit)] ${tinta}`}>{h.t}</span>
                        <span className={`block text-[13px] ${suave}`}>{h.d}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* 2 · Plataformas */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.4, ease }} className={`md:border-l md:pl-8 ${isLight ? "border-[#1534DC]/10" : "border-white/10"}`}>
              <p className={rotulo}>Plataformas</p>
              <ul className="mt-3 space-y-0.5">
                {PLATAFORMAS.map((p) => (
                  <li key={p.t}>
                    <Link href={p.href} onClick={onClose} {...(p.fuera ? { target: "_blank", rel: "noopener" } : {})} className={fila}>
                      <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color, boxShadow: `0 0 12px ${p.color}` }} />
                      <span>
                        <span className={`flex items-center gap-1.5 text-[15px] font-bold [font-family:var(--font-figtree,inherit)] ${tinta}`}>
                          {p.t}
                          <span aria-hidden className={`text-[12px] transition-transform duration-200 group-hover:translate-x-0.5 ${suave}`}>{p.fuera ? "↗" : "→"}</span>
                        </span>
                        <span className={`block text-[13px] ${suave}`}>{p.d}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className={`mt-4 text-[12px] leading-relaxed ${suave}`}>Cada plataforma trae un copiloto que aprende de tu marca y se conecta a tus herramientas.</p>
            </motion.div>

            {/* 3 · Lo que construimos */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4, ease }} className={`md:border-l md:pl-8 ${isLight ? "border-[#1534DC]/10" : "border-white/10"}`}>
              <Link href={GUIA.href} onClick={onClose} className={`mb-5 block rounded-[12px] border p-3 transition-colors ${isLight ? "border-[#1534DC]/12 hover:bg-[#1534DC]/[0.05]" : "border-white/10 hover:bg-white/[0.05]"}`}>
                <span className={rotulo}>Guía gratis</span>
                <span className={`mt-1 block text-[14px] font-semibold ${tinta}`}>{GUIA.t} →</span>
                <span className={`block text-[12px] ${suave}`}>AEO, GEO y palabras calientes</span>
              </Link>
              <p className={rotulo}>Lo que construimos</p>
              <ul className="mt-4 space-y-2.5">
                {SERVICIOS.map((s) => (
                  <li key={s}>
                    <Link href="/shift-lab" onClick={onClose} className={`text-[14px] transition-colors duration-200 hover:text-[#F540FF] ${isLight ? "text-[#0E1745]/85" : "text-white/80"}`}>
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className={`flex items-center justify-between gap-4 border-t px-6 py-3.5 md:px-7 ${isLight ? "border-[#1534DC]/10 bg-[#1534DC]/[0.03]" : "border-white/10 bg-white/[0.02]"}`}>
            <span className={`text-[13px] ${suave}`}>
              <b className={`font-bold ${tinta}`}>Shift</b> <b className="font-bold text-[#F540FF]">LAB</b> · inteligencia artificial aplicada a la reputación y la comunicación
            </span>
            <Link href="/shift-lab" onClick={onClose} className="shrink-0 text-[13px] font-semibold text-[#F540FF] hover:underline [font-family:var(--font-figtree,inherit)]">
              Conocer Shift LAB →
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
