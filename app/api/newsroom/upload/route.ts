import { NextRequest, NextResponse } from "next/server";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://2.25.128.2:8055";
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 2MB limit" }, { status: 400 });
    }

    // Forward to Directus
    const directusForm = new FormData();
    directusForm.append("file", file);

    const headers: Record<string, string> = {};
    if (DIRECTUS_TOKEN) {
      headers["Authorization"] = `Bearer ${DIRECTUS_TOKEN}`;
    }

    const res = await fetch(`${DIRECTUS_URL}/files`, {
      method: "POST",
      headers,
      body: directusForm,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.errors?.[0]?.message || "Upload failed" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ id: data.data.id, url: `${DIRECTUS_URL}/assets/${data.data.id}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
