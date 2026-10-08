import { promises as fs } from "fs";
import path from "path";
import type { Dirent } from "fs";
import { getAgent } from "./avatar-factory/agent-registry";

// Binary / non-text files the cockpit must never read as UTF-8 (the agent's
// dedup DB alone is ~24MB). Transient `last-think-*` dumps are skipped by name.
const SKIP_EXT = new Set([
  ".db", ".sqlite", ".sqlite3", ".png", ".jpg", ".jpeg", ".gif",
  ".webp", ".ico", ".pdf", ".zip", ".gz", ".lock",
]);
// Above this size we keep the file in the tree but don't load its content.
const MAX_CONTENT_BYTES = 256 * 1024;
// Raw working data the cockpit doesn't need: the agent's research output
// (`stages/`), run logs (`runs/`) and scraped articles (`output/`) accumulate
// to 1,000+ files / ~16MB over a week. The cockpit shows the *curated* mind
// (_config, memory, skills, root identity files), so we never descend here.
const SKIP_DIR = new Set(["stages", "runs", "output", "node_modules"]);

export interface IcmFile {
  id: string;
  name: string;
  relativePath: string;
  fullPath: string;
  size: number;
  modifiedAt: string;
  extension: string;
  content: string;
}

export interface IcmFolder {
  id: string;
  name: string;
  relativePath: string;
  files: IcmFile[];
}

export interface ParsedSource {
  url: string;
  name: string;
  scope: "global" | "latam";
  description?: string;
}

export interface ShifterMemory {
  folders: IcmFolder[];
  totalFiles: number;
  totalBytes: number;
  sources: ParsedSource[];
  lastUpdated: string;
  systemPrompt: string;
  learningLoop: string;
  confidenceLedger: string;
  entityGraph: string;
  columnCandidates: string;
  skillIndex: string;
  sourceHistory: string;
}

/** Carga el ICM de cualquier agente desde su avatarDir. */
export async function loadAgentICM(avatarDir: string): Promise<ShifterMemory> {
  const folders: IcmFolder[] = [];
  await walk(avatarDir, "", folders);

  const allFiles = folders.flatMap((f) => f.files);
  const registry = allFiles.find((f) => f.name === "source-registry.md");
  const sources = registry ? parseSourceRegistry(registry.content) : [];
  const systemPrompt = buildSystemPrompt(allFiles);

  const learningLoop = allFiles.find((f) => f.relativePath === "memory/learning-loop.md")?.content || "";
  const confidenceLedger = allFiles.find((f) => f.relativePath === "memory/confidence-ledger.md")?.content || "";
  const entityGraph = allFiles.find((f) => f.relativePath === "memory/entity-graph.md")?.content || "";
  const columnCandidates = allFiles.find((f) => f.relativePath === "memory/column-candidates.md")?.content || "";
  const skillIndex = allFiles.find((f) => f.relativePath === "skills/_index.md")?.content || "";
  const sourceHistory = allFiles.find((f) => f.relativePath === "_config/source-history.md")?.content || "";

  return {
    folders,
    totalFiles: allFiles.length,
    totalBytes: allFiles.reduce((sum, f) => sum + f.size, 0),
    sources,
    lastUpdated: allFiles.length
      ? allFiles
          .map((f) => new Date(f.modifiedAt).getTime())
          .sort((a, b) => b - a)[0]
          .toString()
      : Date.now().toString(),
    systemPrompt,
    learningLoop,
    confidenceLedger,
    entityGraph,
    columnCandidates,
    skillIndex,
    sourceHistory,
  };
}

/** Shim de compatibilidad: el ICM de Shifter. */
export function loadShifterICM(): Promise<ShifterMemory> {
  const shifter = getAgent("shifter")!;
  return loadAgentICM(shifter.avatarDir);
}

async function walk(base: string, rel: string, out: IcmFolder[]) {
  const dir = path.join(base, rel);
  let entries: Dirent[] = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  const files: IcmFile[] = [];
  const subdirs: string[] = [];

  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const childRel = path.posix.join(rel, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIR.has(e.name)) continue;   // skip raw output/run data dirs
      subdirs.push(childRel);
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      // The cockpit only needs the curated *text* memory. Skip binary blobs
      // (e.g. the ~24MB articles-seen.db) and the transient reasoning dumps —
      // reading those as UTF-8 and shipping them to the client on every
      // render is what made the page take ~1 minute to load.
      if (SKIP_EXT.has(ext)) continue;
      if (/^last-think-(raw|prompt)/.test(e.name)) continue;
      const full = path.join(base, childRel);
      const stat = await fs.stat(full);
      // Keep oversized text files visible in the tree, but don't load their
      // content into the page payload.
      const content = stat.size > MAX_CONTENT_BYTES ? "" : await fs.readFile(full, "utf-8");
      files.push({
        id: childRel.replace(/[^a-zA-Z0-9]/g, "_"),
        name: e.name,
        relativePath: childRel,
        fullPath: full,
        size: stat.size,
        modifiedAt: stat.mtime.toISOString(),
        extension: ext,
        content,
      });
    }
  }

  if (files.length > 0) {
    out.push({
      id: rel ? rel.replace(/[^a-zA-Z0-9]/g, "_") : "root",
      name: rel ? path.basename(rel) : "Root",
      relativePath: rel || ".",
      files,
    });
  }

  for (const s of subdirs) {
    await walk(base, s, out);
  }
}

