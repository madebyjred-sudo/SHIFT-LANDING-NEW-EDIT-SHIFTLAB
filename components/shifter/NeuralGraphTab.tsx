"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LabDotGrid, LabCornerMarks } from "@/components/ui/lab-primitives";
import { X } from "lucide-react";
import type { ShifterMemory, ParsedSource, IcmFile } from "@/lib/shifter-icm";

type NodeType = "core" | "persona" | "rule" | "registry" | "source-global" | "source-latam" | "doc";

interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  description: string;
  x: number;
  y: number;
  meta?: string;
}

interface GraphLink {
  from: string;
  to: string;
}

const TYPE_COLORS: Record<NodeType, string> = {
  core: "#00FF88",
  persona: "#F540FF",
  rule: "#5BE9FF",
  registry: "#f59e0b",
  "source-global": "#3b82f6",
  "source-latam": "#8b5cf6",
  doc: "#ffffff",
};

const TYPE_LABELS: Record<NodeType, string> = {
  core: "Núcleo",
  persona: "Persona",
  rule: "Regla editorial",
  registry: "Registro",
  "source-global": "Fuente global",
  "source-latam": "Fuente Latam",
  doc: "Documento ICM",
};

function deriveNodes(memory: ShifterMemory, agentName: string): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Core identity node
  nodes.push({
    id: "shifter-core",
    name: `${agentName} Core`,
    type: "core",
    description: `Núcleo de identidad de ${agentName}. ICM propio + memoria aislada.`,
    x: 400,
    y: 300,
    meta: "ICM",
  });

  // ICM docs around center in a lower arc
  const icmDocs: IcmFile[] = memory.folders.flatMap((f) => f.files);
  const docRadiusX = 260;
  const docRadiusY = 160;
  const docStartAngle = Math.PI * 0.15;
  const docEndAngle = Math.PI * 0.85;
  const docsToShow = icmDocs.slice(0, 8);
  docsToShow.forEach((doc, idx) => {
    const angle = docStartAngle + ((docEndAngle - docStartAngle) * idx) / Math.max(docsToShow.length - 1, 1);
    const x = 400 + Math.cos(angle) * docRadiusX;
    const y = 300 + Math.sin(angle) * docRadiusY;
    const type: NodeType =
      doc.name.includes("persona") ? "persona" : doc.name.includes("company") ? "rule" : doc.name.includes("registry") ? "registry" : "doc";
    const id = `icm-${doc.id}`;
    nodes.push({
      id,
      name: doc.name.replace(/\.md$/, ""),
      type,
      description: doc.relativePath,
      x,
      y,
      meta: `${(doc.size / 1024).toFixed(1)} KB`,
    });
    links.push({ from: "shifter-core", to: id });
  });

  // Sources as orbital outer ring
  const globalSources = memory.sources.filter((s) => s.scope === "global");
  const latamSources = memory.sources.filter((s) => s.scope === "latam");

  const placeSources = (sources: ParsedSource[], radius: number, yOffset: number, type: NodeType) => {
    const count = sources.length;
    const spread = 360;
    const step = spread / Math.max(count, 1);
    const start = -spread / 2;
    sources.forEach((s, idx) => {
      const angleDeg = start + idx * step + (type === "source-latam" ? 180 : 0);
      const angle = (angleDeg * Math.PI) / 180;
      const x = 400 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius * 0.65 + yOffset;
      const id = `src-${s.url.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40)}`;
      nodes.push({
        id,
        name: s.name,
        type,
        description: s.description || s.url,
        x,
        y,
        meta: s.scope,
      });
      links.push({ from: "shifter-core", to: id });
    });
  };

  placeSources(globalSources, 360, -40, "source-global");
  placeSources(latamSources, 360, 40, "source-latam");

  return { nodes, links };
}

function linePath(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
}

