import Link from "next/link";
import Image from "next/image";

export interface NewsCardArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  date_published: string | null;
  cover_image: string | null;
  category_name: string | null;
  category_slug: string | null;
  read_time: number | null;
  author: string | null;
  author_avatar?: string | null;
  author_role?: string | null;
  author_is_ai?: boolean;
  co_author?: string | null;
  co_author_avatar?: string | null;
  co_author_is_ai?: boolean;
  isMock?: boolean;
}

type CardVariant = "hero" | "standard" | "panoramic" | "compact" | "grid";

interface NewsCardProps {
  article: NewsCardArticle;
  variant?: CardVariant;
  priority?: boolean;
  index?: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── TravelCard-inspired article card ── */
function TravelArticleCard({
  article,
  variant = "grid",
  priority = false,
  index = 0,
}: NewsCardProps) {
  const href = `/newsroom/${article.slug}`;

  // Aspect ratio & sizing per variant
  const containerClasses = {
    hero: "min-h-[520px] lg:min-h-[560px]",
    standard: "min-h-[420px]",
    panoramic: "min-h-[380px] lg:min-h-[420px]",
    compact: "min-h-[280px]",
    grid: "min-h-[380px]",
  }[variant];

  const titleSize = {
    hero: "text-2xl md:text-3xl lg:text-[40px]",
    standard: "text-xl md:text-2xl",
    panoramic: "text-xl md:text-2xl lg:text-[28px]",
    compact: "text-lg md:text-xl",
    grid: "text-lg md:text-xl",
  }[variant];

  return (
    <Link
      href={href}
      className="group relative block w-full overflow-hidden rounded-[24px] shadow-md transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={`relative ${containerClasses}`}>
        {/* Background Image with Zoom Effect */}
        {article.cover_image ? (
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1534DC]/30 to-[#F540FF]/20" />
        )}

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute top-5 left-5 md:top-6 md:left-6 z-10">
          {article.category_name && (
            <span className="inline-block px-3 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-[0.15em] [font-family:var(--font-figtree)]">
              {article.category_name}
            </span>
          )}
        </div>

        {/* Content Container — anchored to bottom */}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
          {/* Middle Section: Title + Excerpt (slides up on hover) */}
          <div className="space-y-3 transition-transform duration-500 ease-out group-hover:-translate-y-14 md:group-hover:-translate-y-16">
            <h3
              className={`font-bold leading-[1.1] tracking-tight [font-family:var(--font-figtree)] ${titleSize}`}
            >
              {article.title}
            </h3>
            {article.excerpt && variant !== "compact" && (
              <p className="text-sm md:text-base text-white/75 [font-family:var(--font-fira-sans)] leading-relaxed line-clamp-2 md:line-clamp-3">
                {article.excerpt}
              </p>
            )}
            {article.author && (
              <div className="flex items-center gap-2.5 pt-1">
                {(article.author_avatar || article.co_author_avatar) && (
                  <span className="flex shrink-0 -space-x-2">
                    {article.author_avatar && (
                      <Image
                        src={article.author_avatar}
                        alt={article.author}
                        width={32}
                        height={32}
                        className={`h-8 w-8 rounded-full object-cover ${article.author_is_ai ? "ai-avatar" : "ring-2 ring-black/40"}`}
                      />
                    )}
                    {article.co_author_avatar && (
                      <Image
                        src={article.co_author_avatar}
                        alt={article.co_author ?? ""}
                        width={32}
                        height={32}
                        className={`h-8 w-8 rounded-full object-cover ${article.co_author_is_ai ? "ai-avatar" : "ring-2 ring-black/40"}`}
                      />
                    )}
                  </span>
                )}
                <span className="leading-tight [font-family:var(--font-figtree)]">
                  <span className="block text-[12px] md:text-[13px] font-semibold text-white/90">
                    {article.author}
                    {article.co_author && <span className="text-white/55"> × </span>}
                    {article.co_author}
                  </span>
                  {(article.co_author || article.author_role) && (
                    <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
                      {article.co_author ? "Collab" : article.author_role}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Section: Meta + CTA (revealed on hover, slides up into view) */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 translate-y-full opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-[12px] md:text-[13px] text-white/70 [font-family:var(--font-fira-sans)]">
                {article.date_published && (
                  <span>{formatDate(article.date_published)}</span>
                )}
                {article.read_time && (
                  <>
                    <span className="text-white/40">·</span>
                    <span>{article.read_time} min lectura</span>
                  </>
                )}
              </div>
              <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] [font-family:var(--font-figtree)] text-white bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-sm px-4 py-2 rounded-full transition-colors duration-200">
                Leer
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Panoramic variant: horizontal layout with image left, text right ── */
function PanoramicCard({ article, index = 0 }: NewsCardProps) {
  const href = `/newsroom/${article.slug}`;

  return (
    <Link
      href={href}
      className="group relative grid grid-cols-1 md:grid-cols-2 rounded-[24px] overflow-hidden shadow-md transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image Side */}
      <div className="relative w-full aspect-[16/10] md:aspect-auto md:min-h-[360px] overflow-hidden">
        {article.cover_image ? (
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1534DC]/30 to-[#F540FF]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/20" />
      </div>

      {/* Content Side */}
      <div className="relative flex flex-col justify-center p-8 md:p-10 bg-[#111A31]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1534DC]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {article.category_name && (
          <span className="inline-block self-start px-3 py-1 rounded-full bg-[#1534DC]/30 border border-[#1534DC]/50 text-white text-[10px] font-bold uppercase tracking-[0.15em] [font-family:var(--font-figtree)] mb-5">
            {article.category_name}
          </span>
        )}

        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold leading-[1.1] tracking-tight text-white [font-family:var(--font-figtree)] mb-4">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="text-[#A0ABC0] text-sm md:text-base leading-relaxed [font-family:var(--font-fira-sans)] line-clamp-3 mb-5">
            {article.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-[12px] md:text-[13px] text-white/50 [font-family:var(--font-fira-sans)]">
          {article.author && (
            <span className="flex items-center gap-1.5 text-white/80">
              {(article.author_avatar || article.co_author_avatar) && (
                <span className="flex -space-x-1.5">
                  {article.author_avatar && (
                    <Image src={article.author_avatar} alt={article.author} width={22} height={22} className={`h-[22px] w-[22px] rounded-full object-cover ${article.author_is_ai ? "ai-avatar" : "ring-1 ring-[#111A31]"}`} />
                  )}
                  {article.co_author_avatar && (
                    <Image src={article.co_author_avatar} alt={article.co_author ?? ""} width={22} height={22} className={`h-[22px] w-[22px] rounded-full object-cover ${article.co_author_is_ai ? "ai-avatar" : "ring-1 ring-[#111A31]"}`} />
                  )}
                </span>
              )}
              <span className="font-semibold [font-family:var(--font-figtree)]">
                {article.author}{article.co_author ? ` × ${article.co_author}` : ""}
              </span>
            </span>
          )}
          {article.date_published && <span>{formatDate(article.date_published)}</span>}
          {article.read_time && (
            <>
              <span className="text-white/20">·</span>
              <span>{article.read_time} min lectura</span>
            </>
          )}
        </div>

        {/* Hover CTA */}
        <div className="mt-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] [font-family:var(--font-figtree)] text-[#F540FF] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          Leer artículo
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

/* ── Compact variant: text-only card for side stack ── */
function CompactCard({ article, index = 0 }: NewsCardProps) {
  const href = `/newsroom/${article.slug}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-end min-h-[200px] p-6 md:p-8 rounded-[20px] overflow-hidden shadow-md transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 bg-[#111A31]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#1534DC]/10 to-[#F540FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {article.category_name && (
        <span className="inline-block self-start px-2.5 py-1 rounded-full bg-[#1534DC]/20 border border-[#1534DC]/40 text-white text-[10px] font-bold uppercase tracking-[0.15em] [font-family:var(--font-figtree)] mb-4">
          {article.category_name}
        </span>
      )}

      <h3 className="text-lg md:text-xl font-bold leading-[1.15] tracking-tight text-white [font-family:var(--font-figtree)] mb-3 line-clamp-3 group-hover:text-[#F540FF] transition-colors duration-300">
        {article.title}
      </h3>

      {article.excerpt && (
        <p className="text-[#A0ABC0] text-sm leading-relaxed [font-family:var(--font-fira-sans)] line-clamp-2 mb-4">
          {article.excerpt}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2.5 text-[12px] text-white/40 [font-family:var(--font-fira-sans)]">
        {article.author && (
          <span className="flex items-center gap-1.5 text-white/70">
            {(article.author_avatar || article.co_author_avatar) && (
              <span className="flex -space-x-1.5">
                {article.author_avatar && (
                  <Image src={article.author_avatar} alt={article.author} width={20} height={20} className={`h-5 w-5 rounded-full object-cover ${article.author_is_ai ? "ai-avatar" : "ring-1 ring-[#111A31]"}`} />
                )}
                {article.co_author_avatar && (
                  <Image src={article.co_author_avatar} alt={article.co_author ?? ""} width={20} height={20} className={`h-5 w-5 rounded-full object-cover ${article.co_author_is_ai ? "ai-avatar" : "ring-1 ring-[#111A31]"}`} />
                )}
              </span>
            )}
            <span className="font-semibold [font-family:var(--font-figtree)]">
              {article.author}{article.co_author ? ` × ${article.co_author}` : ""}
            </span>
          </span>
        )}
        {article.date_published && <span>{formatDate(article.date_published)}</span>}
        {article.read_time && (
          <>
            <span className="text-white/20">·</span>
            <span>{article.read_time} min</span>
          </>
        )}
      </div>
    </Link>
  );
}

/* ── Main export ── */
export default function NewsCard({ article, variant = "grid", priority = false, index = 0 }: NewsCardProps) {
  if (variant === "panoramic") {
    return <PanoramicCard article={article} variant={variant} priority={priority} index={index} />;
  }
  if (variant === "compact") {
    return <CompactCard article={article} variant={variant} priority={priority} index={index} />;
  }
  return <TravelArticleCard article={article} variant={variant} priority={priority} index={index} />;
}
