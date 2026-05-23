"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Clawd — el mascot pixel-art del Shift LAB / Shifty.
 *
 * 24×24 grid, 6 colores. Matrix porteada de
 * /Users/juan/Downloads/clawd-build/clawd_idle_final.py.
 *
 * Animaciones (layers que corren en paralelo):
 *
 *   A. Breathing            — translateY ±1px loop 3.2s easeInOut.
 *   B. Eye blink            — cada 4.5-7s (random) por 180ms.
 *   C. Wink on message      — trigger externo (triggerWink prop ↑).
 *   D. Bubble bounce        — lo maneja el padre (ShiftyHint).
 *   E. Pupil cursor follow  — cuando hovered=true sigue el mouse ±1 cell.
 *   F. Excited bounce       — cuando hovered=true breath se acelera +
 *                             amplitud sube (±2px).
 *   G. Hair wave            — cada 2.5s un cell del mechón pink se shiftea.
 *   H. Foot tap             — alterna pie izquierdo/derecho cada 700ms,
 *                             secuencia L-R-L-R con micro retracción.
 *   I. Pupil idle random    — cuando NO hovered, pupila se mueve a una
 *                             posición random cada 3.5s.
 *
 * useReducedMotion: si el OS pide menos movimiento, todas las animaciones
 * se pausan en frame base. Sprite sigue visible pero estático.
 */

// ──────────────────────────────────────────────────────────────
// Matrix 24×24 — fuente única de verdad del sprite
// ──────────────────────────────────────────────────────────────
const CLAWD_IDLE: number[][] = [
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 4, 4, 4, 4, 2, 2, 2, 2, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 4, 4, 4, 2, 2, 2, 2, 5, 5, 5, 5, 2, 2, 2, 3, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 4, 4, 2, 2, 2, 2, 5, 0, 0, 0, 0, 5, 2, 2, 3, 1, 0, 0, 0, 0],
  [0, 0, 1, 4, 4, 2, 2, 2, 2, 5, 0, 0, 0, 1, 0, 0, 5, 2, 3, 3, 1, 0, 0, 0],
  [0, 0, 1, 4, 4, 2, 2, 2, 2, 5, 0, 0, 1, 1, 1, 0, 5, 2, 2, 3, 1, 0, 0, 0],
  [0, 0, 1, 4, 4, 2, 2, 2, 2, 5, 0, 0, 0, 1, 0, 0, 5, 2, 2, 3, 1, 0, 0, 0],
  [0, 0, 1, 2, 2, 2, 2, 2, 2, 3, 5, 0, 0, 0, 0, 5, 3, 2, 2, 3, 1, 0, 0, 0],
  [0, 0, 1, 2, 4, 2, 2, 2, 2, 2, 3, 5, 5, 5, 5, 3, 2, 2, 2, 3, 1, 0, 0, 0],
  [0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 3, 1, 0, 0, 0],
  [0, 0, 1, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1, 0, 0, 0],
  [0, 1, 4, 4, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 3, 1, 1, 0, 0],
  [1, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1, 3, 1, 0],
  [1, 4, 4, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1, 3, 1, 0],
  [1, 4, 2, 2, 1, 3, 2, 2, 2, 2, 2, 2, 2, 5, 2, 2, 2, 2, 2, 3, 1, 3, 1, 0],
  [1, 2, 2, 2, 1, 3, 2, 2, 2, 2, 2, 2, 5, 2, 2, 2, 2, 2, 3, 3, 1, 2, 1, 0],
  [1, 2, 2, 3, 1, 3, 2, 2, 2, 2, 2, 2, 2, 5, 2, 2, 2, 2, 3, 3, 1, 2, 1, 0],
  [1, 3, 3, 1, 1, 3, 3, 2, 2, 2, 2, 2, 5, 2, 2, 2, 2, 3, 3, 1, 1, 3, 1, 0],
  [0, 1, 1, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 0, 1, 0, 0],
  [0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 2, 3, 1, 0, 0, 0, 0, 1, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
];

