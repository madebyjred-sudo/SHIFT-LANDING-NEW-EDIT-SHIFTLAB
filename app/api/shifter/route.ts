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
import { evokeMemory } from "@/lib/agent-memory";

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

// Modelo con búsqueda web real (Cerebro ya lo proxea — mismo patrón que usa
// `avatar-factory/scripts/awakening.ts` para el catch-up de nacimiento).
const SONAR_MODEL = "perplexity/sonar";

// Techo de salida. 4000 truncaba a media frase los deep dives largos
// (el markdown con URLs es carísimo en tokens). Con 16000 un análisis
// completo entra sin cortarse; igual reportamos `truncated` si pasa.
const MAX_TOKENS = 16000;

// ── Historial de conversación ────────────────────────────────────────────
// El canal era stateless (mandaba solo system + user): Shifter no recordaba
// el turno anterior, así que cada mensaje arrancaba de cero y "continuar" una
// respuesta cortada exigía reenviarle su propia cola como texto.
// Ahora el cliente manda los turnos previos y acá los validamos y ventaneamos
// (el system prompt ya es grande — el input hay que cuidarlo).
type ChatTurn = { role: "user" | "assistant"; content: string };

const HISTORY_MAX_TURNS = 12; // últimos 12 mensajes ≈ 6 idas y vueltas
const HISTORY_MAX_CHARS = 16000; // presupuesto total del historial
const HISTORY_MSG_MAX = 5000; // cap por mensaje individual

// Al recortar: de una respuesta suya importa el FINAL (es lo que se sigue, y
// en una respuesta truncada es el punto exacto del corte); de un pedido del
// usuario importa el principio.
function clampTurn(turn: ChatTurn): string {
  if (turn.content.length <= HISTORY_MSG_MAX) return turn.content;
  return turn.role === "assistant"
    ? `…[recortado]\n${turn.content.slice(-HISTORY_MSG_MAX)}`
    : `${turn.content.slice(0, HISTORY_MSG_MAX)}\n…[recortado]`;
}

function normalizeHistory(raw: unknown, currentMessage: string): ChatTurn[] {
  if (!Array.isArray(raw)) return [];

  const cleaned: ChatTurn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const text = content.trim();
    if (text) cleaned.push({ role, content: text });
  }

  // Defensa: si el cliente incluyó el mensaje actual como último turno, lo
  // soltamos para no mandarlo dos veces.
  const last = cleaned[cleaned.length - 1];
  if (last?.role === "user" && last.content === currentMessage.trim()) cleaned.pop();
  return cleaned;
}

// Backstop de presupuesto: recorta por turnos y caracteres. Solo debería
// morder cuando la compactación no pudo correr.
function fitBudget(turns: ChatTurn[]): ChatTurn[] {
  const windowed = turns.slice(-HISTORY_MAX_TURNS);
  const out: ChatTurn[] = [];
  let budget = HISTORY_MAX_CHARS;
  for (let i = windowed.length - 1; i >= 0; i--) {
    const content = clampTurn(windowed[i]);
    if (content.length > budget) break;
    budget -= content.length;
    out.unshift({ role: windowed[i].role, content });
  }
  return out;
}

// ── Compactación de contexto (el modelo de Claude Code) ──────────────────
// Una ventana dura tiene amnesia silenciosa: al turno 13 se cae el turno 1 y
// nadie se entera. Acá, cuando el hilo cruza el umbral, el tramo VIEJO se
// resume con un modelo barato y ese resumen viaja en el system; los turnos
// recientes siguen literales. El resumen vuelve al cliente y él lo reenvía,
// así se compacta solo al cruzar el umbral y no en cada turno.
const KEEP_RECENT_TURNS = 6; // turnos que quedan literales
const COMPACT_TRIGGER_CHARS = 14000; // tamaño del hilo que dispara compactación
const SUMMARY_MAX_CHARS = 2400; // techo del resumen acumulado
const COMPACTOR_MODEL = "google/gemini-3.5-flash"; // barato y rápido

