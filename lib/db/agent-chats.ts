// ----------------------------------------------------------------------
// agent-chats — historial de chat del cockpit por (usuario, agente)
// ----------------------------------------------------------------------
// Aislamiento: TODA función recibe userId (verificado server-side) +
// agentId, y SIEMPRE filtra por ambos. Nadie ve el historial de otro.
// Búsqueda full-text español vía la columna generada `fts`.

import { getPool } from "./client";

export type SaveTurnInput = {
  userId: string;
  agentId: string;
  sessionId: string;
  userMessage: string;
  agentMessage: string;
  model?: string | null;
};

/** Persiste un turno completo (user + agent) en una transacción. */
export async function saveTurn(i: SaveTurnInput): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO agent_chats (user_id, agent_id, session_id, role, content, model)
       VALUES ($1, $2, $3, 'user', $4, $5)`,
      [i.userId, i.agentId, i.sessionId, i.userMessage, i.model ?? null],
    );
    await client.query(
      `INSERT INTO agent_chats (user_id, agent_id, session_id, role, content, model)
       VALUES ($1, $2, $3, 'agent', $4, $5)`,
      [i.userId, i.agentId, i.sessionId, i.agentMessage, i.model ?? null],
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export type SessionSummary = {
  sessionId: string;
  started: string;
  last: string;
  count: number;
  preview: string;
};

/** Lista las conversaciones del usuario con ese agente (más recientes primero). */
export async function listSessions(
  userId: string,
  agentId: string,
  limit = 60,
): Promise<SessionSummary[]> {
  const r = await getPool().query(
    `SELECT s.session_id, s.started, s.last, s.n,
       (SELECT content FROM agent_chats c
         WHERE c.user_id = $1 AND c.agent_id = $2 AND c.session_id = s.session_id AND c.role = 'user'
         ORDER BY c.ts ASC LIMIT 1) AS preview
     FROM (
       SELECT session_id, MIN(ts) AS started, MAX(ts) AS last, COUNT(*) AS n
       FROM agent_chats
       WHERE user_id = $1 AND agent_id = $2
       GROUP BY session_id
     ) s
     ORDER BY s.last DESC
     LIMIT $3`,
    [userId, agentId, limit],
  );
  return r.rows.map((x) => ({
    sessionId: x.session_id,
    started: new Date(x.started).toISOString(),
    last: new Date(x.last).toISOString(),
    count: Number(x.n),
    preview: x.preview || "",
  }));
}

export type ChatMsg = {
  role: "user" | "agent";
  content: string;
  model: string | null;
  ts: string;
};

/** Mensajes de una sesión (cronológico), scoped a user+agent. */
export async function getSessionMessages(
  userId: string,
  agentId: string,
  sessionId: string,
): Promise<ChatMsg[]> {
  const r = await getPool().query(
    `SELECT role, content, model, ts
     FROM agent_chats
     WHERE user_id = $1 AND agent_id = $2 AND session_id = $3
     ORDER BY ts ASC`,
    [userId, agentId, sessionId],
  );
  return r.rows.map((x) => ({
    role: x.role,
    content: x.content,
    model: x.model,
    ts: new Date(x.ts).toISOString(),
  }));
}

export type SearchHit = {
  sessionId: string;
  role: "user" | "agent";
  snippet: string;
  ts: string;
};

/** Busca (full-text español) en los chats del usuario con ese agente. */
export async function searchMessages(
  userId: string,
  agentId: string,
  q: string,
  limit = 40,
): Promise<SearchHit[]> {
  if (!q.trim()) return [];
  const r = await getPool().query(
    `SELECT session_id, role, ts,
       ts_headline('spanish', content, websearch_to_tsquery('spanish', $3),
                   'StartSel=«, StopSel=», MaxWords=20, MinWords=6, MaxFragments=1') AS snippet
     FROM agent_chats
     WHERE user_id = $1 AND agent_id = $2 AND fts @@ websearch_to_tsquery('spanish', $3)
     ORDER BY ts DESC
     LIMIT $4`,
    [userId, agentId, q, limit],
  );
  return r.rows.map((x) => ({
    sessionId: x.session_id,
    role: x.role,
    snippet: x.snippet,
    ts: new Date(x.ts).toISOString(),
  }));
}
