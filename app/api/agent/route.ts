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
import { extractLeadWithLLM } from "@/lib/agent/extract-lead-llm";
import { notifyHotLead } from "@/lib/slack/notify-lead";
import {
  logTurn,
  recordExtraction,
  recordHubspotSync,
} from "@/lib/db/conversations";

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
  /** UUID generado client-side, persistido en sessionStorage. Permite
   *  agrupar turnos del mismo visitante para attach transcript completo
   *  a HubSpot. Si no viene, generamos uno server-side (worse: no
   *  podemos correlacionar turns futuros del mismo visitor). */
  sessionId?: string;
  /** URL de la page desde donde Shifty fue abierto. Útil para entender
   *  contexto del lead (ej. "vino desde /shift-lab"). */
  pageOrigin?: string;
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

  // ── Session ID — generamos si no vino del cliente ─────────────────
  const sessionId =
    payload.sessionId ??
    `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const pageOrigin = payload.pageOrigin ?? request.headers.get("referer") ?? undefined;
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const lastUserMessage = messages[messages.length - 1].content;

  // ── HubSpot capture (fire-and-forget) ─────────────────────────────
  // Si en el último mensaje del usuario detectamos email + nombre (post
  // handoff de Shifty), pusheamos un Contact al CRM en background.
  // NO bloqueamos el SSE — la latencia se mantiene < primer byte de
  // Cerebro. Si falla HubSpot, log y seguimos. Si el email ya existe,
  // HubSpot dedupe automático.
  //
  // ADEMÁS: registramos la extraction + outcome del sync en DB para
  // auditing/analytics. Todo async, no afecta latency del chat.
  const lead = tryExtractLeadFromConversation(messages);
  if (lead) {
    (async () => {
      try {
        const extractionId = await recordExtraction({
          sessionId,
          email: lead.email,
          firstName: lead.firstname,
          lastName: lead.lastname,
          summary: lead.brief,
          country: lead.country,
          extractor: "regex",
        });
        const r = await upsertContactWithNote(lead);
        await recordHubspotSync({
          extractionId,
          sessionId,
          contactId: r.contactId,
          noteId: r.noteCreated ? "created" : null,
          success: r.ok,
          errors: r.errors,
        });
        if (r.ok) {
          console.log(
            "[shifty→hubspot] OK contactId:",
            r.contactId,
            "note:",
            r.noteCreated,
            "session:",
            sessionId,
          );
        } else {
          console.warn("[shifty→hubspot] partial:", r.errors.join(" | "));
        }
      } catch (e) {
        console.error("[shifty→hubspot] threw:", e);
      }
    })();
  }

  // Build Cerebro request. system_blocks goes server-side (no leak via
  // network from client). Bearer key likewise stays on the server.
  const cerebroBody = {
    model: MODEL_ID,
    stream: true,
    temperature: 0.4,
    // 1500 = budget generoso para que el reasoning interno (Gemini 3.5
    // lo fuerza ON y a veces come 400-600 tokens en queries complejos)
    // no estrangule la respuesta visible. Antes con 800 se cortaba a
    // media oración en queries tipo "campaña con IA en consumo masivo".
    // Cost por turno: ~$0.013 max (gemini-3.5-flash a $9/M).
    max_tokens: 1500,
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

  // Tee SSE — chunks pasan al cliente Y se acumulan para logging.
  // Después del [DONE] event, parseamos la respuesta acumulada del
  // assistant y la persistimos junto con el user msg en una sola
  // transaction (logTurn).
  //
  // Importante: el tee se hace en TransformStream, no leyendo el
  // body 2 veces. Esto preserva el streaming real al cliente — los
  // chunks llegan vivos, no esperan a que termine para mostrar.
  let assistantBuffer = "";
  const decoder = new TextDecoder();
  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      // Pass-through al cliente
      controller.enqueue(chunk);
      // Acumular para parsing post-stream
      assistantBuffer += decoder.decode(chunk, { stream: true });
    },
    flush() {
      // Stream terminó — parsear los deltas acumulados y extraer el
      // content total del assistant message. Después loggear el turno.
      assistantBuffer += decoder.decode();
      const assistantContent = parseAssistantContentFromSSE(assistantBuffer);

      // Fire-and-forget el log (no bloquea el response que ya
      // terminó). Si DB falla, log error pero no romper nada — el
      // usuario ya recibió su respuesta.
      logTurn({
        sessionId,
        userMessage: lastUserMessage,
        assistantMessage: assistantContent,
        ip,
        userAgent,
        pageOrigin,
      }).catch((e) => console.error("[shifty→db] logTurn failed:", e));

      // ── LLM extraction (Phase 1) ──────────────────────────────
      // Corre AFTER del stream porque ahora tenemos la respuesta
      // del assistant en assistantContent → contexto completo del
      // turno para que el extractor entienda intent + tier.
      //
      // SOLO corre si:
      //   • Hay al menos 2 user turns (suficiente contexto)
      //   • No corrió ya regex extraction este turno (evita doble
      //     upsert; regex es path rápido cuando user da email explícito)
      //
      // Fire-and-forget — agregar latency post-stream no afecta UX.
      const userTurnCount = messages.filter((m) => m.role === "user").length;
      const shouldRunLLM = userTurnCount >= 2 && !lead;
      if (shouldRunLLM) {
        const messagesForExtraction = [
          ...messages,
          { role: "assistant" as const, content: assistantContent },
        ];
        (async () => {
          try {
            const extracted = await extractLeadWithLLM(messagesForExtraction);
            if (!extracted) return;
            const { result, rawResponse } = extracted;

            const extractionId = await recordExtraction({
              sessionId,
              email: result.email,
              firstName: result.first_name,
              lastName: result.last_name,
              company: result.company,
              intent: result.intent,
              tier: result.tier,
              sentiment: result.sentiment,
              country: result.country,
              summary: result.summary,
              extractor: "llm",
              rawResponse,
            });

            // Si LLM encontró email → upsert a HubSpot (regex no
            // disparó este turno, ver shouldRunLLM)
            let hubspotContactId: string | null = null;
            if (result.email) {
              const summary =
                result.summary ?? lastUserMessage.slice(0, 500);
              const r = await upsertContactWithNote({
                email: result.email,
                firstname: result.first_name ?? undefined,
                lastname: result.last_name ?? undefined,
                company: result.company ?? undefined,
                brief: summary,
                country: result.country ?? "Internacional (via chat)",
                source: "shifty-chat",
                icpTier: result.tier ?? undefined,
              });
              await recordHubspotSync({
                extractionId,
                sessionId,
                contactId: r.contactId,
                noteId: r.noteCreated ? "created" : null,
                success: r.ok,
                errors: r.errors,
              });
              hubspotContactId = r.contactId;
            }

            // Slack notification para hot leads (Phase 2)
            if (result.tier === "green") {
              await notifyHotLead({
                sessionId,
                lead: result,
                pageOrigin,
                hubspotContactId,
              });
            }
          } catch (e) {
            console.error("[shifty→llm-extract] threw:", e);
          }
        })();
      }
    },
  });

  return new Response(upstream.body!.pipeThrough(transform), {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      // Echo session id al cliente para que pueda persistirlo si
      // el server generó uno nuevo (caso primer request del visitor).
      "X-Session-Id": sessionId,
    },
  });
}

/**
 * Parsea el buffer SSE acumulado de Cerebro/OpenRouter y reconstruye
 * el content total del assistant message. Cada chunk es:
 *
 *   data: {"choices":[{"delta":{"content":"Hola"}}]}\n\n
 *   data: {"choices":[{"delta":{"content":" mundo"}}]}\n\n
 *   data: [DONE]\n\n
 *
 * Iteramos sobre cada line, parseamos el JSON delta, concatenamos
 * `delta.content`. Ignoramos non-content events (reasoning, role, etc).
 */
function parseAssistantContentFromSSE(sseBuffer: string): string {
  const lines = sseBuffer.split("\n");
  const parts: string[] = [];
  for (const line of lines) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const json = JSON.parse(payload) as {
        choices?: Array<{ delta?: { content?: unknown } }>;
      };
      const content = json.choices?.[0]?.delta?.content;
      if (typeof content === "string" && content.length > 0) {
        parts.push(content);
      }
    } catch {
      // chunk parcial — se completará en el siguiente decode
    }
  }
  return parts.join("");
}
