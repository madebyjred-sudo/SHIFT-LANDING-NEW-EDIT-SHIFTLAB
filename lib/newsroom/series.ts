/**
 * Series (hilos) del Newsroom.
 *
 * Una serie es un conjunto ORDENADO de piezas que se leen como una sola obra
 * en partes: "parte 3 de 5". Es lo que distingue una serie de una colección —
 * las colecciones (`feeds.ts`) se arman solas por reglas y no tienen orden;
 * una serie necesita saber qué va primero, y eso no se puede deducir.
 *
 * Por eso la membresía acá es EXPLÍCITA, al revés que en los feeds. El orden
 * del arreglo `partes` es el orden de lectura.
 *
 * Los tres casos que esto cubre:
 *   1. Publicar un hilo completo de una  → se declara la serie con sus partes.
 *   2. Sumarle una parte a algo ya publicado → se agrega el slug al final.
 *   3. Agrupar piezas sueltas ya existentes → se listan en el orden que toque.
 *
 * Vive en código, igual que los feeds: es versionable y no exige tocar el
 * esquema de Directus. Cuando haga falta editarlo desde el CMS, solo cambia
 * `getSeries()` por una lectura remota y ni las páginas ni los componentes se
 * enteran.
 */

export interface NewsSeries {
  slug: string;
  name: string;
  /** Una línea: de qué va el hilo completo. */
  tagline: string;
  intro: string;
  accent: string;
  /** Slugs en ORDEN DE LECTURA. El índice manda, no la fecha. */
  partes: string[];
}

export const SERIES: NewsSeries[] = [
  // Todavía no hay ninguna. Se declara acá cuando exista el primer hilo real:
  // inventar una serie de ejemplo dejaría una página viva y vacía en el sitio.
];

export function getSeries(): NewsSeries[] {
  return SERIES;
}

export function getSerie(slug: string): NewsSeries | null {
  const s = decodeURIComponent(slug).trim().toLowerCase();
  return SERIES.find((x) => x.slug === s) ?? null;
}

export interface UbicacionEnSerie {
  serie: NewsSeries;
  /** 1-indexado, como se le muestra a la gente. */
  parte: number;
  total: number;
  anterior: string | null;
  siguiente: string | null;
}

/** Dónde cae un artículo dentro de su serie, si pertenece a alguna. */
export function ubicarEnSerie(slug: string): UbicacionEnSerie | null {
  for (const serie of SERIES) {
    const i = serie.partes.indexOf(slug);
    if (i === -1) continue;
    return {
      serie,
      parte: i + 1,
      total: serie.partes.length,
      anterior: i > 0 ? serie.partes[i - 1] : null,
      siguiente: i < serie.partes.length - 1 ? serie.partes[i + 1] : null,
    };
  }
  return null;
}
