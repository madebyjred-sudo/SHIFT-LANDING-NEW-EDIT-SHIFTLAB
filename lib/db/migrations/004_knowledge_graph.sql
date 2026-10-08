-- ----------------------------------------------------------------------
-- Knowledge graph para RAG de Shifty
-- ----------------------------------------------------------------------
-- Se usa la extensión pgvector en la misma DB donde viven los logs de
-- conversaciones (shifty_conversations). Tablas: kg_nodes, kg_edges,
-- kg_sync_state. Los embeddings son 1536-dim (OpenAI text-embedding-3-small).

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS kg_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL,           -- ej: article:davivienda-14-medios
  node_type TEXT NOT NULL,           -- article | metric | service | sector | icp | hub | person | concept | link
  title TEXT NOT NULL,
  content TEXT NOT NULL,             -- chunk semántico recuperable
  payload JSONB NOT NULL DEFAULT '{}', -- metadatos estructurados (slug, país, tags, etc.)
  embedding VECTOR(1536),
  date_updated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_id, node_type, title)
);

-- Nota: no creamos índice aproximado (ivfflat/hnsw) por ahora. Con < ~2k vectores
-- la búsqueda secuencial por cosine distance es exacta, rápida y evita que
-- ivfflat con pocos lists devuelva resultados incompletos (visto en práctica:
-- LIMIT 10 solo devolvía 1 fila). Cuando el grafo crezca a miles de nodos,
-- evaluar HNSW con lists adecuadas.
CREATE INDEX IF NOT EXISTS idx_kg_nodes_type ON kg_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_source ON kg_nodes(source_id);

CREATE TABLE IF NOT EXISTS kg_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_source_id TEXT NOT NULL,
  to_source_id TEXT NOT NULL,
  relation TEXT NOT NULL,
  UNIQUE(from_source_id, to_source_id, relation)
);

CREATE INDEX IF NOT EXISTS idx_kg_edges_from ON kg_edges(from_source_id);
CREATE INDEX IF NOT EXISTS idx_kg_edges_to ON kg_edges(to_source_id);

-- Control de ingesta incremental
CREATE TABLE IF NOT EXISTS kg_sync_state (
  source_type TEXT PRIMARY KEY,      -- directus | config
  last_sync_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  checksum TEXT
);
