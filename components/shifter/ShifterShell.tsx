"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ShifterSidebar, ShifterBottomNav } from "./ShifterSidebar";
import { ShifterHeader } from "./ShifterHeader";
import NeuralGraphTab from "./NeuralGraphTab";
import MemoryTab from "./MemoryTab";
import CommsTab from "./CommsTab";
import { LabDotGrid } from "@/components/ui/lab-primitives";
import type { ShifterMemory } from "@/lib/shifter-icm";
import type { OpenClawStatus } from "@/lib/shifter-system";
import type { ShifterStatus } from "@/lib/shifter-status";

type Tab = "graph" | "memory" | "comms";

export type ModelOption = {
  id: string;
  name: string;
  badge: string;
};

export const MODELS: ModelOption[] = [
  { id: "gpt-5.5", name: "GPT 5.5", badge: "OAI" },
  { id: "opus-4.8", name: "Opus 4.8", badge: "ANTH" },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", badge: "GOO" },
  { id: "sonnet-4.6", name: "Sonnet 4.6", badge: "ANTH" },
];

export default function ShifterShell({
  memory,
  system,
  status,
}: {
  memory: ShifterMemory;
  system: OpenClawStatus;
  status: ShifterStatus;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTabState] = useState<Tab>(() => {
    const t = searchParams.get("tab");
    return t === "memory" || t === "comms" ? t : "graph";
  });
  const [selectedModel, setSelectedModel] = useState<ModelOption>(() => {
    const inferred = MODELS.find((m) => system.model?.toLowerCase().includes(m.id.split("-")[0]));
    return inferred || MODELS[0];
  });
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login?redirectTo=/newsroom/ShifterAI");
        return;
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [router, supabase]);
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "memory" || t === "comms" || t === "graph") {
      setActiveTabState(t);
    } else {
      setActiveTabState("graph");
    }
  }, [searchParams]);

  // Hide site footer only on this page without touching layout.tsx
  useEffect(() => {
    if (typeof document === "undefined") return;
    const main = document.getElementById("main-content");
    if (!main) return;
    const footerWrapper = main.nextElementSibling as HTMLElement | null;
    if (footerWrapper) {
      const prev = footerWrapper.style.display;
      footerWrapper.style.display = "none";
      return () => {
        footerWrapper.style.display = prev;
      };
    }
  }, []);

  const setActiveTab = (tab: Tab) => {
    setActiveTabState(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] w-full items-center justify-center bg-[#0A0E27] pt-20 text-white md:pt-24">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#F540FF]" />
          <p className="[font-family:var(--font-fira-mono)] text-[12px] text-white/60">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate flex min-h-[calc(100dvh-64px)] w-full overflow-hidden bg-[#0A0E27] pt-20 text-white md:pt-24">
      <LabDotGrid opacity={0.18} />
      <ShifterSidebar activeTab={activeTab} onChange={setActiveTab} />
      <div className="relative z-10 flex flex-1 flex-col min-w-0">
        <ShifterHeader
          activeTab={activeTab}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
        <main className="flex-1 overflow-hidden">
          {mounted && (
            <TabPanel activeTab={activeTab} memory={memory} system={system} status={status} selectedModel={selectedModel} />
          )}
        </main>
      </div>
      <ShifterBottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}

function TabPanel({
  activeTab,
  memory,
  system,
  status,
  selectedModel,
}: {
  activeTab: Tab;
  memory: ShifterMemory;
  system: OpenClawStatus;
  status: ShifterStatus;
  selectedModel: ModelOption;
}) {
  if (activeTab === "graph") return <NeuralGraphTab memory={memory} />;
  if (activeTab === "memory") return <MemoryTab memory={memory} />;
  return <CommsTab selectedModel={selectedModel} system={system} memory={memory} status={status} />;
}