function parseSourceRegistry(content: string): ParsedSource[] {
  const sources: ParsedSource[] = [];
  let scope: "global" | "latam" = "global";

  for (const line of content.split("\n")) {
    const scopeMatch = line.match(/^##\s*Fuentes\s+(Internacionales|Latam)/i);
    if (scopeMatch) {
      scope = scopeMatch[1].toLowerCase().startsWith("lat") ? "latam" : "global";
    }
    const match = line.match(/^-\s*\[x\]\s+(https?:\/\/\S+)\s+—\s+([^—]+)\s*(?:—\s*(.+))?\s*$/);
    if (match) {
      sources.push({
        url: match[1].trim(),
        name: match[2].trim(),
        scope,
        description: match[3]?.trim(),
      });
    }
  }
  return sources;
}

function buildSystemPrompt(files: IcmFile[]): string {
  // Layer 0: Global identity files (loaded on every turn by OpenClaw)
  const layer0 = {
    agents: files.find((f) => f.name === "AGENTS.md")?.content || "",
    soul: files.find((f) => f.name === "SOUL.md")?.content || "",
    identity: files.find((f) => f.name === "IDENTITY.md")?.content || "",
    user: files.find((f) => f.name === "USER.md")?.content || "",
    tools: files.find((f) => f.name === "TOOLS.md")?.content || "",
    heartbeat: files.find((f) => f.name === "HEARTBEAT.md")?.content || "",
    claude: files.find((f) => f.name === "CLAUDE.md")?.content || "",
  };

  // Layer 1: Workspace routing
  const context = files.find((f) => f.name === "CONTEXT.md")?.content || "";

  // Layer 2: Stage contracts
  const stageFiles = files
    .filter((f) => f.relativePath.startsWith("stages/") && f.name === "CONTEXT.md")
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  // Layer 3: Config / reference material
  const configFiles = files.filter((f) => f.relativePath.startsWith("_config/"));
  const persona = configFiles.find((f) => f.name === "base-persona.md")?.content || "";
  const rules = configFiles.find((f) => f.name === "company-rules.md")?.content || "";
  const registry = configFiles.find((f) => f.name === "source-registry.md")?.content || "";

  // Layer 4: Memory & Learning
  const memoryFiles = files.filter((f) => f.relativePath.startsWith("memory/"));
  const memoryMd = memoryFiles.find((f) => f.name === "MEMORY.md")?.content || "";
  const learningLoop = memoryFiles.find((f) => f.name === "learning-loop.md")?.content || "";
  const confidenceLedger = memoryFiles.find((f) => f.name === "confidence-ledger.md")?.content || "";
  const entityGraph = memoryFiles.find((f) => f.name === "entity-graph.md")?.content || "";

  // Skills
  const skillFiles = files.filter((f) => f.relativePath.startsWith("skills/"));
  const skillIndex = skillFiles.find((f) => f.name === "_index.md")?.content || "";
  const skillSystem = skillFiles.find((f) => f.name === "skill-system.md")?.content || "";

  const parts: string[] = [
    "# SYSTEM PROMPT — SHIFTER (Agente Editorial Autónomo de Shift Latam)",
    "",
    "## Layer 0 — Global Identity (loaded on every turn)",
    "",
    layer0.claude,
    "",
    layer0.identity,
    "",
    layer0.soul,
    "",
    layer0.agents,
    "",
    layer0.user,
    "",
    layer0.tools,
    "",
    layer0.heartbeat,
    "",
    "## Layer 1 — Workspace Routing",
    "",
    context,
    "",
    "## Layer 2 — Stage Contracts",
    "",
  ];

  for (const stage of stageFiles) {
    const stageName = stage.relativePath.replace(/^stages\//, "").replace(/\/CONTEXT\.md$/, "");
    parts.push(`### Stage: ${stageName}`);
    parts.push("");
    parts.push(stage.content);
    parts.push("");
  }

  parts.push("## Layer 3 — Reference Material (stable across runs)");
  parts.push("");
  parts.push(persona);
  parts.push("");
  parts.push(rules);
  parts.push("");
  parts.push("## Fuentes de research registradas");
  parts.push(registry);
  parts.push("");

  parts.push("## Layer 4 — Long-term Memory & Learning");
  parts.push("");
  parts.push("### MEMORY.md (curated wisdom)");
  parts.push(memoryMd);
  parts.push("");
  parts.push("### Learning Loop (feedback-driven evolution)");
  parts.push(learningLoop);
  parts.push("");
  parts.push("### Confidence Ledger (claims ranked by evidence)");
  parts.push(confidenceLedger);
  parts.push("");
  parts.push("### Entity Graph (companies, people, trends)");
  parts.push(entityGraph);
  parts.push("");

  parts.push("## Layer 5 — Skills & Capabilities");
  parts.push("");
  parts.push(skillIndex);
  parts.push("");
  parts.push(skillSystem);
  parts.push("");

  parts.push("## Instrucciones de respuesta");
  parts.push("- Respondé como Shifter: directo, cínico fundamentado, sin preámbulos floridos.");
  parts.push("- Si no tenés una fuente verificable para algo, no lo afirmes.");
  parts.push("- Tu audiencia son CMOs, CTOs, CEOs y directores de comunicación de corporaciones en América Latina.");
  parts.push("- No opinés sobre política partidaria salvo que afecte regulación tecnológica.");
  parts.push("- No publiques nada sin señalar que es borrador pendiente de revisión humana.");
  parts.push("- Las citas deben ir en formato [Fuente](url).");
  parts.push("- Seguí la estructura ICM: cargá solo el contexto relevante para la etapa actual.");
  parts.push("- Si hay feedback en el Learning Loop que contradice tu comportamiento actual, aplicalo.");
  parts.push("- Si una entidad en el Entity Graph cambió de estado, reflejalo en tus respuestas.");
  parts.push("");

  return parts.join("\n");
}
