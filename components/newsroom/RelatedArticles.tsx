import Link from "next/link";
import Image from "next/image";
import type { NewsCardArticle } from "./NewsCard";
import { alFrente } from "@/lib/newsroom/ai-authors";

interface RelatedArticlesProps {
  articles: NewsCardArticle[];
  currentSlug: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Avatar chico. Sin imagen cae a la inicial, nunca a un círculo vacío. */
function Avatar({
  src,
  nombre,
  z = "",
  alFrenteAqui = false,
}: {
  src?: string | null;
  nombre: string;
  z?: string;
  /** En colaboración humano + IA, el humano se dibuja encima. */
  alFrenteAqui?: boolean;
}) {
  const base =
    "relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white " +
    (alFrenteAqui ? "z-10 " : "") + z;
  if (!src) {
    return (
      <span
        className={`${base} flex items-center justify-center bg-[#111A31]/10 text-[10px] font-bold text-[#111A31]/50 [font-family:var(--font-figtree)]`}
        aria-hidden
      >
        {nombre.trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <span className={base}>
      <Image src={src} alt="" fill sizes="24px" className="object-cover" />
    </span>
  );
}

export default function RelatedArticles({ articles, currentSlug }: RelatedArticlesProps) {
  const related = articles.filter((a) => a.slug !== currentSlug).slice(0, 3);
  if (related.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-[#111A31]/10">
      <h2 className="text-2xl md:text-3xl font-bold text-[#111A31] [font-family:var(--font-figtree)] mb-10 tracking-tight">
        Artículos <span className="text-[#1534DC]">relacionados</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {related.map((article) => (
          <Link
            key={article.id}
            href={article.isMock ? "#" : `/newsroom/${article.slug}`}
            className="group block"
          >
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-[#111A31]/5">
              {article.cover_image ? (
                <Image
                  src={article.cover_image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1534DC]/10 to-[#F540FF]/10" />
              )}
            </div>

            <h3 className="text-base md:text-lg font-bold text-[#111A31] [font-family:var(--font-figtree)] leading-snug group-hover:text-[#1534DC] transition-colors line-clamp-2">
              {article.title}
            </h3>

            {/* Firma: cara + nombre. Con coautoría, los dos avatares montados. */}
            {article.author && (
              <div className="mt-3 flex items-center gap-2">
                <span className="flex items-center">
                  <Avatar
                    src={article.author_avatar}
                    nombre={article.author}
                    alFrenteAqui={
                      alFrente(article.author_is_ai, article.co_author_is_ai) === "principal"
                    }
                  />
                  {article.co_author && (
                    <Avatar
                      src={article.co_author_avatar}
                      nombre={article.co_author}
                      z="-ml-2"
                      alFrenteAqui={
                        alFrente(article.author_is_ai, article.co_author_is_ai) === "co"
                      }
                    />
                  )}
                </span>
                <span className="truncate text-[12.5px] font-semibold text-[#111A31]/70 [font-family:var(--font-figtree)]">
                  {article.author}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-[12px] text-[#111A31]/40 [font-family:var(--font-fira-sans)] mt-2">
              {article.date_published && <span>{formatDate(article.date_published)}</span>}
              {article.read_time && (
                <>
                  <span>·</span>
                  <span>{article.read_time} min</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
