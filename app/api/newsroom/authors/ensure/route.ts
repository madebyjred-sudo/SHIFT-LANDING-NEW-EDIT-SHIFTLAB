import { NextRequest, NextResponse } from "next/server";
import { getDirectusToken } from "@/lib/directus-auth";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://2.25.128.2:8055";

async function getHeaders() {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = await getDirectusToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, name, email } = body;

    if (!user_id || !name) {
      return NextResponse.json({ error: "Missing user_id or name" }, { status: 400 });
    }

    const existingRes = await fetch(
      `${DIRECTUS_URL}/items/authors?filter[user_id][_eq]=${user_id}&limit=1&fields=id,name,slug,user_id,role,bio,avatar`,
      { headers: await getHeaders() }
    );
    const existing = await existingRes.json().catch(() => ({ data: [] }));

    if (existing.data?.length > 0) {
      return NextResponse.json({ author: existing.data[0], created: false });
    }

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const createRes = await fetch(`${DIRECTUS_URL}/items/authors`, {
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify({
        name,
        slug,
        user_id,
        bio: `Autor del Newsroom de Shift Latam.`,
        role: "author",
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.errors?.[0]?.message || "Failed to create author" },
        { status: createRes.status }
      );
    }

    const data = await createRes.json();
    return NextResponse.json({ author: data.data, created: true });
  } catch (error) {
    console.error("Ensure author error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
