import type { NewsCardArticle } from "@/components/newsroom/NewsCard";

// ─── Fase 1 del ranking del Newsroom ──────────────────────────────────────
// Mezcla FRESCURA con DIVERSIDAD de autor/tema para evitar el "muro de un solo
// autor" (p.ej. rachas de Shifter) en el hero y la primera fila. El orden del
// array que recibe NewsroomGrid define hero/secundarias/grilla por posición, así
// que este re-orden es el único punto de control (sin tocar el render).
//
// Determinista: mismo input → mismo orden (safe para ISR/revalidate). No usa
// aleatoriedad. No es cronológico puro: parte de frescura + un leve empuje a
// autores humanos, y arma el orden greedy penalizando repetir autor/categoría
// dentro de la ventana visible reciente.
//
// Fase 2 (pendiente): sumar un `demandScore` desde GSC. Fase 3: personalización
// por visitante. Este archivo es el punto de extensión de ambas.

const DAY = 86_400_000;
const HALF_LIFE_DAYS = 21; // frescura útil ~3 semanas
const HUMAN_BOOST = 0.05; // desempate suave a favor de humanos (NO voltea diferencias reales de fecha; el hero sigue siendo lo más fresco). El anti-"muro" lo hace AUTHOR_PENALTY.
const WINDOW = 4; // "primera fila": hero + secundarias
const AUTHOR_PENALTY = 0.6; // castigo por repetir autor dentro de la ventana
const CATEGORY_PENALTY = 0.15; // castigo por repetir categoría dentro de la ventana

function ageDays(dateStr: string | null | undefined, now: number): number {
  if (!dateStr) return 3650;
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return 3650;
  return Math.max(0, (now - t) / DAY);
}

function recency(a: NewsCardArticle, now: number): number {
  // hoy≈1 · ~3 semanas≈0.37 · ~6 semanas≈0.14
  return Math.exp(-ageDays(a.date_published, now) / HALF_LIFE_DAYS);
}

function baseScore(a: NewsCardArticle, now: number): number {
  return recency(a, now) + (a.author_is_ai ? 0 : HUMAN_BOOST);
}

function authorKey(a: NewsCardArticle): string {
  return (a.author || "?").toString().toLowerCase();
}

/**
 * Reordena los artículos publicados mezclando frescura + diversidad de autor/tema.
 * `nowMs` es inyectable para tests; por defecto Date.now().
 */
export function rankArticles(
  articles: NewsCardArticle[],
  nowMs: number = Date.now(),
): NewsCardArticle[] {
  if (articles.length <= 2) return articles;

  const remaining = articles.map((a) => ({ a, base: baseScore(a, nowMs) }));
  const selected: NewsCardArticle[] = [];

  while (remaining.length) {
    const window = selected.slice(-WINDOW);
    let bestIdx = 0;
    let bestVal = -Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const cand = remaining[i];
      let sameAuthor = 0;
      let sameCat = 0;
      for (const s of window) {
        if (authorKey(s) === authorKey(cand.a)) sameAuthor++;
        if (s.category_slug && s.category_slug === cand.a.category_slug) sameCat++;
      }
      const val = cand.base - AUTHOR_PENALTY * sameAuthor - CATEGORY_PENALTY * sameCat;
      if (val > bestVal) {
        bestVal = val;
        bestIdx = i;
      }
    }
    selected.push(remaining[bestIdx].a);
    remaining.splice(bestIdx, 1);
  }

  return selected;
}
