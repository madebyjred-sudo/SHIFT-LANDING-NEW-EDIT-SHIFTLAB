import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import directus, { readItems, getDirectusImageUrl, type NewsCategory, type NewsArticle, type Author } from "@/lib/directus";
import AuthorCard from "@/components/newsroom/AuthorCard";
import ShareButtons from "@/components/newsroom/ShareButtons";
import RelatedArticles from "@/components/newsroom/RelatedArticles";
import NewsletterCTA from "@/components/newsroom/NewsletterCTA";
import ReadingProgress from "@/components/newsroom/ReadingProgress";
import ArticleContent from "@/components/newsroom/ArticleContent";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

/* ── MOCK DATA FALLBACK ────────────────────────────────────── */
const MOCK_ARTICLES: Record<string, NewsArticle> = {
  "futuro-comunicacion-ia-generativa": {
    id: "m1", status: "published", date_published: "2026-05-28T10:00:00Z",
    title: "El futuro de la comunicación estratégica en la era de la inteligencia artificial generativa",
    slug: "futuro-comunicacion-ia-generativa",
    excerpt: "Cómo los LLMs y los agentes autónomos están redefiniendo el landscape del PR corporativo, la gestión de crisis en tiempo real y la creación de narrativas a escala regional.",
    content: `<p>La inteligencia artificial generativa ha llegado para quedarse. En el mundo de la comunicación estratégica, esto representa tanto una oportunidad como un desafío sin precedentes.</p>
<h2>El cambio de paradigma</h2>
<p>Los LLMs han democratizado la creación de contenido. Cualquier persona puede generar textos coherentes, propuestas creativas e incluso estrategias de comunicación en segundos. Pero precisamente por eso, el valor diferencial ya no está en la producción, sino en la dirección estratégica.</p>
<blockquote><p>"La IA no reemplaza a los comunicadores. Los comunicadores que usan IA reemplazan a los que no."</p></blockquote>
<h2>Nuevos modelos de trabajo</h2>
<p>En Shift Latam estamos experimentando con flujos de trabajo híbridos donde los agentes de IA manejan la producción a escala y los humanos se enfocan en:</p>
<ul><li>Dirección creativa y narrativa</li><li>Validación de insights culturales</li><li>Toma de decisiones estratégicas</li><li>Gestión de relaciones stakeholders</li></ul>
<h2>Lo que viene</h2>
<p>El próximo año veremos la consolidación de los "agentes autónomos" — sistemas que no solo generan contenido sino que lo distribuyen, monitorean y optimizan sin intervención humana constante.</p>`,
    cover_image: "/assets/images/shift-lab/shift-lab-banner-desktop.png",
    category: { id: "cat-6", name: "Innovación", slug: "innovacion" },
    read_time: 8, author: "Equipo Shift LAB",
    author_id: { id: "1", name: "Equipo Shift", slug: "equipo-shift", bio: "El equipo editorial de Shift Latam", avatar: null, role: "Editorial", social_links: null, user_id: null },
    featured: true, tags: ["IA", "PR", "Comunicación"], layout_preset: "classic", content_blocks: null, gallery_images: null,
  },
  "shift-omnicom-alianza-regional": {
    id: "m2", status: "published", date_published: "2026-05-26T14:30:00Z",
    title: "Shift Latam y Omnicom PR Group consolidan alianza estratégica en la región",
    slug: "shift-omnicom-alianza-regional",
    excerpt: "Un nuevo capítulo en nuestra expansión regional fortalece las operaciones en Centroamérica, Caribe y el mercado US Hispanic con capacidades globales.",
    content: "<p>Shift Latam anuncia hoy la consolidación formal de su alianza estratégica con Omnicom PR Group...</p>",
    cover_image: "/assets/png/sectors/newsroom-banner.png",
    category: { id: "cat-1", name: "Noticias", slug: "noticias" },
    read_time: 5, author: "Comunicaciones Shift",
    author_id: { id: "1", name: "Equipo Shift", slug: "equipo-shift", bio: "El equipo editorial de Shift Latam", avatar: null, role: "Editorial", social_links: null, user_id: null },
    featured: false, tags: ["Alianzas", "Expansión"], layout_preset: "editorial", content_blocks: null, gallery_images: null,
  },
};

function resolveCategory(article: NewsArticle): NewsCategory | null {
  if (!article.category) return null;
  if (typeof article.category === "string") return null;
  return article.category as NewsCategory;
}

