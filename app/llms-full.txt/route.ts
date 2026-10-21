import { SITE_NAME, SITE_URL } from "@/app/seo";
import { directusItems } from "@/lib/directus-auth";
import { articuloMd, escuchaMd, guiaMd, type ArticuloMd } from "@/lib/md/sitio";

/**
 * llms-full.txt: la versión larga de /llms.txt. Trae el contenido completo de las
 * páginas que más sirven a un agente (herramientas gratis, guía y los artículos
 * recientes del Newsroom) para que no tenga que recorrer el HTML del sitio.
 * Se regenera cada hora desde las mismas fuentes que las páginas.
 */
export const revalidate = 3600;

const ARTICULOS = 25;

export async function GET() {
  let arts: ArticuloMd[] = [];
  try {
    arts = await directusItems<ArticuloMd>(
      `/items/news_articles?filter[status][_eq]=published&sort=-date_published&fields=title,slug,excerpt,content,date_published,author&limit=${ARTICULOS}`,
    );
  } catch {
    /* sin Directus, sale lo institucional */
  }
  const sep = "\n\n---\n\n";
  const txt = `# ${SITE_NAME} · contenido completo para agentes de IA

> Consultora de comunicación estratégica, reputación corporativa y asuntos públicos con operación propia en doce mercados de América Latina, el Caribe y el sur de Estados Unidos. Shift LAB es su vertical de inteligencia artificial aplicada: Eco mide lo que dicen las IA de una marca y Sentinel escucha redes sociales y medios.

Índice corto: ${SITE_URL}/llms.txt · Sitemap: ${SITE_URL}/sitemap.xml
Cada página de este archivo existe también suelta en Markdown: agrega \`.md\` a su dirección (por ejemplo ${SITE_URL}/shift-lab/guia-ia.md o ${SITE_URL}/newsroom/<slug>.md).
${sep}${escuchaMd("escucha-gratis")}${sep}${escuchaMd("escucha-ia")}${sep}${escuchaMd("escucha-digital")}${sep}${await guiaMd()}${sep}# Newsroom · los ${arts.length} artículos más recientes${sep}${arts.map(articuloMd).join(sep)}`;
  return new Response(txt, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}
