import fs from 'fs';
import path from 'path';

/**
 * Avatar Factory ICM Orchestrator
 * 
 * Este script es el "corazón" que mueve la ejecución a través de las 5 carpetas
 * del sistema ICM para un avatar específico.
 */

const AVATAR_NAME = process.argv[2] || "vector";
const BASE_DIR = path.join(process.cwd(), "lib", "avatar-factory", "avatars", AVATAR_NAME);

async function runStage(stageName: string) {
  console.log(`\n▶ Iniciando Stage: ${stageName}`);
  const stageDir = path.join(BASE_DIR, "stages", stageName);
  const contextFile = path.join(stageDir, "CONTEXT.md");
  
  if (!fs.existsSync(contextFile)) {
    console.warn(`⚠️ No se encontró CONTEXT.md en ${stageDir}. Creando dummy para la estructura...`);
    fs.writeFileSync(contextFile, `# Stage ${stageName}\n\n## Inputs\n\n## Process\n\n## Outputs\n`);
  }

  // Aquí integraríamos con Cerebro Gateway / Claude Opus
  // 1. Lee el CLAUDE.md (Layer 0)
  // 2. Lee el CONTEXT.md (Layer 2)
  // 3. Pasa los archivos por la API de Anthropic.
  // 4. Guarda la respuesta en la carpeta /output/ del stage.
  
  console.log(`✅ Stage ${stageName} completado.`);
}

async function main() {
  console.log(`Iniciando pipeline de ejecución para avatar: ${AVATAR_NAME}`);
  
  try {
    await runStage("00_reflection");
    await runStage("01_research");
    await runStage("02_write");
    await runStage("03_verify");
    
    console.log("\n⏸ Pipeline pausado. El borrador está en la bandeja de aprobación (04_review).");
    console.log("Esperando intervención humana en la UI web...");
    
    // El stage 05_internalize solo corre cuando se dispara el webhook desde la UI.
  } catch (error) {
    console.error("Error en el pipeline:", error);
  }
}

main();
