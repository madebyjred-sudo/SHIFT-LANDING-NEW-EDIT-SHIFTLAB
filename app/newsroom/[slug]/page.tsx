import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDirectusImageUrl, type NewsCategory, type NewsArticle, type Author } from "@/lib/directus";
import { directusItems } from "@/lib/directus-auth";
import AuthorCard from "@/components/newsroom/AuthorCard";
import ShareButtons from "@/components/newsroom/ShareButtons";
import RelatedArticles from "@/components/newsroom/RelatedArticles";
import NewsletterCTA from "@/components/newsroom/NewsletterCTA";
import ReadingProgress from "@/components/newsroom/ReadingProgress";
import ArticleContent from "@/components/newsroom/ArticleContent";
import { isAiAuthor } from "@/lib/newsroom/ai-authors";
import { SITE_URL, SITE_NAME } from "@/app/seo";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

function resolveCategory(article: NewsArticle): NewsCategory | null {
  if (!article.category) return null;
  if (typeof article.category === "string") return null;
  return article.category as NewsCategory;
}

function resolveAuthor(article: NewsArticle): Author | null {
  const a = article.author_id;
  if (a && typeof a === "object" && "name" in a) return a as Author;
  return null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

/* ── METADATA ── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let article: NewsArticle | null = null;
  try {
    const articles = await directusItems<NewsArticle>(
      `/items/news_articles?filter[slug][_eq]=${encodeURIComponent(slug)}&filter[status][_eq]=published&fields=*,category.id,category.name,category.slug&limit=1`
    );
    article = articles[0] ?? null;
  } catch { /* sin datos */ }
  if (!article) return { title: "Artículo no encontrado" };
  const cover = article.cover_image
    ? (article.cover_image.startsWith("/")
        ? `${SITE_URL}${article.cover_image}`
        : `${SITE_URL}${getDirectusImageUrl(article.cover_image)}`)
    : undefined;
  const canonical = `${SITE_URL}/newsroom/${article.slug}`;
  return {
    title: `${article.title} | Shift Newsroom`,
    description: article.excerpt || undefined,
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      type: "article",
      url: canonical,
      publishedTime: article.date_published || undefined,
      authors: article.author ? [article.author] : undefined,
      images: cover ? [cover] : undefined,
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.excerpt || undefined, images: cover ? [cover] : undefined },
  };
}

/* ── FETCH RELATED ── */
async function fetchRelated(categorySlug: string | null, currentSlug: string) {
  if (!categorySlug) return [];
  try {
    const related = await directusItems<NewsArticle>(
      `/items/news_articles?filter[status][_eq]=published&filter[slug][_neq]=${encodeURIComponent(currentSlug)}&filter[category][slug][_eq]=${encodeURIComponent(categorySlug)}&sort=-date_published&fields=*,category.id,category.name,category.slug&limit=4`
    );
    return related.map((a) => ({ id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt, date_published: a.date_published, cover_image: a.cover_image ? getDirectusImageUrl(a.cover_image) : null, category_name: resolveCategory(a)?.name ?? null, category_slug: resolveCategory(a)?.slug ?? null, read_time: a.read_time, author: a.author }));
  } catch { return []; }
}

/* ── STRUCTURED DATA (GEO / citabilidad por IA) ── */
/** Convierte HTML a texto plano (para articleBody, wordCount y respuestas FAQ). */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extrae pares Pregunta/Respuesta del bloque "Preguntas frecuentes" del cuerpo.
 *  Convención: <h2>Preguntas frecuentes</h2> seguido de <h3>P</h3><p>R</p>…
 *  Espeja el contenido VISIBLE (no es texto oculto) → FAQPage legítimo, no cloaking. */
function parseFaq(html: string): { q: string; a: string }[] {
  if (!html) return [];
  const start = html.search(
    /<h[23][^>]*>\s*(?:preguntas frecuentes|preguntas y respuestas|faq)\s*<\/h[23]>/i
  );
  if (start === -1) return [];
  const region = html.slice(start);
  const out: { q: string; a: string }[] = [];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3[^>]*>|<h2[^>]*>|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(region)) !== null) {
    const q = stripHtml(m[1]);
    const a = stripHtml(m[2]);
    if (q && a && a.length > 15) out.push({ q, a });
  }
  return out;
}

/** Mini-diccionario de entidades estables → sameAs autoritativo (entity linking).
 *  Desambigua ante la IA de quién/qué trata el artículo. Degrada a Thing simple
 *  cuando la entidad no está en el mapa. Solo URLs reales y verificables. */
