"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import type { AgentInfo } from "./ShifterShell";

// Selector de agente en el header del cockpit. Navega por ruta
// (/agent-admin/<id>) → el estado de chat no se cruza entre agentes.
export default function AgentSwitcher({
  agentId,
  agentName,
  agents,
}: {
  agentId: string;
  agentName: string;
  agents: AgentInfo[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const multi = agents.length > 1;

  const go = (id: string) => {
    setOpen(false);
    if (id === agentId) return;
    const tab = searchParams.get("tab");
    router.push(`/agent-admin/${id}${tab ? `?tab=${tab}` : ""}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => multi && setOpen((v) => !v)}
        aria-haspopup={multi}
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F540FF]/40 ${
          multi ? "hover:border-white/20 cursor-pointer" : "cursor-default"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-[#00FF88]" />
        <span className="[font-family:var(--font-figtree)] text-[12px] font-semibold text-white">{agentName}</span>
        {multi && <ChevronDown size={14} className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {open && multi && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-white/[0.08] bg-[#0A0E27] p-1 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
            {agents.map((a) => (
              <button
                key={a.id}
                onClick={() => go(a.id)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.05] focus:outline-none"
              >
                <span className="flex items-center gap-2">
                  <span className="[font-family:var(--font-figtree)] text-[13px] text-white/90">{a.displayName}</span>
                  {a.status === "awakening" && (
                    <span className="rounded bg-[#7C5CFF]/15 px-1.5 py-0.5 [font-family:var(--font-fira-mono)] text-[9px] uppercase tracking-[0.08em] text-[#B9A6FF]">
                      despertando
                    </span>
                  )}
                </span>
                {a.id === agentId && <Check size={14} className="shrink-0 text-[#00FF88]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
