import { SITE_URL } from "@/app/seo";
import { directusItems } from "@/lib/directus-auth";
import { articuloMd, respuestaMd, type ArticuloMd } from "@/lib/md/sitio";

/* /newsroom/<slug>.md (rewrite en next.config): el artículo en Markdown para agentes de IA. */
export const revalidate = 3600;

export async function GET(_: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  if (!/^[a-z0-9-]{1,200}$/.test(slug)) return new Response("No encontrado", { status: 404 });
  let rows: ArticuloMd[] = [];
  try {
    rows = await directusItems<ArticuloMd>(
      `/items/news_articles?filter[status][_eq]=published&filter[slug][_eq]=${slug}&fields=title,slug,excerpt,content,date_published,author&limit=1`,
    );
  } catch {
    return new Response("No disponible", { status: 503 });
  }
  if (!rows[0]) return new Response("No encontrado", { status: 404 });
  return respuestaMd(articuloMd(rows[0]), `${SITE_URL}/newsroom/${slug}`);
}
