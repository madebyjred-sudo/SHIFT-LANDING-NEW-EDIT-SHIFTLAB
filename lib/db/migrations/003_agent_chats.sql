-- ============================================================
-- agent_chats — historial de chat del cockpit, por USUARIO y por AGENTE
-- ============================================================
-- Aislado por user_id (Supabase auth) + agent_id ('shifter'|'luna'|…).
-- Búsqueda full-text en español (tsvector generado + GIN).
-- Idempotente (IF NOT EXISTS). Owner = shifty (el rol del app).
-- ============================================================

CREATE TABLE IF NOT EXISTS agent_chats (
  id          BIGSERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,               -- Supabase auth user id
  agent_id    TEXT NOT NULL,               -- 'shifter' | 'luna' | …
  session_id  TEXT NOT NULL,               -- agrupa una conversación
  role        TEXT NOT NULL CHECK (role IN ('user', 'agent')),
  content     TEXT NOT NULL,
  model       TEXT,
  ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- índice de búsqueda (español)
  fts         tsvector GENERATED ALWAYS AS (to_tsvector('spanish', content)) STORED
);

-- Listar sesiones + cargar una sesión (scoped por user+agent).
CREATE INDEX IF NOT EXISTS agent_chats_user_agent_session_ts_idx
  ON agent_chats (user_id, agent_id, session_id, ts);
-- Orden por recencia dentro de user+agent.
CREATE INDEX IF NOT EXISTS agent_chats_user_agent_ts_idx
  ON agent_chats (user_id, agent_id, ts DESC);
-- Búsqueda full-text.
CREATE INDEX IF NOT EXISTS agent_chats_fts_idx
  ON agent_chats USING GIN (fts);

ALTER TABLE agent_chats OWNER TO shifty;
