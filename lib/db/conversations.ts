// ----------------------------------------------------------------------
// Conversation persistence — write/read helpers
// ----------------------------------------------------------------------
// Diseño:
//   • `logTurn` se llama desde /api/agent DESPUÉS de cada exchange
//     completo (user msg in + assistant msg out). Persiste ambos en
//     una sola transaction para garantizar pair-integrity.
//   • `getSessionTranscript` reconstruye la conversación cronológica
//     para attach a HubSpot notes / Slack notifications.
//   • `recordExtraction` y `recordHubspotSync` registran outcomes de
//     pipelines downstream para auditing.
//
// Todos los writes son async fire-and-forget desde el /api/agent
// route — si DB falla, log error pero NO romper el SSE response al
// usuario (la experiencia de chat prevalece sobre logging).

import { getPool } from "./client";

export type LogTurnInput = {
  sessionId: string;
  userMessage: string;
  assistantMessage: string;
  ip?: string;
  userAgent?: string;
  pageOrigin?: string;
};

/**
 * Persiste un turno completo (user msg + assistant msg) en una sola
 * transaction. Garantiza que nunca quede un user msg sin su pair de
 * respuesta en DB.
 */
export async function logTurn(input: LogTurnInput): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO conversations (session_id, role, content, ip, user_agent, page_origin)
       VALUES ($1, 'user', $2, $3, $4, $5)`,
      [
        input.sessionId,
        input.userMessage,
        input.ip ?? null,
        input.userAgent ?? null,
        input.pageOrigin ?? null,
      ],
    );
    await client.query(
      `INSERT INTO conversations (session_id, role, content, ip, user_agent, page_origin)
       VALUES ($1, 'assistant', $2, $3, $4, $5)`,
      [
        input.sessionId,
        input.assistantMessage,
        input.ip ?? null,
        input.userAgent ?? null,
        input.pageOrigin ?? null,
      ],
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export type TranscriptTurn = {
  role: "user" | "assistant";
  content: string;
  ts: Date;
};

/**
 * Devuelve el transcript completo de una sesión en orden cronológico.
 * Usado para attach a HubSpot notes (full conversation context).
 */
export async function getSessionTranscript(
  sessionId: string,
  opts: { limit?: number } = {},
): Promise<TranscriptTurn[]> {
  const limit = opts.limit ?? 100;
  const pool = getPool();
  const result = await pool.query<{ role: "user" | "assistant"; content: string; ts: Date }>(
    `SELECT role, content, ts
     FROM conversations
     WHERE session_id = $1
     ORDER BY ts ASC
     LIMIT $2`,
    [sessionId, limit],
  );
  return result.rows;
}

/**
 * Formatea un transcript como texto plano legible para HubSpot Note.
 */
export function formatTranscriptForNote(turns: TranscriptTurn[]): string {
  return turns
    .map((t) => {
      const label = t.role === "user" ? "Visitante" : "Shifty";
      return `[${label}] ${t.content}`;
    })
    .join("\n\n");
}

export type RecordExtractionInput = {
  sessionId: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  intent?: string | null;
  tier?: "green" | "yellow" | "red" | null;
  sentiment?: string | null;
  country?: string | null;
  summary?: string | null;
  extractor: "regex" | "llm";
  rawResponse?: unknown;
};

/**
 * Registra una extraction (regex o LLM). Devuelve el id auto-generado
 * para que el caller pueda referenciarlo en `hubspot_syncs`.
 */
export async function recordExtraction(input: RecordExtractionInput): Promise<number> {
  const pool = getPool();
  const result = await pool.query<{ id: number }>(
    `INSERT INTO extractions
       (session_id, email, first_name, last_name, company, intent, tier,
        sentiment, country, summary, extractor, raw_response)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id`,
    [
      input.sessionId,
      input.email ?? null,
      input.firstName ?? null,
      input.lastName ?? null,
      input.company ?? null,
      input.intent ?? null,
      input.tier ?? null,
      input.sentiment ?? null,
      input.country ?? null,
      input.summary ?? null,
      input.extractor,
      input.rawResponse ? JSON.stringify(input.rawResponse) : null,
    ],
  );
  return result.rows[0].id;
}

export type RecordHubspotSyncInput = {
  extractionId?: number | null;
  sessionId: string;
  contactId?: string | null;
  noteId?: string | null;
  success: boolean;
  errors?: string[];
};

export async function recordHubspotSync(input: RecordHubspotSyncInput): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO hubspot_syncs
       (extraction_id, session_id, contact_id, note_id, success, errors)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      input.extractionId ?? null,
      input.sessionId,
      input.contactId ?? null,
      input.noteId ?? null,
      input.success,
      input.errors && input.errors.length > 0 ? JSON.stringify(input.errors) : null,
    ],
  );
}
