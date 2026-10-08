// ----------------------------------------------------------------------
// DB operations para el knowledge graph de Shifty (RAG).
// Usa el mismo Pool de lib/db/client.ts (DATABASE_URL → shifty_conversations).
// ----------------------------------------------------------------------

import { getPool } from "./client";

export interface KgNodeInput {
  source_id: string;
  node_type: string;
  title: string;
  content: string;
  payload?: Record<string, unknown>;
  embedding?: number[];
}

export interface KgEdgeInput {
  from_source_id: string;
  to_source_id: string;
  relation: string;
}

export async function upsertNodes(nodes: KgNodeInput[]): Promise<void> {
  if (nodes.length === 0) return;
  const pool = getPool();

  const values: unknown[] = [];
  const placeholders: string[] = [];
  let idx = 1;

  for (const n of nodes) {
    placeholders.push(
      `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, now())`,
    );
    values.push(
      n.source_id,
      n.node_type,
      n.title,
      n.content,
      JSON.stringify(n.payload ?? {}),
      n.embedding ? `[${n.embedding.join(",")}]` : null,
    );
  }

  const sql = `
    INSERT INTO kg_nodes (source_id, node_type, title, content, payload, embedding, date_updated)
    VALUES ${placeholders.join(", ")}
    ON CONFLICT (source_id, node_type, title)
    DO UPDATE SET
      content = EXCLUDED.content,
      payload = EXCLUDED.payload,
      embedding = EXCLUDED.embedding,
      date_updated = now();
  `;

  await pool.query(sql, values);
}

export async function upsertEdges(edges: KgEdgeInput[]): Promise<void> {
  if (edges.length === 0) return;
  const pool = getPool();

  const values: unknown[] = [];
  const placeholders: string[] = [];
  let idx = 1;

  for (const e of edges) {
    placeholders.push(`($${idx++}, $${idx++}, $${idx++})`);
    values.push(e.from_source_id, e.to_source_id, e.relation);
  }

  const sql = `
    INSERT INTO kg_edges (from_source_id, to_source_id, relation)
    VALUES ${placeholders.join(", ")}
    ON CONFLICT (from_source_id, to_source_id, relation) DO NOTHING;
  `;

  await pool.query(sql, values);
}

export async function clearNodesBySourceType(sourceTypePrefix: string): Promise<void> {
  const pool = getPool();
  await pool.query("DELETE FROM kg_nodes WHERE source_id LIKE $1 || ':%'", [sourceTypePrefix]);
}

export async function getSyncState(sourceType: string): Promise<{ lastSyncAt: Date | null; checksum: string | null }> {
  const pool = getPool();
  const res = await pool.query(
    "SELECT last_sync_at, checksum FROM kg_sync_state WHERE source_type = $1",
    [sourceType],
  );
  if (res.rows.length === 0) return { lastSyncAt: null, checksum: null };
  return { lastSyncAt: res.rows[0].last_sync_at, checksum: res.rows[0].checksum };
}

export async function setSyncState(
  sourceType: string,
  checksum: string,
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `
    INSERT INTO kg_sync_state (source_type, last_sync_at, last_success_at, checksum)
    VALUES ($1, now(), now(), $2)
    ON CONFLICT (source_type)
    DO UPDATE SET last_sync_at = now(), last_success_at = now(), checksum = EXCLUDED.checksum;
    `,
    [sourceType, checksum],
  );
}

export async function countNodes(): Promise<{ total: number; byType: Record<string, number> }> {
  const pool = getPool();
  const totalRes = await pool.query("SELECT COUNT(*)::int as n FROM kg_nodes");
  const byTypeRes = await pool.query(
    "SELECT node_type, COUNT(*)::int as n FROM kg_nodes GROUP BY node_type ORDER BY node_type",
  );
  const byType: Record<string, number> = {};
  for (const row of byTypeRes.rows) {
    byType[row.node_type] = row.n;
  }
  return { total: totalRes.rows[0].n, byType };
}
