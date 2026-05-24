"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ShiftMark from "@/components/common/ShiftMark";
import Clawd from "./Clawd";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
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

// (Clawd vive en su propio archivo — Clawd.tsx — para mantener este
// archivo enfocado en el shell del island. Clawd maneja todas sus
// animaciones internas: breathing, blink, pupil tracking, hair wave,
// foot tap, etc.)

// sessionStorage key — la mantenemos local para no acoplar el componente
// a un singleton externo. Si el visitante vuelve mañana, el hint
// reaparece (rotated, no spam — sessionStorage muere con la tab).
const HINT_SEEN_KEY = "shifty:hint-seen";

// ────────────────────────────────────────────────────────────────────
// FEATURE FLAG — Clawd mascot
// ────────────────────────────────────────────────────────────────────
// Mientras esté en false, el mascot NO se renderea en ningún perch
// (inside-hint, walk-out-of-bubble, on-pill, on-panel). El componente
// Clawd.tsx + toda su lógica (idle animations, autonomous behaviors,
// layoutId transitions) queda en el repo intacta para flip rápido.
//
// Toggle a true cuando el stakeholder apruebe el diseño.
// Toda la maquinaria (typewriter, halo, tail, sessionStorage de hint,
// chatEverOpened tracking) sigue activa — el hint y el pill funcionan
// idénticos a antes, solo sin Clawd visible.
const CLAWD_ENABLED = false;

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
  // Una vez que el visitante abrió el chat al menos una vez, Clawd se
  // queda sentado encima del pill (con autonomous behaviors). Persistente
  // dentro de la sesión.
  const [chatEverOpened, setChatEverOpened] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.sessionStorage.getItem(HINT_SEEN_KEY);
    if (seen) {
      setChatEverOpened(true);
      return;
    }
    // Pequeño delay para que el hint aterrice después del primer paint
    // y del greeting del bot — evita pop-in agresivo.
    const t = window.setTimeout(() => setShowHint(true), 1800);
    return () => window.clearTimeout(t);
  }, []);

  // Al abrir Shifty (desde pill o desde hint), marcamos visto, ocultamos
  // el hint, y activamos el mascot persistente que vivirá encima del pill.
  const handleOpen = React.useCallback(() => {
    setShowHint(false);
    setChatEverOpened(true);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(HINT_SEEN_KEY, "1");
    }
    onOpen();
  }, [onOpen]);

  // ESC para cerrar el panel — accessibility + keyboard power-user win.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // ── Voice / speech-to-text ─────────────────────────────────────
  // Snapshot del input cuando voice se activa, para que los nuevos
  // chunks dictados se agreguen al final del texto ya escrito en vez
  // de reemplazarlo.
  const [speechBase, setSpeechBase] = React.useState("");

  // Helper para detectar macOS — el error message es diferente porque
  // hay que ir a Settings de sistema, no solo el browser.
  const isMacOS =
    typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

  const showMicBlockedAlert = React.useCallback(
    (errName?: string) => {
      if (typeof window === "undefined") return;
      const lines = [
        "No pude acceder al micrófono.",
        "",
      ];

      if (isMacOS) {
        lines.push(
          "Si activaste el mic en la barra del browser y sigue fallando, es probable que macOS tenga bloqueado el micrófono para tu browser a nivel sistema.",
          "",
          "Apple → Configuración del Sistema → Privacidad y seguridad → Micrófono → activá Google Chrome (o Safari).",
          "",
          "Después recargá la página y volvé a probar.",
        );
      } else {
        lines.push(
          "1. Hacé click en el ícono del candado o cámara/mic al lado de la URL.",
          "2. Permití el micrófono.",
          "3. Recargá la página.",
        );
      }

      if (errName) {
        lines.push("", `(detalle técnico: ${errName})`);
      }

      window.alert(lines.join("\n"));
    },
    [isMacOS],
  );

  // handleVoiceToggle hace EL CHECK DE PERMISO DIRECTAMENTE en el
  // click handler (user-gesture context preservado) en vez de delegarlo
  // al hook. Si el browser permite, se activa voice; si no, alert
  // explicativo y voice se queda apagado.
  const handleVoiceToggle = React.useCallback(async () => {
    // Si ya está activo, solo desactivar (no requiere permiso)
    if (state.voice) {
      onToggleVoice();
      return;
    }

    if (typeof navigator === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      window.alert(
        "Tu navegador no soporta dictado por voz. Probá con Chrome, Edge o Safari actualizado.",
      );
      return;
    }

    console.info("[shifty voice] requesting mic permission...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      console.info("[shifty voice] mic permission granted ✓");

      // Snapshot input + activar voice (la hook arranca SpeechRecognition)
      setSpeechBase(input);
      onToggleVoice();
    } catch (err) {
      const e = err as { name?: string; message?: string };
      console.error(
        "[shifty voice] getUserMedia failed:",
        e?.name,
        e?.message,
        err,
      );

      const name = e?.name || "";
      if (name === "NotFoundError" || name === "OverconstrainedError") {
        window.alert(
          "No se detectó micrófono en tu dispositivo. Conectá uno y volvé a probar.",
        );
      } else {
        // NotAllowedError / PermissionDeniedError / SecurityError / etc
        showMicBlockedAlert(name);
      }
    }
  }, [state.voice, input, onToggleVoice, showMicBlockedAlert]);

  // El hook arranca SpeechRecognition cuando voice=true. Como ya pasamos
  // el check de getUserMedia en handleVoiceToggle, acá solo hay que
  // manejar errores DURANTE el dictado (network, no-speech, etc).
  useSpeechRecognition({
    active: state.voice,
    lang: "es-419",
    initialBase: speechBase,
    onTranscript: (text) => onInputChange(text),
    onError: (e) => {
      console.warn("[shifty voice] recognition error:", e);
      if (e === "not-allowed" || e === "service-not-allowed") {
        // Race condition — permission revoked between gUM check y SR start
        onToggleVoice();
        showMicBlockedAlert(e);
      } else if (e === "not-supported") {
        onToggleVoice();
        window.alert(
          "Tu navegador no soporta dictado por voz. Probá con Chrome, Edge o Safari actualizado.",
        );
      } else if (e === "no-speech" || e === "aborted") {
        // Silencio largo o usuario lo cerró — onend ya restartea, ignore.
      } else {
        // network / audio-capture / unknown — log y dejar que onend recupere.
      }
    },
  });

  return (
    <div
      className="fixed z-[100] right-3 sm:right-6 bottom-3 sm:bottom-6 flex flex-col items-end gap-3"
      style={{
        // Safe area iOS — el iPhone notch/home indicator come ~34px
        // abajo. Sin esto el pill queda DEBAJO de la barra del sistema
        // en iOS Safari.
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        // relative para que Clawd-on-pill se posicione respecto al wrapper.
        position: "fixed",
      }}
    >
      {/* Hint flotante — solo visible mientras pill está colapsado y la
          sesión no marcó "seen". Se compone aparte del pill para que su
          halo magenta no compita con la pill expandida. */}
      <AnimatePresence>
        {!open && showHint && <ShiftyHint onClick={handleOpen} />}
      </AnimatePresence>

      {/* Clawd perches (on-pill + on-panel) — gated por feature flag.
          Cuando se active, vuelve la animación de salto entre perches
          via layoutId compartido. */}
      <AnimatePresence>
        {CLAWD_ENABLED &&
          chatEverOpened &&
          (open ? (
            <motion.div
              key="clawd-on-panel"
              layoutId="clawd-perch"
              className="pointer-events-none absolute"
              style={{
                top: "-8px",
                right: "calc(50% - 14px)",
                zIndex: 2,
              }}
              transition={{
                layout: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              <Clawd autonomous size={28} walkRange={16} />
            </motion.div>
          ) : (
            <motion.div
              key="clawd-on-pill"
              layoutId="clawd-perch"
              className="pointer-events-none absolute"
              style={{
                bottom: "30px",
                right: "26px",
                zIndex: 1,
              }}
              transition={{
                layout: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              <Clawd autonomous size={24} walkRange={8} />
            </motion.div>
          ))}
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
                onToggleVoice={handleVoiceToggle}
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
            whileHover={reduce ? undefined : { scale: 1.03 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
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

// NOTA: las funciones ClawdOnPill / ClawdOnPanel se inlinearon en la
// AnimatePresence principal arriba para compartir el layoutId
// "clawd-perch" — framer-motion anima la transición geométrica entre
// las dos posiciones cuando se abre/cierra el chat.

/**
 * ShiftyHint — micro-burbujas rotativas arriba de la pill que invitan
 * al click. Tres mensajes en loop (4.5s c/u) con crossfade vertical
 * sutil. Halo magenta pulsa por debajo (~2.6s easeInOut) — el ritmo
 * lento + offset del propio movimiento del mensaje le da la lectura
 * "vivo, pero elegante". Click abre el panel y dismiss permanente
 * dentro de la sesión.
 */
// ────────────────────────────────────────────────────────────────────
// Typewriter helpers (compartidos por ShiftyHint)
// ────────────────────────────────────────────────────────────────────
type TypePhase = "typing" | "hold" | "erasing" | "pause";

// Ease-in-out por char: lento al empezar, rápido en el medio, lento al
// final. Lectura natural — como si pensara antes y después de cada
// frase. Mid-speed ~35ms, edges ~75ms.
function charDelayMs(pos: number, total: number): number {
  if (total <= 1) return 60;
  const t = pos / Math.max(1, total - 1);
  return Math.round(75 - 40 * Math.sin(t * Math.PI));
}

function ShiftyHint({ onClick }: { onClick: () => void }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = React.useState(0);
  const [text, setText] = React.useState("");
  const [phase, setPhase] = React.useState<TypePhase>("typing");
  const [hovered, setHovered] = React.useState(false);
  // Cada ~15s Clawd sale del bubble, camina encima del top por 3s,
  // y vuelve adentro. Periodic walk-out for personality.
  const [clawdOnTopOfHint, setClawdOnTopOfHint] = React.useState(false);

  React.useEffect(() => {
    if (!CLAWD_ENABLED || reduce) return;
    const trigger = () => {
      setClawdOnTopOfHint(true);
      window.setTimeout(() => setClawdOnTopOfHint(false), 3000);
    };
    // Primera salida después de 9s (deja tiempo a que el visitante
    // lea el primer claim sin distracción).
    const initialDelay = window.setTimeout(trigger, 9000);
    const interval = window.setInterval(trigger, 15000);
    return () => {
      window.clearTimeout(initialDelay);
      window.clearInterval(interval);
    };
  }, [reduce]);

  // Contador de cycles completos (cada vez que idx vuelve a 0).
  // Después de ~3 cycles, alargamos el pause para no ser demanding —
  // el visitante ya vio los 3 mensajes, no necesitamos repetir tan rápido.
  const cycleCountRef = React.useRef(0);

  // Typewriter state machine: typing → hold → erasing → pause → next msg.
  // Si reduce-motion, mostramos el texto completo y rotamos sin animar.
  React.useEffect(() => {
    const target = HINT_MESSAGES[idx];

    if (reduce) {
      setText(target);
      const t = window.setTimeout(() => {
        setIdx((i) => (i + 1) % HINT_MESSAGES.length);
      }, 5000);
      return () => window.clearTimeout(t);
    }

    let timer: number | undefined;

    if (phase === "typing") {
      if (text.length < target.length) {
        timer = window.setTimeout(() => {
          setText(target.slice(0, text.length + 1));
        }, charDelayMs(text.length, target.length));
      } else {
        setPhase("hold");
      }
    } else if (phase === "hold") {
      // 3.5s leyendo el mensaje completo
      timer = window.setTimeout(() => setPhase("erasing"), 3500);
    } else if (phase === "erasing") {
      if (text.length > 0) {
        // Borrar es ~3× más rápido que escribir
        timer = window.setTimeout(() => {
          setText(text.slice(0, -1));
        }, 22);
      } else {
        setPhase("pause");
      }
    } else if (phase === "pause") {
      // Pausa entre mensajes — respiración. Después de 3 cycles
      // completos, alargamos a 4s (menos demanding).
      const longPause = cycleCountRef.current >= 3;
      timer = window.setTimeout(
        () => {
          const next = (idx + 1) % HINT_MESSAGES.length;
          if (next === 0) cycleCountRef.current += 1;
          setIdx(next);
          setPhase("typing");
        },
        longPause ? 4000 : 650,
      );
    }

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [phase, text, idx, reduce]);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Abrir Shifty"
      initial={{ opacity: 0, y: 10, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96, transition: { duration: 0.22 } }}
      transition={{ duration: 0.55, ease: [0.42, 0, 0.58, 1] }}
      className="relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F540FF]/60"
    >
      {/* Halo magenta con ritmo de heartbeat — dos pulsos rápidos +
          pausa larga, en vez de respiración uniforme. */}
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 -m-4 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(245,64,255,0.45), rgba(245,64,255,0) 72%)",
            filter: "blur(14px)",
          }}
          animate={{
            opacity: [0.35, 0.95, 0.45, 0.85, 0.35],
            scale: [1, 1.12, 1.04, 1.1, 1],
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.12, 0.25, 0.4, 1],
          }}
        />
      )}

      {/* Bubble — overflow-hidden para que la sheen quede clipeada al
          rounded. La tail vive AFUERA como sibling absolute. */}
      <span
        className="relative inline-flex items-center overflow-hidden rounded-full pl-2.5 pr-3.5 py-2"
        style={{
          background: SURFACE_BG,
          backdropFilter: SURFACE_BACKDROP,
          WebkitBackdropFilter: SURFACE_BACKDROP,
          boxShadow: SURFACE_SHADOW,
        }}
      >
        <SurfaceSheen />
        <span className="relative z-[1] flex items-center gap-2">
          {/* Clawd — disabled via feature flag. Cuando se activa,
              Clawd vive aquí por default y cada ~15s salta al top via
              layoutId. Mientras esté false, solo se ve el typewriter. */}
          {CLAWD_ENABLED &&
            (clawdOnTopOfHint ? (
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 22,
                  height: 22,
                }}
              />
            ) : (
              <motion.span
                layoutId="clawd-hint-pos"
                className="inline-flex shrink-0"
              >
                <Clawd size={22} hovered={hovered} triggerWink={idx} />
              </motion.span>
            ))}

          {/* Typewriter container — minWidth fijo para que el bubble no
              cambie de ancho al escribir/borrar (longest message =
              "Empecemos a trabajar." con cursor). */}
          <span
            className="block whitespace-nowrap text-[11.5px] font-medium tracking-[0.02em] text-white/95"
            style={{
              fontFamily:
                "var(--font-fira-mono), ui-monospace, monospace",
              minWidth: "10rem",
            }}
          >
            {text}
            <motion.span
              aria-hidden
              animate={{ opacity: reduce ? 1 : [1, 1, 0, 0, 1] }}
              transition={{
                duration: 1.0,
                repeat: reduce ? 0 : Infinity,
                ease: "linear",
                times: [0, 0.5, 0.5, 1, 1],
              }}
              className="ml-[2px] inline-block align-middle"
              style={{
                width: "5px",
                height: "11px",
                backgroundColor: "#F540FF",
                verticalAlign: "-1px",
              }}
            />
          </span>
        </span>
      </span>

      {/* Tail/punta abajo apuntando hacia Shifty (que vive debajo en el
          stack flex). Triangle via clip-path con el mismo backdrop
          blur y dark surface para coherencia visual. Posicionada
          ligeramente solapada con el bubble para ocultar el seam. */}
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          bottom: "-7px",
          right: "26px",
          width: "14px",
          height: "9px",
          background: SURFACE_BG,
          backdropFilter: SURFACE_BACKDROP,
          WebkitBackdropFilter: SURFACE_BACKDROP,
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
        }}
      />

      {/* Clawd caminando ENCIMA del bubble — gated por feature flag.
          Visible cada ~15s por 3s cuando esté activo. */}
      {CLAWD_ENABLED && clawdOnTopOfHint && (
        <motion.span
          layoutId="clawd-hint-pos"
          className="pointer-events-none absolute"
          style={{
            top: "-18px",
            left: "14px",
            zIndex: 3,
          }}
        >
          <Clawd
            size={22}
            triggerWink={idx}
            autonomous
            walkRange={30}
          />
        </motion.span>
      )}
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
 * BrandIndicator — el monograma de Shift como "indicator". Cuando el
 * bot está trabajando, un halo magenta respira detrás. En idle, solo
 * el mark (sin ningún status extra — pill se mantiene limpio).
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
