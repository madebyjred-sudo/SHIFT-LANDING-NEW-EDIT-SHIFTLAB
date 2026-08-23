// ----------------------------------------------------------------------
// agent-core/build-system-prompt — system prompt del cockpit (CORTO/curado)
// ----------------------------------------------------------------------
// Réplica EXACTA del buildSystemPrompt de app/api/shifter/route.ts, pero
// parametrizada por AgentDescriptor (promptIntro + promptBlocks + caps).
// NO es el de 7 capas de lib/shifter-icm.ts — ese es otro, no se mezcla.
// Gate-on-content: un bloque sin contenido NO viaja al prompt.

import fs from "node:fs";
import path from "node:path";
import type { AgentDescriptor } from "@/lib/avatar-factory/agent-registry";

function readSafe(avatarDir: string, rel: string, max: number): string {
  try {
    const t = fs.readFileSync(path.join(avatarDir, rel), "utf-8");
    return t.length > max ? t.slice(0, max) + "\n…[truncado]" : t;
  } catch {
    return "";
  }
}

function readTheses(avatarDir: string, dir: string, max: number): string {
  try {
    const d = path.join(avatarDir, dir);
    const files = fs
      .readdirSync(d)
      .filter((f) => f.startsWith("working-thesis-") && f.endsWith(".md"));
    const out = files
      .map((f) => fs.readFileSync(path.join(d, f), "utf-8"))
      .join("\n\n---\n\n");
    return out.length > max ? out.slice(0, max) + "\n…[truncado]" : out.trim();
  } catch {
    return "";
  }
}

export function buildAgentSystemPrompt(d: AgentDescriptor): string {
  const parts: string[] = [...d.promptIntro];
  for (const b of d.promptBlocks) {
    const content =
      b.kind === "theses"
        ? readTheses(d.avatarDir, b.dir ?? "memory/theses", b.max)
        : readSafe(d.avatarDir, b.file ?? "", b.max);
    if (content) parts.push(`${b.label}\n${content}`);
  }
  return parts.filter(Boolean).join("\n\n");
}
