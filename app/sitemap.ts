import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/seo";
import { directusItems } from "@/lib/directus-auth";
import type { NewsArticle } from "@/lib/directus";

// Revalida cada hora: las notas nuevas entran al sitemap sin redeploy.
export const revalidate = 3600;

const ROUTES = [
  "",
  "/about-us",
  "/services",
  "/shifting-culture",
  "/shift-lab",
  "/newsroom",
  "/awards",
  "/purpose",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const base: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  let articles: MetadataRoute.Sitemap = [];
  try {
    const rows = await directusItems<NewsArticle>(
      "/items/news_articles?filter[status][_eq]=published&fields=slug,date_published&sort=-date_published&limit=500",
    );
    articles = rows.map((a) => ({
      url: `${SITE_URL}/newsroom/${a.slug}`,
      lastModified: a.date_published ? new Date(a.date_published) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Build sin token Directus: el sitemap se rellena al revalidar en runtime.
  }

  return [...base, ...articles];
}
