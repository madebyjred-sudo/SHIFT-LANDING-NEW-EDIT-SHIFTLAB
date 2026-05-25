-- ============================================================
-- Shifty conversation persistence — initial schema
-- ============================================================
-- Postgres lives en el VPS Boston junto con la web app (mismo
-- blast radius, sin latency cross-DC). Solo escucha en localhost.
--
-- 3 tablas:
--   conversations   — cada turno (user/assistant) registrado raw
--   extractions     — info estructurada sacada de la sesión por
--                     regex o LLM (email, name, intent, tier)
--   hubspot_syncs   — record de cada llamada a HubSpot API
--                     (success/fail + contact_id retornado)
--
-- Idempotent: usa IF NOT EXISTS. Re-correr no rompe nada.
-- ============================================================

-- ── conversations ────────────────────────────────────────────
-- Cada mensaje de cada turno se persiste raw. Permite:
--   • Reconstruir transcript completo para attach a HubSpot Note
--   • Analytics (turnos por sesión, latencia, conversation flow)
--   • Re-run de extractions cuando subimos el LLM extractor
CREATE TABLE IF NOT EXISTS conversations (
  id          BIGSERIAL PRIMARY KEY,
  session_id  TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Context per-turn (no se setea siempre, solo when available)
  ip          TEXT,
  user_agent  TEXT,
  page_origin TEXT
);

CREATE INDEX IF NOT EXISTS conversations_session_ts_idx
  ON conversations (session_id, ts);
CREATE INDEX IF NOT EXISTS conversations_ts_idx
  ON conversations (ts DESC);

-- ── extractions ──────────────────────────────────────────────
-- Lead info estructurada. Una sesión puede tener múltiples
-- extractions a lo largo de su vida (cada vez que se intenta
-- extract, queda registro — útil para ver cómo evoluciona la
-- info que sabemos del lead).
CREATE TABLE IF NOT EXISTS extractions (
  id            BIGSERIAL PRIMARY KEY,
  session_id    TEXT NOT NULL,
  email         TEXT,
  first_name    TEXT,
  last_name     TEXT,
  company       TEXT,
  -- "info-gathering" | "qualification" | "demo-request" | "pricing"
  -- | "objection" | "ready-to-buy" | "off-topic" | "support"
  intent        TEXT,
  -- "green" = hot lead, "yellow" = warm, "red" = cold/junk
  tier          TEXT CHECK (tier IS NULL OR tier IN ('green', 'yellow', 'red')),
  -- "positive" | "neutral" | "negative" | "frustrated"
  sentiment     TEXT,
  country       TEXT,
  -- 1-2 sentences summary del intent del lead, para mostrar en
  -- HubSpot timeline + slack notif sin tener que leer transcript
  summary       TEXT,
  -- Qué motor lo sacó: "regex" (heuristic) o "llm" (Gemini)
  extractor     TEXT NOT NULL DEFAULT 'regex'
                 CHECK (extractor IN ('regex', 'llm')),
  -- Raw response del LLM si extractor=llm (para debug/auditing)
  raw_response  JSONB,
  ts            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS extractions_session_idx
  ON extractions (session_id, ts DESC);
CREATE INDEX IF NOT EXISTS extractions_email_idx
  ON extractions (email)
  WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS extractions_tier_ts_idx
  ON extractions (tier, ts DESC)
  WHERE tier IS NOT NULL;

-- ── hubspot_syncs ────────────────────────────────────────────
-- Log de cada llamada a HubSpot API. Permite:
--   • Reintentos manuales si HubSpot falló temporariamente
--   • Auditoría de qué se mandó al CRM y cuándo
--   • Métrica de success rate de la integración
CREATE TABLE IF NOT EXISTS hubspot_syncs (
  id             BIGSERIAL PRIMARY KEY,
  extraction_id  BIGINT REFERENCES extractions(id) ON DELETE SET NULL,
  session_id     TEXT NOT NULL,
  -- IDs que HubSpot devolvió (NULL si falló antes del create)
  contact_id     TEXT,
  note_id        TEXT,
  success        BOOLEAN NOT NULL,
  -- Array de strings con error messages
  errors         JSONB,
  ts             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hubspot_syncs_session_idx
  ON hubspot_syncs (session_id, ts DESC);
CREATE INDEX IF NOT EXISTS hubspot_syncs_contact_idx
  ON hubspot_syncs (contact_id)
  WHERE contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS hubspot_syncs_failures_idx
  ON hubspot_syncs (ts DESC)
  WHERE success = FALSE;

-- ── Helper view: latest extraction per session ───────────────
-- Útil para queries tipo "dame el estado actual de leads activos
-- de hoy" sin tener que hacer subqueries DISTINCT ON manualmente.
CREATE OR REPLACE VIEW v_latest_extractions AS
SELECT DISTINCT ON (session_id)
  id, session_id, email, first_name, last_name, company,
  intent, tier, sentiment, country, summary, extractor, ts
FROM extractions
ORDER BY session_id, ts DESC;
