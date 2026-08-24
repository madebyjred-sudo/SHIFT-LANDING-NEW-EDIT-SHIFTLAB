#!/usr/bin/env tsx
// ----------------------------------------------------------------------
// Ingesta del knowledge graph para el RAG de Shifty.
// Fuentes:
//   - content/knowledge/shift-latam-config.yaml (servicios, sectores, hubs, etc.)
//   - Directus news_articles (casos, métricas, contenido publicado)
//
// Uso:
//   OPENAI_API_KEY=... DATABASE_URL=... npx tsx scripts/kg-ingest.ts
// ----------------------------------------------------------------------

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { createHash } from "node:crypto";
import { directusItems } from "@/lib/directus-auth";
import { embedTexts } from "@/lib/agent/kg-embed";
import {
  upsertNodes,
  upsertEdges,
  setSyncState,
  countNodes,
  type KgNodeInput,
  type KgEdgeInput,
} from "@/lib/db/kg";
import type { NewsArticle, NewsCategory, Author } from "@/lib/directus";

const BATCH_SIZE = 100;

interface ConfigDoc {
  identity?: Record<string, unknown>;
  services?: Array<Record<string, unknown>>;
  shiftlab?: Record<string, unknown>;
  concepts?: Array<Record<string, unknown>>;
  sectors?: Array<Record<string, unknown>>;
  ideal_customer?: Record<string, unknown>;
  hubs?: Array<Record<string, unknown>>;
  people?: Array<Record<string, unknown>>;
  awards?: Record<string, unknown>;
  links_internos?: Array<Record<string, unknown>>;
  contactos?: Record<string, unknown>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function chunkText(text: string, maxChars = 1500): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxChars) return [cleaned];
  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    chunks.push(cleaned.slice(start, start + maxChars));
    start += maxChars;
  }
  return chunks;
}

// ----------------------------------------------------------------------
// Config YAML → nodos
// ----------------------------------------------------------------------

function loadConfig(): ConfigDoc {
  const configPath = path.join(process.cwd(), "content", "knowledge", "shift-latam-config.yaml");
  const raw = fs.readFileSync(configPath, "utf-8");
  return yaml.load(raw) as ConfigDoc;
}

