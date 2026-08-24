import { NextRequest, NextResponse } from "next/server";
import { getAuthorByUserId, isAdmin } from "@/lib/auth";
import { randomUUID } from "crypto";
import { getDirectusToken } from "@/lib/directus-auth";


const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://2.25.128.2:8055";

async function getHeaders() {
  const headers: Record<string, string> = {};
  const token = await getDirectusToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Resuelve el author_id para un usuario de Supabase. Si todavía no existe
 * un registro de autor, lo crea acá mismo (igual que /authors/ensure) para
 * que el artículo NUNCA quede huérfano bajo un id por defecto y, por lo
 * tanto, invisible en la lista filtrada del escritorio.
 */
async function resolveOrCreateAuthorId(
  uid: string,
  name?: string,
  email?: string
): Promise<string | null> {
  const existingRes = await fetch(
    `${DIRECTUS_URL}/items/authors?filter[user_id][_eq]=${uid}&limit=1&fields=id`,
    { headers: await getHeaders() }
  );
  const existing = await existingRes.json().catch(() => ({ data: [] }));
  if (existing.data?.[0]?.id) return String(existing.data[0].id);

  const authorName = name || email?.split("@")[0] || "Autor";
  const slug = authorName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const createRes = await fetch(`${DIRECTUS_URL}/items/authors`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await getHeaders()) },
    body: JSON.stringify({
      name: authorName,
      slug,
      user_id: uid,
      bio: "Autor del Newsroom de Shift Latam.",
      role: "author",
    }),
  });
  if (!createRes.ok) return null;
  const created = await createRes.json().catch(() => ({}));
  return created.data?.id ? String(created.data.id) : null;
}

/* ── GET: List articles ── */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const author = await getAuthorByUserId(userId);
    const admin = author ? isAdmin(author.role) : false;

    let queryUrl = `${DIRECTUS_URL}/items/news_articles?fields=*,category.name&sort=-date_created`;
    if (!admin && author) {
      queryUrl += `&filter[author_id][_eq]=${author.id}`;
    }

    const articlesRes = await fetch(queryUrl, { headers: await getHeaders() });
    const articlesData = await articlesRes.json().catch(() => ({ data: [] }));
    return NextResponse.json({ articles: articlesData.data || [] });
  } catch (error) {
    console.error("GET articles error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ── POST: Create article ── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      layout_preset,
      cover_image,
      gallery_images,
      status,
      user_id,
      author_name,
      author_email,
    } = body;

    if (!title || !slug || !excerpt || !content || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!cover_image) {
      return NextResponse.json({ error: "Cover image is required" }, { status: 400 });
    }

    const uid = user_id || request.headers.get("x-user-id");
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolver (o crear) el autor real. Nunca caer a un id por defecto:
    // eso dejaba el artículo huérfano e invisible en el escritorio.
    const authorId = await resolveOrCreateAuthorId(uid, author_name, author_email);
    if (!authorId) {
      return NextResponse.json(
        { error: "No se pudo resolver el autor para este usuario. Recargá e intentá de nuevo." },
        { status: 422 }
      );
    }

    let categoryId = category;
    const catRes = await fetch(
      `${DIRECTUS_URL}/items/news_categories?filter[slug][_eq]=${category}&limit=1`,
      { headers: await getHeaders() }
    );
    const catData = await catRes.json().catch(() => ({ data: [] }));
    if (catData.data?.[0]?.id) {
      categoryId = catData.data[0].id;
    }

    const articlePayload = {
      id: randomUUID(),
      title,
      slug,
      excerpt,
      content,
      category: categoryId,
      layout_preset: layout_preset || "classic",
      cover_image,
      gallery_images: gallery_images?.map((id: string) => ({ image_id: id })) || [],
      status: status || "draft",
      author_id: authorId,
      date_published: status === "published" ? new Date().toISOString() : null,
    };

    const res = await fetch(`${DIRECTUS_URL}/items/news_articles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getHeaders()),
      },
      body: JSON.stringify(articlePayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.errors?.[0]?.message || "Failed to create article" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ article: data.data }, { status: 201 });
  } catch (error) {
    console.error("POST article error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
