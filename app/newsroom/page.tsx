import { Metadata } from "next";
import { getDirectusImageUrl, type NewsArticle, type NewsCategory, type Author } from "@/lib/directus";
import { directusItems } from "@/lib/directus-auth";
import NewsroomGrid from "@/components/newsroom/NewsroomGrid";
import type { NewsCardArticle } from "@/components/newsroom/NewsCard";
import { isAiAuthor } from "@/lib/newsroom/ai-authors";
import { rankArticles } from "@/lib/newsroom/rank";

import CurrentMonth from "@/components/newsroom/CurrentMonth";

export const metadata: Metadata = {
  title: "Newsroom | Shift Latam",
  description:
    "El pulso de Shift Latam. Últimas noticias, insights estratégicos, casos de éxito y reflexiones sobre comunicación, IA y transformación digital en América Latina.",
};

export const revalidate = 60;

// ─── HELPERS ─────────────────────────────────────────────────

function mapDirectusArticle(
  article: NewsArticle,
  authorsById: Map<string, Author>,
  authorsByName: Map<string, Author>,
): NewsCardArticle {
  const cat = article.category as NewsCategory | null;
  // author_id no es una relación expandible en Directus → unimos por id
  // contra el listado de autores cargado aparte.
  const au =
    article.author_id != null
      ? authorsById.get(String(article.author_id)) ?? null
      : null;
  // Co-autoría (collabs): segundo autor, unido por co_author_id.
  const coId = (article as unknown as { co_author_id?: number | string | null })
    .co_author_id;
  let co = coId != null ? authorsById.get(String(coId)) ?? null : null;
  // Fallback robusto: Directus puede no exponer co_author_id (campo agregado por
  // SQL directo, fuera de su caché de esquema). En ese caso derivamos el co-autor
  // de la convención "Principal × Co" en el campo author (texto reconocido).
  const rawAuthor = typeof article.author === "string" ? article.author : "";
  if (!co && rawAuthor.includes(" × ")) {
    const coName = rawAuthor.split(" × ").pop()?.trim() ?? "";
    co = authorsByName.get(coName.toLowerCase()) ?? null;
  }
  // Nombre del autor principal: el de author_id; si no, la parte previa al " × ".
  const principalName =
    au?.name ?? (rawAuthor.includes(" × ") ? rawAuthor.split(" × ")[0].trim() : article.author);
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    date_published: article.date_published,
    cover_image: article.cover_image ? getDirectusImageUrl(article.cover_image) : null,
    category_name: cat?.name ?? null,
    category_slug: cat?.slug ?? null,
    read_time: article.read_time,
    author: principalName,
    author_avatar: au?.avatar ? getDirectusImageUrl(au.avatar) : null,
    author_role: au?.role ?? null,
    author_is_ai: isAiAuthor(au?.name, au?.role),
    co_author: co?.name ?? null,
    co_author_avatar: co?.avatar ? getDirectusImageUrl(co.avatar) : null,
    co_author_is_ai: isAiAuthor(co?.name, co?.role),
  };
}

// ─── PAGE ────────────────────────────────────────────────────

export default async function NewsroomPage() {
  // Contenido en vivo desde Directus — sin datos mock. Si no hay
  // publicados, la grilla muestra su estado vacío.
  let articles: NewsCardArticle[] = [];
  let categories: { id: string; name: string; slug: string }[] = [];

  try {
    const rawArticles = await directusItems<NewsArticle>(
      "/items/news_articles?filter[status][_eq]=published&sort=-date_published&fields=*,category.id,category.name,category.slug&limit=50"
    );
    const authorsList = await directusItems<Author>(
      "/items/authors?fields=id,name,avatar,role&limit=200"
    );
    const authorsById = new Map(authorsList.map((a) => [String(a.id), a]));
    const authorsByName = new Map(
      authorsList.map((a) => [String(a.name).toLowerCase(), a]),
    );
    articles = rawArticles.map((a) =>
      mapDirectusArticle(a, authorsById, authorsByName),
    );

    const rawCats = await directusItems<NewsCategory>(
      "/items/news_categories?sort=name&limit=20"
    );
    categories = rawCats.map((c) => ({
      id: String(c.id),
      name: c.name,
      slug: c.slug,
    }));
  } catch (err) {
    console.error("[newsroom] Directus fetch failed:", err);
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden selection:bg-[#F540FF] selection:text-white">
      {/* ── Editorial Header ── */}
      <section className="relative pt-[160px] pb-6 md:pt-[220px] md:pb-10 px-6">
        {/* Background Video (Space) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover opacity-[0.15]"
          >
            <source src="/assets/videos/newsroom-space.mp4" type="video/mp4" />
          </video>
          {/* Gradient to fade into the white background below */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />
        </div>

        {/* Ambient glows — subtle brand colors on light bg */}
        <div className="absolute z-0 top-[-15%] left-[-5%] w-[600px] h-[600px] bg-[#1534DC] opacity-[0.06] blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute z-0 top-[10%] right-[-10%] w-[400px] h-[400px] bg-[#F540FF] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-[1400px] mx-auto">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal [font-family:var(--font-glitz-local)] leading-[0.9] tracking-tight text-[#111A31]">
                News<span className="text-[#1534DC]">room</span>
              </h1>
            </div>

            <div className="flex flex-col md:items-end gap-3 text-left md:text-right">
              <p className="max-w-md text-base md:text-lg text-[#1F2A44] [font-family:var(--font-fira-sans)] font-light leading-relaxed">
                El pulso de Shift Latam. Últimas noticias, insights estratégicos y disrupción editorial.
              </p>
              <div className="flex items-center md:justify-end gap-4 [font-family:var(--font-figtree)] text-[11px] font-bold tracking-[0.15em] uppercase">
                <span className="text-[#111A31]/50">
                  <CurrentMonth />
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-gradient-to-r from-[#111A31]/10 via-[#111A31]/5 to-transparent" />
        </div>
      </section>

      {/* ── Grid Section ── */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 pb-40">
        <NewsroomGrid articles={rankArticles(articles)} categories={categories} />
      </section>
    </div>
  );
}
