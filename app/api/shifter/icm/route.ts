import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ICM_DIR = path.join(process.cwd(), "lib", "avatar-factory", "avatars", "shifter");

function isSafeRelativePath(rel: string): boolean {
  if (!rel || typeof rel !== "string") return false;
  // Only allow [a-zA-Z0-9._-/] and must end with .md
  if (!/^[a-zA-Z0-9._/-]+\.md$/.test(rel)) return false;
  const normalized = path.normalize(rel);
  if (normalized.startsWith("..")) return false;
  if (path.isAbsolute(normalized)) return false;
  return true;
}

function htmlToMarkdown(html: string): string {
  // Minimal HTML-to-Markdown for TipTap output
  return (
    html
      // Headings
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n")
      // Bold / italic
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/gi, "_$1_")
      // Links
      .replace(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
      // Lists
      .replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, (m) =>
        m
          .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
          .replace(/<\/?ul[^>]*>/gi, "")
      )
      .replace(/<ol[^>]*>[\s\S]*?<\/ol>/gi, (m) => {
        let i = 1;
        return m
          .replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${i++}. $1\n`)
          .replace(/<\/?ol[^>]*>/gi, "");
      })
      // Paragraphs
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
      // Line breaks
      .replace(/<br\s*\/?>/gi, "\n")
      // Strip remaining tags
      .replace(/<[^>]+>/g, "")
      // Decode common entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim()
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { relativePath, content, contentType } = body;

    if (!isSafeRelativePath(relativePath)) {
      return NextResponse.json({ success: false, error: "Invalid path" }, { status: 400 });
    }

    const fullPath = path.join(ICM_DIR, relativePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    const md = contentType === "html" ? htmlToMarkdown(content || "") : content || "";
    await fs.writeFile(fullPath, md, "utf-8");

    return NextResponse.json({ success: true, relativePath });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Write failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  // Same as POST: overwrite allowed for existing files
  return POST(req);
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const relativePath = searchParams.get("path");

    if (!isSafeRelativePath(relativePath || "")) {
      return NextResponse.json({ success: false, error: "Invalid path" }, { status: 400 });
    }

    const fullPath = path.join(ICM_DIR, relativePath!);
    await fs.unlink(fullPath);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
