"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

// Force graph must be loaded client-side only
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface GraphNode {
  id: string;
  name: string;
  type: string;
  relevance: string;
  val: number;
  color: string;
  x?: number;
  y?: number;
}
interface GraphLink {
  source: string;
  target: string;
}
interface ShifterState {
  live: boolean;
  graph: { nodes: GraphNode[]; links: GraphLink[] };
  confidence: { high: number; medium: number; low: number };
  todaySpend: number | null;
  fetchedAt: string;
}

export default function MemoryGraph() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [state, setState] = useState<ShifterState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Fetch real agent state — refresca cada 60s (el agente actualiza su
  // grafo en cada heartbeat / research cycle).
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/shifter/state", { cache: "no-store" });
        const json = (await res.json()) as ShifterState;
        if (alive) setState(json);
      } catch {
        /* keep last */
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!mounted) return null;

  const graphData = state?.graph ?? { nodes: [], links: [] };
  const entityCount = Math.max(0, graphData.nodes.length - 1); // -1 por el root

  return (
    <div ref={containerRef} className="h-full w-full bg-[#050814] relative">
      {/* HUD top-left */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h2 className="font-glitz text-4xl text-white/90">NEURAL GRAPH</h2>
        <p className="font-mono text-xs text-white/50 mt-2 uppercase tracking-widest flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              state?.live ? "bg-green-500 animate-pulse" : "bg-yellow-500"
            }`}
          />
          {loading
            ? "Sincronizando memoria…"
            : state?.live
              ? `${entityCount} entidades · file-based memory`
              : "Sin datos en vivo (dev / agente dormido)"}
        </p>
      </div>

      {/* HUD top-right — stats reales */}
      {state?.live && (
        <div className="absolute top-8 right-8 z-10 pointer-events-none text-right font-mono text-[11px] text-white/60 space-y-1">
          <div>
            confidence:{" "}
            <span className="text-green-400">{state.confidence.high}H</span>{" "}
            <span className="text-blue-400">{state.confidence.medium}M</span>{" "}
            <span className="text-amber-400">{state.confidence.low}L</span>
          </div>
          {state.todaySpend != null && (
            <div>
              hoy: <span className="text-white/80">${state.todaySpend.toFixed(2)}</span> / $5.50
            </div>
          )}
        </div>
      )}

      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(n: object) => {
          const node = n as GraphNode;
          return `${node.name}${node.type !== "core" ? ` (${node.type} · ${node.relevance})` : ""}`;
        }}
        nodeColor={(node: object) => (node as GraphNode).color || "#ffffff"}
        nodeRelSize={6}
        linkColor={() => "rgba(255,255,255,0.12)"}
        linkWidth={1.2}
        backgroundColor="#050814"
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        nodeCanvasObjectMode={() => "after"}
        nodeCanvasObject={(node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const n = node as GraphNode;
          // Etiqueta solo para core + entidades no-low, para no saturar
          if (n.type !== "core" && n.relevance === "low") return;
          const label = n.name;
          const fontSize = Math.max(10, 12 / globalScale);
          ctx.font = `${fontSize}px ui-monospace, monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          const y = (n.y ?? 0) + (n.val ?? 6) / globalScale + 2;
          ctx.fillText(label.length > 28 ? label.slice(0, 27) + "…" : label, n.x ?? 0, y);
        }}
      />

      {/* Decorative scanning line */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_0%,rgba(34,197,94,0.05)_50%,transparent_100%)] bg-[length:100%_4px] animate-[scan_8s_linear_infinite]" />
    </div>
  );
}
