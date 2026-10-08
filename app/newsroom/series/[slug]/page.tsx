import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDirectusImageUrl, type NewsArticle, type NewsCategory, type Author } from "@/lib/directus";
import { directusItems } from "@/lib/directus-auth";
import { isAiAuthor } from "@/lib/newsroom/ai-authors";
import { getSerie, getSeries } from "@/lib/newsroom/series";
import NewsCard, { type NewsCardArticle } from "@/components/newsroom/NewsCard";
import { SITE_URL, SITE_NAME } from "@/app/seo";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getSeries().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getSerie(slug);
  if (!s) return { title: "Serie no encontrada" };
  const canonical = `${SITE_URL}/newsroom/series/${s.slug}`;
  return {
    title: s.name,
    description: s.intro.slice(0, 300),
    alternates: { canonical },
    openGraph: { title: s.name, description: s.intro.slice(0, 300), url: canonical, type: "website" },
  };
}

export default async function SeriePage({ params }: Props) {
  const { slug } = await params;
  const serie = getSerie(slug);
  if (!serie) notFound();

  const [raw, autores] = await Promise.all([
    directusItems<NewsArticle>(
      "/items/news_articles?filter[status][_eq]=published&fields=*,category.id,category.name,category.slug&limit=200",
    ),
    directusItems<Author>("/items/authors?fields=id,name,avatar,role&limit=200"),
  ]);
  const porId = new Map(autores.map((a) => [String(a.id), a]));
  const porSlug = new Map(raw.map((a) => [a.slug, a]));

  // El orden lo da la serie, NO la fecha: es lo que la vuelve una serie.
  const partes = serie.partes
    .map((s) => porSlug.get(s))
    .filter(Boolean) as NewsArticle[];

  const tarjetas: NewsCardArticle[] = partes.map((a) => {
    const cat = a.category as NewsCategory | null;
    const au = a.author_id != null ? porId.get(String(a.author_id)) ?? null : null;
    const nombre = au?.name ?? (typeof a.author === "string" ? a.author : null);
    return {
      id: String(a.id),
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      date_published: a.date_published,
      cover_image: a.cover_image ? getDirectusImageUrl(a.cover_image) : null,
      category_name: cat && typeof cat === "object" ? cat.name : null,
      category_slug: cat && typeof cat === "object" ? cat.slug : null,
      read_time: a.read_time,
      author: typeof a.author === "string" ? a.author : nombre,
      author_avatar: au?.avatar ? getDirectusImageUrl(au.avatar) : null,
      author_role: au?.role ?? null,
      author_is_ai: isAiAuthor(nombre, au?.role ?? null),
    };
  });

  const faltan = serie.partes.length - partes.length;

  // `hasPart` con `position`: es lo que le dice a un motor que esto se lee en
  // orden y no es una lista cualquiera.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries",
    name: serie.name,
    description: serie.intro,
    url: `${SITE_URL}/newsroom/series/${serie.slug}`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    hasPart: tarjetas.map((a, i) => ({
      "@type": "NewsArticle",
      position: i + 1,
      headline: a.title,
      url: `${SITE_URL}/newsroom/${a.slug}`,
      datePublished: a.date_published ?? undefined,
      author: a.author ? { "@type": "Person", name: a.author } : undefined,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 pb-12 pt-28 md:px-8 md:pb-16 md:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-8 text-sm text-black/50">
        <Link href="/newsroom" className="hover:text-black">Newsroom</Link>
        <span className="mx-2">/</span>
        <span className="text-black/80">{serie.name}</span>
      </nav>

      <header
        className="rounded-[28px] border px-6 py-10 md:px-10 md:py-14"
        style={{ borderColor: `${serie.accent}33`, background: `${serie.accent}0A` }}
      >
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] [font-family:var(--font-figtree)]"
          style={{ background: `${serie.accent}1A`, color: serie.accent }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: serie.accent }} />
          Serie · {serie.partes.length} partes
        </span>
        <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl [font-family:var(--font-figtree)]">
          {serie.name}
        </h1>
        <p className="mt-2 text-lg text-black/60">{serie.tagline}</p>
        <p className="mt-5 max-w-2xl leading-relaxed text-black/70">{serie.intro}</p>
      </header>

      {faltan > 0 && (
        <p className="mt-6 rounded-2xl border border-black/10 bg-black/[0.02] p-5 text-[14px] text-black/55">
          {faltan === 1 ? "Una parte declarada" : `${faltan} partes declaradas`} todavía sin
          publicar. Aparecerán acá en cuanto salgan.
        </p>
      )}

      <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {tarjetas.map((a, i) => (
          <li key={a.id} className="relative">
            <span
              className="absolute -top-3 left-4 z-20 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white [font-family:var(--font-figtree)]"
              style={{ background: serie.accent }}
            >
              Parte {i + 1}
            </span>
            <NewsCard article={a} variant="grid" index={i} priority={i < 3} className="h-full" />
          </li>
        ))}
      </ol>
    </main>
  );
}