function resolveAuthor(article: NewsArticle): Author | null {
  if (!article.author_id) return null;
  if (typeof article.author_id === "string") return null;
  return article.author_id as Author;
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
    const articles = (await directus.request(readItems("news_articles", { filter: { slug: { _eq: slug }, status: { _eq: "published" } }, fields: ["*", { category: ["id", "name", "slug"] }, { author_id: ["*"] }], limit: 1 }))) as unknown as NewsArticle[];
    article = articles[0] ?? null;
  } catch { /* fallback */ }
  if (!article) article = MOCK_ARTICLES[slug] ?? null;
  if (!article) return { title: "Artículo no encontrado" };
  return {
    title: `${article.title} | Shift Newsroom`,
    description: article.excerpt || undefined,
    openGraph: { title: article.title, description: article.excerpt || undefined, type: "article", publishedTime: article.date_published || undefined, authors: article.author ? [article.author] : undefined },
    twitter: { card: "summary_large_image", title: article.title, description: article.excerpt || undefined },
  };
}

/* ── FETCH RELATED ── */
async function fetchRelated(categorySlug: string | null, currentSlug: string) {
  if (!categorySlug) return [];
  try {
    const related = (await directus.request(readItems("news_articles", { filter: { status: { _eq: "published" }, slug: { _neq: currentSlug }, category: { slug: { _eq: categorySlug } } }, sort: ["-date_published"], fields: ["*", { category: ["id", "name", "slug"] }], limit: 4 }))) as unknown as NewsArticle[];
    return related.map((a) => ({ id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt, date_published: a.date_published, cover_image: a.cover_image ? getDirectusImageUrl(a.cover_image) : null, category_name: resolveCategory(a)?.name ?? null, category_slug: resolveCategory(a)?.slug ?? null, read_time: a.read_time, author: a.author }));
  } catch { return []; }
}

/* ── SHARED COMPONENTS ── */
function ArticleMeta({ authorName, authorAvatar, authorBio, authorRole, publishedDate, readTime, articleSlug, title }: {
  authorName: string; authorAvatar: string | null; authorBio: string | null; authorRole: string | null; publishedDate: string; readTime: number | null; articleSlug: string; title: string;
}) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 py-8 md:py-10 border-b border-[#111A31]/8">
        <AuthorCard name={authorName} avatarUrl={authorAvatar} bio={authorBio} role={authorRole} date={publishedDate} readTime={readTime} />
        <ShareButtons url={`/newsroom/${articleSlug}`} title={title} />
      </div>
    </>
  );
}

