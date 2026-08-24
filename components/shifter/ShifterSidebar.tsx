"use client";

import { Network, FolderOpen, Terminal, SquareTerminal } from "lucide-react";

type Tab = "graph" | "memory" | "comms" | "gateway";

const TABS: { id: Tab; label: string; icon: typeof Network }[] = [
  { id: "graph", label: "Neural Graph", icon: Network },
  { id: "memory", label: "Memory", icon: FolderOpen },
  { id: "comms", label: "Comms", icon: Terminal },
  { id: "gateway", label: "Gateway", icon: SquareTerminal },
];

export function ShifterSidebar({
  activeTab,
  onChange,
}: {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav
      aria-label="Shifter secciones"
      className="hidden lg:flex w-64 flex-col border-r border-white/[0.08] bg-[#0A0E27]/90 backdrop-blur-xl"
    >
      <div className="px-5 py-6">
        <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.18em] text-[#8B92B5]">
          // 01_Navigation
        </p>
      </div>
      <div className="flex-1 px-3 space-y-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE9FF]/60 ${
                isActive
                  ? "bg-[#141A36] text-white"
                  : "text-white/60 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                  isActive
                    ? "border-[#F540FF]/40 bg-[#F540FF]/10 text-[#F540FF]"
                    : "border-white/10 bg-white/[0.03] text-white/60 group-hover:border-white/20 group-hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <span className="[font-family:var(--font-figtree)] text-[14px] font-semibold">
                {tab.label}
              </span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#F540FF] shadow-[0_0_8px_#F540FF]" />
              )}
            </button>
          );
        })}
      </div>
      <div className="border-t border-white/[0.08] p-4">
        <p className="[font-family:var(--font-fira-mono)] text-[10px] text-white/30">
          SHIFT LAB UNIT
        </p>
        <p className="[font-family:var(--font-fira-mono)] text-[10px] text-white/30">
          v2.0.0-architect
        </p>
      </div>
    </nav>
  );
}

export function ShifterBottomNav({
  activeTab,
  onChange,
}: {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav
      aria-label="Shifter secciones móvil"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[#0A0E27]/95 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-[72px] flex-col items-center gap-1 rounded-lg px-3 py-2 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE9FF]/60 ${
                isActive ? "text-[#F540FF]" : "text-white/50 hover:text-white"
              }`}
            >
              <Icon size={22} strokeWidth={1.8} />
              <span className="[font-family:var(--font-figtree)] text-[10px] font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
