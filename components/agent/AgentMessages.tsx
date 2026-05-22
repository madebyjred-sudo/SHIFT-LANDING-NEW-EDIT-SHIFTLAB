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
}: {
  messages: Message[];
  onQuickChip: (text: string) => void;
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
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4"
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
        />
      ))}
    </div>
  );
}
