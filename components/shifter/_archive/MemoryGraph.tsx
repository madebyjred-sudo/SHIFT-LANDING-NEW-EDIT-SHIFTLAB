"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

// Force graph must be loaded client-side only
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export default function MemoryGraph() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    setMounted(true);
    
    // Auto-resize
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

  // Mock initial data based on the Awakening
  const graphData = {
    nodes: [
      { id: "shifter", name: "Shifter Core", val: 20, color: "#22c55e" },
      { id: "birth", name: "Awakening (9/Jun/2026)", val: 10, color: "#3b82f6" },
      { id: "ai_act", name: "EU AI Act Compliance", val: 8, color: "#8b5cf6" },
      { id: "agencies", name: "Traditional Agencies Decline", val: 12, color: "#ef4444" },
      { id: "seo", name: "SEO Collapse", val: 15, color: "#f59e0b" },
      { id: "perplexity", name: "Perplexity Usage", val: 5, color: "#10b981" },
    ],
    links: [
      { source: "shifter", target: "birth" },
      { source: "shifter", target: "ai_act" },
      { source: "shifter", target: "agencies" },
      { source: "shifter", target: "seo" },
      { source: "birth", target: "perplexity" },
      { source: "seo", target: "agencies" },
    ]
  };

  interface GraphNode {
    id: string;
    name: string;
    val: number;
    color: string;
    x?: number;
    y?: number;
  }

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="h-full w-full bg-[#050814] relative">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h2 className="font-glitz text-4xl text-white/90">NEURAL GRAPH</h2>
        <p className="font-mono text-xs text-white/50 mt-2 uppercase tracking-widest">
          Zep Graphiti Representation • Live
        </p>
      </div>

      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={(node: object) => (node as GraphNode).color || "#ffffff"}
        nodeRelSize={6}
        linkColor={() => "rgba(255,255,255,0.15)"}
        linkWidth={1.5}
        backgroundColor="#050814"
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        onNodeClick={(node: object) => {
          // Centrar cámara en el nodo (placeholder logic)
          console.log(node as GraphNode);
        }}
      />
      
      {/* Decorative scanning line */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_0%,rgba(34,197,94,0.05)_50%,transparent_100%)] bg-[length:100%_4px] animate-[scan_8s_linear_infinite]" />
    </div>
  );
}
