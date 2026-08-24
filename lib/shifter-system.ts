import { execSync } from "child_process";
import { getAgent } from "./avatar-factory/agent-registry";

export interface OpenClawStatus {
  running: boolean;
  model?: string;
  plugins?: string[];
  uptimeSeconds?: number;
  lastLogs: string[];
}

// Solo nombres de container válidos (alfanum + _ -); evita inyección en execSync.
function safeContainer(name: string): string {
  if (!/^[a-zA-Z0-9_.-]+$/.test(name)) throw new Error(`container inválido: ${name}`);
  return name;
}

/** Estado del container OpenClaw de cualquier agente. */
export function getAgentSystemStatus(containerName: string): OpenClawStatus {
  const result: OpenClawStatus = { running: false, lastLogs: [] };
  let c: string;
  try {
    c = safeContainer(containerName);
  } catch {
    return result;
  }
  try {
    const ps = execSync(`docker ps --filter name=${c} --format '{{.Status}}'`, {
      encoding: "utf-8",
    }).trim();
    result.running = ps.includes("Up");
  } catch {
    result.running = false;
  }

  try {
    const logs = execSync(`docker logs --tail 20 ${c} 2>&1`, {
      encoding: "utf-8",
    });
    result.lastLogs = logs
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .slice(-10);

    const modelLine = result.lastLogs.find((l) => l.includes("agent model:"));
    if (modelLine) {
      const m = modelLine.match(/agent model:\s*(.+?)\s*\(/);
      if (m) result.model = m[1].trim();
    }

    const pluginsLine = result.lastLogs.find((l) => l.includes("plugins:"));
    if (pluginsLine) {
      const m = pluginsLine.match(/plugins:\s*(.+?);/);
      if (m) {
        result.plugins = m[1].split(",").map((p) => p.trim());
      }
    }
  } catch {
    // ignore
  }

  return result;
}

/** Shim de compatibilidad: el container de Shifter. */
export function getOpenClawStatus(): OpenClawStatus {
  const shifter = getAgent("shifter")!;
  return getAgentSystemStatus(shifter.containerName);
}
