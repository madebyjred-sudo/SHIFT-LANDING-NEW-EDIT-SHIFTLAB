/**
 * Detección de autoría por agente IA (Shifter u otros agentes de Shift LAB).
 *
 * No dependemos de un campo en Directus (un campo nuevo no entra a su caché de
 * esquema si se inserta por SQL y rompe los `fields=` explícitos). En su lugar
 * derivamos la condición de los datos que el app ya lee: nombre y rol del autor.
 *
 * Convención: un agente IA editorial se llama como tal (p. ej. "Shifter") o su
 * rol declara el laboratorio ("… · Shift LAB"). Futuros agentes que sigan esa
 * convención quedan detectados sin tocar el frontend.
 */
const AI_AGENT_NAMES = new Set(["shifter"]);

export function isAiAuthor(
  name?: string | null,
  role?: string | null,
): boolean {
  const n = (name || "").trim().toLowerCase();
  const r = (role || "").trim().toLowerCase();
  if (!n && !r) return false;
  if (AI_AGENT_NAMES.has(n)) return true;
  if (/shift\s*lab/.test(r)) return true; // rol "Radar editorial · Shift LAB"
  if (/\b(agente ia|agente|bot)\b/.test(r)) return true;
  return false;
}
