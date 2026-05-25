// ----------------------------------------------------------------------
// Shifty — streaming engine (real)
// ----------------------------------------------------------------------
// `runAgentTurn` orquesta un turno completo del chat:
//   1. Lanza choreography de "thinking" en paralelo (visible al usuario).
//   2. Postea el historial a `/api/agent` que proxea a Cerebro.
//   3. Parsea SSE deltas OAI-compat → emite `chunk` events al UI.
//   4. Cuando llega el primer chunk, acelera la choreography restante y
//      emite `writing-start`.
//   5. Tras `done`, emite citations + suggestions desde el match local
//      (chips de la SCRIPT, no del modelo — son intent-aware UX, no
//      content del LLM).
//
// El contrato `TurnEvent` no cambió respecto al mock — la UI no se tocó.

import type { Citation, Message, ThinkingStep } from "./agent-types";
import { matchScript } from "./agent-types";

export type TurnEvent =
  | { type: "thinking-start"; steps: ThinkingStep[] }
  | { type: "step-reveal"; stepId: string }
  | { type: "writing-start" }
  | { type: "chunk"; text: string }
  | { type: "citations"; citations: Citation[] }
  | { type: "suggestions"; suggestions: string[] }
  | { type: "done" };

export type ChatMessage = { role: "user" | "assistant"; content: string };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ----------------------------------------------------------------------
// SSE parser — OAI-compat delta stream
// ----------------------------------------------------------------------
// Cerebro reenvía el stream tal cual viene de OpenRouter (formato OAI):
//   data: {"id":..., "choices":[{"delta":{"content":"Hola"}}]}\n\n
//   data: [DONE]\n\n
// Algunos chunks tienen `reasoning` deltas (Gemini) que ignoramos — los
// configuramos OFF server-side, pero si llegan los descartamos defensivos.

type ParsedSSEEvent =
  | { kind: "content"; text: string }
  | { kind: "done" }
  | { kind: "noop" };

function parseSSELine(line: string): ParsedSSEEvent {
  if (!line.startsWith("data:")) return { kind: "noop" };
  const payload = line.slice(5).trim();
  if (!payload) return { kind: "noop" };
  if (payload === "[DONE]") return { kind: "done" };
  try {
    const json = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: unknown } }>;
    };
    const delta = json.choices?.[0]?.delta;
    const content = delta?.content;
    if (typeof content === "string" && content.length > 0) {
      return { kind: "content", text: content };
    }
    return { kind: "noop" };
  } catch {
    return { kind: "noop" };
  }
}

/**
 * Lee el stream del fetch a `/api/agent` y emite trozos de texto a través
 * del callback `onChunk`. Resuelve cuando llega [DONE] o cierra el stream.
 *
 * Lanza si el upstream devuelve no-OK.
 */
async function readSSEStream(
  response: Response,
  onFirstByte: () => void,
  onChunk: (text: string) => void,
): Promise<void> {
  if (!response.body) throw new Error("empty body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sawFirstByte = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Eventos SSE están separados por \n\n. Iteramos línea por línea
      // dentro de cada evento — un evento puede tener `data: ...\n` + más
      // líneas opcionales.
      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) >= 0) {
        const eventBlock = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        for (const rawLine of eventBlock.split("\n")) {
          const line = rawLine.trim();
          if (!line) continue;
          const parsed = parseSSELine(line);
          if (parsed.kind === "content") {
            if (!sawFirstByte) {
              sawFirstByte = true;
              onFirstByte();
            }
            onChunk(parsed.text);
          } else if (parsed.kind === "done") {
            return;
          }
        }
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // ignored
    }
  }
}

// ----------------------------------------------------------------------
// Choreography — thinking steps que el usuario ve mientras esperamos
// ----------------------------------------------------------------------
// Usamos el SCRIPT local (intent → steps + chips) sólo para choreography
// y para los chips post-mensaje. El contenido del mensaje siempre viene
// del LLM. Si el LLM termina antes que la choreography, cortamos en seco
// y revelamos los pasos restantes de golpe.

// Thinking labels GENÉRICOS — usados para TODOS los turnos (los
// labels per-intent del SCRIPT se sienten canned / "guion fake"). Estos
// 3 dan la sensación de trabajo real sin claim de saber qué está
// pasando en el reasoning interno del modelo.
const DEFAULT_THINKING: ThinkingStep[] = [
  { id: "d1", kind: "ponder", label: "Procesando tu mensaje", duration: 500 },
  { id: "d2", kind: "ponder", label: "Buscando información relevante", duration: 800 },
  { id: "d3", kind: "ponder", label: "Armando respuesta", duration: 600 },
];

type StepController = {
  cancel: () => void;
  reveal: (cb: (stepId: string) => void) => Promise<void>;
};

/**
 * Devuelve un controller que va revelando los pasos según sus durations,
 * pero permite cancelar (cortar las esperas restantes) cuando llega el
 * primer chunk del modelo.
 */
function startStepReveal(steps: ThinkingStep[]): StepController {
  let cancelled = false;
  return {
    cancel: () => {
      cancelled = true;
    },
    reveal: async (cb) => {
      for (const step of steps) {
        if (cancelled) {
          cb(step.id); // revelá lo que queda sin esperar
          continue;
        }
        await wait(step.duration);
        cb(step.id);
      }
    },
  };
}