const ENTITY_SAMEAS: Record<string, string[]> = {
  "banco davivienda": ["https://es.wikipedia.org/wiki/Davivienda", "https://www.davivienda.com.sv/"],
  davivienda: ["https://es.wikipedia.org/wiki/Davivienda"],
  camarasal: ["https://www.camarasal.com/"],
  "cámara de comercio e industria de el salvador": ["https://www.camarasal.com/"],
  "el salvador": ["https://es.wikipedia.org/wiki/El_Salvador", "https://www.wikidata.org/wiki/Q792"],
  "san salvador": ["https://es.wikipedia.org/wiki/San_Salvador"],
  "shift el salvador": [SITE_URL],
  "shift latam": [SITE_URL],
  "shift porter novelli": [SITE_URL],
};
function mkEntity(name: string): Record<string, unknown> {
  const node: Record<string, unknown> = { "@type": "Thing", name };
  const sameAs = ENTITY_SAMEAS[name.trim().toLowerCase()];
  if (sameAs?.length) node.sameAs = sameAs.length === 1 ? sameAs[0] : sameAs;
  return node;
}

function ArticleJsonLd({ article, category, author, coAuthor }: {
  article: NewsArticle; category: NewsCategory | null; author: Author | null; coAuthor: Author | null;
}) {
  const url = `${SITE_URL}/newsroom/${article.slug}`;
  const img = article.cover_image
    ? (article.cover_image.startsWith("/")
        ? `${SITE_URL}${article.cover_image}`
        : `${SITE_URL}${getDirectusImageUrl(article.cover_image)}`)
    : undefined;
  const datePublished = article.date_published || undefined;
  const bodyText = stripHtml(article.content || "");
  const wordCount = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : undefined;
  const tags = Array.isArray(article.tags) ? article.tags.filter(Boolean) : [];

  const mkAuthor = (a: Author | null, fallbackName: string) => {
    const name = a?.name || fallbackName || "Equipo Shift";
    const ai = isAiAuthor(a?.name, a?.role);
    const isOrg = ai || /^shift\b|equipo shift/i.test(name);
    const node: Record<string, unknown> = { "@type": isOrg ? "Organization" : "Person", name };
    if (a?.role) node.jobTitle = a.role;
    if (a?.bio) node.description = a.bio;
    const links = (a as unknown as { social_links?: string[] })?.social_links;
    if (Array.isArray(links) && links.length) node.sameAs = links;
    return node;
  };

  const authors: Record<string, unknown>[] = [
    mkAuthor(author, article.author?.split(" × ")[0] ?? "Equipo Shift"),
  ];
  if (coAuthor) authors.push(mkAuthor(coAuthor, ""));

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || undefined,
    image: img ? [img] : undefined,
    datePublished,
    dateModified: datePublished,
    inLanguage: "es",
    isAccessibleForFree: true,
    articleSection: category?.name || undefined,
    keywords: tags.length ? tags.join(", ") : undefined,
    about: tags.length ? tags.map((t) => mkEntity(t)) : undefined,
    wordCount,
    articleBody: bodyText || undefined,
    author: authors,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/svg/nav-logo.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1"] },
    url,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };

  const crumbs = [
    { name: "Inicio", url: SITE_URL },
    { name: "Newsroom", url: `${SITE_URL}/newsroom` },
    ...(category ? [{ name: category.name, url: `${SITE_URL}/newsroom/tag/${encodeURIComponent(category.slug)}` }] : []),
    { name: article.title, url },
  ];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
  };

  // FAQPage: espeja el bloque visible "Preguntas frecuentes" del cuerpo.
  // Es de las señales más fuertes para que un LLM extraiga y cite respuestas.
  const faqPairs = parseFaq(article.content || "");
  const faqLd = faqPairs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        inLanguage: "es",
        mainEntity: faqPairs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  // Un único @graph con @context compartido: la IA lee un grafo de entidades
  // coherente (Article + Breadcrumb + FAQPage) en vez de fragmentos sueltos.
  const graph = [articleLd, breadcrumbLd, ...(faqLd ? [faqLd] : [])].map((node) => {
    const rest: Record<string, unknown> = { ...(node as Record<string, unknown>) };
    delete rest["@context"];
    return rest;
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}

/* ── SHARED COMPONENTS ── */
function ArticleMeta({ authorName, authorAvatar, coAuthorAvatar, authorIsAi, coAuthorIsAi, authorBio, authorRole, publishedDate, readTime, articleSlug, title }: {
  authorName: string; authorAvatar: string | null; coAuthorAvatar: string | null; authorIsAi: boolean; coAuthorIsAi: boolean; authorBio: string | null; authorRole: string | null; publishedDate: string; readTime: number | null; articleSlug: string; title: string;
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 py-8 md:py-10 border-b border-[#111A31]/8">
        <AuthorCard name={authorName} avatarUrl={authorAvatar} coAvatarUrl={coAuthorAvatar} authorIsAi={authorIsAi} coIsAi={coAuthorIsAi} bio={authorBio} role={authorRole} date={publishedDate} readTime={readTime} />
        <ShareButtons url={`/newsroom/${articleSlug}`} title={title} />
      </div>
    </>
  );
}

function ArticleFooter({ authorName, authorAvatar, coAuthorAvatar, authorIsAi, coAuthorIsAi, authorBio, authorRole, category, tags, articleSlug }: {
  authorName: string; authorAvatar: string | null; coAuthorAvatar: string | null; authorIsAi: boolean; coAuthorIsAi: boolean; authorBio: string | null; authorRole: string | null; category: NewsCategory | null; tags: string[] | null; articleSlug: string;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2 py-8 border-t border-[#111A31]/8">
        {category && <span className="px-3 py-1.5 rounded-full bg-[#1534DC]/8 border border-[#1534DC]/15 text-white text-[11px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)]">{category.name}</span>}
        {tags?.map((tag) => {
          const t = tag.trim().toLowerCase();
          const isAiTag = t === "ai" || t === "ia";
          const href = `/newsroom/tag/${encodeURIComponent(t)}`;
          return isAiTag ? (
            <Link key={tag} href={href} className="ai-tag inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-[11px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)]"><span aria-hidden>✦</span>{tag}</Link>
          ) : (
            <Link key={tag} href={href} className="px-3 py-1.5 rounded-full bg-[#111A31]/5 border border-[#111A31]/10 text-[#111A31]/50 hover:text-[#1534DC] hover:border-[#1534DC]/30 transition-colors text-[11px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)]">{tag}</Link>
          );
        })}
      </div>
      <div className="py-10 border-t border-[#111A31]/8">
        <div className="flex items-start gap-5">
          <span className="flex shrink-0 -space-x-3">
            <span style={{ zIndex: 20 }} className={`relative block shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 bg-[#1534DC]/5 ${authorIsAi ? "border-[#F540FF]/50 ai-avatar" : "border-[#1534DC]/20"}`}>
              {authorAvatar ? <Image src={authorAvatar} alt={authorName} fill className="object-cover" /> : <span className="w-full h-full flex items-center justify-center text-[#1534DC] font-bold text-xl [font-family:var(--font-figtree)]">{authorName.charAt(0).toUpperCase()}</span>}
              {authorIsAi && <span aria-hidden title="Agente IA" className="pointer-events-none absolute bottom-0 right-0 grid place-items-center w-[18px] h-[18px] rounded-full bg-[#F540FF] text-white text-[9px] leading-none font-bold ring-[1.5px] ring-white">✦</span>}
            </span>
            {coAuthorAvatar && (
              <span style={{ zIndex: 10 }} className={`relative block shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 bg-[#1534DC]/5 ${coAuthorIsAi ? "border-[#F540FF]/50 ai-avatar" : "border-[#1534DC]/20"}`}>
                <Image src={coAuthorAvatar} alt={authorName} fill className="object-cover" />
                {coAuthorIsAi && <span aria-hidden title="Agente IA" className="pointer-events-none absolute bottom-0 right-0 grid place-items-center w-[18px] h-[18px] rounded-full bg-[#F540FF] text-white text-[9px] leading-none font-bold ring-[1.5px] ring-white">✦</span>}
              </span>
            )}
          </span>
          <div>
            <p className="text-[15px] font-bold text-[#111A31] [font-family:var(--font-figtree)]">Escrito por {authorName}</p>
            <p className="text-sm text-[#111A31]/60 [font-family:var(--font-fira-sans)] leading-relaxed mt-1">{authorBio || `${authorRole}. Compartiendo insights sobre comunicación, reputación y transformación digital en América Latina.`}</p>
          </div>
        </div>
      </div>
      <div className="py-10 border-t border-[#111A31]/8">
        <Link href="/newsroom" className="inline-flex items-center gap-2.5 text-[#111A31]/50 hover:text-[#1534DC] transition-colors [font-family:var(--font-figtree)] font-bold text-[12px] uppercase tracking-[0.15em]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver al Newsroom
        </Link>
      </div>
    </>
  );
}

/* ── LAYOUT: CLASSIC (default) ── */
function ClassicLayout({ article, coverUrl, category, authorName, authorAvatar, coAuthorAvatar, authorIsAi, coAuthorIsAi, authorBio, authorRole, publishedDate, relatedArticles }: {
  article: NewsArticle; coverUrl: string | null; category: NewsCategory | null; authorName: string; authorAvatar: string | null; coAuthorAvatar: string | null; authorIsAi: boolean; coAuthorIsAi: boolean; authorBio: string | null; authorRole: string | null; publishedDate: string; relatedArticles: any[];
}) {
  return (
    <>
      <section className="relative">
        {coverUrl && (
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.5/1] overflow-hidden">
            <Image src={coverUrl} alt={article.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-[1400px] mx-auto px-6 pb-8 md:pb-14">
            <nav className="flex items-center gap-2 text-[12px] [font-family:var(--font-fira-sans)] mb-4 md:mb-6">
              <Link href="/" className="text-white/50 hover:text-white/80 transition-colors">Inicio</Link>
              <span className="text-white/30">/</span>
              <Link href="/newsroom" className="text-white/50 hover:text-white/80 transition-colors">Newsroom</Link>
              {category && <><span className="text-white/30">/</span><span className="text-white/70">{category.name}</span></>}
            </nav>
            {category && <span className="inline-block px-3 py-1 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-[0.15em] [font-family:var(--font-figtree)] mb-4">{category.name}</span>}
            <h1 className="text-3xl md:text-5xl lg:text-[64px] font-bold leading-[1.05] text-white [font-family:var(--font-figtree)] tracking-tight max-w-4xl">{article.title}</h1>
          </div>
        </div>
      </section>
      <article className="relative z-10 max-w-[1400px] mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <ArticleMeta authorName={authorName} authorAvatar={authorAvatar} coAuthorAvatar={coAuthorAvatar} authorIsAi={authorIsAi} coAuthorIsAi={coAuthorIsAi} authorBio={authorBio} authorRole={authorRole} publishedDate={publishedDate} readTime={article.read_time} articleSlug={article.slug} title={article.title} />
          {article.excerpt && <div className="py-8 md:py-10 border-b border-[#111A31]/8"><p className="text-xl md:text-2xl text-[#1F2A44] [font-family:var(--font-fira-sans)] font-light leading-relaxed">{article.excerpt}</p></div>}
          <div className="py-8 md:py-12"><ArticleContent content={article.content || ""} /></div>
          <ArticleFooter authorName={authorName} authorAvatar={authorAvatar} coAuthorAvatar={coAuthorAvatar} authorIsAi={authorIsAi} coAuthorIsAi={coAuthorIsAi} authorBio={authorBio} authorRole={authorRole} category={category} tags={article.tags} articleSlug={article.slug} />
        </div>
        <RelatedArticles articles={relatedArticles} currentSlug={article.slug} />
        <div className="max-w-3xl mx-auto"><NewsletterCTA /></div>
      </article>
    </>
  );
}

/* ── LAYOUT: EDITORIAL ── */
function EditorialLayout({ article, coverUrl, category, authorName, authorAvatar, coAuthorAvatar, authorIsAi, coAuthorIsAi, authorBio, authorRole, publishedDate, relatedArticles }: {
  article: NewsArticle; coverUrl: string | null; category: NewsCategory | null; authorName: string; authorAvatar: string | null; coAuthorAvatar: string | null; authorIsAi: boolean; coAuthorIsAi: boolean; authorBio: string | null; authorRole: string | null; publishedDate: string; relatedArticles: any[];
}) {
  return (
    <>
      <section className="max-w-[1400px] mx-auto px-6 pt-[120px] md:pt-[160px] pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div>
            <nav className="flex items-center gap-2 text-[12px] [font-family:var(--font-fira-sans)] mb-6">
              <Link href="/" className="text-[#111A31]/40 hover:text-[#111A31]/70 transition-colors">Inicio</Link>
              <span className="text-[#111A31]/20">/</span>
              <Link href="/newsroom" className="text-[#111A31]/40 hover:text-[#111A31]/70 transition-colors">Newsroom</Link>
              {category && <><span className="text-[#111A31]/20">/</span><span className="text-[#1534DC]">{category.name}</span></>}
            </nav>
            {category && <span className="inline-block px-3 py-1 rounded-full bg-[#1534DC]/8 border border-[#1534DC]/15 text-white text-[10px] font-bold uppercase tracking-[0.15em] [font-family:var(--font-figtree)] mb-5">{category.name}</span>}
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.05] text-[#111A31] [font-family:var(--font-figtree)] tracking-tight mb-6">{article.title}</h1>
            {article.excerpt && <p className="text-lg md:text-xl text-[#1F2A44] [font-family:var(--font-fira-sans)] font-light leading-relaxed mb-8">{article.excerpt}</p>}
            <AuthorCard name={authorName} avatarUrl={authorAvatar} coAvatarUrl={coAuthorAvatar} authorIsAi={authorIsAi} coIsAi={coAuthorIsAi} bio={authorBio} role={authorRole} date={publishedDate} readTime={article.read_time} />
          </div>
          {coverUrl && (
            <div className="relative w-full aspect-[4/5] md:aspect-[3/4] rounded-3xl overflow-hidden">
              <Image src={coverUrl} alt={article.title} fill className="object-cover" priority />
            </div>
          )}
        </div>
      </section>
      <article className="relative z-10 max-w-[1400px] mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 py-8 md:py-10 border-b border-[#111A31]/8">
            <ShareButtons url={`/newsroom/${article.slug}`} title={article.title} />
          </div>
          <div className="py-8 md:py-12"><ArticleContent content={article.content || ""} /></div>
          <ArticleFooter authorName={authorName} authorAvatar={authorAvatar} coAuthorAvatar={coAuthorAvatar} authorIsAi={authorIsAi} coAuthorIsAi={coAuthorIsAi} authorBio={authorBio} authorRole={authorRole} category={category} tags={article.tags} articleSlug={article.slug} />
        </div>
        <RelatedArticles articles={relatedArticles} currentSlug={article.slug} />
        <div className="max-w-3xl mx-auto"><NewsletterCTA /></div>
      </article>
    </>
  );
}

/* ── LAYOUT: MAGAZINE ── */
function MagazineLayout({ article, coverUrl, category, authorName, authorAvatar, coAuthorAvatar, authorIsAi, coAuthorIsAi, authorBio, authorRole, publishedDate, relatedArticles }: {
  article: NewsArticle; coverUrl: string | null; category: NewsCategory | null; authorName: string; authorAvatar: string | null; coAuthorAvatar: string | null; authorIsAi: boolean; coAuthorIsAi: boolean; authorBio: string | null; authorRole: string | null; publishedDate: string; relatedArticles: any[];
}) {
  return (
    <>
      <section className="max-w-[1400px] mx-auto px-6 pt-[120px] md:pt-[160px]">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <nav className="flex items-center justify-center gap-2 text-[12px] [font-family:var(--font-fira-sans)] mb-6">
            <Link href="/" className="text-[#111A31]/40 hover:text-[#111A31]/70 transition-colors">Inicio</Link>
            <span className="text-[#111A31]/20">/</span>
            <Link href="/newsroom" className="text-[#111A31]/40 hover:text-[#111A31]/70 transition-colors">Newsroom</Link>
            {category && <><span className="text-[#111A31]/20">/</span><span className="text-[#1534DC]">{category.name}</span></>}
          </nav>
          {category && <span className="inline-block px-3 py-1 rounded-full bg-[#1534DC]/8 border border-[#1534DC]/15 text-white text-[10px] font-bold uppercase tracking-[0.15em] [font-family:var(--font-figtree)] mb-5">{category.name}</span>}
          <h1 className="text-4xl md:text-6xl lg:text-[80px] font-bold leading-[0.95] text-[#111A31] [font-family:var(--font-glitz-local)] tracking-tight mb-6">{article.title}</h1>
          {article.excerpt && <p className="text-lg md:text-xl text-[#1F2A44] [font-family:var(--font-fira-sans)] font-light leading-relaxed max-w-2xl mx-auto">{article.excerpt}</p>}
        </div>
        {coverUrl && (
          <div className="relative w-full aspect-[16/9] md:aspect-[2.35/1] rounded-3xl overflow-hidden mb-10">
            <Image src={coverUrl} alt={article.title} fill className="object-cover" priority />
          </div>
        )}
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-6 mb-12">
          <AuthorCard name={authorName} avatarUrl={authorAvatar} coAvatarUrl={coAuthorAvatar} authorIsAi={authorIsAi} coIsAi={coAuthorIsAi} bio={authorBio} role={authorRole} date={publishedDate} readTime={article.read_time} />
        </div>
      </section>
      <article className="relative z-10 max-w-[1400px] mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center py-8 md:py-10 border-b border-[#111A31]/8">
            <ShareButtons url={`/newsroom/${article.slug}`} title={article.title} />
          </div>
          <div className="py-8 md:py-12"><ArticleContent content={article.content || ""} /></div>
          <ArticleFooter authorName={authorName} authorAvatar={authorAvatar} coAuthorAvatar={coAuthorAvatar} authorIsAi={authorIsAi} coAuthorIsAi={coAuthorIsAi} authorBio={authorBio} authorRole={authorRole} category={category} tags={article.tags} articleSlug={article.slug} />
        </div>
        <RelatedArticles articles={relatedArticles} currentSlug={article.slug} />
        <div className="max-w-3xl mx-auto"><NewsletterCTA /></div>
      </article>
    </>
  );
}

/* ── LAYOUT: HERO-SPLIT ── */
function HeroSplitLayout({ article, coverUrl, category, authorName, authorAvatar, coAuthorAvatar, authorIsAi, coAuthorIsAi, authorBio, authorRole, publishedDate, relatedArticles }: {
  article: NewsArticle; coverUrl: string | null; category: NewsCategory | null; authorName: string; authorAvatar: string | null; coAuthorAvatar: string | null; authorIsAi: boolean; coAuthorIsAi: boolean; authorBio: string | null; authorRole: string | null; publishedDate: string; relatedArticles: any[];
}) {
  return (
    <>
      <section className="max-w-[1400px] mx-auto px-6 pt-[100px] md:pt-[140px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start mb-12">
          <div className="md:col-span-5 lg:col-span-4">
            {coverUrl && (
              <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden sticky top-24">
                <Image src={coverUrl} alt={article.title} fill className="object-cover" priority />
              </div>
            )}
          </div>
          <div className="md:col-span-7 lg:col-span-8">
            <nav className="flex items-center gap-2 text-[12px] [font-family:var(--font-fira-sans)] mb-4">
              <Link href="/" className="text-[#111A31]/40 hover:text-[#111A31]/70 transition-colors">Inicio</Link>
              <span className="text-[#111A31]/20">/</span>
              <Link href="/newsroom" className="text-[#111A31]/40 hover:text-[#111A31]/70 transition-colors">Newsroom</Link>
              {category && <><span className="text-[#111A31]/20">/</span><span className="text-[#1534DC]">{category.name}</span></>}
            </nav>
            {category && <span className="inline-block px-3 py-1 rounded-full bg-[#1534DC]/8 border border-[#1534DC]/15 text-white text-[10px] font-bold uppercase tracking-[0.15em] [font-family:var(--font-figtree)] mb-5">{category.name}</span>}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.08] text-[#111A31] [font-family:var(--font-figtree)] tracking-tight mb-6">{article.title}</h1>
            {article.excerpt && <p className="text-lg text-[#1F2A44] [font-family:var(--font-fira-sans)] font-light leading-relaxed mb-8">{article.excerpt}</p>}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <AuthorCard name={authorName} avatarUrl={authorAvatar} coAvatarUrl={coAuthorAvatar} authorIsAi={authorIsAi} coIsAi={coAuthorIsAi} bio={authorBio} role={authorRole} date={publishedDate} readTime={article.read_time} />
              <ShareButtons url={`/newsroom/${article.slug}`} title={article.title} />
            </div>
          </div>
        </div>
      </section>
      <article className="relative z-10 max-w-[1400px] mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="py-8 md:py-12"><ArticleContent content={article.content || ""} /></div>
          <ArticleFooter authorName={authorName} authorAvatar={authorAvatar} coAuthorAvatar={coAuthorAvatar} authorIsAi={authorIsAi} coAuthorIsAi={coAuthorIsAi} authorBio={authorBio} authorRole={authorRole} category={category} tags={article.tags} articleSlug={article.slug} />
        </div>
        <RelatedArticles articles={relatedArticles} currentSlug={article.slug} />
        <div className="max-w-3xl mx-auto"><NewsletterCTA /></div>
      </article>
    </>
  );
}

/* ── PAGE ── */
export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  let article: NewsArticle | null = null;

  try {
    const articles = await directusItems<NewsArticle>(
      `/items/news_articles?filter[slug][_eq]=${encodeURIComponent(slug)}&filter[status][_eq]=published&fields=*,category.id,category.name,category.slug&limit=1`
    );
    article = articles[0] ?? null;
  } catch { /* sin datos */ }

  if (!article) notFound();

  const category = resolveCategory(article);
  // author_id no es una relación expandible en Directus; si resolveAuthor
  // no lo trae como objeto, lo buscamos por id contra la colección authors.
  let author = resolveAuthor(article);
  if (!author && article.author_id != null) {
    try {
      const list = await directusItems<Author>(
        `/items/authors?filter[id][_eq]=${encodeURIComponent(String(article.author_id))}&fields=id,name,avatar,role,bio,social_links&limit=1`
      );
      author = list[0] ?? null;
    } catch {
      /* sin autor */
    }
  }
  // Co-autoría (collab): segundo autor por co_author_id.
  let coAuthor: Author | null = null;
  const coId = (article as unknown as { co_author_id?: number | string | null })
    .co_author_id;
  if (coId != null) {
    try {
      const list = await directusItems<Author>(
        `/items/authors?filter[id][_eq]=${encodeURIComponent(String(coId))}&fields=id,name,avatar,role,bio,social_links&limit=1`
      );
      coAuthor = list[0] ?? null;
    } catch {
      /* sin co-autor */
    }
  }
  // Fallback robusto: si Directus no expone co_author_id (campo fuera de su
  // caché de esquema), derivamos el co-autor de la convención "Principal × Co"
  // en el campo author (texto reconocido por Directus).
  const rawAuthor = typeof article.author === "string" ? article.author : "";
  if (!coAuthor && rawAuthor.includes(" × ")) {
    const coName = rawAuthor.split(" × ").pop()?.trim() ?? "";
    if (coName) {
      try {
        const list = await directusItems<Author>(
          `/items/authors?filter[name][_eq]=${encodeURIComponent(coName)}&fields=id,name,avatar,role,bio,social_links&limit=1`
        );
        coAuthor = list[0] ?? null;
      } catch {
        /* sin co-autor */
      }
    }
  }
  const rawBase = author?.name || article.author || "Equipo Shift";
  const baseName = rawBase.includes(" × ") ? rawBase.split(" × ")[0].trim() : rawBase;
  const authorName = coAuthor ? `${baseName} × ${coAuthor.name}` : baseName;
  const authorBio = author?.bio || null;
  const authorAvatar = author?.avatar ? getDirectusImageUrl(author.avatar) : null;
  const coAuthorAvatar = coAuthor?.avatar ? getDirectusImageUrl(coAuthor.avatar) : null;
  // Diferenciador de autoría por agente IA (Shifter & co.): glow magenta.
  const authorIsAi = isAiAuthor(author?.name, author?.role);
  const coAuthorIsAi = isAiAuthor(coAuthor?.name, coAuthor?.role);
  const authorRole = coAuthor ? "Collab · Shift Latam" : author?.role || "Shift Latam";
  const publishedDate = formatDate(article.date_published);
  const relatedArticles = await fetchRelated(category?.slug ?? null, slug);
  const coverUrl = article.cover_image ? (article.cover_image.startsWith("/") ? article.cover_image : getDirectusImageUrl(article.cover_image)!) : null;
  const layout = article.layout_preset || "classic";

  const layoutProps = { article, coverUrl, category, authorName, authorAvatar, coAuthorAvatar, authorIsAi, coAuthorIsAi, authorBio, authorRole, publishedDate, relatedArticles };

  return (
    <>
      <ReadingProgress />
      <ArticleJsonLd article={article} category={category} author={author} coAuthor={coAuthor} />
      <div className="min-h-screen bg-white overflow-hidden selection:bg-[#F540FF] selection:text-white pb-32">
        {layout === "editorial" && <EditorialLayout {...layoutProps} />}
        {layout === "magazine" && <MagazineLayout {...layoutProps} />}
        {layout === "hero-split" && <HeroSplitLayout {...layoutProps} />}
        {(layout === "classic" || !layout) && <ClassicLayout {...layoutProps} />}
      </div>
    </>
  );
}
