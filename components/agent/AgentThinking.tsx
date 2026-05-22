"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ThinkingStep } from "./agent-types";

/**
 * AgentThinking — pensamientos del agente en lenguaje natural.
 *
 * Antes el timeline parecía un log con `→` y `·` y nombres de tools tipo
 * `site.search`. Ahora es una sucesión de frases que se leen como un
 * monólogo interno: "Pregunta sobre reconocimientos", "Reviso el
 * palmarés…", "Armo la respuesta". Sin rutas de código.
 *
 * Cada línea tiene un punto pequeño en el margen izquierdo cuyo color
 * indica el estado:
 *   - pending  → punto faint, texto muy muteado
 *   - active   → punto magenta con ping, texto blanco
 *   - resolved → punto blanco medio, texto medio
 *
 * Al terminar el turno, el bloque colapsa detrás de un disclosure
 * pequeño tipográfico. Hacer click vuelve a abrirlo.
 */
export default function AgentThinking({
  steps,
  revealedIds,
  done,
}: {
  steps: ThinkingStep[];
  revealedIds: string[];
  done: boolean;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const activeIdx = steps.findIndex((s) => !revealedIds.includes(s.id));
  const allResolved = activeIdx === -1;

  React.useEffect(() => {
    if (done && allResolved) {
      const id = window.setTimeout(() => setCollapsed(true), 900);
      return () => window.clearTimeout(id);
    }
    setCollapsed(false);
  }, [done, allResolved]);

  if (!steps.length) return null;

  return (
    <div className="mb-2.5">
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.ol
            key="log"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden space-y-1.5"
          >
            {steps.map((step, i) => {
              const resolved = revealedIds.includes(step.id);
              const active = !resolved && i === activeIdx;
              const state: "pending" | "active" | "resolved" = resolved
                ? "resolved"
                : active
                  ? "active"
                  : "pending";
              return (
                <ThoughtLine
                  key={step.id}
                  step={step}
                  state={state}
                />
              );
            })}
          </motion.ol>
        )}
      </AnimatePresence>

      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="inline-flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/80 transition-colors"
        >
          <ResolvedDot />
          <span>ver razonamiento ({steps.length})</span>
        </button>
      )}
    </div>
  );
}

/**
 * ThoughtLine — una línea de pensamiento. La distinción ponder/tool ya
 * no se marca con prefijos distintos: ambos se leen como pensamientos
 * en lenguaje natural. La detail del tool se anexa con un guión largo
 * en una segunda línea sutil, sólo cuando hay detail.
 */
function ThoughtLine({
  step,
  state,
}: {
  step: ThinkingStep;
  state: "pending" | "active" | "resolved";
}) {
  const hasDetail = step.kind === "tool" && !!step.toolDetail;
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-[7px] shrink-0">
        {state === "active" ? (
          <ActiveDot />
        ) : state === "resolved" ? (
          <ResolvedDot />
        ) : (
          <PendingDot />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div
          className={`text-[12.5px] leading-[1.5] transition-colors duration-200 ${
            state === "active"
              ? "text-white/95"
              : state === "resolved"
                ? "text-white/55"
                : "text-white/30"
          }`}
        >
          {step.label}
        </div>
        {hasDetail && (
          <div
            className={`mt-0.5 text-[11.5px] leading-[1.45] transition-colors duration-200 ${
              state === "active"
                ? "text-white/55"
                : state === "resolved"
                  ? "text-white/35"
                  : "text-white/20"
            }`}
          >
            {step.toolDetail}
          </div>
        )}
      </div>
    </li>
  );
}

function ActiveDot() {
  return (
    <span className="relative inline-flex h-1.5 w-1.5">
      <span
        aria-hidden
        className="absolute inset-0 animate-ping rounded-full"
        style={{ backgroundColor: "#F540FF", opacity: 0.55 }}
      />
      <span
        className="relative inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: "#F540FF", boxShadow: "0 0 6px rgba(245,64,255,0.65)" }}
      />
    </span>
  );
}
function ResolvedDot() {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: "rgba(255,255,255,0.45)" }}
    />
  );
}
function PendingDot() {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
    />
  );
}
