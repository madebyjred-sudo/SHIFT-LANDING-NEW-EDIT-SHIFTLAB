// ----------------------------------------------------------------------
// /api/shifter/directive — encola una directiva humana al agente
// ----------------------------------------------------------------------
// El HEARTBEAT.md del agente define el contrato: los humanos escriben
// curiosidades/directivas a memory/pending-queries.md; el cron del
// sistema las lee y corre la búsqueda (Perplexity Sonar); el próximo
// heartbeat del agente las procesa.
//
// Esta route es ese canal: append-only (nunca sobrescribe la memoria),
// sandboxed al agent dir, formato exacto que el agente espera.

import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AGENT_DIR = path.join(
  process.cwd(),
  "lib/avatar-factory/avatars/shifter",
);
const QUEUE_FILE = path.join(AGENT_DIR, "memory/pending-queries.md");

const MAX_LEN = 1000;

export async function POST(request: Request) {
  let body: { query?: string; why?: string; priority?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const query = (body.query ?? "").trim().slice(0, MAX_LEN);
  if (!query) {
    return NextResponse.json({ ok: false, error: "query vacía" }, { status: 400 });
  }
  const why = (body.why ?? "Directiva de Oscar vía cockpit").trim().slice(0, MAX_LEN);
  const priority = ["high", "medium", "low"].includes((body.priority ?? "").toLowerCase())
    ? (body.priority as string).toLowerCase()
    : "high";

  // Timestamp legible (UTC). El agente parsea el header ## ... — Topic.
  const now = new Date();
  const stamp = now.toISOString().slice(0, 16).replace("T", " ");
  const topic = query.length > 50 ? query.slice(0, 47) + "…" : query;

  const entry = `\n## ${stamp} — ${topic}\n**Query:** ${query}\n**Why:** ${why}\n**Priority:** ${priority}\n**Source:** human-directive (cockpit)\n`;

  // Verificar que el agent dir existe (prod). En dev local no existe →
  // respondemos 503 honesto en vez de crear estructura fantasma.
  if (!fs.existsSync(AGENT_DIR)) {
    return NextResponse.json(
      { ok: false, error: "agent offline (dev)", queued: false },
      { status: 503 },
    );
  }

  try {
    // Asegurar memory/ existe; append (nunca overwrite)
    fs.mkdirSync(path.dirname(QUEUE_FILE), { recursive: true });
    if (!fs.existsSync(QUEUE_FILE)) {
      fs.writeFileSync(
        QUEUE_FILE,
        "# Pending Queries — Curiosidades a investigar\n\n_El cron lee este archivo y corre las búsquedas. El agente procesa los resultados en su heartbeat._\n",
        "utf-8",
      );
    }
    fs.appendFileSync(QUEUE_FILE, entry, "utf-8");
    return NextResponse.json({
      ok: true,
      queued: true,
      message:
        "Directiva encolada. Shifter la procesará en su próximo ciclo (heartbeat 30m / cron de research).",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e), queued: false },
      { status: 500 },
    );
  }
}
