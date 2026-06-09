"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { Message } from "./agent-types";
import AgentThinking from "./AgentThinking";

/**
 * AgentMessage — burbujas de chat editorial.
 *
 * El usuario pidió burbujas "bien diseñadas". Restricciones:
 *   - Sin gradient magenta — eso era de mal gusto la primera vez.
 *   - Surfaces sutiles: agente con burbuja muy clara (más respiro,
 *     porque el agente domina la conversación). Usuario con burbuja
 *     algo más definida pero igualmente discreta.
 *   - Asimetría sutil en una esquina de cada burbuja para indicar
 *     dirección sin alas/triángulos cursis.
 *   - Citaciones quedan FUERA de la burbuja, como footnote editorial.
 *   - Sugerencias quedan FUERA, como chips hairline.
 *
 * El razonamiento del agente va encima de la burbuja, NO dentro, para
 * que la respuesta final mantenga su peso visual.
 */
export default function AgentMessage({
  message,
  isLast,
  onQuickChip,
  onFeedback,
}: {
  message: Message;
  isLast: boolean;
  onQuickChip?: (text: string) => void;
  onFeedback?: (messageId: string, rating: 1 | -1, reason?: string) => void;
}) {
  if (message.role === "user") return <UserMessage message={message} />;
  return <AgentReply message={message} isLast={isLast} onQuickChip={onQuickChip} onFeedback={onFeedback} />;
}

