// ----------------------------------------------------------------------
// Retrieve para el RAG de Shifty.
// Dado una query de usuario, devuelve el contexto más relevante del
// knowledge graph (Newsroom + config curado) para inyectar en el system
// prompt de Cerebro.
// ----------------------------------------------------------------------

import { getPool } from "@/lib/db/client";
import { embedText } from "./kg-embed";

export interface RetrievedNode {
  source_id: string;
  node_type: string;
  title: string;
  content: string;
  payload: Record<string, unknown>;
  score: number;
  neighbors?: RetrievedNode[];
}

export interface RetrieveOptions {
  country?: string | null;
  topK?: number;
  expandNeighbors?: boolean;
}

const TYPE_BOOST: Record<string, number> = {
  metric: 0.15,
  article: 0.10,
  service: 0.05,
  hub: 0.05,
  person: 0.05,
};

const COUNTRY_MATCH_BOOST = 0.20;
const RECENCY_BOOST = 0.05;
const RECENCY_MONTHS = 12;

function normalizeCountry(input?: string | null): string | null {
  if (!input) return null;
  const map: Record<string, string> = {
    "costa rica": "Costa Rica",
    "cr": "Costa Rica",
    "colombia": "Colombia",
    "co": "Colombia",
    "ecuador": "Ecuador",
    "ec": "Ecuador",
    "guatemala": "Guatemala",
    "gt": "Guatemala",
    "el salvador": "El Salvador",
    "sv": "El Salvador",
    "honduras": "Honduras",
    "hn": "Honduras",
    "nicaragua": "Nicaragua",
    "ni": "Nicaragua",
    "panama": "Panamá",
    "pa": "Panamá",
    "republica dominicana": "República Dominicana",
    "rd": "República Dominicana",
    "dominicana": "República Dominicana",
    "venezuela": "Venezuela",
    "ve": "Venezuela",
    "estados unidos": "Estados Unidos",
    "usa": "Estados Unidos",
    "us": "Estados Unidos",
    "miami": "Estados Unidos",
  };
  const key = input.toLowerCase().trim();
  return map[key] ?? input;
}

async function vectorSearch(
  embedding: number[],
  topK: number,
): Promise<Omit<RetrievedNode, "neighbors">[]> {
  const pool = getPool();
  const embeddingLiteral = `[${embedding.join(",")}]`;
  const res = await pool.query(
    `
    SELECT
      source_id,
      node_type,
      title,
      content,
      payload,
      1 - (embedding <=> $1::vector) AS score
    FROM kg_nodes
    ORDER BY embedding <=> $1::vector
    LIMIT $2;
    `,
    [embeddingLiteral, topK * 3],
  );
  return res.rows.map((r) => ({
    source_id: r.source_id,
    node_type: r.node_type,
    title: r.title,
    content: r.content,
    payload: r.payload,
    score: parseFloat(r.score),
  }));
}

async function vectorSearchByCountry(
  embedding: number[],
  country: string,
  topK: number,
): Promise<Omit<RetrievedNode, "neighbors">[]> {
  const pool = getPool();
  const embeddingLiteral = `[${embedding.join(",")}]`;
  const pattern = `%${country}%`;
  const res = await pool.query(
    `
    SELECT
      source_id,
      node_type,
      title,
      content,
      payload,
      1 - (embedding <=> $1::vector) AS score
    FROM kg_nodes
    WHERE
      payload->>'country' = $2
      OR payload->>'hub' = $2
      OR content ILIKE $3
      OR title ILIKE $3
    ORDER BY embedding <=> $1::vector
    LIMIT $4;
    `,
    [embeddingLiteral, country, pattern, topK * 2],
  );
  return res.rows.map((r) => ({
    source_id: r.source_id,
    node_type: r.node_type,
    title: r.title,
    content: r.content,
    payload: r.payload,
    score: parseFloat(r.score),
  }));
}

async function fetchNeighbors(
  sourceIds: string[],
): Promise<Map<string, RetrievedNode[]>> {
  const byFrom = new Map<string, RetrievedNode[]>();
  if (sourceIds.length === 0) return byFrom;
  const pool = getPool();
  const res = await pool.query(
    `
    SELECT DISTINCT ON (e.from_source_id, n.source_id)
      e.from_source_id AS from_id,
      n.source_id,
      n.node_type,
      n.title,
      n.content,
      n.payload
    FROM kg_nodes n
    JOIN kg_edges e ON n.source_id = e.to_source_id
    WHERE e.from_source_id = ANY($1)
    ORDER BY e.from_source_id, n.source_id;
    `,
    [sourceIds],
  );
  for (const r of res.rows) {
    const node: RetrievedNode = {
      source_id: r.source_id,
      node_type: r.node_type,
      title: r.title,
      content: r.content,
      payload: r.payload,
      score: 0,
    };
    const arr = byFrom.get(r.from_id) ?? [];
    arr.push(node);
    byFrom.set(r.from_id, arr);
  }
  return byFrom;
}