export default function NeuralGraphTab({
  memory,
  colorCore = "#00FF88",
  agentName = "Shifter",
}: {
  memory: ShifterMemory;
  colorCore?: string;
  agentName?: string;
}) {
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const { nodes, links } = deriveNodes(memory, agentName);
  const nodeColor = (t: NodeType) => (t === "core" ? colorCore : TYPE_COLORS[t]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <LabDotGrid opacity={0.15} />

      <div className="absolute left-5 top-5 z-10 max-w-md pointer-events-none md:left-8 md:top-6">
        <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.18em] text-[#8B92B5]">
          // 02_KnowledgeMap
        </p>
        <h2 className="mt-1 [font-family:var(--font-zilla-slab)] text-[26px] font-bold leading-[1.05] text-white md:text-[34px]">
          {agentName}
          <br />
          <span className="text-[#F540FF]">Knowledge Map.</span>
        </h2>
        <p className="mt-2 max-w-[32ch] [font-family:var(--font-fira-mono)] text-[11px] leading-[1.6] text-white/50 md:text-[12px]">
          ICM real + fuentes de research conectadas. {memory.totalFiles} documentos, {memory.sources.length} fuentes indexadas.
        </p>
      </div>

      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-label="Mapa de conocimiento de Shifter"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {links.map((link, idx) => {
          const a = nodes.find((n) => n.id === link.from)!;
          const b = nodes.find((n) => n.id === link.to)!;
          const dim = hovered && hovered !== a.id && hovered !== b.id;
          return (
            <motion.path
              key={`${link.from}-${link.to}`}
              d={linePath(a.x, a.y, b.x, b.y)}
              fill="none"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth={1.5}
              initial={reducedMotion ? {} : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: dim ? 0.15 : 0.55 }}
              transition={{ duration: 0.8, delay: idx * 0.02 }}
            />
          );
        })}

        {nodes.map((node, idx) => {
          const isHovered = hovered === node.id;
          const isDimmed = hovered && hovered !== node.id;
          const r = node.type === "core" ? 18 : node.type.startsWith("source-") ? 7 : 10;
          return (
            <g
              key={node.id}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(node)}
              className="cursor-pointer"
              style={{ opacity: isDimmed ? 0.3 : 1, transition: "opacity 0.2s" }}
            >
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={nodeColor(node.type)}
                filter={isHovered || node.type === "core" ? "url(#glow)" : undefined}
                initial={reducedMotion ? {} : { scale: 0, opacity: 0 }}
                animate={{ scale: isHovered ? 1.2 : 1, opacity: 1 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
              />
              {node.type === "core" && (
                <circle cx={node.x} cy={node.y} r={26} fill="none" stroke={nodeColor(node.type)} strokeOpacity={0.25} strokeWidth={1} />
              )}
              <text
                x={node.x}
                y={node.y + r + (node.type.startsWith("source-") ? 14 : 18)}
                textAnchor="middle"
                className="select-none [font-family:var(--font-fira-mono)]"
                fill={isHovered ? "#ffffff" : "rgba(255,255,255,0.75)"}
                fontSize={node.type.startsWith("source-") ? 9 : 10}
              >
                {node.name.length > 22 ? node.name.slice(0, 20) + "…" : node.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-5 left-5 z-10 hidden rounded-xl border border-white/[0.08] bg-[#141A36]/90 p-4 backdrop-blur-md md:block">
        <p className="mb-2 [font-family:var(--font-figtree)] text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70">
          Leyenda
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <div key={type} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[type as NodeType] }} />
              <span className="[font-family:var(--font-fira-mono)] text-[11px] text-white/70">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
            className="absolute right-3 top-3 bottom-3 z-20 w-72 rounded-2xl border border-white/[0.08] bg-[#141A36]/95 p-5 backdrop-blur-xl md:right-5 md:top-5 md:bottom-5 md:w-80"
          >
            <LabCornerMarks color="rgba(245,64,255,0.45)" />
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.18em] text-[#8B92B5]">
                    {TYPE_LABELS[selected.type]}
                  </p>
                  <h3 className="mt-1 [font-family:var(--font-figtree)] text-[16px] font-semibold leading-[1.25] text-white">
                    {selected.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label="Cerrar panel"
                  className="shrink-0 rounded-lg p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F540FF]/60"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="[font-family:var(--font-fira-mono)] text-[12px] leading-[1.7] text-white/70">
                    {selected.description}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between [font-family:var(--font-fira-mono)] text-[11px]">
                    <span className="text-white/40">Conexiones</span>
                    <span className="text-white/80">
                      {links.filter((l) => l.from === selected.id || l.to === selected.id).length}
                    </span>
                  </div>
                  {selected.meta && (
                    <div className="flex justify-between [font-family:var(--font-fira-mono)] text-[11px]">
                      <span className="text-white/40">Meta</span>
                      <span className="text-white/80">{selected.meta}</span>
                    </div>
                  )}
                  <div className="flex justify-between [font-family:var(--font-fira-mono)] text-[11px]">
                    <span className="text-white/40">Estado</span>
                    <span className="text-[#00FF88]">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