function UserMessage({ message }: { message: Extract<Message, { role: "user" }> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-end"
    >
      <div
        className="max-w-[82%] rounded-[16px] rounded-tr-[6px] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-white/95"
        style={{
          background: "rgba(255,255,255,0.07)",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

function AgentReply({
  message,
  isLast,
  onQuickChip,
  onFeedback,
}: {
  message: Extract<Message, { role: "agent" }>;
  isLast: boolean;
  onQuickChip?: (text: string) => void;
  onFeedback?: (messageId: string, rating: 1 | -1, reason?: string) => void;
}) {
  const hasThinking = (message.thinking?.length ?? 0) > 0;
  const done = !message.streaming;
  const [showReasons, setShowReasons] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-start"
    >
      {hasThinking && (
        <div className="w-full max-w-[88%]">
          <AgentThinking
            steps={message.thinking ?? []}
            revealedIds={message.revealedSteps ?? []}
            done={done}
          />
        </div>
      )}

      {(message.content || message.streaming) && (
        <div
          className="max-w-[88%] rounded-[16px] rounded-tl-[6px] px-3.5 py-2.5"
          style={{
            background: "rgba(255,255,255,0.035)",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <FormattedMarkdown text={message.content} />
          {message.streaming && <Caret />}
        </div>
      )}

      {message.citations && message.citations.length > 0 && done && (
        <div
          className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] uppercase tracking-[0.14em] text-white/40"
          style={{ fontFamily: "var(--font-fira-mono), ui-monospace, monospace" }}
        >
          <span>Fuente</span>
          {message.citations.map((c, i) => (
            <a
              key={`${c.href}-${i}`}
              href={c.href}
              className="text-white/70 underline underline-offset-[3px] decoration-white/25 hover:text-white hover:decoration-[#F540FF] transition-colors"
            >
              {c.label}
            </a>
          ))}
        </div>
      )}

      {isLast && done && message.suggestions && message.suggestions.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {message.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onQuickChip?.(s)}
              className="rounded-full border border-white/[0.10] bg-white/[0.02] px-2.5 py-1 text-[11.5px] text-white/75 hover:border-white/30 hover:text-white hover:bg-white/[0.04] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Feedback UI */}
      {done && message.content && !message.feedback && (
        <div className="mt-2 flex items-center gap-2">
          {!showReasons ? (
            <>
              <button
                type="button"
                onClick={() => onFeedback?.(message.id, 1)}
                className="opacity-40 hover:opacity-100 transition-opacity text-white flex items-center justify-center"
                title="Buena respuesta"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z"/></svg>
              </button>
              <button
                type="button"
                onClick={() => setShowReasons(true)}
                className="opacity-40 hover:opacity-100 transition-opacity text-white flex items-center justify-center"
                title="Mala respuesta"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="currentColor"><path d="M240-840h440v520L400-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-280q9-20 30-34t44-14Zm360 80H240L120-480v80h360l-54 220 174-174v-406Zm0 406v-406 406Zm80 34v-80h120v-360H680v-80h200v520H680Z"/></svg>
              </button>
            </>
          ) : (
            <div className="flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
              <span className="text-[11px] text-white/50 mr-1 self-center">¿Qué falló?</span>
              {["Inexacto", "Irrelevante", "Tono", "Otro"].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setShowReasons(false);
                    onFeedback?.(message.id, -1, r);
                  }}
                  className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10.5px] text-red-200 hover:bg-red-500/20 transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {message.feedback === 1 && (
        <div className="mt-2 text-[11px] text-white/30 animate-in fade-in flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M720-120H320v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h218q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-480 0v-520h160v520H240Z"/></svg>
          Gracias por tu feedback
        </div>
      )}
      {message.feedback === -1 && (
        <div className="mt-2 text-[11px] text-red-400/50 animate-in fade-in flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor"><path d="M240-840h400v520L360-40l-50-50q-7-7-11.5-19t-4.5-23v-14l44-174H120q-32 0-56-24t-24-56v-80q0-7 2-15t4-15l120-280q9-20 30-34t44-14Zm480 0v520H560v-520h160Z"/></svg>
          Feedback registrado ({message.feedbackReason || 'Otro'})
        </div>
      )}
    </motion.div>
  );
}

function Caret() {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-[13px] w-[1.5px] translate-y-[2px] animate-pulse align-baseline"
      style={{ backgroundColor: "#F540FF" }}
    />
  );
}

/**
 * Mini-markdown renderer para los mensajes del agente:
 *   - **bold**
 *   - [texto](href)  → <a> con styling del sistema
 *   - Listas con `- ` o `*   ` o `1. ` al inicio de línea
 *   - Saltos de párrafo (línea en blanco)
 *   - Saltos de línea simples → <br/>
 *
 * No es CommonMark completo — apenas lo que el bot usa. Si en el futuro
 * el modelo empieza a escribir tablas, headers o code fences, agregar
 * acá. Mantener pequeño y predecible.
 */
function FormattedMarkdown({ text }: { text: string }) {
  // Particionar en bloques por línea en blanco. Cada bloque puede ser
  // un párrafo o una lista (si todas sus líneas arrancan con bullet).
  const blocks = text.split(/\n\n+/);
  return (
    <div className="space-y-2 text-[13.5px] leading-relaxed text-white/90">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((l) => l.length > 0);
        const isList = lines.length > 0 && lines.every((l) => /^[\s]*([-*]|\d+\.)\s+/.test(l));
        if (isList) {
          const items = lines.map((l) => l.replace(/^[\s]*([-*]|\d+\.)\s+/, ""));
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 marker:text-white/40">
              {items.map((it, j) => (
                <li key={j}>{renderInline(it)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{renderInline(block)}</p>;
      })}
    </div>
  );
}

// Tokens inline que el renderer reconoce. Procesados en pasos sucesivos:
// primero links (pueden contener `**` adentro), después bold, después
// texto plano con saltos de línea.
function renderInline(s: string): React.ReactNode {
  return renderLinks(s);
}

function renderLinks(s: string): React.ReactNode {
  const out: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) {
      out.push(<React.Fragment key={`tx-${k++}`}>{renderBold(s.slice(last, m.index), `b-${k}`)}</React.Fragment>);
    }
    const linkText = m[1];
    const href = m[2];
    const isExternal = /^https?:\/\//i.test(href);
    out.push(
      <a
        key={`a-${k++}`}
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-white underline underline-offset-[3px] decoration-white/30 hover:decoration-[#F540FF] transition-colors"
      >
        {renderBold(linkText, `lb-${k}`)}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < s.length) {
    out.push(<React.Fragment key={`tx-${k++}`}>{renderBold(s.slice(last), `b-${k}`)}</React.Fragment>);
  }
  return out;
}

function renderBold(s: string, keyPrefix: string): React.ReactNode {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(renderLines(s.slice(last, m.index), `${keyPrefix}-t-${k++}`));
    out.push(
      <strong key={`${keyPrefix}-b-${k++}`} className="font-medium text-white">
        {m[1]}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(renderLines(s.slice(last), `${keyPrefix}-t-${k++}`));
  return out;
}

function renderLines(s: string, key: string): React.ReactNode {
  const parts = s.split("\n");
  return parts.map((p, i) => (
    <React.Fragment key={`${key}-${i}`}>
      {i > 0 && <br />}
      {p}
    </React.Fragment>
  ));
}