function isRecent(payload: Record<string, unknown>): boolean {
  const date = payload.date_published as string | null;
  if (!date) return false;
  const pub = new Date(date);
  if (isNaN(pub.getTime())) return false;
  const monthsAgo = (Date.now() - pub.getTime()) / (1000 * 60 * 60 * 24 * 30);
  return monthsAgo <= RECENCY_MONTHS;
}

export async function retrieve(
  query: string,
  options: RetrieveOptions = {},
): Promise<RetrievedNode[]> {
  const { country, topK = 6, expandNeighbors = true } = options;
  const normalizedCountry = normalizeCountry(country);

  const embedding = await embedText(query);

  // Si el usuario menciona un país, priorizamos nodos de ese país.
  // Primero intentamos una búsqueda filtrada; si no trae suficientes,
  // completamos con la búsqueda general.
  let candidates: Omit<RetrievedNode, "neighbors">[] = [];
  if (normalizedCountry) {
    const filtered = await vectorSearchByCountry(embedding, normalizedCountry, topK);
    candidates = filtered;
    if (filtered.length < Math.ceil(topK / 2)) {
      const general = await vectorSearch(embedding, topK);
      const existing = new Set(filtered.map((f) => f.source_id));
      candidates = [...filtered, ...general.filter((g) => !existing.has(g.source_id))];
    }
  } else {
    candidates = await vectorSearch(embedding, topK);
  }

  // Boosts y ranking
  const scored = candidates.map((c) => {
    let score = c.score;
    score += TYPE_BOOST[c.node_type] ?? 0;

    if (normalizedCountry && c.payload) {
      const payloadCountry = (c.payload.country as string) ?? (c.payload.hub as string);
      const textHasCountry = `${c.title} ${c.content}`.toLowerCase().includes(normalizedCountry.toLowerCase());
      if (payloadCountry === normalizedCountry || textHasCountry) {
        score += COUNTRY_MATCH_BOOST;
      }
    }

    if (c.node_type === "article" && isRecent(c.payload)) {
      score += RECENCY_BOOST;
    }

    return { ...c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topK);

  if (!expandNeighbors) return top;

  // Expansión 1-salto: cada nodo top recibe SUS propios vecinos (por edge),
  // excluyendo los que ya están en el top para no duplicar.
  const neighborsByFrom = await fetchNeighbors(top.map((n) => n.source_id));
  const topIds = new Set(top.map((t) => t.source_id));

  return top.map((t) => ({
    ...t,
    neighbors: (neighborsByFrom.get(t.source_id) ?? [])
      .filter((n) => !topIds.has(n.source_id))
      .slice(0, 3),
  }));
}

export function formatContext(nodes: RetrievedNode[]): string {
  if (nodes.length === 0) {
    return "# Contexto recuperado\n\nNo se encontraron datos específicos en la base de conocimiento. Si la pregunta lo requiere, caé al fallback honesto.";
  }

  const lines: string[] = ["# Contexto recuperado para esta pregunta", ""];

  for (const n of nodes) {
    lines.push(`[tipo: ${n.node_type}] ${n.title}`);
    lines.push(`  ${n.content.slice(0, 800)}`);
    if (n.node_type === "article" && typeof n.payload.slug === "string") {
      lines.push(`  link: [/newsroom/${n.payload.slug}](/newsroom/${n.payload.slug})`);
    }
    if (n.node_type === "metric" && typeof n.payload.article_slug === "string") {
      lines.push(`  caso: [/newsroom/${n.payload.article_slug}](/newsroom/${n.payload.article_slug})`);
    }
    if (n.neighbors && n.neighbors.length > 0) {
      lines.push("  contexto relacionado:");
      for (const nb of n.neighbors) {
        lines.push(`    - [${nb.node_type}] ${nb.title}: ${nb.content.slice(0, 200)}`);
      }
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("Instrucción: usá SOLO estos datos para responder. Si no alcanzan, no inventes: ofrecé derivar a un humano. Cuando cites un artículo, usá el link markdown que aparece arriba.");

  return lines.join("\n");
}
