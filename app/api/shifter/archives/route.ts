// ----------------------------------------------------------------------
// /api/shifter/archives — file tree REAL del agente + lectura de archivo
// ----------------------------------------------------------------------
// Sin ?file → devuelve el árbol de carpetas relevantes (memory + los
// outputs de research). Con ?file=<relpath> → devuelve el contenido de
// ese archivo (sandboxed: solo dentro del agent dir, solo texto).

import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AGENT_DIR = path.join(
  process.cwd(),
  "lib/avatar-factory/avatars/shifter",
);

// Carpetas que exponemos en el cockpit (no exponemos .git, .openclaw,
// articles-seen.db binario, etc.)
const FOLDERS = [
  { id: "memory", label: "01_Memory", dir: "memory", exts: [".md", ".json"] },
  {
    id: "research",
    label: "02_Research",
    dir: "stages/01_research/output",
    exts: [".md"],
  },
  {
    id: "deepdives",
    label: "03_Deepdives",
    dir: "stages/01_research/output/deepdives",
    exts: [".md"],
  },
  { id: "runs", label: "04_Runs", dir: "runs", exts: [".md"] },
];

type FileEntry = { name: string; relPath: string; size: number; mtime: string };

function listDir(rel: string, exts: string[]): FileEntry[] {
  const abs = path.join(AGENT_DIR, rel);
  try {
    return fs
      .readdirSync(abs)
      .filter((f) => exts.some((e) => f.endsWith(e)))
      .map((f) => {
        const st = fs.statSync(path.join(abs, f));
        return {
          name: f,
          relPath: path.join(rel, f),
          size: st.size,
          mtime: st.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.mtime.localeCompare(a.mtime));
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");

  // ── Lectura de un archivo específico (sandboxed) ──
  if (file) {
    // Resolver y verificar que queda DENTRO del agent dir (anti path-traversal)
    const abs = path.resolve(AGENT_DIR, file);
    if (!abs.startsWith(AGENT_DIR + path.sep)) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    // Solo extensiones de texto
    if (!/\.(md|json|txt)$/.test(abs)) {
      return NextResponse.json({ ok: false, error: "unsupported" }, { status: 400 });
    }
    try {
      const content = fs.readFileSync(abs, "utf-8").slice(0, 200_000);
      return NextResponse.json({ ok: true, file, content });
    } catch {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    }
  }

  // ── Árbol de carpetas ──
  const folders = FOLDERS.map((f) => ({
    id: f.id,
    label: f.label,
    files: listDir(f.dir, f.exts),
  }));
  const live = folders.some((f) => f.files.length > 0);
  return NextResponse.json({ live, folders });
}