function configNodesAndEdges(config: ConfigDoc): { nodes: KgNodeInput[]; edges: KgEdgeInput[] } {
  const nodes: KgNodeInput[] = [];
  const edges: KgEdgeInput[] = [];

  // Identity
  if (config.identity) {
    const id = config.identity as Record<string, unknown>;
    nodes.push({
      source_id: "identity:shift-latam",
      node_type: "concept",
      title: "Quiénes somos",
      content: [
        `Shift Latam es ${id.presencia_total}.`,
        `Trayectoria: ${id.trayectoria}.`,
        `Headcount aproximado: ${id.headcount_aprox}.`,
        `Propuesta: ${id.propuesta_valor}`,
      ].join(" "),
      payload: { ...id, source: "config" },
    });
  }

  // Services
  for (const svc of config.services ?? []) {
    const id = svc.id as string;
    const name = svc.name as string;
    const description = (svc.description as string) ?? "";
    nodes.push({
      source_id: `service:${id}`,
      node_type: "service",
      title: name,
      content: `${name}. ${description} ${(svc.cuando_aplica as string[])?.join(". ") ?? ""}`,
      payload: { ...svc, source: "config" },
    });
  }

  // Sectors
  for (const sec of config.sectors ?? []) {
    const sid = sec.id as string;
    const name = sec.name as string;
    nodes.push({
      source_id: `sector:${sid}`,
      node_type: "sector",
      title: name,
      content: `${name}: ${sec.description}`,
      payload: { ...sec, source: "config" },
    });
    // Edge: cada servicio sirve a varios sectores (heurística: todos los servicios sirven a todos los sectores)
    for (const svc of config.services ?? []) {
      edges.push({
        from_source_id: `service:${svc.id as string}`,
        to_source_id: `sector:${sid}`,
        relation: "SERVES",
      });
    }
  }

  // ICP
  for (const [tier, data] of Object.entries(config.ideal_customer ?? {})) {
    const d = data as Record<string, string>;
    nodes.push({
      source_id: `icp:${tier}`,
      node_type: "icp",
      title: d.name,
      content: `${d.name}: ${d.description}`,
      payload: { tier, ...d, source: "config" },
    });
  }

  // Hubs
  for (const hub of config.hubs ?? []) {
    const country = hub.country as string;
    const sid = `hub:${slugify(country)}`;
    nodes.push({
      source_id: sid,
      node_type: "hub",
      title: country,
      content: [
        `Hub de Shift Latam que atiende ${country}${hub.city ? `, con sede en ${hub.city}` : ""}.`,
        hub.role ? `Rol: ${hub.role}.` : "",
        hub.address ? `Dirección: ${hub.address}.` : "",
        hub.phone ? `Teléfono: ${hub.phone}.` : "",
        hub.contact_name
          ? `Persona de contacto que atiende ${country}: ${hub.contact_name} (${hub.contact_role}).`
          : ``,
        hub.contact_email ? `Email de contacto en ${country}: ${hub.contact_email}.` : "",
        `Si necesitás atención en ${country}, este es el hub correspondiente.`,
      ]
        .filter(Boolean)
        .join(" "),
      payload: { ...hub, source: "config" },
    });
  }

  // People
  for (const person of config.people ?? []) {
    const name = person.name as string;
    const hub = (person.hub as string) ?? "Costa Rica";
    const sid = `person:${slugify(name)}`;
    nodes.push({
      source_id: sid,
      node_type: "person",
      title: name,
      content: [
        `${name} atiende ${hub} como ${person.role as string}.`,
        person.bio ? `Perfil: ${person.bio}` : "",
        `Es el contacto de Shift Latam para atención en ${hub}.`,
      ]
        .filter(Boolean)
        .join(" "),
      payload: { ...person, source: "config" },
    });
    edges.push({
      from_source_id: sid,
      to_source_id: `hub:${slugify(hub)}`,
      relation: "BASED_IN",
    });
  }

  // Concepts
  for (const concept of config.concepts ?? []) {
    const cid = concept.id as string;
    nodes.push({
      source_id: `concept:${cid}`,
      node_type: "concept",
      title: concept.name as string,
      content: `${concept.name}: ${concept.description}`,
      payload: { ...concept, source: "config" },
    });
  }

  // Shift LAB
  if (config.shiftlab) {
    const lab = config.shiftlab as Record<string, unknown>;
    nodes.push({
      source_id: "concept:shiftlab",
      node_type: "concept",
      title: "Shift LAB",
      content: `${lab.name}: ${lab.description} Filosofía: ${lab.filosofia}`,
      payload: { ...lab, source: "config" },
    });
    // Conectar Shift LAB con cada servicio
    for (const svc of config.services ?? []) {
      edges.push({
        from_source_id: `concept:shiftlab`,
        to_source_id: `service:${svc.id as string}`,
        relation: "APPLIES_TO",
      });
    }
  }

  // Awards
  if (config.awards) {
    nodes.push({
      source_id: "concept:awards",
      node_type: "concept",
      title: "Premios y reconocimientos",
      content: (config.awards.summary as string) ?? "",
      payload: { ...config.awards, source: "config" },
    });
  }

  // Links internos
  for (const link of config.links_internos ?? []) {
    const path = link.path as string;
    nodes.push({
      source_id: `link:${path}`,
      node_type: "link",
      title: link.name as string,
      content: `${link.name}: ${link.when_to_cite}`,
      payload: { ...link, source: "config" },
    });
  }

  return { nodes, edges };
}

// ----------------------------------------------------------------------
// Directus news_articles → nodos
// ----------------------------------------------------------------------

function extractMetrics(text: string): Array<{ value: string; context: string }> {
  // Heurística simple: buscar números grandes con contexto cercano.
  const metrics: Array<{ value: string; context: string }> = [];
  const pattern = /([A-Z][^.;]{0,120})(\d+[\d.,]*\s*(?:millones|miles|millón|k|M|K|%|por ciento|veces|años|meses|días|países|mercados|medios)[^.;]{0,60})/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    const context = m[1].trim();
    const value = m[2].trim();
    metrics.push({ value, context: `${context} ${value}` });
  }
  return metrics;
}