function ArticleFooter({ authorName, authorAvatar, authorBio, authorRole, category, tags, articleSlug }: {
  authorName: string; authorAvatar: string | null; authorBio: string | null; authorRole: string | null; category: NewsCategory | null; tags: string[] | null; articleSlug: string;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2 py-8 border-t border-[#111A31]/8">
        {category && <span className="px-3 py-1.5 rounded-full bg-[#1534DC]/8 border border-[#1534DC]/15 text-white text-[11px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)]">{category.name}</span>}
        {tags?.map((tag) => <span key={tag} className="px-3 py-1.5 rounded-full bg-[#111A31]/5 border border-[#111A31]/10 text-[#111A31]/50 text-[11px] font-bold uppercase tracking-[0.1em] [font-family:var(--font-figtree)]">{tag}</span>)}
      </div>
      <div className="py-10 border-t border-[#111A31]/8">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-[#1534DC]/20 bg-[#1534DC]/5">
            {authorAvatar ? <Image src={authorAvatar} alt={authorName} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#1534DC] font-bold text-xl [font-family:var(--font-figtree)]">{authorName.charAt(0).toUpperCase()}</div>}
          </div>
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
function ClassicLayout({ article, coverUrl, category, authorName, authorAvatar, authorBio, authorRole, publishedDate, relatedArticles }: {
  article: NewsArticle; coverUrl: string | null; category: NewsCategory | null; authorName: string; authorAvatar: string | null; authorBio: string | null; authorRole: string | null; publishedDate: string; relatedArticles: any[];
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
          <ArticleMeta authorName={authorName} authorAvatar={authorAvatar} authorBio={authorBio} authorRole={authorRole} publishedDate={publishedDate} readTime={article.read_time} articleSlug={article.slug} title={article.title} />
          {article.excerpt && <div className="py-8 md:py-10 border-b border-[#111A31]/8"><p className="text-xl md:text-2xl text-[#1F2A44] [font-family:var(--font-fira-sans)] font-light leading-relaxed">{article.excerpt}</p></div>}
          <div className="py-8 md:py-12"><ArticleContent content={article.content || ""} /></div>
          <ArticleFooter authorName={authorName} authorAvatar={authorAvatar} authorBio={authorBio} authorRole={authorRole} category={category} tags={article.tags} articleSlug={article.slug} />
        </div>
        <RelatedArticles articles={relatedArticles} currentSlug={article.slug} />
        <div className="max-w-3xl mx-auto"><NewsletterCTA /></div>
      </article>
    </>
  );
}

/* ── LAYOUT: EDITORIAL ── */
function EditorialLayout({ article, coverUrl, category, authorName, authorAvatar, authorBio, authorRole, publishedDate, relatedArticles }: {
  article: NewsArticle; coverUrl: string | null; category: NewsCategory | null; authorName: string; authorAvatar: string | null; authorBio: string | null; authorRole: string | null; publishedDate: string; relatedArticles: any[];
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
            <AuthorCard name={authorName} avatarUrl={authorAvatar} bio={authorBio} role={authorRole} date={publishedDate} readTime={article.read_time} />
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
          <ArticleFooter authorName={authorName} authorAvatar={authorAvatar} authorBio={authorBio} authorRole={authorRole} category={category} tags={article.tags} articleSlug={article.slug} />
        </div>
        <RelatedArticles articles={relatedArticles} currentSlug={article.slug} />
        <div className="max-w-3xl mx-auto"><NewsletterCTA /></div>
      </article>
    </>
  );
}

/* ── LAYOUT: MAGAZINE ── */
function MagazineLayout({ article, coverUrl, category, authorName, authorAvatar, authorBio, authorRole, publishedDate, relatedArticles }: {
  article: NewsArticle; coverUrl: string | null; category: NewsCategory | null; authorName: string; authorAvatar: string | null; authorBio: string | null; authorRole: string | null; publishedDate: string; relatedArticles: any[];
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
          <AuthorCard name={authorName} avatarUrl={authorAvatar} bio={authorBio} role={authorRole} date={publishedDate} readTime={article.read_time} />
        </div>
      </section>
      <article className="relative z-10 max-w-[1400px] mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center py-8 md:py-10 border-b border-[#111A31]/8">
            <ShareButtons url={`/newsroom/${article.slug}`} title={article.title} />
          </div>
          <div className="py-8 md:py-12"><ArticleContent content={article.content || ""} /></div>
          <ArticleFooter authorName={authorName} authorAvatar={authorAvatar} authorBio={authorBio} authorRole={authorRole} category={category} tags={article.tags} articleSlug={article.slug} />
        </div>
        <RelatedArticles articles={relatedArticles} currentSlug={article.slug} />
        <div className="max-w-3xl mx-auto"><NewsletterCTA /></div>
      </article>
    </>
  );
}

/* ── LAYOUT: HERO-SPLIT ── */
function HeroSplitLayout({ article, coverUrl, category, authorName, authorAvatar, authorBio, authorRole, publishedDate, relatedArticles }: {
  article: NewsArticle; coverUrl: string | null; category: NewsCategory | null; authorName: string; authorAvatar: string | null; authorBio: string | null; authorRole: string | null; publishedDate: string; relatedArticles: any[];
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
              <AuthorCard name={authorName} avatarUrl={authorAvatar} bio={authorBio} role={authorRole} date={publishedDate} readTime={article.read_time} />
              <ShareButtons url={`/newsroom/${article.slug}`} title={article.title} />
            </div>
          </div>
        </div>
      </section>
      <article className="relative z-10 max-w-[1400px] mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="py-8 md:py-12"><ArticleContent content={article.content || ""} /></div>
          <ArticleFooter authorName={authorName} authorAvatar={authorAvatar} authorBio={authorBio} authorRole={authorRole} category={category} tags={article.tags} articleSlug={article.slug} />
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
    const articles = (await directus.request(readItems("news_articles", { filter: { slug: { _eq: slug }, status: { _eq: "published" } }, fields: ["*", { category: ["id", "name", "slug"] }, { author_id: ["*"] }], limit: 1 }))) as unknown as NewsArticle[];
    article = articles[0] ?? null;
  } catch { /* fallback */ }

  if (!article) article = MOCK_ARTICLES[slug] ?? null;
  if (!article) notFound();

  const category = resolveCategory(article);
  const author = resolveAuthor(article);
  const authorName = author?.name || article.author || "Equipo Shift";
  const authorBio = author?.bio || null;
  const authorAvatar = author?.avatar ? getDirectusImageUrl(author.avatar) : null;
  const authorRole = author?.role || "Shift Latam";
  const publishedDate = formatDate(article.date_published);
  const relatedArticles = await fetchRelated(category?.slug ?? null, slug);
  const coverUrl = article.cover_image ? (article.cover_image.startsWith("/") ? article.cover_image : getDirectusImageUrl(article.cover_image)!) : null;
  const layout = article.layout_preset || "classic";

  const layoutProps = { article, coverUrl, category, authorName, authorAvatar, authorBio, authorRole, publishedDate, relatedArticles };

  return (
    <>
      <ReadingProgress />
      <main className="min-h-screen bg-white overflow-hidden selection:bg-[#F540FF] selection:text-white pb-32">
        {layout === "editorial" && <EditorialLayout {...layoutProps} />}
        {layout === "magazine" && <MagazineLayout {...layoutProps} />}
        {layout === "hero-split" && <HeroSplitLayout {...layoutProps} />}
        {(layout === "classic" || !layout) && <ClassicLayout {...layoutProps} />}
      </main>
    </>
  );
}
