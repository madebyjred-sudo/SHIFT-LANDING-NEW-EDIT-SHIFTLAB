import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import GuiaCine from "./GuiaCine";
import AjustesMovil from "@/components/escucha/AjustesMovil";
import { ECO_REAL, FECHA_DATOS } from "@/lib/escucha/datos-reales";
import { createPageMetadata, absoluteUrl } from "@/app/seo";

/* Guía Shift LAB de visibilidad de marca en IA (AEO/GEO) y escucha digital.
 * Contenido en content/guia-ia.md; se renderiza en el servidor (indexable). */

const RUTA = "/shift-lab/guia-ia";
const TITULO = "Guía de visibilidad de marca en IA (AEO y GEO) · Shift LAB";
const DESCRIPCION = "Cómo medir y mejorar lo que ChatGPT, Gemini, Claude, Perplexity y otras IA dicen de tu marca: preguntas, palabras calientes, auditoría, estrategia y programa. Con datos de Eco en América Latina.";

export const metadata: Metadata = createPageMetadata({ markdown: true, pathname: RUTA, title: TITULO, description: DESCRIPCION, keywords: ["AEO", "GEO", "visibilidad en IA", "palabras calientes", "qué dice ChatGPT de mi marca", "guía AEO en español"] });

export default async function GuiaPage() {
  const md = await readFile(path.join(process.cwd(), "content", "guia-ia.md"), "utf8");
  const titulo = md.match(/^# (.+)$/m)?.[1] ?? TITULO;
  const partes = md.split(/^## /m);
  const cabeza = partes[0].replace(/^# .+$/m, "").trim();
  const [bajada, ...resto] = cabeza.split(/\n\s*\n/);
  const capitulos = partes.slice(1).map((b) => {
    const nl = b.indexOf("\n");
    return { titulo: b.slice(0, nl).trim(), cuerpo: b.slice(nl + 1).trim() };
  });
  const pct = (a: number, b: number) => Math.round((a / b) * 1000) / 10;
  const cifras = [
    { v: pct(ECO_REAL.conError, ECO_REAL.respuestasTotales), d: 1, pie: "de las respuestas de IA que medimos trae al menos un dato equivocado de la marca." },
    { v: pct(ECO_REAL.noNombradaConCompetidor, ECO_REAL.noNombrada), d: 1, pie: "de las respuestas que no nombran a la marca recomiendan a un competidor." },
    { v: pct(ECO_REAL.citada, ECO_REAL.respuestas), d: 1, pie: `de las respuestas enlaza al sitio de la marca. Medido por Eco, ${FECHA_DATOS}.` },
  ];
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITULO,
    description: DESCRIPCION,
    inLanguage: "es",
    url: absoluteUrl(RUTA),
    author: { "@type": "Organization", name: "Shift LAB · Shift LATAM" },
    publisher: { "@type": "Organization", name: "Shift LATAM" },
    datePublished: "2026-10-21",
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <AjustesMovil />
      <GuiaCine titulo={titulo} bajada={bajada} intro={resto.join("\n\n")} capitulos={capitulos} cifras={cifras} />
    </>
  );
}
