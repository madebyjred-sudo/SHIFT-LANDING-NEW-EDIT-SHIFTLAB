import { directusItems } from "@/lib/directus-auth";
import type { NewsArticle } from "@/lib/directus";
import { SITE_URL, SITE_NAME } from "@/app/seo";

/**
 * Feed RSS del Newsroom.
 *
 * No es nostalgia: medido sobre los logs del 3 al 17 de agosto, los rastreadores
 * pidieron `/atom.xml`, `/feed`, `/rss.xml` y `/sitemap_index.xml` — y los cuatro
 * devolvían 404. Un feed es un canal de descubrimiento que los agentes buscan
 * por convención y que además consumen lectores y agregadores.
 */
export const revalidate = 600;

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  let items: NewsArticle[] = [];
  try {
    items = await directusItems<NewsArticle>(
      "/items/news_articles?filter[status][_eq]=published&sort=-date_published" +
        "&fields=title,slug,excerpt,date_published,author&limit=40",
    );
  } catch {
    // Sin Directus el feed sale vacío pero válido: un 500 le enseña al
    // rastreador que la URL no sirve y deja de pedirla.
  }

  const entradas = items
    .map((a) => {
      const url = `${SITE_URL}/newsroom/${a.slug}`;
      const fecha = a.date_published ? new Date(a.date_published).toUTCString() : "";
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${fecha ? `<pubDate>${fecha}</pubDate>` : ""}
      ${a.author ? `<dc:creator>${esc(String(a.author))}</dc:creator>` : ""}
      <description>${esc(a.excerpt ?? "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)} · Newsroom</title>
    <link>${SITE_URL}/newsroom</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Análisis, casos y lecturas de mercado de Shift Latam en América Latina, el Caribe y el sur de Estados Unidos.</description>
    <language>es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${entradas}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
