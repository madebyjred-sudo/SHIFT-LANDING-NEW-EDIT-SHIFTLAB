/**
 * Colecciones del Newsroom ("feeds").
 *
 * Un feed es un hub temático con identidad propia: nombre, badge, copy y — si
 * lo pide — un tratamiento visual distinto. Sustituye al cableado a mano que
 * vivía en TOPIC_LABELS de `app/newsroom/tag/[tag]/page.tsx`.
 *
 * MEMBRESÍA POR REGLAS, no por asignación. Cada feed declara qué lo compone
 * (tags, categorías, autores o autoría IA) y los artículos entran solos. Si la
 * pertenencia se asignara artículo por artículo alguien tendría que mantenerla,
 * y eso se abandona a la segunda semana.
 *
 * El registro vive en código a propósito: es versionable y sale hoy. Cuando haga
 * falta editarlo desde el CMS, solo cambia `getFeeds()` por una lectura a
 * Directus — las páginas y los componentes no se enteran.
 */
import { isAiAuthor } from "./ai-authors";

export type FeedTreatment = "standard" | "voces";

export interface FeedMatch {
  tags?: string[];
  categories?: string[];
  authors?: string[];
  aiAuthors?: boolean;
}

export interface NewsFeed {
  slug: string;
  name: string;
  /** Etiqueta corta para el badge sobre las tarjetas. */
  badge: string;
  tagline: string;
  intro: string;
  accent: string;
  treatment: FeedTreatment;
  match: FeedMatch;
}

export const FEEDS: NewsFeed[] = [
  {
    slug: "voces-de-la-region",
    name: "Voces de la región",
    badge: "Voces",
    tagline: "Doce mercados, doce lecturas propias",
    intro:
      "Shift opera en doce mercados de América Latina, el Caribe y el sur de Estados Unidos, y en cada uno hay alguien que lleva años leyendo su plaza de cerca. Esta colección reúne lo que están publicando quienes dirigen esas operaciones: crisis en tiempo real, reputación corporativa, campañas y el criterio detrás de cada decisión. Cada pieza cita la publicación original de su autor.",
    accent: "#1534DC",
    treatment: "voces",
    // La firma de quien dirige un mercado YA es la señal de pertenencia: no hace
    // falta que además lleve un tag. Así entran las piezas que Rodrigo, Oscar y
    // Gabriela publicaron antes de que existiera la colección, sin tener que
    // re-etiquetar contenido ya publicado para que encaje en un filtro.
    match: {
      tags: ["voces de shift", "voces de la región"],
      authors: [
        "Rodrigo Castro",
        "Oscar Solano",
        "Gabriela Piedra",
        "Gonzalo Piñeros",
        "Camila Ferreiro",
        "Angélica Moreno",
        "Rosario Montenegro",
      ],
    },
  },
  {
    slug: "escrito-por-ia",
    name: "Escrito por IA",
    badge: "IA",
    tagline: "Nuestros agentes editoriales, con revisión humana",
    intro:
      "Columnas y estudios firmados por los agentes editoriales de Shift LAB. Shifter cubre metodología, reputación y demanda de búsqueda; Luna cubre cultura y atención. Todo lo que firman pasa por revisión humana antes de publicarse, y esa regla no es negociable: la máquina investiga, analiza y redacta, y una persona decide si sale.",
    accent: "#F540FF",
    treatment: "standard",
    match: { aiAuthors: true, authors: ["shifter", "luna"] },
  },
  {
    slug: "reputacion-en-la-ia",
    name: "Reputación en la IA",
    badge: "GEO",
    tagline: "Qué dicen los modelos de tu marca",
    intro:
      "La capa de reputación que casi nadie mide todavía: qué responden los asistentes cuando alguien pregunta por una marca, de dónde sacan esas respuestas y qué se puede hacer al respecto. Incluye nuestras propias auditorías, con fechas y con los errores adelante.",
    accent: "#0EA5A4",
    treatment: "standard",
    match: {
      tags: ["ia", "ai", "geo", "reputación algorítmica", "bing", "indexación"],
    },
  },
];

/**
 * A qué mercado pertenece cada voz. Se usa cuando la pieza no trae el país en
 * los tags — el caso de todo lo publicado antes de que existiera la colección.
 */
export const PAIS_POR_AUTOR: Record<string, string> = {
  "rodrigo castro": "Costa Rica",
  "oscar solano": "Costa Rica",
  "gabriela piedra": "Costa Rica",
  "gonzalo piñeros": "Colombia",
  "camila ferreiro": "El Salvador",
  "angélica moreno": "Ecuador",
  "rosario montenegro": "Nicaragua",
};

/** Resuelve el mercado de una firma, tolerando coautoría ("X × Shifter"). */
export function paisDeAutor(autor?: string | null): string | null {
  if (!autor) return null;
  for (const parte of autor.split("×")) {
    const hit = PAIS_POR_AUTOR[parte.trim().toLowerCase()];
    if (hit) return hit;
  }
  return null;
}

export function getFeeds(): NewsFeed[] {
  return FEEDS;
}

export function getFeed(slug: string): NewsFeed | null {
  const s = decodeURIComponent(slug).trim().toLowerCase();
  return FEEDS.find((f) => f.slug === s) ?? null;
}

/** Lo mínimo que hay que saber de un artículo para resolver su pertenencia. */
export interface FeedCandidate {
  tags?: string[] | null;
  categorySlug?: string | null;
  author?: string | null;
  authorRole?: string | null;
}

function norm(s: unknown): string {
  return String(s ?? "").trim().toLowerCase();
}

export function matchesFeed(a: FeedCandidate, feed: NewsFeed): boolean {
  const { match } = feed;

  if (match.tags?.length) {
    const tags = (a.tags ?? []).map(norm);
    if (match.tags.some((t) => tags.includes(norm(t)))) return true;
  }

  if (match.categories?.length) {
    const cat = norm(a.categorySlug);
    if (cat && match.categories.some((c) => norm(c) === cat)) return true;
  }

  if (match.authors?.length) {
    const au = norm(a.author);
    // El autor puede venir como colaboración ("Shifter × Luna").
    const partes = au.split("×").map((p) => p.trim());
    if (match.authors.some((n) => partes.includes(norm(n)))) return true;
  }

  if (match.aiAuthors && isAiAuthor(a.author, a.authorRole)) return true;

  return false;
}

/** Todos los feeds a los que pertenece un artículo. */
export function feedsFor(a: FeedCandidate): NewsFeed[] {
  return FEEDS.filter((f) => matchesFeed(a, f));
}