/**
 * Turno real. Conserva el contrato del mock: AsyncGenerator de TurnEvent.
 *
 * Argumentos:
 *   - messages: historial completo (incluyendo el último user message)
 *   - lastUserInput: el texto del último user message, para intent matching
 *   - sessionId: UUID generado por ShiftAgent, persistido en sessionStorage.
 *                Enviado a /api/agent para agrupar turnos del mismo visitor
 *                en DB y attach transcript completo a HubSpot.
 *   - pageOrigin: window.location.href (optional). Útil para tracking.
 */
export async function* runAgentTurn(
  messages: ChatMessage[],
  lastUserInput: string,
  sessionId?: string,
  pageOrigin?: string,
): AsyncGenerator<TurnEvent> {
  const intent = matchScript(lastUserInput);
  // SIEMPRE usamos DEFAULT_THINKING (genérico) — los pasos específicos
  // por intent del SCRIPT ("Reviso el palmarés", etc.) se sentían como
  // guion canned. El SCRIPT sigue siendo útil para citations + chips
  // post-respuesta (intent.citations + intent.suggestions más abajo),
  // pero el thinking visible va neutro.
  const steps = DEFAULT_THINKING;

  // 1. Anunciar los pasos al UI de una.
  yield { type: "thinking-start", steps };

  // 2. Arrancar la choreography en paralelo con el fetch al backend.
  //    Cada step revelado se vuelca a un buffer; el generator los drena
  //    intercalado con los chunks que lleguen del modelo.
  const stepBuffer: Array<{ type: "step-reveal"; stepId: string }> = [];
  const stepController = startStepReveal(steps);
  const stepDone = stepController.reveal((id) => {
    stepBuffer.push({ type: "step-reveal", stepId: id });
  });

  // 3. Disparar el fetch. NO esperamos a que termine la choreography —
  //    si el modelo responde rápido, queremos cortarla.
  let fetchError: unknown = null;
  const chunkBuffer: string[] = [];
  let writingStarted = false;
  let streamFinished = false;

  const fetchPromise = (async () => {
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, sessionId, pageOrigin }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${errBody.slice(0, 200)}`);
      }
      await readSSEStream(
        res,
        () => {
          // Primer byte de contenido — cortamos las esperas restantes.
          stepController.cancel();
        },
        (text) => {
          chunkBuffer.push(text);
        },
      );
    } catch (err) {
      fetchError = err;
    } finally {
      streamFinished = true;
    }
  })();

  // 4. Loop principal: ir drenando step-reveals y chunks. Yieldeamos en
  //    el orden en que aparecen. Si no hay nada en buffer, dormimos un
  //    poquito y reintentamos.
  while (!streamFinished || stepBuffer.length > 0 || chunkBuffer.length > 0) {
    // Drenar steps que cayeron en el buffer.
    while (stepBuffer.length > 0) {
      const evt = stepBuffer.shift();
      if (evt) yield evt;
    }

    // Si todavía no empezamos a escribir y hay un chunk listo (o el
    // stream terminó), emitimos writing-start.
    if (!writingStarted && (chunkBuffer.length > 0 || streamFinished)) {
      writingStarted = true;
      yield { type: "writing-start" };
    }

    // Drenar chunks.
    while (chunkBuffer.length > 0) {
      const text = chunkBuffer.shift();
      if (text) yield { type: "chunk", text };
    }

    // Si todo está vacío pero el stream sigue, esperar un tick corto.
    if (!streamFinished && stepBuffer.length === 0 && chunkBuffer.length === 0) {
      await wait(40);
    }
  }

  await fetchPromise; // garantiza que `streamFinished` y `fetchError` son finales

  if (fetchError) {
    // Mensaje de fallback amigable.
    if (!writingStarted) yield { type: "writing-start" };
    yield {
      type: "chunk",
      text:
        "Ups — tuve un problema técnico para responder. Probá de nuevo en un momento, o escribinos directo a **holahola@shiftpn.com**.",
    };
    yield { type: "done" };
    return;
  }

  await stepDone; // por las dudas que quede algún reveal pendiente

  // 5. Citations + suggestions desde el intent matcher local.
  if (intent.citations?.length) {
    yield { type: "citations", citations: intent.citations as Citation[] };
  }
  if (intent.suggestions?.length) {
    yield { type: "suggestions", suggestions: intent.suggestions };
  }

  yield { type: "done" };
}

// ----------------------------------------------------------------------
// Small helpers
// ----------------------------------------------------------------------

let idCounter = 0;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}

export const INITIAL_GREETING: Message = {
  id: "agent-greeting",
  role: "agent",
  ts: 0,
  content:
    "Hola, soy **Shifty**, un gusto en conocerte. ¿Cómo te puedo ayudar?",
  thinking: [],
  revealedSteps: [],
  suggestions: [
    "¿Qué servicios ofrecen?",
    "Premios y reconocimientos",
    "Hablar con un consultor",
    "Sobre Shift LAB",
  ],
};
