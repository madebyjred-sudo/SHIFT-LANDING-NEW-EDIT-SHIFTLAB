import { NextRequest, NextResponse } from "next/server";
import { getDirectusToken } from "@/lib/directus-auth";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://2.25.128.2:8055";

async function getHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  const token = await getDirectusToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 2MB limit" }, { status: 400 });
    }

    const directusForm = new FormData();
    directusForm.append("file", file);

    const res = await fetch(`${DIRECTUS_URL}/files`, {
      method: "POST",
      headers: await getHeaders(),
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
