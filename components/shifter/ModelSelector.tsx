"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Cpu } from "lucide-react";
import type { ModelOption } from "./ShifterShell";

export default function ModelSelector({
  models,
  selected,
  onChange,
}: {
  models: ModelOption[];
  selected: ModelOption;
  onChange: (model: ModelOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#141A36]/70 px-3 py-2 text-left transition-colors hover:border-[#F540FF]/40 hover:bg-[#141A36] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F540FF]/50"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#F540FF]">
          <Cpu size={15} />
        </span>
        <div className="hidden sm:block">
          <p className="[font-family:var(--font-fira-mono)] text-[10px] text-white/40">Modelo activo</p>
          <p className="[font-family:var(--font-figtree)] text-[12px] font-semibold text-white leading-none">
            {selected.name}
          </p>
        </div>
        <span className="ml-1 rounded bg-white/[0.06] px-1.5 py-0.5 [font-family:var(--font-fira-mono)] text-[9px] text-white/50">
          {selected.badge}
        </span>
        <ChevronDown
          size={14}
          className={`ml-1 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-white/[0.08] bg-[#141A36]/95 p-1 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          {models.map((model) => (
            <li key={model.id} role="option" aria-selected={model.id === selected.id}>
              <button
                onClick={() => {
                  onChange(model);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F540FF]/50 ${
                  model.id === selected.id
                    ? "bg-[#F540FF]/10 text-white"
                    : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    model.id === selected.id ? "bg-[#F540FF] shadow-[0_0_8px_#F540FF]" : "bg-white/20"
                  }`}
                />
                <span className="flex-1 [font-family:var(--font-figtree)] text-[13px] font-medium">
                  {model.name}
                </span>
                <span className="rounded bg-white/[0.05] px-1.5 py-0.5 [font-family:var(--font-fira-mono)] text-[9px] text-white/40">
                  {model.badge}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
