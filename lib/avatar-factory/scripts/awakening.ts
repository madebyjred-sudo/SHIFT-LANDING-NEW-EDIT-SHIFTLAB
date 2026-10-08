import fs from 'fs';
import path from 'path';
import { checkBudget, registerCost, calculatePerplexityCost } from './budget';

/**
 * Secuencia de Despertar (Awakening) de un avatar.
 *
 * El avatar "nace" corriendo un catch-up de investigación (Perplexity Sonar
 * vía el gateway Cerebro) y persistiendo ese primer recuerdo en su memoria
 * file-based versionada (`memory/00-birth-catchup.md`).
 *
 * Zep fue jubilado: la memoria ya no se inyecta en un grafo externo, vive
 * como archivos auditables igual que el resto de la mente del avatar.
 *
 * Uso:  ts-node awakening.ts <avatar>   (default: shifter)
 */

// Llave del gateway Cerebro (OpenAI-compatible) — SIEMPRE desde el entorno,
// nunca hardcodeada. En el VPS la setea PM2 (CEREBRO_API_KEY).
const CEREBRO_API_KEY = process.env.CEREBRO_API_KEY || process.env.OPENROUTER_API_KEY || "";
const CEREBRO_URL = process.env.CEREBRO_URL || "https://shift-cerebro-production.up.railway.app/v1/chat/completions";

const AVATAR_NAME = process.argv[2] || "shifter";
const BASE_DIR = path.join(process.cwd(), "lib", "avatar-factory", "avatars", AVATAR_NAME);

async function runCatchup() {
  if (!checkBudget()) return;
  if (!CEREBRO_API_KEY) {
    console.error("[AWAKENING] Falta CEREBRO_API_KEY en el entorno. Abortando despertar.");
    return;
  }

  const prompt = `Acabo de nacer como agente editorial autónomo especializado en RRPP, Marketing y Tecnología en Latam (mi nombre es ${AVATAR_NAME}).
Necesito un "Catch-up 2026". Busca en la web y preséntame un resumen crudo y analítico de los hitos más críticos de la industria en lo que va de 2026.
Enfócate en la intersección de Inteligencia Artificial, agencias de publicidad, colapso del SEO tradicional y regulaciones tecnológicas (ej. EU AI Act). Sé directo.`;

  console.log(`[PERPLEXITY] Corriendo catch-up de nacimiento para ${AVATAR_NAME}...`);

  try {
    const res = await fetch(CEREBRO_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CEREBRO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "perplexity/sonar",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json() as any;

    if (data.choices && data.choices[0]) {
      const resultText = data.choices[0].message.content;
      console.log(`[PERPLEXITY] Investigación completa. Persistiendo en memoria file-based...`);

      const usage = data.usage || { prompt_tokens: 100, completion_tokens: 500 };
      const cost = calculatePerplexityCost(usage.prompt_tokens, usage.completion_tokens);
      registerCost("perplexity/sonar", cost, "Catch-up de nacimiento");

      // Persistir el "nacimiento" en la memoria file-based del avatar
      // (antes esto iba a Zep — ahora vive como archivo auditable).
      const memDir = path.join(BASE_DIR, "memory");
      fs.mkdirSync(memDir, { recursive: true });
      const memoryText = `# Momento de nacimiento — ${AVATAR_NAME}\n\n` +
        `Encendido/a. Estado inicial: agente analítico y crudo, pizarra en blanco.\n\n` +
        `## Resumen de investigación (catch-up de nacimiento)\n\n${resultText}\n`;
      fs.writeFileSync(path.join(memDir, "00-birth-catchup.md"), memoryText);

      console.log(`=== ${AVATAR_NAME.toUpperCase()} HA DESPERTADO (memoria → ${path.join(memDir, "00-birth-catchup.md")}) ===`);
    } else {
      console.error("[PERPLEXITY] Formato de respuesta inesperado:", JSON.stringify(data));
    }
  } catch (error) {
    console.error("[PERPLEXITY] Error llamando a la API:", error);
  }
}

async function main() {
  console.log(`Iniciando secuencia de Despertar para ${AVATAR_NAME}...`);
  await runCatchup();
}

main();
