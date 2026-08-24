// ----------------------------------------------------------------------
// agent-core/chat — chat con un agente vía Cerebro (OAI-compat)
// ----------------------------------------------------------------------
// Cuerpo de app/api/shifter/route.ts parametrizado por AgentDescriptor.
// Mismos defaults (temp 0.5, max_tokens 4000, tenant shift-pn, mode normal,
// fallback content→reasoning, timeout 120s, status codes).

import type { AgentDescriptor } from "@/lib/avatar-factory/agent-registry";
import { buildAgentSystemPrompt } from "./build-system-prompt";
import { evokeMemory } from "@/lib/agent-memory";

const CEREBRO_BASE_URL =
  process.env.CEREBRO_BASE_URL ||
  "https://shift-cerebro-production.up.railway.app";
const CEREBRO_API_KEY = process.env.CEREBRO_API_KEY || "";

export interface ChatResult {
  success: boolean;
  text?: string;
  model?: string;
  latencyMs?: number;
  error?: string;
}

export async function chatWithAgent(
  d: AgentDescriptor,
  body: { message?: string; modelId?: string; traceLabel?: string },
): Promise<{ result: ChatResult; status: number }> {
  if (!CEREBRO_API_KEY) {
    return {
      result: { success: false, error: "Canal no configurado (falta CEREBRO_API_KEY en el server)." },
      status: 200,
    };
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return { result: { success: false, error: "Mensaje vacío" }, status: 400 };
  }

  const model = d.modelMap[body.modelId ?? ""] ?? d.defaultModel;
  const started = Date.now();
  // Brick 3: evocar memoria relevante a lo que preguntaron
  const evoked = evokeMemory(d.id, message);
  const systemContent = evoked ? `${buildAgentSystemPrompt(d)}\n\n${evoked}` : buildAgentSystemPrompt(d);

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
        temperature: d.temperature,
        max_tokens: d.maxTokens,
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: message },
        ],
        tenant: d.tenant,
        app_id_hint: d.appIdHint,
        trace_label: body.traceLabel || d.traceLabel,
        mode: "normal",
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return {
        result: { success: false, error: `Cerebro ${res.status}: ${t.slice(0, 200)}` },
        status: 200,
      };
    }

    const data = (await res.json()) as {
      choices?: Array<{
        message?: { content?: string; reasoning?: string };
        finish_reason?: string;
      }>;
    };
    const choice = data.choices?.[0];
    const text =
      (choice?.message?.content || "").trim() ||
      (choice?.message?.reasoning || "").trim();

    if (!text) {
      return {
        result: {
          success: false,
          error: `El modelo no devolvió texto (finish: ${choice?.finish_reason ?? "?"}). Probá de nuevo o cambiá de modelo.`,
          model,
        },
        status: 200,
      };
    }

    return {
      result: { success: true, text, model, latencyMs: Date.now() - started },
      status: 200,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return {
      result: { success: false, error: `Fallo de conexión a Cerebro: ${msg}` },
      status: 200,
    };
  }
}
