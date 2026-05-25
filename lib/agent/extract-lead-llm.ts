// ----------------------------------------------------------------------
// LLM-based lead extraction — upgrade del regex extractor
// ----------------------------------------------------------------------
// El regex en lib/hubspot/extract-lead.ts hace una pasada heurística
// (email regex en último msg + "soy X" name extractor). Funciona en
// ~30-40% de los casos. El LLM extractor sube esa cobertura a ~80-90%
// porque entiende contexto:
//
//   • Detecta email aunque no esté en el último mensaje
//   • Saca nombre de "Juan acá de banco X" (sin "soy")
//   • Identifica intent + tier (green/yellow/red) — invaluable para
//     prioritization downstream
//   • Saca empresa, país, sentiment
//   • Genera un summary que va al HubSpot Note (mejor que dump del
//     primer mensaje raw)
//
// Costo: usa Cerebro con google/gemini-2.0-flash (~$0.075/M input,
// $0.30/M output). Para un turno típico de 800 input + 200 output:
// ($0.075 × 800 + $0.30 × 200) / 1M = $0.00012. ~$1/mes para 10K turnos.
// El modelo más barato disponible que respeta JSON output reliably.

import type { ChatMessage } from "@/components/agent/agent-engine";

// Schema del JSON que el LLM debe devolver. Mantenemos snake_case para
// matchear con DB columns directamente.
export type LLMExtractionResult = {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  country: string | null;
  intent:
    | "info-gathering"
    | "qualification"
    | "demo-request"
    | "pricing"
    | "objection"
    | "ready-to-buy"
    | "off-topic"
    | "support"
    | null;
  tier: "green" | "yellow" | "red" | null;
  sentiment: "positive" | "neutral" | "negative" | "frustrated" | null;
  summary: string | null;
};

const EXTRACTION_SCHEMA_PROMPT = `Sos un extractor de información de leads de una conversación entre un visitante y Shifty (asistente de Shift Latam, agencia de comunicación regional).

Analizá la conversación completa y devolvé EXACTAMENTE este JSON (campos null si no se encuentran):

{
  "email": "email@example.com" | null,
  "first_name": "Juan" | null,
  "last_name": "Pérez" | null,
  "company": "Banco BAC" | null,
  "country": "CR" | "GT" | "PA" | "Colombia" | etc | null,
  "intent": "info-gathering" | "qualification" | "demo-request" | "pricing" | "objection" | "ready-to-buy" | "off-topic" | "support",
  "tier": "green" | "yellow" | "red",
  "sentiment": "positive" | "neutral" | "negative" | "frustrated",
  "summary": "Frase corta (max 200 char) sobre qué quiere el visitante y por qué"
}

Reglas de tier:
- "green" = está listo para hablar (pidió demo, dio email + empresa, preguntó pricing concreto)
- "yellow" = info-gathering serio (preguntas específicas, contexto profesional, pero no se identificó)
- "red" = curiosidad casual, off-topic, o spam/junk

Reglas de intent:
- "info-gathering" = preguntas generales sobre servicios
- "qualification" = describe su problema y pregunta si Shift puede ayudar
- "demo-request" = pidió reunión/demo/llamada/presupuesto
- "pricing" = preguntó precio/costo/honorarios
- "objection" = expresó duda/preocupación
- "ready-to-buy" = decidido, quiere arrancar
- "off-topic" = no relacionado al negocio
- "support" = pregunta sobre algo que ya tienen contratado

Devolvé SOLO el JSON, sin markdown, sin explicación, sin texto antes ni después.`;

type CerebroResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

/**
 * Llama a Cerebro con la conversación completa y un prompt de
 * extracción estructurada. Devuelve LLMExtractionResult o null si
 * Cerebro falla / response no parsea.
 *
 * Nunca tira excepción — el caller (route handler) hace fire-and-forget
 * y si esto falla solo perdemos esta extraction (la regex sigue).
 *
 * Modelo: gemini-2.0-flash. Configurable via env AGENT_EXTRACTOR_MODEL.
 */
