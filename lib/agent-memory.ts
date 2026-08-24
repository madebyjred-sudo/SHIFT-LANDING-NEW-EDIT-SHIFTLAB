// ----------------------------------------------------------------------
// agent-memory — evocación en el chat (Brick 3)
// ----------------------------------------------------------------------
// Antes de responderle a alguien, el agente EVOCA: busca en todo su
// memory_index (citas de libros, insights, tesis, síntesis) lo relevante
// a lo que le preguntaron y lo inyecta al system prompt. Así puede traer
// algo que leyó/pensó hace meses, no solo lo que cabe en su prompt fijo.
//
// Reusa el retrieve() determinista del memory-manager (mismo que el think),
// por agente (env DB_PATH + SHIFTER_MEMORY_DIR). Defensivo: cualquier
// error → "" (el chat nunca se rompe por esto).

import { execFileSync } from "node:child_process";
import path from "node:path";
import { getAgent } from "@/lib/avatar-factory/agent-registry";

const PY = "/usr/bin/python3";

export function evokeMemory(agentId: string, question: string, k = 6): string {
  const agent = getAgent(agentId);
  if (!agent || !question.trim()) return "";
  const memDir = path.join(agent.avatarDir, "memory");
  const dbPath = path.join(memDir, agentId === "shifter" ? "articles-seen.db" : "mind.db");
  const mm = path.join(process.cwd(), "scripts", "shifter-memory-manager.py");
  try {
    const out = execFileSync(PY, [mm, "retrieve", question.slice(0, 400), String(k)], {
      env: { ...process.env, SHIFTER_MEMORY_DIR: memDir, DB_PATH: dbPath },
      timeout: 8000,
      encoding: "utf-8",
      maxBuffer: 1024 * 1024,
    });
    const rows = JSON.parse(out || "[]");
    if (!Array.isArray(rows) || rows.length === 0) return "";
    const lines = rows
      .map((r: { kind?: string; gist?: string; ref?: string }) =>
        `- [${r.kind || "mem"}] ${(r.gist || r.ref || "").toString().slice(0, 320)}`,
      )
      .join("\n");
    return `# Memoria evocada — lo que esta conversación te trae de tu memoria acumulada (citas de libros que leíste, insights, tesis previas). Usalo SOLO si es relevante; si citás un libro, decí de dónde.\n${lines}`;
  } catch {
    return "";
  }
}
