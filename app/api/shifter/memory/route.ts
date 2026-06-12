import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { promisify } from "util";
import { exec as execCallback } from "child_process";

const exec = promisify(execCallback);
const MEMORY_MANAGER = "/var/www/shiftlatam-web/scripts/shifter-memory-manager.py";

function runManager(args: string[], stdin?: string): any {
  const cmd = `python3 "${MEMORY_MANAGER}" ${args.join(" ")}`;
  const result = execSync(cmd, {
    input: stdin,
    encoding: "utf-8",
    timeout: 30000,
  });
  return JSON.parse(result);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "insights";
    const status = searchParams.get("status") || undefined;
    const q = searchParams.get("q") || undefined;
    const entity = searchParams.get("entity") || undefined;

    switch (type) {
      case "insights": {
        let args = ["get-insights"];
        if (status) args.push(status);
        const data = runManager(args);
        return NextResponse.json({ success: true, data });
      }
      case "entities": {
        const data = runManager(["get-entities"]);
        return NextResponse.json({ success: true, data });
      }
      case "relationships": {
        const args = entity ? ["get-relationships", entity] : ["get-relationships"];
        const data = runManager(args);
        return NextResponse.json({ success: true, data });
      }
      case "columns": {
        const data = runManager(["get-columns"]);
        return NextResponse.json({ success: true, data });
      }
      default:
        return NextResponse.json({ success: false, error: "Unknown type" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, id, data } = body;

    // For now, only update status/confidence via direct SQLite
    // We'll use python inline for updates
    const dbPath = "/var/www/shiftlatam-web/lib/avatar-factory/avatars/shifter/memory/articles-seen.db";
    const setClause: string[] = [];
    const values: any[] = [];

    if (data.status) {
      setClause.push("status = ?");
      values.push(data.status);
    }
    if (data.confidence) {
      setClause.push("confidence = ?");
      values.push(data.confidence);
    }
    if (data.body) {
      setClause.push("body = ?");
      values.push(data.body);
    }
    if (data.title) {
      setClause.push("title = ?");
      values.push(data.title);
    }
    if (setClause.length === 0) {
      return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
    }

    let table = "";
    if (type === "insight") table = "insights";
    else if (type === "column") table = "columns";
    else if (type === "entity") table = "entities";
    else return NextResponse.json({ success: false, error: "Unknown type" }, { status: 400 });

    values.push(id);
    const sql = `UPDATE ${table} SET ${setClause.join(", ")}, last_updated = datetime('now') WHERE id = ?`;

    const pyScript = `
import sqlite3
conn = sqlite3.connect('${dbPath}')
cur = conn.cursor()
cur.execute('''${sql}''', ${JSON.stringify(values)})
conn.commit()
conn.close()
print('ok')
`;

    await exec(`python3 -c '${pyScript}'`);

    // Re-export .md
    runManager(["export"]);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
