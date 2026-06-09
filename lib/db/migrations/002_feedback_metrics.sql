-- ============================================================
-- Shifty Metrics & Feedback Schema
-- ============================================================

-- ── message_feedback ────────────────────────────────────────────
-- Guarda el feedback explícito (pulgar arriba/abajo) de un mensaje 
-- específico del bot.
CREATE TABLE IF NOT EXISTS message_feedback (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  message_content TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating IN (1, -1)),
  reason TEXT,
  comment TEXT,
  ts TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS message_feedback_session_idx
  ON message_feedback (session_id, ts DESC);

-- ── session_metrics ─────────────────────────────────────────────
-- Guarda la calificación global (CSAT) y métricas de cierre al
-- finalizar una sesión (ej. al darle "Limpiar Chat").
CREATE TABLE IF NOT EXISTS session_metrics (
  session_id TEXT PRIMARY KEY,
  csat_score INT CHECK (csat_score BETWEEN 1 AND 5),
  user_comment TEXT,
  total_turns INT,
  duration_seconds INT,
  closed_at TIMESTAMPTZ DEFAULT NOW()
);
