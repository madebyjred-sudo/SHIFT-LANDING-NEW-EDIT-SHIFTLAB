// ----------------------------------------------------------------------
// /api/shifter/state — lee el estado REAL del agente Shifter
// ----------------------------------------------------------------------
// El cerebro del agente vive en el filesystem del host, montado en el
// container OpenClaw pero también legible directo por Next.js porque
// ambos corren desde /var/www/shiftlatam-web:
//
//   lib/avatar-factory/avatars/shifter/
//     ├── SOUL.md                  ← creencias evolutivas auto-escritas
//     ├── memory/entity-graph.md   ← el grafo de conocimiento (Neural Graph)
//     ├── memory/confidence-ledger.md
//     ├── memory/heartbeat-state.json
//     └── memory/cost-ledger.json  ← gasto del agente
//
// En dev local estos archivos no existen (solo el config estático) →
// devolvemos estructura vacía con `live: false` para que el cockpit
// muestre un estado "sin datos" en vez de romper.

import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AGENT_DIR = path.join(
  process.cwd(),
  "lib/avatar-factory/avatars/shifter",
);

function readFileSafe(rel: string): string | null {
  try {
    return fs.readFileSync(path.join(AGENT_DIR, rel), "utf-8");
  } catch {
    return null;
  }
}

function readJsonSafe<T>(rel: string): T | null {
  const txt = readFileSafe(rel);
  if (!txt) return null;
  try {
    return JSON.parse(txt) as T;
  } catch {
    return null;
  }
}

// ── Parse entity-graph.md → nodes + links para el force graph ────────
type GraphNode = {
  id: string;
  name: string;
  type: string;
  relevance: string;
  val: number;
  color: string;
};
type GraphLink = { source: string; target: string };

const TYPE_COLORS: Record<string, string> = {
  trend: "#F540FF",
  concept: "#5BAEFF",
  technology: "#5BE9FF",
  company: "#22c55e",
  person: "#f59e0b",
  default: "#9244d8",
};
const RELEVANCE_VAL: Record<string, number> = {
  high: 14,
  medium: 9,
  low: 5,
};

function parseEntityGraph(md: string | null): {
  nodes: GraphNode[];
  links: GraphLink[];
} {
  const ROOT: GraphNode = {
    id: "__shifter__",
    name: "Shifter Core",
    type: "core",
    relevance: "high",
    val: 24,
    color: "#22c55e",
  };
  if (!md) return { nodes: [ROOT], links: [] };

  const nodes: GraphNode[] = [ROOT];
  const links: GraphLink[] = [];

  // Bloques: ### Nombre \n - **Type:** x \n - **Relevance:** y
  const blocks = md.split(/\n###\s+/).slice(1);
  for (const b of blocks) {
    const name = b.split("\n", 1)[0].trim();
    if (!name) continue;
    const type = (b.match(/\*\*Type:\*\*\s*(\w+)/i)?.[1] || "default").toLowerCase();
    const relevance = (b.match(/\*\*Relevance:\*\*\s*(\w+)/i)?.[1] || "medium").toLowerCase();
    const id = name.toLowerCase().replace(/\s+/g, "_").slice(0, 60);
    nodes.push({
      id,
      name,
      type,
      relevance,
      val: RELEVANCE_VAL[relevance] ?? 9,
      color: TYPE_COLORS[type] ?? TYPE_COLORS.default,
    });
    links.push({ source: "__shifter__", target: id });
  }
  return { nodes, links };
}

// ── Parse confidence-ledger.md → counts por nivel ────────────────────
function parseConfidence(md: string | null) {
  if (!md) return { high: 0, medium: 0, low: 0, raw: null };
  const countRows = (section: string) => {
    const re = new RegExp(`##\\s*${section}[\\s\\S]*?(?=\\n##\\s|$)`, "i");
    const block = md.match(re)?.[0] ?? "";
    // filas de tabla = líneas que empiezan con | y no son separadores/headers
    const rows = block
      .split("\n")
      .filter((l) => l.trim().startsWith("|") && !/^\|[\s\-|]+\|$/.test(l.trim()))
      .filter((l) => !/Claim|Evidence|Why Low/i.test(l));
    return rows.length;
  };
  return {
    high: countRows("High Confidence"),
    medium: countRows("Medium Confidence"),
    low: countRows("Low Confidence"),
    raw: md,
  };
}

export async function GET() {
  const entityMd = readFileSafe("memory/entity-graph.md");
  const confidenceMd = readFileSafe("memory/confidence-ledger.md");
  const soul = readFileSafe("SOUL.md");
  const heartbeat = readJsonSafe<Record<string, unknown>>("memory/heartbeat-state.json");
  const costLedger = readJsonSafe<Record<string, unknown>>("memory/cost-ledger.json");

  const live = entityMd !== null || soul !== null;

  // Gasto de hoy (cost-ledger.json estructura: { "YYYY-MM-DD": { totalSpent } })
  let todaySpend: number | null = null;
  if (costLedger) {
    const today = new Date().toISOString().slice(0, 10);
    const rec = (costLedger as Record<string, { totalSpent?: number }>)[today];
    todaySpend = rec?.totalSpent ?? null;
  }

  return NextResponse.json({
    live,
    graph: parseEntityGraph(entityMd),
    confidence: parseConfidence(confidenceMd),
    soul,
    heartbeat,
    todaySpend,
    fetchedAt: new Date().toISOString(),
  });
}
