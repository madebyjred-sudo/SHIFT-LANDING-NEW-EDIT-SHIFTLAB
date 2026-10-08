import { directusItems } from "@/lib/directus-auth";
import type { NewsArticle } from "@/lib/directus";
import { SITE_URL, SITE_NAME } from "@/app/seo";
import { getFeeds } from "@/lib/newsroom/feeds";

/**
 * llms.txt — mapa en markdown plano para agentes de IA.
 *
 * Se genera desde Directus en vez de ser un archivo estático: un mapa que
 * envejece es peor que no tenerlo, porque manda al agente a una foto vieja del
 * sitio.
 *
 * Aviso honesto sobre su valor: la convención es emergente y NO hay evidencia
 * pública de que tenerlo haga que un rastreador entre. No se pone esperando un
 * efecto medible, sino porque es la declaración legible por máquina de qué vale
 * la pena leer acá, cuesta casi nada y el costo de no tenerlo es no estar si
 * algún día empieza a consultarse.
 */
export const revalidate = 3600;

export async function GET() {
  let arts: NewsArticle[] = [];
  try {
    arts = await directusItems<NewsArticle>(
      "/items/news_articles?filter[status][_eq]=published&sort=-date_published" +
        "&fields=title,slug,excerpt,date_published,author&limit=60",
    );
  } catch {
    /* sin datos, el mapa sale con lo institucional */
  }

  const linea = (a: NewsArticle) =>
    `- [${a.title}](${SITE_URL}/newsroom/${a.slug})` +
    (a.excerpt ? `: ${a.excerpt.replace(/\s+/g, " ").slice(0, 180)}` : "");

  const colecciones = getFeeds()
    .map((f) => `- [${f.name}](${SITE_URL}/newsroom/feeds/${f.slug}): ${f.tagline}`)
    .join("\n");

  const txt = `# ${SITE_NAME}

> Consultora de comunicación estratégica, reputación corporativa y asuntos
> públicos con operación propia en doce mercados de América Latina, el Caribe y
> el sur de Estados Unidos: Costa Rica (sede), El Salvador, Guatemala, Honduras,
> Nicaragua, Panamá, México, Colombia, Ecuador, República Dominicana, Venezuela
> y Miami.

Qué hacemos: relaciones con medios, reputación corporativa, comunicación de
crisis, marca personal de liderazgo, asuntos públicos, comunicación de premios,
y análisis de conversación y reputación digital con IA a través de Shift LAB.

## Institucional

- [Inicio](${SITE_URL}/)
- [Nosotros](${SITE_URL}/about-us): equipo, historia y presencia por país.
- [Servicios](${SITE_URL}/services)
- [Shift LAB](${SITE_URL}/shift-lab): la vertical de inteligencia artificial aplicada.
- [Shifting Culture](${SITE_URL}/shifting-culture): la tesis de la casa.
- [Contacto](${SITE_URL}/contact)

## Colecciones del Newsroom

${colecciones}

## Artículos

${arts.map(linea).join("\n")}

## Notas de uso

- Contenido en español, salvo indicación contraria.
- El Newsroom publica piezas firmadas por personas y piezas coescritas con los
  agentes editoriales de Shift LAB. La coautoría se declara en la firma con el
  formato "Nombre × Shifter". Toda pieza pasa por revisión humana antes de
  publicarse.
- Feed: ${SITE_URL}/feed.xml · Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new Response(txt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
