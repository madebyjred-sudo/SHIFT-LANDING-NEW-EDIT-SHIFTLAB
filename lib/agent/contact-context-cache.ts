// ----------------------------------------------------------------------
// Per-session HubSpot contact cache para Phase 3 (context enrichment)
// ----------------------------------------------------------------------
// El lookup a HubSpot Contacts API toma ~100-300ms. Si lo hacemos en
// CADA turno del chat, sumamos esa latency al critical path antes del
// stream de Cerebro. Cache por session_id con TTL 5min:
//
//   • Primera vez que el visitor da email → lookup HubSpot → cachear
//   • Siguientes turnos del MISMO session → usar cache
//   • Si pasan 5min → re-lookup (capturar cambios en CRM post-conv)
//
// Es in-memory (single-instance VPS Boston). Si en el futuro corremos
// múltiples instances de PM2 → mover a Redis. Por ahora overkill.

import {
  getContactByEmail,
  formatContactContextForPrompt,
  type ContactContext,
} from "@/lib/hubspot/lookup-contact";

type CacheEntry = {
  /** ContactContext del CRM, o null si lookup confirmó que no existe */
  context: ContactContext | null;
  /** ms desde Date.now() cuando se hizo el lookup */
  lookedUpAt: number;
  /** Email usado para el lookup (para cache invalidation si user
   *  cambia de email en la misma conversación) */
  email: string;
};

const TTL_MS = 5 * 60 * 1000; // 5 min
const cache = new Map<string, CacheEntry>();

// Email regex razonable (no full RFC 5322).
const EMAIL_RE = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

/**
 * Escanea los mensajes del visitor en orden cronológico y devuelve el
 * email MÁS RECIENTE encontrado. Razonamiento: si el visitor corrige
 * su email mid-chat, queremos usar el último, no el primero.
 */
function findLatestEmailInMessages(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    const match = m.content.match(EMAIL_RE);
    if (match) return match[1].toLowerCase();
  }
  return null;
}

/**
 * Devuelve un visitor context formatted (string ready para system_blocks)
 * o null si:
 *   • No hay email en la conversación
 *   • HubSpot no tiene este contacto (lookup devolvió null)
 *   • HubSpot API falló (degradado silencioso — no es crítico)
 *
 * Usa cache por sessionId — primera vez paga el lookup, después es free
 * por 5min.
 */
export async function getVisitorContextForSession(
  sessionId: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<string | null> {
  const email = findLatestEmailInMessages(messages);
  if (!email) return null;

  const cached = cache.get(sessionId);
  const fresh =
    cached &&
    cached.email === email &&
    Date.now() - cached.lookedUpAt < TTL_MS;

  let context: ContactContext | null;
  if (fresh && cached) {
    context = cached.context;
  } else {
    context = await getContactByEmail(email);
    cache.set(sessionId, { context, email, lookedUpAt: Date.now() });
    // Garbage collect entries viejas oportunisticamente — evita memory
    // leak cuando muchas sesiones largas accumlan
    if (cache.size > 1000) {
      const cutoff = Date.now() - TTL_MS * 2;
      for (const [k, v] of cache.entries()) {
        if (v.lookedUpAt < cutoff) cache.delete(k);
      }
    }
  }

  if (!context) return null;
  return formatContactContextForPrompt(context);
}
