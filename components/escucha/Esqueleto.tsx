"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

/* Esqueleto del reporte mientras la escucha corre: la forma de lo que viene
 * (cifra grande, filas, gráfico) respirando, sin texto inventado. */

type Tono = "eco" | "sentinel" | "integral";
const COLOR: Record<Tono, { base: string; brillo: string; borde: string }> = {
  eco: { base: "#e9ebf6", brillo: "#f6f7fc", borde: "#e3e5f1" },
  sentinel: { base: "#E6E6E1", brillo: "#F2F2EE", borde: "#DCDCD6" },
  integral: { base: "rgba(255,255,255,0.06)", brillo: "rgba(255,255,255,0.12)", borde: "rgba(255,255,255,0.1)" },
};

function Hueso({ className, tono, delay = 0 }: { className: string; tono: Tono; delay?: number }) {
  const c = COLOR[tono];
  return (
    <motion.span
      className={`block rounded-[6px] ${className}`}
      style={{ background: `linear-gradient(90deg, ${c.base} 0%, ${c.brillo} 50%, ${c.base} 100%)`, backgroundSize: "200% 100%" }}
      animate={{ backgroundPosition: ["100% 0%", "-100% 0%"] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay }}
    />
  );
}

export function EsqueletoReporte({ tono, etiqueta }: { tono: Tono; etiqueta: string }) {
  const c = COLOR[tono];
  return (
    <div role="status" aria-live="polite" className="mx-auto w-full max-w-[1180px] px-6 py-16 md:px-10">
      <p className={`text-[13px] font-medium ${tono === "integral" ? "text-white/55" : "text-[#8A8B92]"}`}>{etiqueta}</p>
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <Hueso tono={tono} className="h-[88px] w-[60%]" />
          <Hueso tono={tono} className="mt-5 h-4 w-[85%]" delay={0.1} />
          <Hueso tono={tono} className="mt-3 h-4 w-[70%]" delay={0.2} />
          <Hueso tono={tono} className="mt-3 h-4 w-[40%]" delay={0.3} />
        </div>
        <div className="border-t" style={{ borderColor: c.borde }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="grid grid-cols-[minmax(0,1fr)_80px] items-center gap-6 border-b py-5" style={{ borderColor: c.borde }}>
              <Hueso tono={tono} className="h-4" delay={i * 0.08} />
              <Hueso tono={tono} className="h-4" delay={i * 0.08 + 0.05} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-14 flex h-[140px] items-end gap-2">
        {[38, 52, 30, 64, 80, 46, 58, 92, 70, 44, 60, 36, 50, 74].map((h, i) => (
          <div key={i} className="flex-1" style={{ height: `${h}%` }}>
            <Hueso tono={tono} className="h-full w-full" delay={i * 0.04} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* La integral: el formulario vive en un componente cliente y el resto de la
 * página en el servidor. El formulario avisa su estado por un evento y este
 * envoltorio decide: nada antes de lanzar, esqueleto mientras corre, todo al terminar. */

export type FaseLanding = "idle" | "corriendo" | "listo";
const EVENTO = "escucha:fase";

export function avisarFase(f: FaseLanding) {
  (window as unknown as { __escuchaFase?: FaseLanding }).__escuchaFase = f;
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: f }));
}

/* El resto de la landing SIEMPRE está en el HTML (lo leen Google y los motores
 * de IA); antes de lanzar la escucha va plegado a altura 0 e inerte, y al
 * terminar se despliega. Contenido plegado por UX sí se indexa; contenido que
 * no existe en el HTML, no. */
export function Plegado({ abierto, children }: { abierto: boolean; children: ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={abierto ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ overflow: abierto ? "visible" : "hidden" }}
      inert={!abierto}
      data-escucha={abierto ? "abierta" : "espera"}
    >
      {children}
    </motion.div>
  );
}

export function TrasEscucha({ children, tono = "integral" }: { children: ReactNode; tono?: Tono }) {
  const [fase, setFase] = useState<FaseLanding>("idle");
  useEffect(() => {
    const ya = (window as unknown as { __escuchaFase?: FaseLanding }).__escuchaFase;
    if (ya) setFase(ya);
    const f = (e: Event) => setFase((e as CustomEvent<FaseLanding>).detail);
    window.addEventListener(EVENTO, f);
    return () => window.removeEventListener(EVENTO, f);
  }, []);
  return (
    <>
      <AnimatePresence>
        {fase === "corriendo" && tono !== "integral" && (
          <motion.div key="hueso" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EsqueletoReporte tono={tono} etiqueta="Armando tu reporte" />
          </motion.div>
        )}
      </AnimatePresence>
      <Plegado abierto={fase === "listo"}>{children}</Plegado>
    </>
  );
}
