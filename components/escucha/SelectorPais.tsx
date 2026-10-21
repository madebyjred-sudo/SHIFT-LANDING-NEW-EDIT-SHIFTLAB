"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { PAISES } from "@/lib/escucha/paises";

/* Selector de país propio (no el menú del sistema): lista anclada al campo que
 * se despliega con animación, con bandera, marca del elegido, teclado completo
 * (flechas, Enter, Esc, escribir para saltar) y un tema por landing. */

type Tono = "eco" | "sentinel" | "integral";
const T: Record<Tono, { panel: string; borde: string; texto: string; suave: string; hover: string; activo: string; marca: string; radio: string; sombra: string; fuente: string }> = {
  eco: { panel: "#ffffff", borde: "#e3e5f1", texto: "#0e1745", suave: "#858eb4", hover: "#f1f3fa", activo: "#eef1ff", marca: "#1534dc", radio: "10px", sombra: "0 24px 50px -20px rgba(14,23,69,.35)", fuente: "var(--font-fira-sans)" },
  sentinel: { panel: "#ffffff", borde: "#DCDCD6", texto: "#17171B", suave: "#8A8B92", hover: "#F4F4F2", activo: "#F1E7FB", marca: "#9244D8", radio: "6px", sombra: "0 24px 50px -24px rgba(23,23,27,.45)", fuente: "var(--font-plex)" },
  integral: { panel: "#0E1438", borde: "rgba(255,255,255,.12)", texto: "#ffffff", suave: "rgba(255,255,255,.45)", hover: "rgba(255,255,255,.06)", activo: "rgba(91,233,255,.12)", marca: "#5BE9FF", radio: "14px", sombra: "0 30px 60px -20px rgba(0,0,0,.7)", fuente: "var(--font-figtree)" },
};

export const bandera = (cc: string) => cc.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

export function SelectorPais({ cc, onCc, tono, className = "", etiqueta = "País" }: { cc: string; onCc: (cc: string) => void; tono: Tono; className?: string; etiqueta?: string }) {
  const t = T[tono];
  const [abierto, setAbierto] = useState(false);
  const [foco, setFoco] = useState(0);
  const raiz = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLUListElement>(null);
  const id = useId();
  const actual = PAISES.find((p) => p.cc === cc) ?? PAISES[0];
  const buscado = useRef({ txt: "", t: 0 });

  useEffect(() => {
    if (!abierto) return;
    setFoco(Math.max(0, PAISES.findIndex((p) => p.cc === cc)));
    const fuera = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAbierto(false);
    };
    addEventListener("pointerdown", fuera);
    return () => removeEventListener("pointerdown", fuera);
  }, [abierto, cc]);

  // Con la lista abierta, la burbuja flotante de Shifty se aparta para no tapar países.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-lista-abierta", abierto);
    return () => document.documentElement.removeAttribute("data-lista-abierta");
  }, [abierto]);

  useEffect(() => {
    if (abierto) lista.current?.querySelector<HTMLElement>(`[data-i="${foco}"]`)?.scrollIntoView({ block: "nearest" });
  }, [foco, abierto]);

  const elegir = (i: number) => {
    onCc(PAISES[i].cc);
    setAbierto(false);
  };

  const tecla = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!abierto) return setAbierto(true);
      setFoco((f) => (f + (e.key === "ArrowDown" ? 1 : PAISES.length - 1)) % PAISES.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (abierto) elegir(foco);
      else setAbierto(true);
    } else if (e.key === "Escape") {
      setAbierto(false);
    } else if (e.key === "Tab") {
      setAbierto(false);
    } else if (e.key.length === 1) {
      const b = buscado.current;
      b.txt = Date.now() - b.t > 700 ? e.key.toLowerCase() : b.txt + e.key.toLowerCase();
      b.t = Date.now();
      const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
      const i = PAISES.findIndex((p) => norm(p.nombre).startsWith(norm(b.txt)));
      if (i >= 0) {
        setFoco(i);
        if (!abierto) onCc(PAISES[i].cc);
      }
    }
  };

  return (
    <div ref={raiz} className="relative">
      <style>{`html[data-lista-abierta] .shifty-agent-island{opacity:0;pointer-events:none;transition:opacity .15s}`}</style>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={id}
        aria-label={`${etiqueta}: ${actual.nombre}`}
        onClick={() => setAbierto((v) => !v)}
        onKeyDown={tecla}
        className={`flex w-full items-center gap-2.5 text-left ${className}`}
      >
        <span className="text-[1.1em] leading-none">{bandera(actual.cc)}</span>
        <span className="min-w-0 flex-1 truncate">{actual.nombre}</span>
        <motion.svg animate={{ rotate: abierto ? 180 : 0 }} transition={{ duration: 0.25 }} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="shrink-0 opacity-60">
          <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.ul
            ref={lista}
            id={id}
            role="listbox"
            aria-label={etiqueta}
            aria-activedescendant={`${id}-${foco}`}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+6px)] z-50 max-h-[min(520px,62vh)] w-max min-w-full origin-top overflow-y-auto border p-1.5 [scrollbar-width:thin]"
            style={{ background: t.panel, borderColor: t.borde, borderRadius: t.radio, boxShadow: t.sombra, color: t.texto, fontFamily: t.fuente }}
          >
            {PAISES.map((p, i) => {
              const sel = p.cc === cc;
              const enFoco = i === foco;
              return (
                <li
                  key={p.cc}
                  id={`${id}-${i}`}
                  data-i={i}
                  role="option"
                  aria-selected={sel}
                  onPointerEnter={() => setFoco(i)}
                  onClick={() => elegir(i)}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 text-[15px] transition-colors"
                  style={{ borderRadius: `calc(${t.radio} - 4px)`, background: sel ? t.activo : enFoco ? t.hover : "transparent", fontWeight: sel ? 600 : 400 }}
                >
                  <span className="text-[17px] leading-none">{bandera(p.cc)}</span>
                  <span className="flex-1">{p.nombre}</span>
                  {sel && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M3 7.2 5.8 10 11 4" stroke={t.marca} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