async function articleNodesAndEdges(): Promise<{ nodes: KgNodeInput[]; edges: KgEdgeInput[] }> {
  const nodes: KgNodeInput[] = [];
  const edges: KgEdgeInput[] = [];

  const rawArticles = await directusItems<NewsArticle>(
    "/items/news_articles?filter[status][_eq]=published&sort=-date_published&fields=*,category.id,category.name,category.slug&limit=200",
    0,
  );

  console.log(`[ingest] ${rawArticles.length} artículos publicados en Directus`);

  for (const article of rawArticles) {
    const slug = article.slug;
    const sourceId = `article:${slug}`;
    const cat = article.category as NewsCategory | null;
    const title = article.title;
    const excerpt = article.excerpt ?? "";
    const content = article.content ?? "";
    const tags = article.tags ?? [];
    const fullText = `${title}. ${excerpt} ${content}`.replace(/\s+/g, " ").trim();

    // Nodo article principal
    nodes.push({
      source_id: sourceId,
      node_type: "article",
      title,
      content: fullText.slice(0, 2000),
      payload: {
        slug,
        excerpt,
        category: cat?.name ?? null,
        category_slug: cat?.slug ?? null,
        tags,
        date_published: article.date_published,
        author: article.author,
        read_time: article.read_time,
        source: "directus",
      },
    });

    // Nodos métrica extraídos del artículo
    const metrics = extractMetrics(fullText);
    for (let i = 0; i < metrics.length; i++) {
      const metric = metrics[i];
      nodes.push({
        source_id: `${sourceId}:metric:${i}`,
        node_type: "metric",
        title: metric.value,
        content: `${metric.value} — ${metric.context} (caso: ${title})`,
        payload: {
          article_slug: slug,
          article_title: title,
          value: metric.value,
          source: "directus",
        },
      });
      edges.push({
        from_source_id: `${sourceId}:metric:${i}`,
        to_source_id: sourceId,
        relation: "FROM_ARTICLE",
      });
    }

    // Edges hacia sectores por categoría/tags
    const sectorKeywords: Record<string, string[]> = {
      salud: ["salud", "life sciences", "farmacia", "medicina", "bienestar"],
      finanzas: ["banca", "finanzas", "seguros", "fintech", "servicios financieros", "banco"],
      gobierno: ["gobierno", "asuntos públicos", "regulador", "política", "agenda pública"],
      turismo: ["turismo", "marca país", "destino", "viaje", "ict"],
      consumo: ["retail", "consumo", "fast food", "alimentos", "bebidas", "retail"],
      tecnologia: ["tecnología", "educación", "minecraft", "ia", "inteligencia artificial", "digital"],
      "tercer-sector": ["ong", "causa", "social", "advocacy", "impacto social", "feminicidio", "menstrual"],
    };
    const textLower = fullText.toLowerCase();
    for (const [sectorId, keywords] of Object.entries(sectorKeywords)) {
      if (keywords.some((k) => textLower.includes(k))) {
        edges.push({
          from_source_id: sourceId,
          to_source_id: `sector:${sectorId}`,
          relation: "BELONGS_TO",
        });
      }
    }

    // Edges hacia servicios por keywords
    const serviceKeywords: Record<string, string[]> = {
      crisis: ["crisis", "riesgo", "reputación", "controversia", "escándalo"],
      "media-data": ["data", "performance", "paid media", "seo", "aeo", "dashboard", "escucha social"],
      creatividad: ["campaña", "creatividad", "producción", "storytelling", "activación", "cannes"],
      estrategia: ["estrategia corporativa", "asuntos públicos", "posicionamiento ejecutivo", "ceo branding", "esg"],
    };
    for (const [svcId, keywords] of Object.entries(serviceKeywords)) {
      if (keywords.some((k) => textLower.includes(k))) {
        edges.push({
          from_source_id: sourceId,
          to_source_id: `service:${svcId}`,
          relation: "PROVES",
        });
      }
    }
  }

  return { nodes, edges };
}

// ----------------------------------------------------------------------
// Embeddings por lotes
// ----------------------------------------------------------------------

async function embedNodes(nodes: KgNodeInput[]): Promise<KgNodeInput[]> {
  const out: KgNodeInput[] = [];
  for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
    const batch = nodes.slice(i, i + BATCH_SIZE);
    console.log(`[ingest] embeddings lote ${i + 1}..${Math.min(i + BATCH_SIZE, nodes.length)} / ${nodes.length}`);
    const embeddings = await embedTexts(batch.map((n) => `${n.title}. ${n.content}`));
    for (let j = 0; j < batch.length; j++) {
      out.push({ ...batch[j], embedding: embeddings[j] });
    }
  }
  return out;
}

// ----------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------

async function main() {
  const config = loadConfig();
  const { nodes: configNodes, edges: configEdges } = configNodesAndEdges(config);

  console.log(`[ingest] ${configNodes.length} nodos del config`);
  console.log(`[ingest] ${configEdges.length} edges del config`);

  const { nodes: articleNodes, edges: articleEdges } = await articleNodesAndEdges();
  console.log(`[ingest] ${articleNodes.length} nodos de artículos`);
  console.log(`[ingest] ${articleEdges.length} edges de artículos`);

  const allNodes = [...configNodes, ...articleNodes];
  const allEdges = [...configEdges, ...articleEdges];

  const embeddedNodes = await embedNodes(allNodes);

  // Upsert en DB
  console.log("[ingest] guardando nodos...");
  await upsertNodes(embeddedNodes);
  console.log("[ingest] guardando edges...");
  await upsertEdges(allEdges);

  // Checksum simple del config
  const configRaw = fs.readFileSync(
    path.join(process.cwd(), "content", "knowledge", "shift-latam-config.yaml"),
    "utf-8",
  );
  const checksum = createHash("sha256").update(configRaw).digest("hex");
  await setSyncState("config", checksum);
  await setSyncState("directus", new Date().toISOString());

  const counts = await countNodes();
  console.log("[ingest] listo. Totales:", counts);
}

main().catch((err) => {
  console.error("[ingest] error:", err);
  process.exit(1);
});
