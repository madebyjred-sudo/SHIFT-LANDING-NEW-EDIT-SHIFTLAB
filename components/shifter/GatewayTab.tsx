"use client";

import { useState } from "react";
import { Terminal, ExternalLink, Loader2 } from "lucide-react";

// Consola OpenClaw (gateway con funciones completas: archivos, exec, etc.)
// servida en su propio subdominio (same-origin → su WebSocket /acp resuelve).
const GATEWAY_URL = "https://shifter.shiftlatam.agency";

export default function GatewayTab() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
        <div className="flex items-center gap-2 text-white/80">
          <Terminal size={14} className="text-[#F540FF]" />
          <span className="[font-family:var(--font-figtree)] text-[12px] font-semibold uppercase tracking-[0.12em]">
            Gateway · Consola OpenClaw
          </span>
        </div>
        <a
          href={GATEWAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-white/60 transition-colors hover:border-white/20 hover:text-white"
        >
          <ExternalLink size={13} />
          <span className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.1em]">Abrir aparte</span>
        </a>
      </div>
      <div className="relative min-h-0 flex-1">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0A0E27]">
            <div className="flex items-center gap-2 text-white/50">
              <Loader2 size={16} className="animate-spin text-[#F540FF]" />
              <span className="[font-family:var(--font-fira-mono)] text-[12px]">Conectando a la consola…</span>
            </div>
          </div>
        )}
        <iframe
          src={GATEWAY_URL}
          title="OpenClaw Gateway Console"
          onLoad={() => setLoaded(true)}
          className="h-full w-full border-0"
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
