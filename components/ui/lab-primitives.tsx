"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Shift LAB visual primitives — terminal / tech aesthetic.
 *
 * Type system:
 *  - Glitz       → display headlines
 *  - Figtree     → subtitles, UI labels, badge text
 *  - Fira Mono   → paragraphs, code-blocks, line numbers, terminal output
 *
 * Palette tokens (used inline because we want a single self-contained file):
 *  --lab-bg    #0A0E27   deep navy
 *  --lab-card  #141A36   surface
 *  --lab-line  rgba(255,255,255,0.08)
 *  --lab-muted #8B92B5
 *  --magenta   #F540FF
 *  --cyan      #5BE9FF
 *  --blue      #1534DC
 *  --green     #00FF88
 */

// ----------------------------------------------------------------------
// Section label — small monospaced badge like "// 01_HERO"
// ----------------------------------------------------------------------
export function LabSectionLabel({
  index,
  name,
  className = "",
}: {
  index: string;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 [font-family:var(--font-fira-mono)] text-[11px] uppercase tracking-[0.18em] text-[#8B92B5] ${className}`}
    >
      <span className="text-[#5BE9FF]">{"//"}</span>
      <span className="text-white/80">{index}</span>
      <span className="text-white/35">_</span>
      <span>{name}</span>
    </div>
  );
}

// ----------------------------------------------------------------------
// Status pill — like a live indicator (e.g. "● ONLINE" or "● RUNTIME")
// ----------------------------------------------------------------------
export function LabStatusPill({
  status = "ONLINE",
  color = "#00FF88",
}: {
  status?: string;
  color?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 [font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.18em] text-white/70">
      <span
        className="relative inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      >
        <span
          className="absolute inset-0 animate-ping rounded-full"
          style={{ backgroundColor: color, animationDuration: "2.4s" }}
        />
      </span>
      {status}
    </span>
  );
}

// ----------------------------------------------------------------------
// Terminal frame — code-editor-style container with title bar.
// ----------------------------------------------------------------------
export function LabTerminalFrame({
  title = "shift-lab:~",
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/8 bg-[#141A36]/85 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(21,52,220,0.45)] ${className}`}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.02] px-4 py-2.5">
        <span className="block h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
        <span className="block h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
        <span className="block h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
        <span className="ml-3 [font-family:var(--font-fira-mono)] text-[11px] text-white/45 truncate">
          {title}
        </span>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Blinking cursor — terminal-style accent
// ----------------------------------------------------------------------
export function LabCursor({ color = "#5BE9FF" }: { color?: string }) {
  return (
    <span
      aria-hidden
      className="ml-1 inline-block h-[1em] w-[0.5em] translate-y-[0.12em] animate-pulse align-baseline"
      style={{ backgroundColor: color, animationDuration: "1.1s" }}
    />
  );
}

// ----------------------------------------------------------------------
// Dot/grid background pattern — subtle, fades to bg
// ----------------------------------------------------------------------
export function LabDotGrid({
  className = "",
  opacity = 0.5,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        opacity,
        maskImage:
          "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 40%, transparent 80%)",
      }}
    />
  );
}

// ----------------------------------------------------------------------
// Scan lines — subtle horizontal CRT-style overlay
// ----------------------------------------------------------------------
export function LabScanlines({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 mix-blend-overlay ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)",
      }}
    />
  );
}

// ----------------------------------------------------------------------
// Numbered line — monospaced row prefixed with `01 ▍`
// ----------------------------------------------------------------------
export function LabCodeLine({
  number,
  children,
  className = "",
}: {
  number: number | string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-baseline gap-4 [font-family:var(--font-fira-mono)] ${className}`}
    >
      <span className="select-none text-[11px] tabular-nums text-white/25 w-6 text-right">
        {String(number).padStart(2, "0")}
      </span>
      <div className="flex-1 text-sm leading-[1.65] text-white/75">
        {children}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Typewriter — types the text out character by character once.
// ----------------------------------------------------------------------
export function LabTypewriter({
  text,
  speed = 28,
  className = "",
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i += 1;
      setShown(i);
      if (i < text.length) {
        window.setTimeout(tick, speed);
      }
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [text, speed]);
  return (
    <span className={className}>
      {text.slice(0, shown)}
      {shown < text.length && <LabCursor />}
    </span>
  );
}

// ----------------------------------------------------------------------
// Corner brackets — HUD-style L-shaped marks on container corners
// ----------------------------------------------------------------------
export function LabCornerMarks({
  className = "",
  color = "rgba(91,233,255,0.55)",
}: {
  className?: string;
  color?: string;
}) {
  const len = 14;
  const off = 6;
  const stroke = (
    <span
      aria-hidden
      className="absolute block"
      style={{ backgroundColor: color }}
    />
  );
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {/* top-left */}
      <span
        className="absolute"
        style={{ top: off, left: off, width: len, height: 1, background: color }}
      />
      <span
        className="absolute"
        style={{ top: off, left: off, width: 1, height: len, background: color }}
      />
      {/* top-right */}
      <span
        className="absolute"
        style={{ top: off, right: off, width: len, height: 1, background: color }}
      />
      <span
        className="absolute"
        style={{ top: off, right: off, width: 1, height: len, background: color }}
      />
      {/* bottom-left */}
      <span
        className="absolute"
        style={{ bottom: off, left: off, width: len, height: 1, background: color }}
      />
      <span
        className="absolute"
        style={{ bottom: off, left: off, width: 1, height: len, background: color }}
      />
      {/* bottom-right */}
      <span
        className="absolute"
        style={{ bottom: off, right: off, width: len, height: 1, background: color }}
      />
      <span
        className="absolute"
        style={{ bottom: off, right: off, width: 1, height: len, background: color }}
      />
      {/* hide unused */}
      <span className="hidden">{stroke}</span>
    </div>
  );
}
