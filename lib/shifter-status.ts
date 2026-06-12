import { promises as fs } from "fs";
import path from "path";

const MEMORY_DIR = path.join(
  process.cwd(),
  "lib",
  "avatar-factory",
  "avatars",
  "shifter",
  "memory"
);

export interface ScanStatus {
  lastScanAt: string | null;
  newArticles: number;
  deepDives: number;
  lastResearchLog: string | null;
}

export interface TrendItem {
  name: string;
  description: string;
  articleCount: number;
  status: string;
}

export interface ColumnCandidate {
  title: string;
  tension: string;
  status: string;
  generatedAt: string;
}

export interface ShifterStatus {
  scan: ScanStatus;
  trends: TrendItem[];
  columns: ColumnCandidate[];
  costToday: number;
}

export async function getShifterStatus(): Promise<ShifterStatus> {
  const [scan, trends, columns, costToday] = await Promise.all([
    readScanStatus(),
    readTrends(),
    readColumnCandidates(),
    readCostToday(),
  ]);

  return { scan, trends, columns, costToday };
}

async function readScanStatus(): Promise<ScanStatus> {
  try {
    const raw = await fs.readFile(
      path.join(MEMORY_DIR, "heartbeat-state.json"),
      "utf-8"
    );
    const data = JSON.parse(raw);
    const ts = data.lastChecks?.sourceScan;
    return {
      lastScanAt: ts ? new Date(ts * 1000).toISOString() : null,
      newArticles: data.lastScanStats?.newArticles ?? 0,
      deepDives: data.lastScanStats?.deepDives ?? 0,
      lastResearchLog: data.lastResearchLog ?? null,
    };
  } catch {
    return {
      lastScanAt: null,
      newArticles: 0,
      deepDives: 0,
      lastResearchLog: null,
    };
  }
}

async function readTrends(): Promise<TrendItem[]> {
  // Trends are embedded in the learning-loop.md and entity-graph.md
  // For now, extract from the latest think file or learning-loop
  try {
    const raw = await fs.readFile(
      path.join(MEMORY_DIR, "learning-loop.md"),
      "utf-8"
    );
    // Extract insight blocks that look like trends
    const trends: TrendItem[] = [];
    const lines = raw.split("\n");
    let currentInsight = "";
    for (const line of lines) {
      if (line.startsWith("- ") || line.startsWith("* ")) {
        currentInsight = line.replace(/^[-*]\s+/, "").trim();
        if (currentInsight.length > 10) {
          trends.push({
            name: currentInsight.slice(0, 60),
            description: currentInsight,
            articleCount: 0,
            status: "emerging",
          });
        }
      }
    }
    return trends.slice(0, 5);
  } catch {
    return [];
  }
}

async function readColumnCandidates(): Promise<ColumnCandidate[]> {
  try {
    const raw = await fs.readFile(
      path.join(MEMORY_DIR, "column-candidates.md"),
      "utf-8"
    );
    const blocks = raw.split(/^## /m).filter((b) => b.trim());
    const columns: ColumnCandidate[] = [];

    for (const block of blocks) {
      const lines = block.split("\n").filter((l) => l.trim());
      if (lines.length === 0) continue;

      const titleLine = lines.find((l) =>
        l.startsWith("## ") || l.startsWith("# ")
      );
      const title = titleLine
        ? titleLine.replace(/^#+\s+/, "").trim()
        : lines[0].trim();

      const tensionMatch = block.match(/\*\*Tension:\*\*\s*(.+)/);
      const statusMatch = block.match(/\*\*Status:\*\*\s*(.+)/);
      const dateMatch = block.match(/## Auto-generated — (\d{4}-\d{2}-\d{2})/);

      columns.push({
        title: title.slice(0, 80),
        tension: tensionMatch?.[1]?.trim() || "",
        status: statusMatch?.[1]?.trim() || "draft",
        generatedAt: dateMatch?.[1] || "",
      });
    }

    return columns.slice(0, 4);
  } catch {
    return [];
  }
}

async function readCostToday(): Promise<number> {
  try {
    const raw = await fs.readFile(
      path.join(MEMORY_DIR, "cost-log.jsonl"),
      "utf-8"
    );
    const today = new Date().toISOString().slice(0, 10);
    let total = 0;
    for (const line of raw.trim().split("\n")) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        if (entry.timestamp?.startsWith(today)) {
          total += entry.cost_usd || 0;
        }
      } catch {
        // skip malformed
      }
    }
    return total;
  } catch {
    return 0;
  }
}