export async function extractLeadWithLLM(
  messages: ChatMessage[],
): Promise<{ result: LLMExtractionResult; rawResponse: unknown } | null> {
  const CEREBRO_BASE_URL =
    process.env.CEREBRO_BASE_URL ||
    "https://shift-cerebro-production.up.railway.app";
  const CEREBRO_API_KEY = process.env.CEREBRO_API_KEY;
  const MODEL = process.env.AGENT_EXTRACTOR_MODEL || "google/gemini-2.0-flash";

  if (!CEREBRO_API_KEY) {
    console.warn("[extract-lead-llm] CEREBRO_API_KEY not set, skipping");
    return null;
  }

  // Format conversation como contexto para el LLM
  const conversationText = messages
    .map((m) => `[${m.role === "user" ? "Visitante" : "Shifty"}] ${m.content}`)
    .join("\n\n");

  const body = {
    model: MODEL,
    stream: false,
    temperature: 0.1, // determinístico para extraction
    max_tokens: 500,
    messages: [
      { role: "system", content: EXTRACTION_SCHEMA_PROMPT },
      {
        role: "user",
        content: `Conversación a analizar:\n\n${conversationText}`,
      },
    ],
    response_format: { type: "json_object" },
    tenant: "shift-pn",
    app_id_hint: "shift-pn-extractor",
    trace_label: "shifty-lead-extractor",
    mode: "normal",
  };

  let response: Response;
  try {
    response = await fetch(`${CEREBRO_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CEREBRO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // Timeout corto — si extraction tarda > 10s no vale la pena
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.error("[extract-lead-llm] fetch failed:", err);
    return null;
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error(
      "[extract-lead-llm] non-2xx:",
      response.status,
      text.slice(0, 300),
    );
    return null;
  }

  let data: CerebroResponse;
  try {
    data = (await response.json()) as CerebroResponse;
  } catch (err) {
    console.error("[extract-lead-llm] response not JSON:", err);
    return null;
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    console.warn("[extract-lead-llm] no content in response");
    return null;
  }

  // Stripe markdown fences si el LLM las puso a pesar de json_object
  const cleaned = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: LLMExtractionResult;
  try {
    parsed = JSON.parse(cleaned) as LLMExtractionResult;
  } catch (err) {
    console.error("[extract-lead-llm] JSON parse failed:", err, cleaned.slice(0, 200));
    return null;
  }

  return { result: validateAndNormalize(parsed), rawResponse: data };
}

/**
 * Normaliza el output del LLM — defensivos contra variantes que el
 * modelo a veces inventa ("info_gathering" en lugar de "info-gathering",
 * "high" en lugar de "green", etc).
 */
function validateAndNormalize(raw: LLMExtractionResult): LLMExtractionResult {
  const normalizedIntent = normalizeIntent(raw.intent);
  const normalizedTier = normalizeTier(raw.tier);
  const normalizedSentiment = normalizeSentiment(raw.sentiment);

  return {
    email: typeof raw.email === "string" && raw.email.includes("@") ? raw.email.toLowerCase().trim() : null,
    first_name: nullableString(raw.first_name),
    last_name: nullableString(raw.last_name),
    company: nullableString(raw.company),
    country: nullableString(raw.country),
    intent: normalizedIntent,
    tier: normalizedTier,
    sentiment: normalizedSentiment,
    summary: nullableString(raw.summary)?.slice(0, 500) ?? null,
  };
}

function nullableString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed || trimmed.toLowerCase() === "null") return null;
  return trimmed;
}

function normalizeIntent(v: unknown): LLMExtractionResult["intent"] {
  if (typeof v !== "string") return null;
  const norm = v.toLowerCase().replace(/_/g, "-").trim();
  const valid: LLMExtractionResult["intent"][] = [
    "info-gathering",
    "qualification",
    "demo-request",
    "pricing",
    "objection",
    "ready-to-buy",
    "off-topic",
    "support",
  ];
  return valid.includes(norm as NonNullable<LLMExtractionResult["intent"]>)
    ? (norm as LLMExtractionResult["intent"])
    : null;
}

function normalizeTier(v: unknown): LLMExtractionResult["tier"] {
  if (typeof v !== "string") return null;
  const norm = v.toLowerCase().trim();
  if (norm === "green" || norm === "high" || norm === "hot") return "green";
  if (norm === "yellow" || norm === "medium" || norm === "warm") return "yellow";
  if (norm === "red" || norm === "low" || norm === "cold") return "red";
  return null;
}

function normalizeSentiment(v: unknown): LLMExtractionResult["sentiment"] {
  if (typeof v !== "string") return null;
  const norm = v.toLowerCase().trim();
  if (norm === "positive" || norm === "happy") return "positive";
  if (norm === "neutral") return "neutral";
  if (norm === "negative") return "negative";
  if (norm === "frustrated" || norm === "angry") return "frustrated";
  return null;
}
