import { Metadata } from "next";
import Link from "next/link";
import { getDirectusImageUrl, type NewsArticle, type NewsCategory, type Author } from "@/lib/directus";
import { directusItems } from "@/lib/directus-auth";
import { isAiAuthor } from "@/lib/newsroom/ai-authors";
import NewsCard, { type NewsCardArticle } from "@/components/newsroom/NewsCard";
import { SITE_URL, SITE_NAME } from "@/app/seo";

export const revalidate = 60;

interface Props {
  params: Promise<{ tag: string }>;
}

// Etiquetas con copy propio (la jugada GEO "ai-seo": hubs temáticos citables).
const TOPIC_LABELS: Record<string, { title: string; intro: string }> = {
  ai: {
    title: "Inteligencia Artificial",
    intro:
      "Estudios y análisis de Shift Latam producidos o co-escritos por nuestros agentes editoriales de IA. Datos verificables, metodología explícita y lectura estratégica para tomadores de decisión en América Latina.",
  },
  ia: {
    title: "Inteligencia Artificial",
    intro:
      "Estudios y análisis de Shift Latam producidos o co-escritos por nuestros agentes editoriales de IA.",
  },
};

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function loadTopic(rawTag: string) {
  const norm = decodeURIComponent(rawTag).trim().toLowerCase();
  const [rawArticles, authorsList] = await Promise.all([
    directusItems<NewsArticle>(
      "/items/news_articles?filter[status][_eq]=published&sort=-date_published&fields=*,category.id,category.name,category.slug&limit=200",
    ),
    directusItems<Author>("/items/authors?fields=id,name,avatar,role&limit=200"),
  ]);
  const byId = new Map(authorsList.map((a) => [String(a.id), a]));
  const byName = new Map(authorsList.map((a) => [String(a.name).toLowerCase(), a]));

  const match = rawArticles.filter((a) => {
    const cat = a.category as NewsCategory | null;
    const catSlug = cat && typeof cat === "object" ? String(cat.slug).toLowerCase() : "";
    const tags = Array.isArray(a.tags) ? a.tags.map((t) => String(t).toLowerCase()) : [];
    return tags.includes(norm) || catSlug === norm;
  });

  const articles: NewsCardArticle[] = match.map((article) => {
    const cat = article.category as NewsCategory | null;
    const au = article.author_id != null ? byId.get(String(article.author_id)) ?? null : null;
    const coId = (article as unknown as { co_author_id?: number | string | null }).co_author_id;
    let co = coId != null ? byId.get(String(coId)) ?? null : null;
    const rawAuthor = typeof article.author === "string" ? article.author : "";
    if (!co && rawAuthor.includes(" × ")) {
      co = byName.get((rawAuthor.split(" × ").pop() ?? "").trim().toLowerCase()) ?? null;
    }
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
  });

  return { norm, articles };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const norm = decodeURIComponent(tag).trim().toLowerCase();
  const label = TOPIC_LABELS[norm];
  const name = label?.title ?? titleCase(norm);
  const url = `${SITE_URL}/newsroom/tag/${encodeURIComponent(norm)}`;
  const description = label?.intro ?? `Notas del Newsroom de Shift Latam sobre ${name}.`;
  return {
    title: `${name} | Newsroom`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: `${name} | Newsroom`, description, siteName: SITE_NAME },
    twitter: { card: "summary_large_image", title: `${name} | Newsroom`, description },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  let data: Awaited<ReturnType<typeof loadTopic>> = { norm: "", articles: [] };
  try {
    data = await loadTopic(tag);
  } catch {
    /* sin Directus: estado vacío */
  }
  const norm = data.norm || decodeURIComponent(tag).trim().toLowerCase();
  const label = TOPIC_LABELS[norm];
  const name = label?.title ?? titleCase(norm);
  const url = `${SITE_URL}/newsroom/tag/${encodeURIComponent(norm)}`;
  const isAi = norm === "ai" || norm === "ia";

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${name} — Newsroom Shift Latam`,
    description: label?.intro ?? `Notas sobre ${name}.`,
    url,
    inLanguage: "es",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    hasPart: data.articles.slice(0, 50).map((a) => ({
      "@type": "NewsArticle",
      headline: a.title,
      url: `${SITE_URL}/newsroom/${a.slug}`,
      datePublished: a.date_published || undefined,
    })),
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden selection:bg-[#F540FF] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <section className="relative max-w-[1400px] mx-auto px-6 pt-[140px] md:pt-[180px] pb-10">
        <nav className="flex items-center gap-2 text-[12px] [font-family:var(--font-fira-sans)] mb-6">
          <Link href="/" className="text-[#111A31]/40 hover:text-[#111A31]/70 transition-colors">Inicio</Link>
          <span className="text-[#111A31]/20">/</span>
          <Link href="/newsroom" className="text-[#111A31]/40 hover:text-[#111A31]/70 transition-colors">Newsroom</Link>
          <span className="text-[#111A31]/20">/</span>
          <span className="text-[#1534DC]">{name}</span>
        </nav>
        {isAi && (
          <span className="ai-tag inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-[11px] font-bold uppercase tracking-[0.12em] [font-family:var(--font-figtree)] mb-5">
            <span aria-hidden>✦</span> Autoría con IA
          </span>
        )}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal [font-family:var(--font-glitz-local)] leading-[0.95] tracking-tight text-[#111A31] mb-5">
          {name}
        </h1>
        <p className="max-w-2xl text-base md:text-lg text-[#1F2A44] [font-family:var(--font-fira-sans)] font-light leading-relaxed">
          {label?.intro ?? `Todo lo que el Newsroom de Shift Latam ha publicado sobre ${name}.`}
        </p>
        <div className="mt-6 h-[1px] bg-gradient-to-r from-[#111A31]/10 via-[#111A31]/5 to-transparent" />
      </section>

      <section className="relative max-w-[1400px] mx-auto px-6 pb-40">
        {data.articles.length === 0 ? (
          <p className="py-20 text-center text-[#111A31]/50 [font-family:var(--font-fira-sans)]">
            Aún no hay notas en este tema.{" "}
            <Link href="/newsroom" className="text-[#1534DC] underline">Volver al Newsroom</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.articles.map((a, i) => (
              <NewsCard key={a.id} article={a} variant="standard" priority={i < 3} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
