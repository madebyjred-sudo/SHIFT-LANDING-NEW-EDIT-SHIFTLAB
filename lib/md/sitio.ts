/* Versiones en Markdown del sitio para agentes de IA (ChatGPT, Claude, Perplexity…).
 * Las usan /llms-full.txt, /shift-lab/<pagina>.md y /newsroom/<slug>.md.
 * El contenido sale de las mismas fuentes que las páginas: la guía de content/guia-ia.md,
 * las FAQ de lib/escucha/faq.ts y los artículos de Directus. */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { SITE_URL } from "@/app/seo";
import { FAQ_ECO, FAQ_INTEGRAL, FAQ_SENTINEL } from "@/lib/escucha/faq";

export const PAISES_MD = "cr (Costa Rica), sv (El Salvador), gt (Guatemala), hn (Honduras), ni (Nicaragua), pa (Panamá), mx (México), co (Colombia), ec (Ecuador), do (República Dominicana), ve (Venezuela)";

/** La copia en Markdown declara como canónica la página HTML: no compite con ella en buscadores. */
export function respuestaMd(md: string, canonica?: string) {
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      ...(canonica ? { Link: `<${canonica}>; rel="canonical"` } : {}),
    },
  });
}

export async function guiaMd(): Promise<string> {
  const md = await readFile(path.join(process.cwd(), "content", "guia-ia.md"), "utf8");
  return `${md.trim()}\n\n---\n\nFuente: ${SITE_URL}/shift-lab/guia-ia · Shift LAB, Shift Latam.\n`;
}

type Faq = { p: string; r: string }[];
const faqMd = (f: Faq) => f.map((x) => `### ${x.p}\n\n${x.r}`).join("\n\n");

const ESCUCHAS = {
  "escucha-ia": {
    titulo: "Escucha gratis en IA · Eco",
    resumen:
      "Herramienta gratis de Shift LAB. Pregunta a siete inteligencias artificiales (ChatGPT, Claude, Gemini, Perplexity, DeepSeek, Grok y Meta AI) qué saben de una marca, como lo haría un cliente de su país.",
    recibe: ["Cuántas IA conocen la marca y cuántas la nombran", "A quién recomiendan en su lugar", "La respuesta completa de cada IA", "Las palabras calientes que la IA asocia a la marca"],
    faq: FAQ_ECO.map(([p, r]) => ({ p, r })),
  },
  "escucha-digital": {
    titulo: "Escucha digital gratis · Sentinel",
    resumen:
      "Herramienta gratis de Sentinel by Shift. Lee 30 días de conversación pública sobre una marca en redes sociales, medios digitales y blogs de su país.",
    recibe: ["Menciones totales en 30 días", "Tono positivo, neutral y negativo", "Menciones por red social y por medio", "Día pico de la conversación y titulares de prensa", "Palabras calientes de la conversación"],
    faq: FAQ_SENTINEL,
  },
  "escucha-gratis": {
    titulo: "Escucha integral gratis · Eco + Sentinel",
    resumen:
      "Herramienta gratis de Shift LAB que junta las dos escuchas: lo que responden siete inteligencias artificiales sobre una marca y 30 días de redes sociales y medios de su país, con una lectura que cruza las dos.",
    recibe: ["Qué IA conocen y nombran la marca", "Menciones, tono y fuentes de los últimos 30 días", "Lo que la gente dice y la IA todavía no sabe", "Palabras calientes de búsqueda, IA y conversación"],
    faq: FAQ_INTEGRAL,
  },
} as const;
export type PaginaEscucha = keyof typeof ESCUCHAS;

export function escuchaMd(k: PaginaEscucha): string {
  const e = ESCUCHAS[k];
  return `# ${e.titulo}

${e.resumen}

- Página: ${SITE_URL}/shift-lab/${k}
- Enlace con la marca ya puesta: ${SITE_URL}/shift-lab/${k}?marca={marca}&pais={pais}
- Países (pais): ${PAISES_MD}

## Cómo funciona

1. La persona escribe el sitio web de su marca (o el nombre, si no tiene sitio) y elige el país.
2. Deja su correo de trabajo. Los correos personales (Gmail, Hotmail, Outlook) no se aceptan.
3. En pocos minutos recibe por correo un enlace privado al reporte. El enlace vive 30 días.

Es gratis, sin cuenta y sin tarjeta. Al dejar el correo de trabajo, la persona acepta que un especialista de Shift le escriba sobre los resultados.

## Qué recibe

${e.recibe.map((x) => `- ${x}`).join("\n")}

## Preguntas frecuentes

${faqMd(e.faq as Faq)}

---

Shift LAB es la vertical de inteligencia artificial aplicada de Shift Latam: ${SITE_URL}/shift-lab
`;
}

/* ---------- HTML de Directus a Markdown (sin dependencias) ---------- */

const ENT: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " ", "&aacute;": "á", "&eacute;": "é", "&iacute;": "í", "&oacute;": "ó", "&uacute;": "ú", "&ntilde;": "ñ", "&iquest;": "¿", "&iexcl;": "¡", "&laquo;": "«", "&raquo;": "»", "&hellip;": "…" };
const entidades = (s: string) => s.replace(/&[a-z#0-9]+;/gi, (m) => ENT[m] ?? (m.startsWith("&#") ? String.fromCodePoint(parseInt(m.slice(2).replace(/^x/i, "0x"))) : m));

export function htmlAMd(html: string): string {
  let s = html.replace(/\r/g, "");
  s = s.replace(/<(script|style|iframe|svg)[\s\S]*?<\/\1>/gi, "");
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => `\n\n${"#".repeat(Math.max(2, +n))} ${t.trim()}\n\n`);
  s = s.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*>|<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi, (_, a1, s1, s2, a2) => `![${a1 ?? a2 ?? ""}](${s1 ?? s2})`);
  s = s.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, h, t) => `[${t.trim()}](${h.startsWith("/") ? SITE_URL + h : h})`);
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**").replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "*$2*");
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, t) => `\n\n${t.replace(/<[^>]+>/g, "").trim().split("\n").map((l: string) => `> ${l.trim()}`).join("\n")}\n\n`);
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${t.replace(/<\/?p[^>]*>/gi, "").trim()}`);
  s = s.replace(/<\/(ul|ol)>/gi, "\n\n").replace(/<(ul|ol)[^>]*>/gi, "\n");
  s = s.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<p[^>]*>/gi, "");
  s = s.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, (_, t) => `\n| ${t.replace(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi, "$1 | ").replace(/<[^>]+>/g, "").trim()}`);
  s = s.replace(/<hr[^>]*>/gi, "\n\n---\n\n");
  s = s.replace(/<[^>]+>/g, "");
  s = entidades(s);
  return s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export type ArticuloMd = { title: string; slug: string; excerpt: string | null; content: string | null; date_published: string | null; author: string | null };

export function articuloMd(a: ArticuloMd): string {
  const fecha = a.date_published ? a.date_published.slice(0, 10) : "";
  return `# ${a.title}

${[a.author ? `Por ${a.author}` : "", fecha ? `Publicado: ${fecha}` : "", `${SITE_URL}/newsroom/${a.slug}`].filter(Boolean).join(" · ")}

${a.excerpt ? `> ${a.excerpt.replace(/\s+/g, " ").trim()}\n\n` : ""}${htmlAMd(a.content ?? "")}
`;
}
