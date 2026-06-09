"use client";

import * as React from "react";
import type { Message } from "./agent-types";
import AgentMessage from "./AgentMessage";

/**
 * AgentMessages — lista vertical de turnos.
 *
 * Ahora que cada turno tiene su burbuja, no necesitamos dividers entre
 * mensajes — el respiro vertical hace el trabajo. Auto-scroll pegado al
 * fondo a menos que el usuario haya subido a leer historial.
 */
export default function AgentMessages({
  messages,
  onQuickChip,
  onFeedback,
}: {
  messages: Message[];
  onQuickChip: (text: string) => void;
  onFeedback?: (messageId: string, rating: 1 | -1, reason?: string) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const stuckToBottomRef = React.useRef(true);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      stuckToBottomRef.current = distance < 80;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!stuckToBottomRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  });

  return (
    <div className="relative min-h-0 flex-1">
      {/* Scroll container — absolute para que los fade overlays floten encima */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.16) transparent",
        }}
      >
        {messages.map((m, i) => (
          <AgentMessage
            key={m.id}
            message={m}
            isLast={i === messages.length - 1}
            onQuickChip={onQuickChip}
            onFeedback={onFeedback}
          />
        ))}
      </div>

      {/* Top edge fade — sugiere que hay scroll arriba (history) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-3"
        style={{
          background:
            "linear-gradient(to bottom, rgba(11,11,18,0.96), rgba(11,11,18,0))",
        }}
      />

      {/* Bottom edge fade — separa visualmente del composer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-4"
        style={{
          background:
            "linear-gradient(to top, rgba(11,11,18,0.96), rgba(11,11,18,0))",
        }}
      />
    </div>
  );
}
