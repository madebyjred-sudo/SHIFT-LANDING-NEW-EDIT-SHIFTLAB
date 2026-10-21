import type { Metadata } from "next";
import AjustesMovil from "@/components/escucha/AjustesMovil";
import { createPageMetadata } from "@/app/seo";
import { schemaHerramienta } from "@/lib/escucha/seo";
import { FAQ_ECO } from "@/lib/escucha/faq";
import EcoEscucha from "./_/EcoEscucha";

/* Herramienta gratis de Eco: qué responden siete IA sobre tu marca.
 * Tema claro a propósito, con los tokens de Eco. La lógica vive en lib/escucha. */

const TITULO = "Qué dice la IA de tu marca · escucha gratis de Eco";
const DESCRIPCION =
  "Pregunta gratis a siete inteligencias artificiales por tu marca: cuántas te conocen, qué dicen, a quién recomiendan en tu lugar y en qué datos se equivocan. Sin cuenta, en menos de un minuto.";

export const metadata: Metadata = createPageMetadata({ markdown: true,
  pathname: "/shift-lab/escucha-ia",
  title: "Escucha gratis en IA · Eco by Shift LAB",
  description: DESCRIPCION,
  keywords: ["qué dice ChatGPT de mi marca", "visibilidad en IA", "AI search grader", "GEO", "marca en inteligencia artificial", "eco shift lab"],
});

export default function EscuchaIAPage() {
  const schema = schemaHerramienta({ ruta: "/shift-lab/escucha-ia", titulo: TITULO, descripcion: DESCRIPCION, nombreApp: "Escucha gratis en IA · Eco", faq: FAQ_ECO, funciones: ["Pregunta a siete IA por tu marca: ChatGPT, Claude, Gemini, Perplexity, DeepSeek, Grok y Meta AI","Cuántas IA conocen tu marca y cuántas la nombran","A quién recomiendan en tu lugar","Respuesta completa de cada IA","Dossier de Eco personalizado"] });
  return (
    <>
      <AjustesMovil />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EcoEscucha />
    </>
  );
}
