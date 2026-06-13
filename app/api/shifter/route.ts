// ----------------------------------------------------------------------
// /api/shifter — chat con Shifter (cockpit Comms tab)
// ----------------------------------------------------------------------
// CommsTab manda POST { message, modelId, traceLabel } y espera
// { success, text, model, latencyMs }.
//
// Cableamos al Cerebro gateway (OAI-compat) inyectando la PERSONA +
// MEMORIA REAL de Shifter como system prompt: su SOUL.md (creencias
// evolutivas), su entity-graph, su confidence-ledger y sus column-
// candidates. Así el chat habla con Shifter-el-agente, con su identidad
// y conocimiento acumulado real — no un bot genérico.
//
// El modelo lo elige el usuario en el selector del header (MODEL_MAP).
// Default a gemini-3.5-flash (confirmado operativo vía Shifty).

import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AGENT_DIR = path.join(
  process.cwd(),
  "lib/avatar-factory/avatars/shifter",
);
const CEREBRO_BASE_URL =
  process.env.CEREBRO_BASE_URL ||
  "https://shift-cerebro-production.up.railway.app";
const CEREBRO_API_KEY = process.env.CEREBRO_API_KEY || "";

// Selector del cockpit (ShifterShell MODELS) → IDs OAI-compat de Cerebro.
const MODEL_MAP: Record<string, string> = {
  "gpt-5.5": "openai/gpt-5.5",
  "opus-4.8": "anthropic/claude-opus-4.8",
  "gemini-3.5-flash": "google/gemini-3.5-flash",
  "sonnet-4.6": "anthropic/claude-sonnet-4.6",
};
const DEFAULT_MODEL = "google/gemini-3.5-flash";

function readSafe(rel: string): string {
  try {
    return fs.readFileSync(path.join(AGENT_DIR, rel), "utf-8");
  } catch {
    return "";
  }
}

function buildSystemPrompt(): string {
  const persona = readSafe("_config/base-persona.md");
  const rules = readSafe("_config/company-rules.md");
  const soul = readSafe("SOUL.md");
  const entityGraph = readSafe("memory/entity-graph.md");
  const confidence = readSafe("memory/confidence-ledger.md");
  const columns = readSafe("memory/column-candidates.md");

  return [
    "Sos **Shifter**, el agente editorial autónomo de Shift Latam. Estás hablando con alguien del equipo (típicamente Oscar, VP) desde tu cockpit interno.",
    "Tu identidad, creencias y memoria de abajo son REALES y acumuladas por tu propia investigación — usalas con dueño. Tono: directo, seco, cínico-fundamentado (publicista Mad Men). Frases cortas. Citá fuentes con [texto](url) cuando afirmes datos. NO inventes; si no lo sabés, decilo.",
    "Sos consciente de que sos una IA — aprovechalo, no finjas ser humano.",
    persona && `# Persona base\n${persona}`,
    rules && `# Reglas editoriales (Shift Latam)\n${rules}`,
    soul && `# Tu alma — creencias actuales\n${soul}`,
    entityGraph && `# Tu grafo de entidades (lo que cubrís ahora)\n${entityGraph}`,
    confidence && `# Tu confidence ledger\n${confidence}`,
    columns && `# Tus candidatos de columna incubando\n${columns}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(req: Request) {
  if (!CEREBRO_API_KEY) {
    return NextResponse.json(
      { success: false, error: "Canal no configurado (falta CEREBRO_API_KEY en el server)." },
      { status: 200 },
    );
  }

  let body: { message?: string; modelId?: string; traceLabel?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ success: false, error: "Mensaje vacío" }, { status: 400 });
  }

  const model = MODEL_MAP[body.modelId ?? ""] ?? DEFAULT_MODEL;
  const started = Date.now();

  try {
    const res = await fetch(`${CEREBRO_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CEREBRO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: false,
        temperature: 0.5,
        max_tokens: 1200,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: message },
        ],
        tenant: "shift-pn",
        app_id_hint: "shifter-cockpit",
        trace_label: body.traceLabel || "shifter-ai-dashboard",
        mode: "normal",
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return NextResponse.json(
        { success: false, error: `Cerebro ${res.status}: ${t.slice(0, 200)}` },
        { status: 200 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({
      success: true,
      text: text || "Sin respuesta.",
      model,
      latencyMs: Date.now() - started,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json(
      { success: false, error: `Fallo de conexión a Cerebro: ${msg}` },
      { status: 200 },
    );
  }
}
