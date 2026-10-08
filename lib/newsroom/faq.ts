/*
 * Separa el bloque de preguntas frecuentes del resto del cuerpo del
 * artículo, para que el FAQ se pinte como acordeón en vez de HTML plano.
 *
 * Convención del contenido (la misma que lee `parseFaq` para el
 * JSON-LD): <h2>Preguntas frecuentes</h2> seguido de pares
 * <h3>pregunta</h3> <p>respuesta</p>.
 *
 * Regla dura: el texto de las respuestas SIEMPRE queda en el DOM. El
 * acordeón colapsa por altura/opacidad, nunca quita el contenido, para
 * que el FAQPage del schema siga espejando texto realmente visible.
 * Ocultarlo con display:none convertiría el marcado en cloaking.
 */

export interface FaqItem {
  q: string;
  /** HTML de la respuesta (puede traer <p>, <a>, <strong>…). */
  a: string;
}

export interface SplitContent {
  /** Cuerpo del artículo sin el bloque de FAQ. */
  body: string;
  /** Título real del bloque ("Preguntas frecuentes", "FAQ"…). */
  faqHeading: string | null;
  items: FaqItem[];
}

const FAQ_HEADING_RE =
  /<h([23])[^>]*>\s*(?:preguntas\s+frecuentes|preguntas\s+y\s+respuestas|faq)\s*<\/h\1>/i;

/**
 * Corta el contenido en cuerpo + items de FAQ. Si no encuentra el
 * bloque, devuelve el contenido intacto y `items` vacío: el artículo se
 * renderiza como siempre.
 */
export function splitFaq(html: string): SplitContent {
  if (!html) return { body: "", faqHeading: null, items: [] };

  const match = html.match(FAQ_HEADING_RE);
  if (!match || match.index === undefined) {
    return { body: html, faqHeading: null, items: [] };
  }

  const start = match.index;
  const level = match[1];
  const afterHeading = start + match[0].length;

  // El bloque de FAQ corre hasta el siguiente h2 del mismo nivel o el
  // final del documento (así un <h2>Cobertura en medios</h2> posterior
  // no queda tragado dentro del acordeón).
  const restAfter = html.slice(afterHeading);
  const nextSectionRe = new RegExp(`<h[1-${level}][^>]*>`, "i");
  const nextMatch = restAfter.match(nextSectionRe);
  const faqRegion =
    nextMatch && nextMatch.index !== undefined
      ? restAfter.slice(0, nextMatch.index)
      : restAfter;
  const tail =
    nextMatch && nextMatch.index !== undefined
      ? restAfter.slice(nextMatch.index)
      : "";

  const items: FaqItem[] = [];
  const pairRe = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3[^>]*>|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = pairRe.exec(faqRegion)) !== null) {
    const q = stripTags(m[1]);
    const a = (m[2] || "").trim();
    if (q && stripTags(a).length > 15) items.push({ q, a });
  }

  // Sin pares reconocibles no tocamos nada: mejor el render de siempre
  // que un acordeón vacío.
  if (items.length === 0) return { body: html, faqHeading: null, items: [] };

  return {
    body: html.slice(0, start) + tail,
    faqHeading: stripTags(match[0]) || "Preguntas frecuentes",
    items,
  };
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
