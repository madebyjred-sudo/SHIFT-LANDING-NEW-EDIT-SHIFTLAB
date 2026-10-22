import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/seo";
import { directusItems } from "@/lib/directus-auth";
import type { NewsArticle } from "@/lib/directus";

// Revalida cada hora: las notas nuevas entran al sitemap sin redeploy.
export const revalidate = 3600;

/* Fecha del último cambio REAL de cada página (no la del momento en que se arma el
 * sitemap). Un lastmod que cambia cada hora le enseña a Google que el dato no es
 * confiable y lo ignora en todo el sitio. Al cambiar el contenido de una página,
 * actualizar su fecha aquí. /newsroom toma la del artículo más reciente. */
const ROUTES: [string, string][] = [
  ["", "2026-10-21"],
  ["/about-us", "2026-10-08"],
  ["/services", "2026-10-08"],
  ["/shifting-culture", "2026-10-08"],
  ["/shift-lab", "2026-10-21"],
  ["/shift-lab/escucha-gratis", "2026-10-21"],
  ["/shift-lab/escucha-ia", "2026-10-21"],
  ["/shift-lab/escucha-digital", "2026-10-21"],
  ["/shift-lab/guia-ia", "2026-10-21"],
  ["/newsroom", ""],
  ["/awards", "2026-10-08"],
  ["/purpose", "2026-10-08"],
  ["/contact", "2026-10-08"],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles: MetadataRoute.Sitemap = [];
  try {
    const rows = await directusItems<NewsArticle>(
      "/items/news_articles?filter[status][_eq]=published&fields=slug,date_published&sort=-date_published&limit=500",
    );
    articles = rows.map((a) => ({
      url: `${SITE_URL}/newsroom/${a.slug}`,
      lastModified: a.date_published ? new Date(a.date_published) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Build sin token Directus: el sitemap se rellena al revalidar en runtime.
  }

  const ultimoArticulo = articles
    .map((a) => (a.lastModified ? new Date(a.lastModified).getTime() : 0))
    .reduce((m, t) => Math.max(m, t), 0);
  const base: MetadataRoute.Sitemap = ROUTES.map(([route, fecha]) => ({
    url: `${SITE_URL}${route}`,
    lastModified: route === "/newsroom" ? (ultimoArticulo ? new Date(ultimoArticulo) : undefined) : new Date(`${fecha}T12:00:00Z`),
    changeFrequency: route === "" || route === "/newsroom" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  return [...base, ...articles];
}
