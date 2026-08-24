// /api/agents/[agentId]/icm — leer/escribir archivos del ICM de un agente.
// Igual que /api/shifter/icm pero anclado al avatarDir del descriptor +
// doble verificación de que el path resuelto queda DENTRO del avatarDir.

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getAgent } from "@/lib/avatar-factory/agent-registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isSafeRelativePath(rel: string): boolean {
  if (!rel || typeof rel !== "string") return false;
  if (!/^[a-zA-Z0-9._/-]+\.md$/.test(rel)) return false;
  const normalized = path.normalize(rel);
  if (normalized.startsWith("..")) return false;
  if (path.isAbsolute(normalized)) return false;
  return true;
}

/** Resuelve rel dentro de avatarDir o null si escapa. */
function safeJoin(avatarDir: string, rel: string): string | null {
  if (!isSafeRelativePath(rel)) return null;
  const full = path.resolve(avatarDir, rel);
  if (full !== path.normalize(full) || !full.startsWith(avatarDir + path.sep)) return null;
  return full;
}

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "_$1_")
    .replace(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, (m) =>
      m.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n").replace(/<\/?ul[^>]*>/gi, ""),
    )
    .replace(/<ol[^>]*>[\s\S]*?<\/ol>/gi, (m) => {
      let i = 1;
      return m.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${i++}. $1\n`).replace(/<\/?ol[^>]*>/gi, "");
    })
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const agent = getAgent(agentId);
  if (!agent) {
    return NextResponse.json({ success: false, error: `Agente desconocido: ${agentId}` }, { status: 404 });
  }
  try {
    const { relativePath, content, contentType } = await req.json();
    const fullPath = safeJoin(agent.avatarDir, relativePath);
    if (!fullPath) {
      return NextResponse.json({ success: false, error: "Invalid path" }, { status: 400 });
    }
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    const md = contentType === "html" ? htmlToMarkdown(content || "") : content || "";
    await fs.writeFile(fullPath, md, "utf-8");
    return NextResponse.json({ success: true, relativePath });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Write failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ agentId: string }> },
) {
  return POST(req, ctx);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const agent = getAgent(agentId);
  if (!agent) {
    return NextResponse.json({ success: false, error: `Agente desconocido: ${agentId}` }, { status: 404 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const fullPath = safeJoin(agent.avatarDir, searchParams.get("path") || "");
    if (!fullPath) {
      return NextResponse.json({ success: false, error: "Invalid path" }, { status: 400 });
    }
    await fs.unlink(fullPath);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
