// ----------------------------------------------------------------------
// Shifty handoff detector — extrae lead de la conversación del chat
// ----------------------------------------------------------------------
// Cuando el usuario, conversando con Shifty, da nombre + email
// (típicamente después de que Shifty le pide el handoff), detectamos
// la info y la pusheamos al CRM como un Contact con Note.
//
// Heurística simple y conservadora (Phase 2 MVP):
//   1. Buscamos email regex en el ÚLTIMO mensaje del usuario.
//   2. Si lo encontramos, intentamos sacar el nombre del mismo mensaje
//      con patrones comunes ("Soy X", "Mi nombre es X", "Me llamo X").
//   3. Brief = primer mensaje del usuario en la conversación (el
//      original intent), porque suele dar más contexto que el último.
//
// Lo que NO hacemos hoy:
//   - Detectar país (Shifty no lo pregunta). Va a "Unknown" en HubSpot.
//   - Manejar nombres con apellidos compuestos perfectamente. Tomamos
//     hasta 3 palabras consecutivas capitalizadas tras el trigger.
//   - Dedupe por session (HubSpot dedupea por email pero puede crear
//     Notes duplicadas si el usuario menciona el email 2 veces).
//     Aceptamos ese trade-off — es Phase 2 MVP.

import type { UpsertContactInput } from "./upsert-contact";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

// Email regex razonable (no full RFC 5322). Captura `local@dominio.tld`.
const EMAIL_RE = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

// Triggers comunes en español + inglés que preceden a un nombre.
const NAME_TRIGGERS = [
  /\bsoy\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,2})/,
  /\bmi nombre es\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,2})/i,
  /\bme llamo\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,2})/i,
  /\bi am\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
  /\bmy name is\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
];

function extractName(text: string): { firstname?: string; lastname?: string } {
  for (const re of NAME_TRIGGERS) {
    const m = text.match(re);
    if (m && m[1]) {
      const parts = m[1].trim().split(/\s+/);
      if (parts.length === 1) return { firstname: parts[0] };
      // 2-3 palabras → primera = firstname, resto = lastname
      return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
    }
  }
  return {};
}

/**
 * Intenta extraer un lead de la conversación.
 *
 * Devuelve null si:
 *   - No hay email en el último mensaje del usuario.
 *   - El último mensaje es del assistant (no del usuario).
 *
 * Devuelve UpsertContactInput si hay email — el resto (nombre, brief)
 * es best-effort.
 */
export function tryExtractLeadFromConversation(
  messages: ConversationMessage[],
): UpsertContactInput | null {
  if (messages.length === 0) return null;

  const lastMsg = messages[messages.length - 1];
  if (lastMsg.role !== "user") return null;

  const emailMatch = lastMsg.content.match(EMAIL_RE);
  if (!emailMatch) return null;
  const email = emailMatch[1].toLowerCase();

  const { firstname, lastname } = extractName(lastMsg.content);

  // Brief = primer mensaje del usuario (intent original), fallback al
  // último si el primero también tiene el email (caso edge: usuario que
  // se identifica en su primer mensaje).
  const userMessages = messages.filter((m) => m.role === "user");
  const firstUserMsg = userMessages[0]?.content ?? "";
  // Si el primer mensaje YA contiene el email, evitamos duplicar la
  // info y usamos el último mensaje como brief.
  const brief =
    firstUserMsg && !firstUserMsg.match(EMAIL_RE)
      ? firstUserMsg
      : lastMsg.content;

  return {
    email,
    firstname,
    lastname,
    brief: brief.slice(0, 2000), // cap a 2KB para no inflar la Note
    country: "Internacional (via chat)", // sin país conocido — Shifty no lo pregunta
    source: "shifty-chat",
  };
}
