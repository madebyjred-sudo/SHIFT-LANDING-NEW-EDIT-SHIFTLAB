import { Metadata } from "next";
import Link from "next/link";
import { type NewsArticle, type NewsCategory, type Author } from "@/lib/directus";
import { directusItems } from "@/lib/directus-auth";
import { isAiAuthor } from "@/lib/newsroom/ai-authors";
import { getFeeds, matchesFeed } from "@/lib/newsroom/feeds";
import FeedBadge from "@/components/newsroom/FeedBadge";
import { SITE_URL } from "@/app/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Colecciones del Newsroom",
  description:
    "Los hubs temáticos del Newsroom de Shift Latam: las voces de nuestras operaciones en la región, lo que escriben nuestros agentes editoriales y la reputación de marca dentro de la IA.",
  alternates: { canonical: `${SITE_URL}/newsroom/feeds` },
};

async function contarPorFeed() {
  const [raw, authorsList] = await Promise.all([
    directusItems<NewsArticle>(
      "/items/news_articles?filter[status][_eq]=published&fields=id,title,tags,author,author_id,category.slug&limit=200",
    ),
    directusItems<Author>("/items/authors?fields=id,name,role&limit=200"),
  ]);
  const byId = new Map(authorsList.map((a) => [String(a.id), a]));

  return getFeeds().map((feed) => {
    const n = raw.filter((a) => {
      const cat = a.category as NewsCategory | null;
      const au = a.author_id != null ? byId.get(String(a.author_id)) ?? null : null;
      return matchesFeed(
        {
          tags: Array.isArray(a.tags) ? a.tags.map(String) : [],
          categorySlug: cat && typeof cat === "object" ? cat.slug : null,
          author: a.author,
          authorRole: au?.role ?? null,
        },
        feed,
      );
    }).length;
    return { feed, n };
  });
}

export default async function FeedsIndexPage() {
  const filas = await contarPorFeed();

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-28 md:px-8 md:pb-16 md:pt-28">
      <nav className="mb-8 text-sm text-black/50">
        <Link href="/newsroom" className="hover:text-black">Newsroom</Link>
        <span className="mx-2">/</span>
        <span className="text-black/80">Colecciones</span>
      </nav>

      <h1 className="text-4xl font-bold leading-tight md:text-6xl [font-family:var(--font-figtree)]">
        Colecciones
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-black/60">
        El Newsroom agrupado por lo que cada conjunto de piezas hace, no por la fecha
        en que salió. Cada colección tiene su propia lectura y se arma sola: una pieza
        entra por lo que es, sin que nadie la asigne a mano.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {filas.map(({ feed, n }) => (
          <Link
            key={feed.slug}
            href={`/newsroom/feeds/${feed.slug}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ borderColor: `${feed.accent}33`, background: `${feed.accent}08` }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
              style={{ background: feed.accent }}
            />
            <div className="relative z-10">
              <FeedBadge feed={feed} tone="onLight" size="md" />
              <h2 className="mt-4 text-2xl font-bold md:text-3xl [font-family:var(--font-figtree)]">
                {feed.name}
              </h2>
              <p className="mt-1 text-black/55">{feed.tagline}</p>
              <p className="mt-4 line-clamp-4 leading-relaxed text-black/70">{feed.intro}</p>
            </div>
            <div className="relative z-10 mt-8 flex items-center justify-between">
              <span className="text-sm font-semibold text-black/50">
                {n} {n === 1 ? "pieza" : "piezas"}
              </span>
              <span
                className="text-sm font-bold transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: feed.accent }}
              >
                Ver colección →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
