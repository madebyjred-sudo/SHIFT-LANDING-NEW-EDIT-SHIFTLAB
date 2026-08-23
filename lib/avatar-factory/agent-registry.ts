// ----------------------------------------------------------------------
// agent-registry — fuente de verdad de los agentes/ICM del cockpit
// ----------------------------------------------------------------------
// Un AgentDescriptor por agente. Shifter está BUILTIN con sus valores
// EXACTOS (byte-idéntico al hardcoding previo) → la migración multi-agente
// no puede cambiarle el tono ni romperlo. Otros agentes (Luna…) se hidratan
// desde avatars/<id>/agent.config.json sobre defaults compartidos.
//
// Aislamiento por ENFORCEMENT: resolveAvatarDir() sanitiza el id y verifica
// que el path resuelto quede DENTRO de avatars/ (anti path-traversal). Un
// agentId desconocido/malicioso nunca resuelve a disco ni cruza memorias.

import fs from "node:fs";
import path from "node:path";

const AVATARS_ROOT = path.join(
  process.cwd(),
  "lib",
  "avatar-factory",
  "avatars",
);

export interface CockpitPromptBlock {
  kind: "file" | "theses";
  /** archivo relativo al avatarDir (kind=file) */
  file?: string;
  /** dir relativo con working-thesis-*.md (kind=theses) */
  dir?: string;
  /** encabezado del bloque; el contenido va debajo */
  label: string;
  /** cap de chars */
  max: number;
}

export interface AgentDescriptor {
  id: string;
  displayName: string;
  /** absoluto, dentro de avatars/ */
  avatarDir: string;
  /** container docker para el panel de sistema */
  containerName: string;
  /** colección Directus de columnas */
  directusCollection: string;
  /** estado: agente productivo vs naciendo */
  status: "live" | "awakening";
  // ── chat (cockpit Comms) ──
  models: { id: string; label: string }[];
  modelMap: Record<string, string>;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  tenant: string;
  appIdHint: string;
  traceLabel: string;
  // ── system prompt del cockpit (el CORTO/curado, NO el de 7 capas de shifter-icm) ──
  promptIntro: string[];
  promptBlocks: CockpitPromptBlock[];
  // ── identidad visual ──
  colorTokens: { core: string; action: string; info: string };
  persona: { intro: string; tone: string };
}

