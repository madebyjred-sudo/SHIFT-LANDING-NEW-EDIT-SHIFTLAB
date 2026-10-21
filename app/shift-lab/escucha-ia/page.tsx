import type { Metadata } from "next";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";
import EcoEscucha from "./_/EcoEscucha";

/* Herramienta gratis de Eco: qué responden siete IA sobre tu marca.
 * Tema claro a propósito, con los tokens de Eco. La lógica vive en lib/escucha. */

const TITULO = "Qué dice la IA de tu marca · escucha gratis de Eco";
const DESCRIPCION =
  "Pregunta gratis a siete inteligencias artificiales por tu marca: cuántas te conocen, qué dicen, a quién recomiendan en tu lugar y en qué datos se equivocan. Sin cuenta, en menos de un minuto.";

export const metadata: Metadata = createPageMetadata({
  pathname: "/shift-lab/escucha-ia",
  title: "Escucha gratis en IA · Eco by Shift LAB",
  description: DESCRIPCION,
  keywords: ["qué dice ChatGPT de mi marca", "visibilidad en IA", "AI search grader", "GEO", "marca en inteligencia artificial", "eco shift lab"],
});

export default function EscuchaIAPage() {
  const schema = createWebPageSchema({ pathname: "/shift-lab/escucha-ia", title: TITULO, description: DESCRIPCION });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <EcoEscucha />
    </>
  );
}