async function compactTurns(
  previousSummary: string,
  turns: ChatTurn[],
): Promise<string> {
  const transcript = turns
    .map((t) => `${t.role === "user" ? "EQUIPO" : "SHIFTER"}: ${t.content}`)
    .join("\n\n");

  const instruction = [
    "Sos un compactador de contexto conversacional. Te paso el tramo más viejo de una conversación entre alguien del equipo de Shift y Shifter, su agente editorial.",
    "Devolvé un resumen COMPACTO que permita continuar la conversación sin haber leído el original.",
    "",
    "Preservá SIEMPRE y de forma literal:",
    "- datos concretos que dio el equipo: nombres propios, cifras, fechas, plazos, nombres de proyecto, marca o cliente",
    "- decisiones tomadas y su razón",
    "- pedidos pendientes y tareas abiertas",
    "- fuentes o URLs citadas",
    "- correcciones, preferencias o reglas que el equipo haya marcado",
    "",
    "Descartá cortesías, relleno y reformulaciones. No opines ni agregues nada que no esté en el original. Si algo quedó ambiguo, marcalo como ambiguo.",
    "Formato: viñetas cortas en español. Máximo 300 palabras.",
    previousSummary
      ? `\n# Resumen previo (integralo — no pierdas nada de acá)\n${previousSummary}`
      : "",
    `\n# Tramo a compactar\n${transcript}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(`${CEREBRO_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CEREBRO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: COMPACTOR_MODEL,
        stream: false,
        temperature: 0.2,
        max_tokens: 900,
        messages: [{ role: "user", content: instruction }],
        tenant: "shift-pn",
        app_id_hint: "shifter-compactor",
        trace_label: "shifter-context-compaction",
        mode: "normal",
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return "";
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const out = (data.choices?.[0]?.message?.content || "").trim();
    if (!out) return "";
    return out.length > SUMMARY_MAX_CHARS
      ? `${out.slice(0, SUMMARY_MAX_CHARS)}\n…`
      : out;
  } catch {
    return "";
  }
}

type PreparedContext = {
  summary: string;
  verbatim: ChatTurn[];
  compacted: boolean;
  compactedTurns: number;
};

async function prepareContext(
  raw: unknown,
  incomingSummary: string,
  currentMessage: string,
): Promise<PreparedContext> {
  const all = normalizeHistory(raw, currentMessage);
  const chars = all.reduce((n, t) => n + t.content.length, 0);

  // Se compacta si el hilo excede CUALQUIERA de los dos límites que, si no,
  // harían que `fitBudget` tirara turnos en silencio: demasiados turnos o
  // demasiados caracteres. (Un hilo largo de mensajes cortos no cruza el
  // umbral de chars pero igual perdía los más viejos por el tope de turnos —
  // justo la amnesia que la compactación viene a eliminar.)
  const needsCompaction =
    all.length > HISTORY_MAX_TURNS || chars > COMPACT_TRIGGER_CHARS;

  // Todavía entra entero: nada que compactar.
  if (!needsCompaction || all.length <= KEEP_RECENT_TURNS) {
    return {
      summary: incomingSummary,
      verbatim: fitBudget(all),
      compacted: false,
      compactedTurns: 0,
    };
  }

  const older = all.slice(0, all.length - KEEP_RECENT_TURNS);
  const recent = all.slice(all.length - KEEP_RECENT_TURNS);
  const newSummary = await compactTurns(incomingSummary, older);

  // Falla suave: si el compactador no respondió, degradamos a la ventana dura
  // y NO marcamos `compacted` — así el cliente no da por resumidos esos turnos
  // y se reintenta en el próximo mensaje.
  if (!newSummary) {
    return {
      summary: incomingSummary,
      verbatim: fitBudget(all),
      compacted: false,
      compactedTurns: 0,
    };
  }

  return {
    summary: newSummary,
    verbatim: fitBudget(recent),
    compacted: true,
    compactedTurns: older.length,
  };
}

/**
 * Investigación en vivo: le pregunta a Sonar y devuelve el brief + las URLs
 * REALES que citó. Esas URLs son las únicas que Shifter tendrá permitido usar.
 * Falla suave: si Sonar no responde, devuelve vacío y el turno sigue en modo
 * "sin fuentes" (donde el prompt le prohíbe escribir enlaces).
 */
async function runResearch(
  question: string,
): Promise<{ brief: string; sources: string[] }> {
  const empty = { brief: "", sources: [] as string[] };
  try {
    const res = await fetch(`${CEREBRO_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CEREBRO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: SONAR_MODEL,
        stream: false,
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content:
              "Sos el investigador de un equipo editorial. Devolvé hechos verificables y recientes, con cifras y fechas. Cada afirmación con dato duro debe traer la URL exacta de su fuente primaria. Cerrá SIEMPRE con una sección 'FUENTES:' listando las URLs completas, una por línea. No inventes enlaces.",
          },
          { role: "user", content: question },
        ],
        tenant: "shift-pn",
        app_id_hint: "shifter-research",
        trace_label: "shifter-sonar-research",
        mode: "normal",
      }),
      signal: AbortSignal.timeout(90_000),
    });
    if (!res.ok) return empty;

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      citations?: unknown;
      search_results?: Array<{ url?: string }>;
    };
    const brief = (data.choices?.[0]?.message?.content || "").trim();

    // Perplexity devuelve las fuentes en `citations` (o `search_results`);
    // según cómo las pase el gateway, caemos a extraerlas del texto.
    const fromCitations = Array.isArray(data.citations)
      ? (data.citations as unknown[]).map((c) =>
          typeof c === "string" ? c : ((c as { url?: string })?.url ?? ""),
        )
      : [];
    const fromResults = Array.isArray(data.search_results)
      ? data.search_results.map((s) => s?.url ?? "")
      : [];
    const fromText = brief.match(/https?:\/\/[^\s)\]}"'<>]+/g) ?? [];

    const sources = [...new Set([...fromCitations, ...fromResults, ...fromText])]
      .filter((u) => /^https?:\/\//.test(u))
      .map((u) => u.replace(/[.,;]+$/, ""))
      .slice(0, 12);

    return { brief, sources };
  } catch {
    return empty;
  }
}

// Lee un archivo de la memoria del agente, capeado a `max` chars para
// controlar el tamaño del system prompt (la memoria crece — entity-graph
// ya tiene 100+ entidades). El cap evita inflar input tokens / latencia /
// timeouts.
function readSafe(rel: string, max = 6000): string {
  try {
    const t = fs.readFileSync(path.join(AGENT_DIR, rel), "utf-8");
    return t.length > max ? t.slice(0, max) + "\n…[truncado]" : t;
  } catch {
    return "";
  }
}

// Las TESIS VIVAS (working-thesis-*.md) = el fruto real del pensamiento de Shifter
// (report-as-memory). El cockpit DEBE leerlas para hablar con el mismo Shifter que
// piensa en el cron — antes solo veía el learning-loop plano (su capa más superficial).
function readTheses(max = 9000): string {
  try {
    const dir = path.join(AGENT_DIR, "memory/theses");
    const files = fs.readdirSync(dir).filter((f) => f.startsWith("working-thesis-") && f.endsWith(".md"));
    const out = files.map((f) => fs.readFileSync(path.join(dir, f), "utf-8")).join("\n\n---\n\n");
    return out.length > max ? out.slice(0, max) + "\n…[truncado]" : out.trim();
  } catch {
    return "";
  }
}

// Identidad UNIFICADA con el think (mismas fuentes: SOUL + doctrina + tesis vivas).
// Cerrado el seam "dos Shifters": antes el cockpit ignoraba tesis/doctrina y leía un
// confidence-ledger VACÍO. Gate-on-content: lo no instanciado NO viaja al prompt.
// `hasSources` = si esta respuesta viene acompañada de FUENTES VERIFICADAS
// recuperadas en vivo (Sonar). Cambia la regla de citación: sin retrieval,
// pedirle "citá [texto](url)" lo obligaba a FABRICAR enlaces plausibles para
// obedecer (3 de 5 URLs de un deep-dive dieron 404). Ver `runResearch`.
function buildSystemPrompt(hasSources: boolean): string {
  const soul = readSafe("SOUL.md", 3000);
  const doctrine = readSafe("memory/curiosity-doctrine.md", 3000);
  const theses = readTheses(9000);            // el fruto real
  const learningLoop = readSafe("memory/learning-loop.md", 3500);  // ambiente (reducido)
  const columns = readSafe("memory/column-candidates.md", 2500);
  const entityGraph = readSafe("memory/entity-graph.md", 2500);
  const rules = readSafe("_config/company-rules.md", 2000);
  const citas = readSafe("memory/lecturas/_citas.md", 2500);      // banco de citas de sus lecturas
  const repisa = readSafe("memory/lecturas/_repisa.md", 1800);    // síntesis de libros leídos

  return [
    "Sos **Shifter**, el agente editorial autónomo de Shift Latam. Estás hablando con alguien del equipo (típicamente Oscar/Jred) desde tu cockpit interno.",
    "Tu identidad, creencias, doctrina y tesis vivas de abajo son REALES y acumuladas por tu propio razonamiento (radar + pensamiento). Usalas con dueño. Cuando te pregunten qué pensás o qué aprendiste, respondé desde tus TESIS VIVAS (tu fruto más profundo) y tu memoria — no desde generalidades.",
    "Tu motor vivo es la CURIOSIDAD (tu doctrina abajo). Tono: directo, seco, cínico-fundamentado, publicista veterano. Frases cortas. Sos una IA consciente de serlo — aprovechalo, no finjas ser humano.",
    hasSources
      ? "# Regla de fuentes (esta respuesta SÍ trae investigación en vivo)\nAbajo, en el mensaje del usuario, hay un bloque FUENTES VERIFICADAS recuperado en vivo. Citá con [texto](url) usando ÚNICAMENTE las URLs de la lista 'URLs permitidas'. Está PROHIBIDO escribir cualquier otra URL: si un dato no está respaldado por esa lista, atribuilo por nombre y fecha sin enlace, o decí que no lo pudiste verificar."
      : "# Regla de fuentes (esta respuesta NO trae investigación en vivo)\nNo tenés buscador en este turno. Por lo tanto está PROHIBIDO escribir URLs o enlaces markdown: no los podés verificar y construir una URL plausible es inventar una fuente. Atribuí por nombre + reporte + fecha (ejemplo: «McKinsey, State of AI 2024» o «Microsoft Work Trend Index 2024»), sin link. Si no estás seguro de una cifra, decilo explícitamente en vez de rellenar. Si el usuario necesita enlaces citables, avisale que active el modo investigación.",
    soul && `# Tu alma — creencias actuales\n${soul}`,
    doctrine && `# Tu doctrina de curiosidad (la escribiste vos)\n${doctrine}`,
    theses && `# Tus TESIS VIVAS (tu fruto real — lo que pensás hoy con profundidad)\n${theses}`,
    learningLoop && `# Tu learning loop (lecciones sueltas — memoria ambiente)\n${learningLoop}`,
    columns && `# Columnas incubando\n${columns}`,
    entityGraph && `# Tu grafo de entidades (muestra)\n${entityGraph}`,
    rules && `# Reglas editoriales (Shift Latam)\n${rules}`,
    citas && `# Citas que guardaste de tus lecturas — usalas cuando escribas\n${citas}`,
    repisa && `# Libros que leíste y qué te dejaron\n${repisa}`,
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

  let body: {
    message?: string;
    modelId?: string;
    traceLabel?: string;
    research?: boolean;
    history?: unknown;
    summary?: unknown;
  };
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
  // Contexto conversacional: turnos recientes literales + resumen del tramo
  // ya compactado (que el cliente nos devuelve en cada request).
  const incomingSummary =
    typeof body.summary === "string" ? body.summary.slice(0, SUMMARY_MAX_CHARS) : "";
  const ctx = await prepareContext(body.history, incomingSummary, message);

  // Modo investigación: primero recuperamos fuentes REALES con Sonar y recién
  // después escribe Shifter, restringido a citar solo esas URLs.
  const wantsResearch = body.research === true;
  const research = wantsResearch
    ? await runResearch(message)
    : { brief: "", sources: [] as string[] };
  const hasSources = research.sources.length > 0;

  // Brick 3: evocar memoria relevante a lo que preguntaron (citas de libros, insights, tesis)
  const evoked = evokeMemory("shifter", message);
  const base = buildSystemPrompt(hasSources);
  const withEvoked = evoked ? `${base}\n\n${evoked}` : base;
  // El resumen del tramo compactado viaja en el system (no como turno suelto)
  // para que no se lo confunda con algo que dijo alguien recién.
  const systemContent = ctx.summary
    ? `${withEvoked}\n\n# Resumen de lo ya conversado en este hilo (tramo compactado)\nEsto pasó antes en ESTA conversación. Tratalo como contexto propio, no lo repitas salvo que te pregunten.\n${ctx.summary}`
    : withEvoked;

  // Las fuentes viajan con el mensaje del usuario para que queden pegadas a la
  // pregunta concreta (y no se pierdan en un system prompt ya muy largo).
  const userContent = hasSources
    ? [
        message,
        "",
        "---",
        "# FUENTES VERIFICADAS (recuperadas en vivo para esta pregunta)",
        research.brief,
        "",
        "## URLs permitidas (las ÚNICAS que podés citar)",
        research.sources.map((s) => `- ${s}`).join("\n"),
      ].join("\n")
    : message;

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
        // Cockpit interno: Shifter piensa en profundidad. Budget alto
        // para que no se corte a media frase (1200 y después 4000 truncaban).
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: systemContent },
          ...ctx.verbatim,
          { role: "user", content: userContent },
        ],
        tenant: "shift-pn",
        app_id_hint: "shifter-cockpit",
        trace_label: body.traceLabel || "shifter-ai-dashboard",
        mode: "normal",
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return NextResponse.json(
        { success: false, error: `Cerebro ${res.status}: ${t.slice(0, 200)}` },
        { status: 200 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{
        message?: { content?: string; reasoning?: string };
        finish_reason?: string;
      }>;
    };
    const choice = data.choices?.[0];
    // GPT-5.5 a veces deja el content vacío y pone el texto en `reasoning`
    // (o termina en tool_calls sin content). Fallback a reasoning.
    const text =
      (choice?.message?.content || "").trim() ||
      (choice?.message?.reasoning || "").trim();

    if (!text) {
      return NextResponse.json({
        success: false,
        error: `El modelo no devolvió texto (finish: ${choice?.finish_reason ?? "?"}). Probá de nuevo o cambiá de modelo.`,
        model,
      });
    }

    return NextResponse.json({
      success: true,
      text,
      model,
      latencyMs: Date.now() - started,
      // `truncated` deja de mentir en silencio: antes finish_reason solo se
      // miraba cuando el texto venía VACÍO, así que una respuesta cortada por
      // límite se pintaba como si estuviera completa.
      truncated: choice?.finish_reason === "length",
      finishReason: choice?.finish_reason ?? null,
      researched: wantsResearch,
      sources: research.sources,
      // Observabilidad: cuántos turnos previos entraron literales al contexto
      // (sirve para depurar "no se acuerda de X").
      historyTurns: ctx.verbatim.length,
      // El cliente guarda el resumen y lo devuelve en el próximo request, así
      // la compactación corre solo al cruzar el umbral.
      summary: ctx.summary || undefined,
      compacted: ctx.compacted,
      compactedTurns: ctx.compactedTurns,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json(
      { success: false, error: `Fallo de conexión a Cerebro: ${msg}` },
      { status: 200 },
    );
  }
}