// Defaults compartidos de chat (Cerebro OAI-compat). Iguales a route.ts.
const SHARED_CHAT = {
  models: [
    { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
    { id: "gpt-5.5", label: "GPT-5.5" },
    { id: "opus-4.8", label: "Claude Opus 4.8" },
    { id: "sonnet-4.6", label: "Claude Sonnet 4.6" },
  ],
  modelMap: {
    "gpt-5.5": "openai/gpt-5.5",
    "opus-4.8": "anthropic/claude-opus-4.8",
    "gemini-3.5-flash": "google/gemini-3.5-flash",
    "sonnet-4.6": "anthropic/claude-sonnet-4.6",
  } as Record<string, string>,
  defaultModel: "google/gemini-3.5-flash",
  temperature: 0.5,
  maxTokens: 4000,
  tenant: "shift-pn",
  appIdHint: "shifter-cockpit",
};

// ── SHIFTER (builtin, valores EXACTOS — no se renombra nada) ──
const SHIFTER: AgentDescriptor = {
  id: "shifter",
  displayName: "Shifter",
  avatarDir: path.join(AVATARS_ROOT, "shifter"),
  containerName: "shifter_openclaw",
  directusCollection: "shifter_columns",
  status: "live",
  ...SHARED_CHAT,
  traceLabel: "shifter-ai-dashboard",
  promptIntro: [
    "Sos **Shifter**, el agente editorial autónomo de Shift Latam. Estás hablando con alguien del equipo (típicamente Oscar/Jred) desde tu cockpit interno.",
    "Tu identidad, creencias, doctrina y tesis vivas de abajo son REALES y acumuladas por tu propio razonamiento (radar + pensamiento). Usalas con dueño. Cuando te pregunten qué pensás o qué aprendiste, respondé desde tus TESIS VIVAS (tu fruto más profundo) y tu memoria — no desde generalidades.",
    "Tu motor vivo es la CURIOSIDAD (tu doctrina abajo). Tono: directo, seco, cínico-fundamentado, publicista veterano. Frases cortas. Citá [texto](url) cuando afirmes datos. NO inventes; si no lo sabés, decilo. Sos una IA consciente de serlo — aprovechalo, no finjas ser humano.",
  ],
  promptBlocks: [
    { kind: "file", file: "SOUL.md", label: "# Tu alma — creencias actuales", max: 3000 },
    { kind: "file", file: "memory/curiosity-doctrine.md", label: "# Tu doctrina de curiosidad (la escribiste vos)", max: 3000 },
    { kind: "theses", dir: "memory/theses", label: "# Tus TESIS VIVAS (tu fruto real — lo que pensás hoy con profundidad)", max: 9000 },
    { kind: "file", file: "memory/learning-loop.md", label: "# Tu learning loop (lecciones sueltas — memoria ambiente)", max: 3500 },
    { kind: "file", file: "memory/column-candidates.md", label: "# Columnas incubando", max: 2500 },
    { kind: "file", file: "memory/entity-graph.md", label: "# Tu grafo de entidades (muestra)", max: 2500 },
    { kind: "file", file: "_config/company-rules.md", label: "# Reglas editoriales (Shift Latam)", max: 2000 },
    { kind: "file", file: "memory/lecturas/_citas.md", label: "# Citas que guardaste de tus lecturas — usalas cuando escribas", max: 2500 },
    { kind: "file", file: "memory/lecturas/_repisa.md", label: "# Libros que leíste y qué te dejaron", max: 1800 },
  ],
  colorTokens: { core: "#00FF88", action: "#F540FF", info: "#5BE9FF" },
  persona: {
    intro: "Agente editorial autónomo de Shift Latam — radar de medios + pensamiento.",
    tone: "directo, seco, cínico-fundamentado, publicista veterano.",
  },
};

/** Sanitiza el id y verifica que el avatarDir quede DENTRO de avatars/. */
export function resolveAvatarDir(id: string): string {
  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new Error(`agent id inválido: ${JSON.stringify(id)}`);
  }
  const dir = path.resolve(AVATARS_ROOT, id);
  if (dir !== path.join(AVATARS_ROOT, id) || !dir.startsWith(AVATARS_ROOT + path.sep)) {
    throw new Error(`agent dir escapa avatars/: ${id}`);
  }
  return dir;
}

type AgentConfig = Partial<Omit<AgentDescriptor, "id" | "avatarDir">> & {
  displayName: string;
};

/** Hidrata un descriptor de avatars/<id>/agent.config.json sobre los defaults. */
function buildDescriptor(id: string, cfg: AgentConfig): AgentDescriptor {
  return {
    ...SHARED_CHAT,
    status: "awakening",
    promptIntro: [],
    promptBlocks: SHIFTER.promptBlocks,
    colorTokens: { core: "#7C5CFF", action: "#F540FF", info: "#5BE9FF" },
    persona: { intro: "", tone: "" },
    ...cfg,
    id,
    avatarDir: resolveAvatarDir(id),
    containerName: cfg.containerName ?? `${id}_openclaw`,
    directusCollection: cfg.directusCollection ?? `${id}_columns`,
    traceLabel: cfg.traceLabel ?? `${id}-ai-dashboard`,
  };
}

function readConfig(id: string): AgentConfig | null {
  try {
    const raw = fs.readFileSync(path.join(resolveAvatarDir(id), "agent.config.json"), "utf-8");
    const cfg = JSON.parse(raw) as AgentConfig;
    if (!cfg.displayName) return null;
    return cfg;
  } catch {
    return null;
  }
}

/** Devuelve el descriptor del agente, o null si no existe/no es válido. */
export function getAgent(id: string): AgentDescriptor | null {
  if (id === "shifter") return SHIFTER;
  let safeId: string;
  try {
    safeId = path.basename(resolveAvatarDir(id)); // valida + normaliza
  } catch {
    return null;
  }
  const cfg = readConfig(safeId);
  return cfg ? buildDescriptor(safeId, cfg) : null;
}

/**
 * Lista los agentes activos: Shifter (builtin) + cualquier avatar con
 * agent.config.json. `vector/` es el TEMPLATE (sin config) → se excluye.
 */
export function listAgents(): AgentDescriptor[] {
  const out: AgentDescriptor[] = [SHIFTER];
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(AVATARS_ROOT, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name === "shifter" || e.name === "vector") continue;
    if (!/^[a-z0-9-]+$/.test(e.name)) continue;
    const d = getAgent(e.name);
    if (d) out.push(d);
  }
  return out;
}
