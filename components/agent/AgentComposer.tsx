"use client";

import * as React from "react";
import { motion } from "framer-motion";

/**
 * AgentComposer — editorial. Sin gradient send, sin "Powered by".
 *
 * Input es un textarea hairline-bordered que crece hasta ~5 líneas. La
 * barra de send es un `↵` tipográfico en mono, no un blob magenta.
 *
 * Modo voz: el mic activa el Web Speech API del browser (es-419). El
 * textarea sigue visible mientras se dicta — la transcripción aparece
 * en vivo. El mic icon cambia a "stop" + halo magenta pulsante para
 * indicar que está escuchando.
 */
export default function AgentComposer({
  value,
  onChange,
  onSend,
  busy,
  voice,
  onToggleVoice,
  voiceError,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  voice: boolean;
  onToggleVoice: () => void;
  voiceError?: string | null;
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
      {voiceError && (
        <div
          role="alert"
          className="mb-2 rounded-md border border-[#F540FF]/30 bg-[#F540FF]/[0.08] px-3 py-2 text-[11.5px] leading-snug text-white/85"
          style={{
            fontFamily: "var(--font-fira-mono), ui-monospace, monospace",
          }}
        >
          {voiceError}
        </div>
      )}
      <div
        className={`relative flex items-end gap-2 rounded-lg border bg-white/[0.025] px-2 py-1.5 transition-all duration-200 ${
          voice
            ? "border-[#F540FF]/40 bg-white/[0.04] shadow-[0_0_0_3px_rgba(245,64,255,0.08)]"
            : "border-white/[0.08] focus-within:border-[#F540FF]/35 focus-within:bg-white/[0.04] focus-within:shadow-[0_0_0_3px_rgba(245,64,255,0.06)]"
        }`}
      >
        {/* Textarea siempre visible — la transcripción del voice
            aparece en vivo acá mientras el usuario dicta. */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          placeholder={
            busy
              ? "trabajando…"
              : voice
                ? "escuchando… (decí algo)"
                : "pregunta algo…"
          }
          disabled={busy}
          autoFocus
          className="flex-1 resize-none bg-transparent px-2 py-2 text-[16px] sm:text-[13.5px] text-white placeholder:text-white/30 outline-none disabled:opacity-60 caret-[#F540FF]"
          style={{ minHeight: "32px", maxHeight: "132px" }}
        />

        <button
          type="button"
          aria-label={voice ? "Detener dictado" : "Dictar por voz"}
          title={voice ? "Detener dictado" : "Dictar por voz"}
          onClick={onToggleVoice}
          className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
            voice
              ? "text-[#F540FF]"
              : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
          }`}
        >
          {voice && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-md"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(245,64,255,0.45), rgba(245,64,255,0) 75%)",
              }}
              animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.18, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <span className="relative">{voice ? <StopIcon /> : <MicIcon />}</span>
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
