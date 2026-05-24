"use client";

import * as React from "react";
import { motion } from "framer-motion";
import ShiftMark from "@/components/common/ShiftMark";
import type { AgentStatus } from "./agent-types";

/**
 * AgentHeader — editorial. Sin avatar, sin BETA, sin gradient circles.
 *
 * Layout:
 *   ASISTENTE                                    voz / nuevo / cerrar
 *   en línea · listo para ayudar
 *
 * El nombre va en Fira Mono small-caps super reducido — leemos como una
 * etiqueta tipográfica, no como un branding de chatbot.
 */
export default function AgentHeader({
  status,
  statusLabel,
  onClose,
  onClear,
}: {
  status: AgentStatus;
  statusLabel: string;
  onClose: () => void;
  onClear: () => void;
}) {
  const idle = status === "idle" || status === "done";
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]">
      <div className="relative shrink-0">
        {!idle && (
          <motion.span
            aria-hidden
            className="absolute inset-[-10px] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(245,64,255,0.50), transparent 75%)",
            }}
            animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <ShiftMark size={32} className="relative" title="Shift LATAM" />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="text-[10px] uppercase tracking-[0.18em] text-white/55 leading-tight"
          style={{ fontFamily: "var(--font-fira-mono), ui-monospace, monospace" }}
        >
          Shifty
        </div>
        <div
          className="mt-1 flex items-center gap-1.5 text-[11.5px] text-white/60 leading-tight"
          style={{ fontFamily: "var(--font-fira-mono), ui-monospace, monospace" }}
        >
          <span className="truncate">
            {idle ? "en línea · listo para ayudar" : statusLabel || "trabajando…"}
          </span>
        </div>
      </div>

      <HeaderButton ariaLabel="Nueva conversación" onClick={onClear}>
        <RefreshIcon />
      </HeaderButton>
      <HeaderButton ariaLabel="Cerrar" onClick={onClose}>
        <CloseIcon />
      </HeaderButton>
    </div>
  );
}

function HeaderButton({
  children,
  ariaLabel,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`grid h-7 w-7 place-items-center rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
        active
          ? "text-white"
          : "text-white/45 hover:text-white/90 hover:bg-white/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
