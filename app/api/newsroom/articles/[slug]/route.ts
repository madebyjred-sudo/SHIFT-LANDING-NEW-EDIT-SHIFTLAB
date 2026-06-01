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

/* ── GET: Single article ── */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = request.nextUrl.searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const author = await getAuthorByUserId(userId);
    const admin = author ? isAdmin(author.role) : false;

    if (!admin && !author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    // Build query: admin sees any, author sees only theirs
    let queryUrl = `${DIRECTUS_URL}/items/news_articles?filter[slug][_eq]=${slug}&fields=*&limit=1`;
    if (!admin && author) {
      queryUrl += `&filter[author_id][_eq]=${author.id}`;
    }

    const articleRes = await fetch(queryUrl, { headers: getHeaders() });
    const articleData = await articleRes.json().catch(() => ({ data: [] }));
    if (!articleData.data?.[0]) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ article: articleData.data[0] });
  } catch (error) {
    console.error("GET article error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ── PATCH: Update article ── */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const {
      title,
      excerpt,
      content,
      category,
      layout_preset,
      cover_image,
      gallery_images,
      status,
      user_id,
    } = body;

    const author = user_id ? await getAuthorByUserId(user_id) : null;
    const admin = author ? isAdmin(author.role) : false;

    if (!admin && !author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    // Resolve category
    let categoryId = category;
    const catRes = await fetch(
      `${DIRECTUS_URL}/items/news_categories?filter[slug][_eq]=${category}&limit=1`,
      { headers: getHeaders() }
    );
    const catData = await catRes.json().catch(() => ({ data: [] }));
    if (catData.data?.[0]?.id) {
      categoryId = catData.data[0].id;
    }

    // Find article ID (with author filter for non-admins)
    let findUrl = `${DIRECTUS_URL}/items/news_articles?filter[slug][_eq]=${slug}&fields=id,author_id&limit=1`;
    if (!admin && author) {
      findUrl += `&filter[author_id][_eq]=${author.id}`;
    }

    const findRes = await fetch(findUrl, { headers: getHeaders() });
    const findData = await findRes.json().catch(() => ({ data: [] }));
    if (!findData.data?.[0]?.id) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const articleId = findData.data[0].id;

    const payload: Record<string, unknown> = {
      title,
      excerpt,
      content,
      category: categoryId,
      layout_preset: layout_preset || "classic",
      status: status || "draft",
      date_published: status === "published" ? new Date().toISOString() : null,
    };

    if (cover_image) payload.cover_image = cover_image;
    if (gallery_images) {
      payload.gallery_images = gallery_images.map((id: string) => ({ image_id: id }));
    }

    const res = await fetch(`${DIRECTUS_URL}/items/news_articles/${articleId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.errors?.[0]?.message || "Failed to update article" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ article: data.data });
  } catch (error) {
    console.error("PATCH article error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ── DELETE: Delete article (admin only) ── */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const userId = request.nextUrl.searchParams.get("user_id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const author = await getAuthorByUserId(userId);
    if (!author || !isAdmin(author.role)) {
      return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 });
    }

    // Find article ID
    const findRes = await fetch(
      `${DIRECTUS_URL}/items/news_articles?filter[slug][_eq]=${slug}&fields=id&limit=1`,
      { headers: getHeaders() }
    );
    const findData = await findRes.json().catch(() => ({ data: [] }));
    if (!findData.data?.[0]?.id) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const articleId = findData.data[0].id;

    const res = await fetch(`${DIRECTUS_URL}/items/news_articles/${articleId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.errors?.[0]?.message || "Failed to delete article" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE article error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
