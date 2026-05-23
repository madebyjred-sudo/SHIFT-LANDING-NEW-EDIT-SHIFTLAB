"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ShiftMark from "@/components/common/ShiftMark";
import type { AgentState, Message } from "./agent-types";
import AgentHeader from "./AgentHeader";
import AgentMessages from "./AgentMessages";
import AgentComposer from "./AgentComposer";

/**
 * AgentIsland — pill colapsada vs panel expandido (dynamic-island-ish).
 *
 *   Colapsada                      Expandida
 *   ─────────────                  ┌─────────────────┐
 *   │ • Asistente │     →          │ Asistente   ✕   │
 *   └─────────────┘                ├─────────────────┤
 *                                  │  conversación   │
 *                                  ├─────────────────┤
 *                                  │  composer       │
 *                                  └─────────────────┘
 *
 * Implementación: dos elementos hermanos (pill y panel) ambos anclados
 * abajo-centro. AnimatePresence con `mode="wait"` los intercambia con
 * un crossfade + sutil scale spring.
 *
 * Por qué NO usamos `motion.div layout`: framer-motion implementa layout
 * vía un transform-matrix de scale, lo que choca contra el
 * `-translate-x-1/2` que necesitamos para centrar. Resultado: el panel
 * quedaba atascado en una matriz scale(0.29, 0.07) tras el morph.
 *
 * Liquid Glass opaco profesional:
 *   - Surface mate `rgba(11,11,18,0.96)` — 96% opaco para legibilidad,
 *     4% deja respirar el warp del backdrop.
 *   - `backdrop-filter: url(#shift-liquid-warp) blur(24px) saturate(160%)`
 *     — mismo warp SVG del navbar.
 *   - Box-shadow en capas: top inset highlight, bottom inset shadow,
 *     hairline outer, drop shadow profundo.
 *   - Top-wet sheen interno en el tercio superior.
 */

// Surface design tokens — usados por ambos estados para consistencia.
const SURFACE_BG = "rgba(11, 11, 18, 0.96)";
const SURFACE_BACKDROP = "url(#shift-liquid-warp) blur(24px) saturate(160%)";
const SURFACE_SHADOW = [
  "inset 0 1px 0 rgba(255,255,255,0.14)",
  "inset 0 -1px 0 rgba(0,0,0,0.45)",
  "inset 0 0 0 0.5px rgba(255,255,255,0.06)",
  "0 24px 60px -22px rgba(0,0,0,0.75)",
  "0 4px 14px -6px rgba(0,0,0,0.5)",
].join(", ");

// Mensajes rotativos del hint que aparece arriba del pill mientras está
// colapsado. Cambian cada ~4.5s con crossfade. Se ocultan permanentemente
// dentro de la sesión cuando el visitante abre Shifty por primera vez.
const HINT_MESSAGES = [
  "¿Necesitas ayuda?",
  "Hablemos.",
  "Empecemos a trabajar.",
];

// sessionStorage key — la mantenemos local para no acoplar el componente
// a un singleton externo. Si el visitante vuelve mañana, el hint
// reaparece (rotated, no spam — sessionStorage muere con la tab).
const HINT_SEEN_KEY = "shifty:hint-seen";

