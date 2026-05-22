"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * AgentComposer — editorial. Sin gradient send, sin "Powered by".
 *
 * Input es un textarea hairline-bordered que crece hasta ~5 líneas. La
 * barra de send es un `↵` tipográfico en mono, no un blob magenta.
 *
 * Modo voz: cuando se activa, el textarea se reemplaza por un texto
 * "escuchando…" en mono con un dot magenta a la izquierda. No hay
 * waveform — la idea es callado, no espectáculo.
 */
export default function AgentComposer({
  value,
  onChange,
  onSend,
  busy,
  voice,
  onToggleVoice,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  voice: boolean;
  onToggleVoice: () => void;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 132)}px`;
  }, [value]);

  const canSend = !busy && value.trim().length > 0;

  return (
    <div className="border-t border-white/[0.08] px-3 py-3">
      <div
        className={`relative flex items-end gap-2 rounded-lg border bg-white/[0.025] px-2 py-1.5 transition-colors duration-200 ${
          voice
            ? "border-[#F540FF]/40"
            : "border-white/[0.08] focus-within:border-white/25"
        }`}
      >
        <AnimatePresence mode="wait">
          {voice ? (
            <motion.div
              key="voice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 px-2 py-2 flex items-center gap-2"
            >
              <span className="relative inline-flex h-[7px] w-[7px]">
                <span
                  className="absolute inset-0 animate-ping rounded-full"
                  style={{ backgroundColor: "#F540FF", opacity: 0.55 }}
                />
                <span
                  className="relative inline-block h-[7px] w-[7px] rounded-full"
                  style={{ backgroundColor: "#F540FF" }}
                />
              </span>
              <span
                className="font-mono text-[11.5px] tracking-[0.04em] text-white/70"
                style={{ fontFamily: "var(--font-fira-mono), ui-monospace, monospace" }}
              >
                escuchando…
              </span>
            </motion.div>
          ) : (
            <motion.textarea
              key="text"
              ref={textareaRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              rows={1}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) onSend();
                }
              }}
              placeholder={busy ? "trabajando…" : "pregunta algo…"}
              disabled={busy}
              className="flex-1 resize-none bg-transparent px-2 py-2 text-[13.5px] text-white placeholder:text-white/30 outline-none disabled:opacity-60 caret-[#F540FF]"
              style={{ minHeight: "32px", maxHeight: "132px" }}
            />
          )}
        </AnimatePresence>

        <button
          type="button"
          aria-label={voice ? "Detener voz" : "Activar voz"}
          onClick={onToggleVoice}
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
            voice
              ? "text-[#F540FF]"
              : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
          }`}
        >
          {voice ? <StopIcon /> : <MicIcon />}
        </button>

        <button
          type="button"
          onClick={() => canSend && onSend()}
          disabled={!canSend}
          aria-label="Enviar"
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-[13px] leading-none transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
            canSend
              ? "text-white hover:bg-white/[0.06]"
              : "cursor-not-allowed text-white/25"
          }`}
          style={{ fontFamily: "var(--font-fira-mono), ui-monospace, monospace" }}
        >
          {busy ? <Loader /> : <SendGlyph />}
        </button>
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}
function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5">
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
  );
}
function SendGlyph() {
  // U+21B5 — return arrow. Reads as "enter to send".
  return <span aria-hidden>↵</span>;
}
function Loader() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 text-white/60"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </motion.svg>
  );
}
