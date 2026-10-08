import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDirectusImageUrl, type NewsArticle, type NewsCategory, type Author } from "@/lib/directus";
import { directusItems } from "@/lib/directus-auth";
import { isAiAuthor } from "@/lib/newsroom/ai-authors";
import { getFeed, getFeeds, matchesFeed, paisDeAutor, type NewsFeed } from "@/lib/newsroom/feeds";
import NewsCard from "@/components/newsroom/NewsCard";
import FeedBadge from "@/components/newsroom/FeedBadge";
import VocesFeed, { type VocesArticulo } from "@/components/newsroom/VocesFeed";
import { SITE_URL, SITE_NAME } from "@/app/seo";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Los doce mercados que declara la sección regional de `/about-us` — la fuente
 * corporativa publicada, para que no se desincronice. Coordenadas de la capital
 * de cada país; Miami es oficina afiliada para el mercado hispano de EE.UU.
 */
const MERCADOS = [
  { pais: "Costa Rica", lat: 9.93, lng: -84.09 },
  { pais: "El Salvador", lat: 13.69, lng: -89.19 },
  { pais: "Guatemala", lat: 14.63, lng: -90.51 },
  { pais: "Honduras", lat: 14.07, lng: -87.19 },
  { pais: "Nicaragua", lat: 12.11, lng: -86.24 },
  { pais: "Panamá", lat: 8.98, lng: -79.52 },
  { pais: "México", lat: 19.36, lng: -99.27 },
  { pais: "Colombia", lat: 4.71, lng: -74.07 },
  { pais: "Ecuador", lat: -0.18, lng: -78.47 },
  { pais: "Rep. Dominicana", lat: 18.49, lng: -69.93 },
  { pais: "Venezuela", lat: 10.48, lng: -66.9 },
  { pais: "Miami", lat: 25.72, lng: -80.27 },
];

export async function generateStaticParams() {
  return getFeeds().map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const feed = getFeed(slug);
  if (!feed) return { title: "Colección no encontrada" };
  const canonical = `${SITE_URL}/newsroom/feeds/${feed.slug}`;
  return {
    title: feed.name,
    description: feed.intro.slice(0, 300),
    alternates: { canonical },
    openGraph: {
      title: feed.name,
      description: feed.intro.slice(0, 300),
      url: canonical,
      type: "website",
    },
  };
}

async function loadFeed(feed: NewsFeed) {
  const [raw, authorsList] = await Promise.all([
    directusItems<NewsArticle>(
      "/items/news_articles?filter[status][_eq]=published&sort=-date_published&fields=*,category.id,category.name,category.slug&limit=200",
    ),
    directusItems<Author>("/items/authors?fields=id,name,avatar,role&limit=200"),
  ]);

  const byId = new Map(authorsList.map((a) => [String(a.id), a]));

  const match = raw.filter((a) => {
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
  });

  const articles: VocesArticulo[] = match.map((article) => {
    const cat = article.category as NewsCategory | null;
    const au = article.author_id != null ? byId.get(String(article.author_id)) ?? null : null;
    const nombre = au?.name ?? (typeof article.author === "string" ? article.author : null);
    const tags = Array.isArray(article.tags) ? article.tags.map(String) : [];
    // El país sale del tag; si la pieza no lo trae —todo lo anterior a la
    // colección—, se deduce de la firma.
    const firma = typeof article.author === "string" ? article.author : nombre;
    const pais =
      MERCADOS.find((m) => tags.some((t) => t.trim().toLowerCase() === m.pais.toLowerCase()))
        ?.pais ?? paisDeAutor(firma);

    return {
      id: String(article.id),
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      date_published: article.date_published,
      cover_image: article.cover_image ? getDirectusImageUrl(article.cover_image) : null,
      category_name: cat && typeof cat === "object" ? cat.name : null,
      category_slug: cat && typeof cat === "object" ? cat.slug : null,
      read_time: article.read_time,
      author: typeof article.author === "string" ? article.author : nombre,
      author_avatar: au?.avatar ? getDirectusImageUrl(au.avatar) : null,
      author_role: au?.role ?? null,
      author_is_ai: isAiAuthor(nombre, au?.role ?? null),
      pais,
    };
  });

  return articles;
}

export default async function FeedPage({ params }: Props) {
  const { slug } = await params;
  const feed = getFeed(slug);
  if (!feed) notFound();

  const articles = await loadFeed(feed);
  const conPieza = new Set(articles.map((a) => a.pais).filter(Boolean) as string[]);
  const mercados = MERCADOS.map((m) => ({ ...m, activo: conPieza.has(m.pais) }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: feed.name,
    description: feed.intro,
    url: `${SITE_URL}/newsroom/feeds/${feed.slug}`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    hasPart: articles.slice(0, 25).map((a) => ({
      "@type": "NewsArticle",
      headline: a.title,
      url: `${SITE_URL}/newsroom/${a.slug}`,
      datePublished: a.date_published ?? undefined,
      author: a.author ? { "@type": "Person", name: a.author } : undefined,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-28 md:px-8 md:pb-16 md:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-8 text-sm text-black/50">
        <Link href="/newsroom" className="hover:text-black">Newsroom</Link>
        <span className="mx-2">/</span>
        <Link href="/newsroom/feeds" className="hover:text-black">Colecciones</Link>
        <span className="mx-2">/</span>
        <span className="text-black/80">{feed.name}</span>
      </nav>

      {feed.treatment === "voces" ? (
        <VocesFeed mercados={mercados} articulos={articles} intro={feed.intro} />
      ) : (
        <>
          <header
            className="rounded-[28px] border px-6 py-10 md:px-10 md:py-14"
            style={{ borderColor: `${feed.accent}33`, background: `${feed.accent}0A` }}
          >
            <FeedBadge feed={feed} tone="onLight" size="md" />
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl [font-family:var(--font-figtree)]">
              {feed.name}
            </h1>
            <p className="mt-2 text-lg text-black/60">{feed.tagline}</p>
            <p className="mt-5 max-w-2xl leading-relaxed text-black/70">{feed.intro}</p>
          </header>

          <div className="mt-10 flex items-baseline justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-black/50 [font-family:var(--font-figtree)]">
              {articles.length} {articles.length === 1 ? "pieza" : "piezas"}
            </h2>
            <Link
              href="/newsroom/feeds"
              className="text-sm text-black/50 underline-offset-4 hover:text-black hover:underline"
            >
              Ver todas las colecciones
            </Link>
          </div>

          {articles.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-black/10 bg-black/[0.02] p-8 text-black/60">
              Todavía no hay piezas publicadas en esta colección.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((a, i) => (
                <NewsCard key={a.id} article={a} variant="grid" index={i} priority={i < 3} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
