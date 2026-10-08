import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/seo";

/**
 * robots.txt
 *
 * El comodín `*` ya permitía todo, así que nombrar a los agentes de IA no
 * "desbloquea" nada. Se hace por dos razones concretas:
 *
 *  1. `Google-Extended` y `Applebot-Extended` NO son rastreadores: son señales
 *     de consentimiento para uso en IA. Si no se nombran, quedan a merced del
 *     default del operador. Nombrarlas y permitirlas es una decisión explícita.
 *  2. Un `Allow` con nombre propio es la única declaración legible por máquina
 *     de que el contenido es citable. Cuesta cero y elimina la ambigüedad.
 *
 * Medido el 17-ago-2026 sobre los logs: OAI-SearchBot pidió `/robots.txt` 434
 * veces y ninguna otra URL. Este archivo es, literalmente, lo único que ese
 * agente ha leído del sitio.
 */
const AGENTES_IA = [
  "GPTBot", // OpenAI · entrenamiento
  "OAI-SearchBot", // OpenAI · el que alimenta las respuestas de ChatGPT
  "ChatGPT-User", // OpenAI · fetch en vivo cuando alguien pregunta
  "ClaudeBot", // Anthropic
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot", // Perplexity · índice
  "Perplexity-User", // Perplexity · fetch en vivo
  "Google-Extended", // señal de consentimiento, no rastreador
  "Applebot-Extended", // idem
  "Amazonbot",
  "meta-externalagent",
  "cohere-ai",
  "DuckAssistBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AGENTES_IA.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
