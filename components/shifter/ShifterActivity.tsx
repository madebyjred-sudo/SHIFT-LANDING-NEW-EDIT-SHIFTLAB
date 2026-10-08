"use client";

/**
 * ShifterActivity — estados de actividad de Shifter en el chat del cockpit.
 *
 *  - ShifterThinkingRow : "pensando" (razonando). Se muestra mientras el agente
 *    real responde (reemplaza el aire muerto del input deshabilitado). LIVE.
 *  - DelegationIndicator : "delegando" a un brazo operativo. Componente listo
 *    para cuando se cablee la delegación (#18); el chat lo renderiza cuando un
 *    mensaje trae `activity.kind === "delegating"`. Hoy dorminte (nada lo emite).
 *
 * Tokens del cockpit: verde #00FF88 (Shifter), magenta #F540FF (acción/brazo),
 * cyan #5BE9FF (micro-estado), card #141A36. Fuentes vía var(--font-*).
 * Todo respeta `reducedMotion` (estados estáticos, sin animación).
 */

import { motion } from "framer-motion";
import { Bot, Terminal, Square } from "lucide-react";

const GREEN = "#00FF88";
const MAGENTA = "#F540FF";

// ── Pensando ──────────────────────────────────────────────────────────────
export function ShifterThinkingRow({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3"
      aria-label="Shifter está razonando"
    >
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#00FF88]/30 bg-[#00FF88]/8 text-[#00FF88]">
        <Bot size={16} />
        {!reducedMotion && (
          <motion.span
            aria-hidden
            className="absolute inset-[-4px] rounded-full border border-[#00FF88]/50"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="mb-1 flex items-center gap-2">
          <span className="[font-family:var(--font-figtree)] text-[11px] font-semibold text-white/80">SHIFTER</span>
        </div>
        <div className="min-w-0 rounded-2xl rounded-tl-none border border-white/[0.08] bg-[#141A36]/80 px-4 py-3">
          <div className="flex items-center gap-2 text-[#00FF88] [font-family:var(--font-fira-mono)] text-[12.5px]">
            <span className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="inline-block h-[5px] w-[5px] rounded-full bg-[#00FF88]"
                  animate={reducedMotion ? { opacity: 0.7 } : { y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                  transition={reducedMotion ? undefined : { duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                />
              ))}
            </span>
            <span>razonando</span>
            {!reducedMotion && (
              <motion.span
                aria-hidden
                className="inline-block h-[14px] w-[7px] bg-[#00FF88]"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.51, 1] }}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Delegando (brazo operativo) ─────────────────────────────────────────────
// Content-only: se renderiza DENTRO de la burbuja de Shifter (que ya da padding).
export function DelegationIndicator({
  task,
  deliverable,
  microState,
  status = "running",
  onStop,
  reducedMotion,
}: {
  task: string;
  deliverable?: string;
  microState?: string;
  status?: "running" | "done";
  onStop?: () => void;
  reducedMotion: boolean;
}) {
  const done = status === "done" || (microState?.trim().startsWith("✓") ?? false);
  return (
    <div>
      {/* nodo Shifter ●—pulso—● brazo operativo */}
      <div className="flex items-center">
        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#00FF88]/40 bg-[#00FF88]/8 text-[#00FF88]">
          <Bot size={14} />
        </div>
        <div className="relative mx-1.5 h-0.5 flex-1 overflow-hidden rounded bg-white/10">
          {!reducedMotion ? (
            <motion.span
              aria-hidden
              className="absolute top-0 h-full w-[30%]"
              style={{ background: `linear-gradient(90deg, transparent, ${MAGENTA}, transparent)` }}
              animate={{ left: ["-30%", "100%"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <span aria-hidden className="absolute left-[35%] top-0 h-full w-[30%]" style={{ background: `linear-gradient(90deg, transparent, ${MAGENTA}, transparent)` }} />
          )}
        </div>
        <div
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-[#F540FF]/45 bg-[#F540FF]/10 text-[#F540FF]"
          style={{ boxShadow: "0 0 16px -4px rgba(245,64,255,0.5)" }}
          title="brazo operativo"
        >
          <Terminal size={14} />
        </div>
      </div>

      <div className="mt-3 [font-family:var(--font-fira-mono)] text-[12px] text-white/85">
        <span className="text-[#F540FF]">delegando ·</span> {task}
        {deliverable && <> <span className="text-white">{deliverable}</span></>}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className={`[font-family:var(--font-fira-mono)] text-[11.5px] ${done ? "text-[#00FF88]" : "text-[#5BE9FF]"}`}>
          {microState || "· iniciando"}
        </span>
        {onStop && !done && (
          <button
            onClick={onStop}
            aria-label="Detener delegación"
            className="ml-auto flex items-center gap-1 rounded-md border border-white/[0.12] bg-white/[0.04] px-2 py-1 [font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.06em] text-white/45 transition-colors hover:border-white/30 hover:text-white"
          >
            <Square size={10} /> stop
          </button>
        )}
      </div>
    </div>
  );
}