export default function AgentIsland({
  state,
  open,
  onOpen,
  onClose,
  onToggleVoice,
  onClear,
  onSend,
  input,
  onInputChange,
}: {
  state: AgentState;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggleVoice: () => void;
  onClear: () => void;
  onSend: (text: string) => void;
  input: string;
  onInputChange: (v: string) => void;
}) {
  const reduce = useReducedMotion();
  const busy =
    state.status === "thinking" ||
    state.status === "tool" ||
    state.status === "writing";

  const spring = reduce
    ? { type: "tween" as const, duration: 0.16 }
    : { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.55 };

  // Mostrar el hint flotante mientras el pill está colapsado y el
  // visitante NO lo ha abierto antes en esta sesión.
  const [showHint, setShowHint] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.sessionStorage.getItem(HINT_SEEN_KEY);
    if (seen) return;
    // Pequeño delay para que el hint aterrice después del primer paint
    // y del greeting del bot — evita pop-in agresivo.
    const t = window.setTimeout(() => setShowHint(true), 1800);
    return () => window.clearTimeout(t);
  }, []);

  // Al abrir Shifty (desde pill o desde hint), marcamos visto y ocultamos.
  const handleOpen = React.useCallback(() => {
    setShowHint(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(HINT_SEEN_KEY, "1");
    }
    onOpen();
  }, [onOpen]);

  return (
    <div
      className="fixed z-[100] right-3 sm:right-6 bottom-3 sm:bottom-6 flex flex-col items-end gap-3"
      style={{
        // Safe area iOS — el iPhone notch/home indicator come ~34px
        // abajo. Sin esto el pill queda DEBAJO de la barra del sistema
        // en iOS Safari.
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Hint flotante — solo visible mientras pill está colapsado y la
          sesión no marcó "seen". Se compone aparte del pill para que su
          halo magenta no compita con la pill expandida. */}
      <AnimatePresence>
        {!open && showHint && <ShiftyHint onClick={handleOpen} />}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={spring}
            role="dialog"
            aria-label="Shifty"
            className="overflow-hidden flex flex-col origin-bottom-right"
            style={{
              // 100dvh > 100vh para iOS Safari (cuenta sólo viewport
              // visible real, no incluye URL bar oculta). vw-24 deja
              // 12px de margen cada lado en mobile.
              width: "min(440px, calc(100vw - 24px))",
              height: "min(620px, calc(100dvh - 72px))",
              borderRadius: 22,
              background: SURFACE_BG,
              backdropFilter: SURFACE_BACKDROP,
              WebkitBackdropFilter: SURFACE_BACKDROP,
              boxShadow: SURFACE_SHADOW,
            }}
          >
            <SurfaceSheen tall />
            <div className="relative z-[1] flex h-full w-full flex-col min-h-0">
              <AgentHeader
                status={state.status}
                statusLabel={state.statusLabel}
                voice={state.voice}
                onToggleVoice={onToggleVoice}
                onClose={onClose}
                onClear={onClear}
              />
              <AgentMessages
                messages={state.messages as Message[]}
                onQuickChip={(t) => onSend(t)}
              />
              <AgentComposer
                value={input}
                onChange={onInputChange}
                onSend={() => onSend(input)}
                busy={busy}
                voice={state.voice}
                onToggleVoice={onToggleVoice}
              />
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="pill"
            type="button"
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={spring}
            onClick={handleOpen}
            aria-label="Abrir Shifty"
            className="overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F540FF]/60"
            style={{
              borderRadius: 9999,
              background: SURFACE_BG,
              backdropFilter: SURFACE_BACKDROP,
              WebkitBackdropFilter: SURFACE_BACKDROP,
              boxShadow: SURFACE_SHADOW,
            }}
          >
            <SurfaceSheen />
            <div className="relative z-[1]">
              <CollapsedPill busy={busy} statusLabel={state.statusLabel} />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ShiftyHint — micro-burbujas rotativas arriba de la pill que invitan
 * al click. Tres mensajes en loop (4.5s c/u) con crossfade vertical
 * sutil. Halo magenta pulsa por debajo (~2.6s easeInOut) — el ritmo
 * lento + offset del propio movimiento del mensaje le da la lectura
 * "vivo, pero elegante". Click abre el panel y dismiss permanente
 * dentro de la sesión.
 */
function ShiftyHint({ onClick }: { onClick: () => void }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setIdx((i) => (i + 1) % HINT_MESSAGES.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Abrir Shifty"
      initial={{ opacity: 0, y: 10, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96, transition: { duration: 0.22 } }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F540FF]/60"
    >
      {/* Halo magenta pulsante — el "click suggest". Sale por fuera del
          bubble como halo radial difuso. opacity + scale oscilan en
          phase para dar la sensación de respiración. */}
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 -m-4 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(245,64,255,0.45), rgba(245,64,255,0) 72%)",
            filter: "blur(14px)",
          }}
          animate={{ opacity: [0.4, 0.95, 0.4], scale: [1, 1.12, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Bubble — misma surface system que el resto (liquid glass). */}
      <span
        className="relative inline-flex items-center overflow-hidden rounded-full px-3.5 py-2"
        style={{
          background: SURFACE_BG,
          backdropFilter: SURFACE_BACKDROP,
          WebkitBackdropFilter: SURFACE_BACKDROP,
          boxShadow: SURFACE_SHADOW,
        }}
      >
        <SurfaceSheen />
        <span className="relative z-[1] flex items-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={HINT_MESSAGES[idx]}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="block whitespace-nowrap text-[11.5px] font-medium tracking-[0.02em] text-white/95"
              style={{
                fontFamily:
                  "var(--font-fira-mono), ui-monospace, monospace",
              }}
            >
              {HINT_MESSAGES[idx]}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </motion.button>
  );
}

/**
 * SurfaceSheen — el "wet" highlight superior. Tall=true para el panel
 * (sólo cubre el tercio superior); tall=false para la pill (cubre todo,
 * leyendo como un sutil top-to-bottom shine).
 */
function SurfaceSheen({ tall = false }: { tall?: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0"
      style={{
        height: tall ? "30%" : "100%",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 40%, transparent 100%)",
      }}
    />
  );
}

/**
 * Collapsed pill — siempre comunica estado sin demandar atención.
 *
 *   Idle:    [shift-mark]  Asistente
 *   Working: [shift-mark con halo magenta]  buscando en /awards…
 */
function CollapsedPill({
  busy,
  statusLabel,
}: {
  busy: boolean;
  statusLabel: string;
}) {
  const label = busy ? statusLabel || "trabajando…" : "Shifty";
  return (
    <div className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 select-none">
      <BrandIndicator active={busy} size={22} />
      <AnimatedLabel text={label} />
    </div>
  );
}

/**
 * BrandIndicator — el monograma de Shift como "indicator". Cuando está
 * activo, un halo magenta lo respira detrás.
 */
function BrandIndicator({ active, size = 22 }: { active: boolean; size?: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      {active && (
        <motion.span
          aria-hidden
          className="absolute rounded-full"
          style={{
            inset: `${-Math.round(size * 0.4)}px`,
            background:
              "radial-gradient(closest-side, rgba(245,64,255,0.55), transparent 75%)",
          }}
          animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.18, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <ShiftMark size={size} className="relative" />
    </span>
  );
}

/**
 * AnimatedLabel — texto pequeño con crossfade al cambiar de label.
 */
function AnimatedLabel({ text }: { text: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={text}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="text-[12px] tracking-[0.04em] text-white/90 whitespace-nowrap"
        style={{ fontFamily: "var(--font-fira-mono), ui-monospace, monospace" }}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  );
}