const PALETTE = [
  "transparent",  // 0
  "#000000",      // 1 — outline negro
  "#E91FFF",      // 2 — magenta principal
  "#8B0CB0",      // 3 — purple shadow
  "#FFC0FF",      // 4 — pink highlight
  "#FFFFFF",      // 5 — blanco (ojo + "S")
] as const;

// ──────────────────────────────────────────────────────────────
// Coordenadas clave del sprite
// ──────────────────────────────────────────────────────────────

// Cells de la pupila (default centrada). Cuando pupilOffset != (0,0),
// estos cells pasan a blanco y aparece la pupila desplazada.
const PUPIL_CELLS: Array<{ r: number; c: number }> = [
  { r: 5, c: 13 },                                       // top
  { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },     // mid (horizontal)
  { r: 7, c: 13 },                                       // bottom
];

// Bounds del iris (5×5 area). Override para blink y clamp para pupila.
const EYE = { rMin: 3, rMax: 7, cMin: 10, cMax: 15 };

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

type ClawdProps = {
  /** CSS pixels. Default 22. */
  size?: number;
  /** Si true, pupila sigue cursor + breathing acelerado (E + F). */
  hovered?: boolean;
  /** Cambio de este número triggerea un wink one-shot (C). */
  triggerWink?: number;
};

