import { ZepClient } from "@getzep/zep-js"; // Requiere: npm install @getzep/zep-js

/**
 * Cliente de Integración de Memoria Temporal (Zep Graphiti) para Vector
 * 
 * Este cliente maneja la "personalidad evolutiva" del avatar. En lugar de
 * un prompt estático, el avatar extrae sus creencias, intereses y lecciones
 * de cada columna que publica y las inyecta en el Grafo de Conocimiento Temporal.
 */

// Zep connection settings (to be configured in .env.local)
const ZEP_API_URL = process.env.ZEP_API_URL || "http://localhost:8000";
const ZEP_API_KEY = process.env.ZEP_API_KEY || "zep-api-key-here";
const AVATAR_USER_ID = "avatar_vector_001"; // El ID persistente del avatar en Zep

// Inicializar el cliente (Lazy init)
let client: ZepClient | null = null;
const getClient = async () => {
  if (!client) {
    client = await ZepClient.init(ZEP_API_URL, ZEP_API_KEY);
  }
  return client;
};

export interface PersonalityEvolution {
  emergingInterests: string[];
  strengthenedBeliefs: { topic: string; belief: string; confidenceLevel: "low" | "medium" | "high" }[];
  fadingInterests: string[];
}

/**
 * Stage 00 (Meta-Reflection): Recupera la "psique" actual del avatar
 * para guiar su investigación del día.
 */
export async function getVectorCurrentPsyche(): Promise<string> {
  // En un entorno real de Zep, hacemos un Graph Search o un Memory Retrieval
  // para extraer las creencias fuertes y los intereses actuales de Vector.
  const zep = await getClient();
  
  try {
    // Ejemplo: buscar las memorias asociadas al avatar
    const memory = await zep.memory.get(AVATAR_USER_ID);
    
    // Aquí procesaríamos el Grafo Temporal (Graphiti) de Zep para devolver
    // un resumen legible por Claude Opus.
    return `
      [Zep Temporal Graph Summary]
      - Intereses Activos: Inteligencia Artificial B2B (Alta Confianza), 
        Colapso del SEO tradicional (Alta Confianza), Inversión en startups Andinas (Media Confianza).
      - Última obsesión: Evolución de las APIs de modelos de lenguaje.
      - Tono sugerido para hoy: Asertivo y crudo en temas B2B y SEO; Exploratorio en startups Andinas.
    `;
  } catch (error) {
    console.error("Error conectando a Zep:", error);
    return "Error: No se pudo cargar la psique. Asume modo Clean Slate (Imparcial).";
  }
}

/**
 * Stage 05 (Internalize): Después de publicar, el avatar evalúa qué 
 * aprendió y actualiza su grafo temporal en Zep.
 */
export async function internalizeLearnings(articleText: string, learnings: PersonalityEvolution) {
  const zep = await getClient();

  // Convertimos las lecciones extraídas en "hechos" para añadir a Zep
  let contextStr = "En su última columna, el avatar consolidó las siguientes posturas:\n";
  learnings.strengthenedBeliefs.forEach(b => {
    contextStr += `- Sobre ${b.topic}: CREE que ${b.belief} (Confianza: ${b.confidenceLevel})\n`;
  });
  contextStr += "Intereses emergentes: " + learnings.emergingInterests.join(", ");

  try {
    // Inyectamos esto como una memoria en la sesión/usuario del avatar.
    // Zep (con Graphiti) automáticamente procesará este texto y extraerá los Nodos
    // y Relaciones (Ej: [Vector] --CREE_QUE--> [El SEO está colapsando]).
    await zep.memory.addMemory(AVATAR_USER_ID, {
      messages: [
        { role: "system", content: contextStr }
      ]
    });
    console.log("Memoria internalizada en Zep correctamente.");
  } catch (error) {
    console.error("Error guardando en Zep:", error);
  }
}
