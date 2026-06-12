import { execSync } from "child_process";

export interface OpenClawStatus {
  running: boolean;
  model?: string;
  plugins?: string[];
  uptimeSeconds?: number;
  lastLogs: string[];
}

export function getOpenClawStatus(): OpenClawStatus {
  const result: OpenClawStatus = { running: false, lastLogs: [] };
  try {
    const ps = execSync("docker ps --filter name=shifter_openclaw --format '{{.Status}}'", {
      encoding: "utf-8",
    }).trim();
    result.running = ps.includes("Up");
  } catch {
    result.running = false;
  }

  try {
    const logs = execSync("docker logs --tail 20 shifter_openclaw 2>&1", {
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
