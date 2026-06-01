import { NextRequest, NextResponse } from "next/server";
import { getAuthorByUserId, isAdmin } from "@/lib/auth";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://2.25.128.2:8055";
const DIRECTUS_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

function getHeaders() {
  const headers: Record<string, string> = {};
  if (DIRECTUS_TOKEN) {
    headers["Authorization"] = `Bearer ${DIRECTUS_TOKEN}`;
  }
  return headers;
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

    // Build query: admin sees all, author sees only theirs
    let queryUrl = `${DIRECTUS_URL}/items/news_articles?fields=*,category.name&sort=-date_created`;
    if (!admin && author) {
      queryUrl += `&filter[author_id][_eq]=${author.id}`;
    }

    const articlesRes = await fetch(queryUrl, { headers: getHeaders() });
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
    } = body;

    if (!title || !slug || !excerpt || !content || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!cover_image) {
      return NextResponse.json({ error: "Cover image is required" }, { status: 400 });
    }

    // Find author by user_id
    const uid = user_id || request.headers.get("x-user-id");
    let authorId = "1";

    if (uid) {
      const authorRes = await fetch(
        `${DIRECTUS_URL}/items/authors?filter[user_id][_eq]=${uid}&limit=1`,
        { headers: getHeaders() }
      );
      const authorData = await authorRes.json().catch(() => ({ data: [] }));
      if (authorData.data?.[0]?.id) {
        authorId = authorData.data[0].id;
      }
    }

    // Resolve category slug to ID
    let categoryId = category;
    const catRes = await fetch(
      `${DIRECTUS_URL}/items/news_categories?filter[slug][_eq]=${category}&limit=1`,
      { headers: getHeaders() }
    );
    const catData = await catRes.json().catch(() => ({ data: [] }));
    if (catData.data?.[0]?.id) {
      categoryId = catData.data[0].id;
    }

    const articlePayload = {
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
        ...getHeaders(),
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