export default function Clawd({
  size = 22,
  hovered = false,
  triggerWink = 0,
}: ClawdProps) {
  const reduce = useReducedMotion();
  const svgRef = React.useRef<SVGSVGElement>(null);

  const [blink, setBlink] = React.useState(false);
  const [pupilOffset, setPupilOffset] = React.useState<{ x: number; y: number }>(
    { x: 0, y: 0 },
  );
  const [hairFrame, setHairFrame] = React.useState(0);
  const [footFrame, setFootFrame] = React.useState(0);

  // ── B. Eye blink loop (random 4.5-7s, duración 180ms) ──────────
  React.useEffect(() => {
    if (reduce) return;
    let blinkOff: number | undefined;
    let scheduleId: number | undefined;
    const schedule = () => {
      const delay = 4500 + Math.random() * 2500;
      scheduleId = window.setTimeout(() => {
        setBlink(true);
        blinkOff = window.setTimeout(() => {
          setBlink(false);
          schedule();
        }, 180);
      }, delay);
    };
    schedule();
    return () => {
      if (scheduleId !== undefined) window.clearTimeout(scheduleId);
      if (blinkOff !== undefined) window.clearTimeout(blinkOff);
    };
  }, [reduce]);

  // ── C. Wink on message change (triggerWink change → blink one-shot) ──
  const prevWink = React.useRef(triggerWink);
  React.useEffect(() => {
    if (triggerWink === prevWink.current) return;
    prevWink.current = triggerWink;
    setBlink(true);
    const t = window.setTimeout(() => setBlink(false), 180);
    return () => window.clearTimeout(t);
  }, [triggerWink]);

  // ── G. Hair wave (cada 2.5s alterna 2 frames) ──────────────────
  React.useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => {
      setHairFrame((f) => (f + 1) % 2);
    }, 2500);
    return () => window.clearInterval(t);
  }, [reduce]);

  // ── H. Foot tap (alterna L → R → L → R cada 700ms) ─────────────
  React.useEffect(() => {
    if (reduce) return;
    const seq = [0, 1, 0, 2]; // neutral, left-up, neutral, right-up
    let i = 0;
    const t = window.setInterval(() => {
      i = (i + 1) % seq.length;
      setFootFrame(seq[i]);
    }, 700);
    return () => window.clearInterval(t);
  }, [reduce]);

  // ── E. Pupil cursor follow (cuando hovered) ────────────────────
  // ── I. Pupil idle random  (cuando NO hovered) ──────────────────
  React.useEffect(() => {
    if (reduce) {
      setPupilOffset({ x: 0, y: 0 });
      return;
    }

    if (hovered) {
      const onMove = (e: MouseEvent) => {
        const el = svgRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        // Map a -1, 0, +1 con dead-zone de ±25px
        const px = Math.abs(dx) < 25 ? 0 : Math.sign(dx);
        const py = Math.abs(dy) < 25 ? 0 : Math.sign(dy);
        setPupilOffset({ x: px, y: py });
      };
      window.addEventListener("mousemove", onMove);
      return () => window.removeEventListener("mousemove", onMove);
    }

    // Idle random
    const positions: Array<{ x: number; y: number }> = [
      { x: 0, y: 0 },   // center (peso doble — más probable)
      { x: 0, y: 0 },
      { x: -1, y: 0 },  // left
      { x: 1, y: 0 },   // right
      { x: 0, y: -1 },  // up
    ];
    const t = window.setInterval(() => {
      setPupilOffset(positions[Math.floor(Math.random() * positions.length)]);
    }, 3500);
    return () => window.clearInterval(t);
  }, [hovered, reduce]);

  // ── Color resolver — combina TODOS los overrides para una celda ────
  const getCellColor = (r: number, c: number): number => {
    const base = CLAWD_IDLE[r][c];

    // 1. Blink — máxima prioridad, overrides eye area
    if (blink && r >= EYE.rMin && r <= EYE.rMax && c >= EYE.cMin && c <= EYE.cMax) {
      // Línea horizontal de párpado en row 5
      if (r === 5 && c >= EYE.cMin && c <= EYE.cMax) return 1;
      // Resto del eye area se vuelve magenta (párpado cerrado)
      if (base === 5 || base === 1) return 2;
      return base;
    }

    // 2. Pupil offset — solo cuando no blink
    if (!blink && (pupilOffset.x !== 0 || pupilOffset.y !== 0)) {
      // Original pupil cells → blanco (sclera)
      if (PUPIL_CELLS.some((p) => p.r === r && p.c === c)) return 5;
      // Shifted pupil cells → negro, pero clamp al eye area
      const shifted = PUPIL_CELLS.some(
        (p) => p.r + pupilOffset.y === r && p.c + pupilOffset.x === c,
      );
      if (
        shifted &&
        r >= EYE.rMin && r <= EYE.rMax &&
        c >= EYE.cMin && c <= EYE.cMax
      ) {
        return 1;
      }
    }

    // 3. Hair wave — shimmer en el mechón pink (cell (1,9) toggles)
    if (hairFrame === 1) {
      if (r === 1 && c === 9) return 4; // magenta → pink (mechón se "encrespa")
      if (r === 2 && c === 4) return 4; // outline → pink (highlight extra)
    }

    // 4. Foot tap — un pie se retracta (bottom row del pie desaparece)
    if (footFrame === 1 && r === 23 && c >= 6 && c <= 8) {
      // Pie izquierdo retraído — bottom outline transparente
      return 0;
    }
    if (footFrame === 2 && r === 23 && c >= 14 && c <= 16) {
      // Pie derecho retraído
      return 0;
    }

    return base;
  };

  // ── Render ─────────────────────────────────────────────────────
  // A. Breathing  +  F. Excited bounce
  const breathDuration = hovered ? 1.6 : 3.2;
  const breathAmplitude = hovered ? -2 : -1;
  const scaleRange = hovered ? [1, 1.05, 1] : 1;

  return (
    <motion.span
      className="inline-flex shrink-0"
      animate={
        reduce
          ? undefined
          : {
              y: [0, breathAmplitude, 0],
              scale: scaleRange,
            }
      }
      transition={{
        duration: breathDuration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ lineHeight: 0 }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        shapeRendering="crispEdges"
        aria-hidden
        className="block"
      >
        {CLAWD_IDLE.map((row, y) =>
          row.map((_, x) => {
            const color = getCellColor(y, x);
            if (color === 0) return null;
            return (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width="1"
                height="1"
                fill={PALETTE[color]}
              />
            );
          }),
        )}
      </svg>
    </motion.span>
  );
}
