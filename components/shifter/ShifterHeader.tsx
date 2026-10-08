"use client";

import { useEffect, useState } from "react";
import { LabStatusPill } from "@/components/ui/lab-primitives";
import ModelSelector from "./ModelSelector";
import AgentSwitcher from "./AgentSwitcher";
import type { ModelOption, AgentInfo } from "./ShifterShell";

type Tab = "graph" | "memory" | "comms" | "gateway";

const TAB_TITLES: Record<Tab, string> = {
  graph: "Neural Graph",
  memory: "Memory Archives",
  comms: "Comms Terminal",
  gateway: "Gateway Console",
};

export function ShifterHeader({
  activeTab,
  selectedModel,
  onModelChange,
  agentId = "shifter",
  agentName = "Shifter",
  agents = [],
}: {
  activeTab: Tab;
  selectedModel: ModelOption;
  onModelChange: (model: ModelOption) => void;
  agentId?: string;
  agentName?: string;
  agents?: AgentInfo[];
}) {
  const [time, setTime] = useState<string>("--:--:--");

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("es-CR", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#0A0E27]/80 px-4 backdrop-blur-md md:px-5">
      <div className="flex items-center gap-3 min-w-0">
        <AgentSwitcher agentId={agentId} agentName={agentName} agents={agents} />
        <span className="hidden sm:inline-block h-6 w-px bg-white/10" />
        <ModelSelector
          selected={selectedModel}
          onChange={onModelChange}
          models={[
            { id: "gpt-5.5", name: "GPT 5.5", badge: "OAI" },
            { id: "opus-4.8", name: "Opus 4.8", badge: "ANTH" },
            { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", badge: "GOO" },
            { id: "sonnet-4.6", name: "Sonnet 4.6", badge: "ANTH" },
          ]}
        />
        <span className="hidden sm:inline-block h-6 w-px bg-white/10" />
        <span className="hidden truncate text-white/70 sm:inline-block [font-family:var(--font-figtree)] text-[12px] font-semibold uppercase tracking-[0.06em]">
          {TAB_TITLES[activeTab]}
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <LabStatusPill status="ONLINE" color="#00FF88" />
        <time
          dateTime={time}
          className="hidden md:block [font-family:var(--font-fira-mono)] text-[12px] text-white/60 tabular-nums"
        >
          {time}
        </time>
      </div>
    </header>
  );
}
