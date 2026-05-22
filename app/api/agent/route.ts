// ----------------------------------------------------------------------
// /api/agent — Shifty proxy to Cerebro Gateway
// ----------------------------------------------------------------------
// Accepts: { messages: [{role, content}] } where role ∈ ('user', 'assistant').
// Streams: SSE chunks from Cerebro `/v1/chat/completions` (OAI-compat).
// The client (components/agent/agent-engine.ts) parses these chunks and
// re-emits them as TurnEvent for the existing UI.
//
// Guardrails:
//   - Rate limit per IP (lib/rate-limit.ts; in-memory best-effort).
//   - Max conversation length (last 12 turns kept, older dropped).
//   - Max user message length (1500 chars).
//   - Bearer key + base URL via server-only env vars.
//
// Modelo: gemini-3.5-flash. Decisión consciente — calidad antes que
// cantidad. La razón cuesta más por turno ($0.012 promedio vs $0.0016
// de 2.5-flash), pero el reasoning interno mejora la robustez de
// guardrails (jailbreak, off-topic, lead capture flow) y la fidelidad
// a la KB. A $50/mes da ~4K turnos/mes — suficiente para una landing.

import { rateLimit } from "@/lib/rate-limit";
import { buildSystemBlocks } from "@/lib/agent/system-prompt";
import { tryExtractLeadFromConversation } from "@/lib/hubspot/extract-lead";
import { upsertContactWithNote } from "@/lib/hubspot/upsert-contact";

export const runtime = "nodejs"; // needs fs to read KB
export const dynamic = "force-dynamic"; // never cache responses

const MAX_USER_MSG_LEN = 1500;
const MAX_TURNS_KEPT = 12; // user+assistant pairs combined → ~6 exchanges

const CEREBRO_BASE_URL =
  process.env.CEREBRO_BASE_URL ||
  "https://shift-cerebro-production.up.railway.app";
const CEREBRO_API_KEY = process.env.CEREBRO_API_KEY || "";
const MODEL_ID = process.env.AGENT_MODEL_ID || "google/gemini-3.5-flash";

type IncomingMessage = { role: "user" | "assistant"; content: string };

type IncomingPayload = {
  messages?: IncomingMessage[];
};

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function jsonError(message: string, status: number, code?: string) {
  return new Response(JSON.stringify({ ok: false, error: { message, code } }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function validateMessages(raw: unknown): IncomingMessage[] | null {
  if (!Array.isArray(raw)) return null;
  const out: IncomingMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const obj = m as Record<string, unknown>;
    const role = obj.role;
    const content = obj.content;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    const trimmed = content.trim();
    if (!trimmed) continue;
    if (trimmed.length > MAX_USER_MSG_LEN) return null;
    out.push({ role, content: trimmed });
  }
  if (out.length === 0) return null;
  // Last message must be from user — otherwise nothing to answer.
  if (out[out.length - 1].role !== "user") return null;
  // Keep only the last N turns to bound input cost on long conversations.
  return out.slice(-MAX_TURNS_KEPT);
}

export async function POST(request: Request) {
  if (!CEREBRO_API_KEY) {
    console.error("[api/agent] CEREBRO_API_KEY not set");
    return jsonError("Asistente no configurado.", 500, "missing_api_key");
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`agent:${ip}`);
  if (!limited.ok) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: { message: "Demasiados intentos. Probá en un momento." },
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Retry-After": String(limited.retryAfterSec),
        },
      },
    );
  }

  let payload: IncomingPayload;
  try {
    payload = (await request.json()) as IncomingPayload;
  } catch {
    return jsonError("Solicitud no válida.", 400, "invalid_json");
  }

  const messages = validateMessages(payload.messages);
  if (!messages) {
    return jsonError("Mensajes inválidos.", 400, "invalid_messages");
  }

  // ── HubSpot capture (fire-and-forget) ─────────────────────────────
  // Si en el último mensaje del usuario detectamos email + nombre (post
  // handoff de Shifty), pusheamos un Contact al CRM en background.
  // NO bloqueamos el SSE — la latencia se mantiene < primer byte de
  // Cerebro. Si falla HubSpot, log y seguimos. Si el email ya existe,
  // HubSpot dedupe automático.
  const lead = tryExtractLeadFromConversation(messages);
  if (lead) {
    upsertContactWithNote(lead)
      .then((r) =>
        r.ok
          ? console.log(
              "[shifty→hubspot] OK contactId:",
              r.contactId,
              "note:",
              r.noteCreated,
            )
          : console.warn("[shifty→hubspot] partial:", r.errors.join(" | ")),
      )
      .catch((e) => console.error("[shifty→hubspot] threw:", e));
  }

  // Build Cerebro request. system_blocks goes server-side (no leak via
  // network from client). Bearer key likewise stays on the server.
  const cerebroBody = {
    model: MODEL_ID,
    stream: true,
    temperature: 0.4,
    // 800 = ~200 tokens de reasoning interno (Gemini 3.5 los exige) +
    // ~600 tokens de respuesta visible (~3-4 párrafos en español).
    // Techo de costo por turno ~$0.012 (gemini-3.5-flash a $9/M
    // completion incluyendo reasoning).
    max_tokens: 800,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    system_blocks: buildSystemBlocks(),
    tenant: "shift-pn",
    app_id_hint: "shift-pn-landing",
    trace_label: "shifty-landing",
    mode: "normal",
    // gemini-3.5-flash requires reasoning enabled (OpenRouter rebota con
    // 400 si pasamos enabled:false). Lo dejamos OFF en el cliente pero
    // el provider lo fuerza ON. Aceptamos el costo extra por la calidad
    // de razonamiento en guardrails y flow de captura.
  };

  let upstream: Response;
  try {
    upstream = await fetch(`${CEREBRO_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CEREBRO_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(cerebroBody),
    });
  } catch (err) {
    console.error("[api/agent] upstream fetch failed", err);
    return jsonError("Servicio temporalmente no disponible.", 503, "upstream_unreachable");
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    console.error("[api/agent] upstream non-2xx", upstream.status, text.slice(0, 500));
    // 401/403 from Cerebro → key revoked or misconfig; surface 500 to user.
    return jsonError(
      "Servicio temporalmente no disponible.",
      upstream.status >= 500 ? 502 : 500,
      "upstream_error",
    );
  }

  if (!upstream.body) {
    return jsonError("Respuesta vacía del servicio.", 502, "empty_upstream");
  }

  // Pass-through SSE. We don't transform here — the client parses OAI
  // delta chunks and translates them into TurnEvent. This keeps the
  // route thin and lets us swap models/providers later without touching
  // either side of the chunk shape.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
